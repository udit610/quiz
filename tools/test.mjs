#!/usr/bin/env node
/*
  Browser tests for the quiz page.

      node tools/test.mjs            run everything
      node tools/test.mjs leaving    run only the tests whose name contains "leaving"

  Needs Playwright with Chromium. Uses no network: the Apps Script, the fonts
  and the photos are all stood in for here, and nothing is sent to the sheet.
  Time is faked, so a 40-second question takes milliseconds.
*/

import fs from 'node:fs';
import http from 'node:http';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = join(root, 'index.html');
const { WEEK, QUESTION_IMAGES, QUIZZES } = await import(pathToFileURL(join(root, 'quiz-data.js')).href);

async function loadPlaywright() {
  try { return await import('playwright'); } catch (e) {}
  try {
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    return await import(pathToFileURL(join(globalRoot, 'playwright', 'index.mjs')).href);
  } catch (e) {}
  console.error('Playwright is not installed. Try: npm install -g playwright && npx playwright install chromium');
  process.exit(2);
}

const { chromium } = await loadPlaywright();

/* The page must be up to date with quiz-data.js before it is tested. */
try {
  execSync(`node "${join(root, 'tools', 'build.mjs')}" --check`, { stdio: 'pipe' });
} catch (e) {
  console.error('index.html does not match quiz-data.js. Run: node tools/build.mjs');
  process.exit(1);
}

const html = fs.readFileSync(PAGE, 'utf8');
const setting = (name, pattern) => { const m = html.match(new RegExp(name + ':\\s*' + pattern)); return m ? m[1] : null; };
const RULES = {
  free: Number(setting('freeLeaves', '(\\d+)')),
  max: Number(setting('maxLeaves', '(\\d+)')),
  answersAt: setting('answersAt', '"([^"]*)"'),
  shuffle: setting('shuffleQuestions', '(true|false)') === 'true'
};
const usualRules = RULES.free === 1 && RULES.max === 3;
const usualLock = RULES.answersAt === '20:00';

const day = 24 * 3600 * 1000;
const quizDay = Date.parse(WEEK.date + 'T00:00:00Z');
const AFTER = new Date(quizDay + 9 * day + 5 * 3600 * 1000);        // well after the quiz day: answers open
const QUIZ_MORNING = new Date(quizDay + 4 * 3600 * 1000);           // 9:30 AM in India on the quiz day
const DAY_BEFORE = new Date(quizDay - day + 10 * 3600 * 1000);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const niceDate = DAYS[new Date(quizDay).getUTCDay()] + ' ' + Number(WEEK.date.slice(8)) + ' ' + MONTHS[Number(WEEK.date.slice(5, 7)) - 1];

/* The class the tests mostly use: the one with the most questions. */
const C = Object.keys(QUIZZES).sort((a, b) => QUIZZES[b].length - QUIZZES[a].length)[0];
const N = QUIZZES[C].length;
const CLASS_NAME = C === 'UKG' ? 'UKG' : 'Class ' + C;
const photoClass = Object.keys(QUIZZES).find(c => QUIZZES[c].some(q => q.img && !q.pic));

/* A tiny real PNG, served in place of every Wikimedia photo. */
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAYAAAD+Bd/7AAAAFUlEQVR42mP8z8Dwn4EIwDiqkL4KAV6SCfgRDXYyAAAAAElFTkSuQmCC', 'base64');


/* ---------- harness ---------- */

function serve(page = () => fs.readFileSync(PAGE)) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      if (req.url.split('?')[0] === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(page());
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(0, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() }));
  });
}

/*
  api.start / api.result: (body, nthCall) => reply
  A reply is an object (sent as JSON), 'fail' (network error) or 'hang' (never answers).
  photos: true serves a picture for every photo; false makes every photo fail.
*/
async function session(browser, { width = 390, height = 844, api = {}, clock = AFTER, photos = false, reducedMotion = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    hasTouch: width < 700,
    isMobile: width < 700,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference'
  });
  const calls = [];
  const errors = [];

  await context.route('**/script.google.com/**', async route => {
    const req = route.request();
    if (req.method() === 'GET') { calls.push({ method: 'GET' }); return route.fulfill({ status: 200, body: '' }); }
    let body = {};
    try { body = JSON.parse(req.postData() || '{}'); } catch (e) {}
    calls.push({ method: 'POST', contentType: req.headers()['content-type'], body });
    const handler = api[body.action];
    const nth = calls.filter(c => c.body && c.body.action === body.action).length;
    const reply = handler ? await handler(body, nth) : { ok: true };
    if (reply === 'fail') return route.abort('failed');
    if (reply === 'hang') return;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(reply) });
  });
  await context.route(/^https:\/\/(?!script\.google\.com)/, route => {
    const url = route.request().url();
    if (photos && Object.values(QUESTION_IMAGES).some(u => url === u || url === u.replace('/960px-', '/500px-'))) {
      return route.fulfill({ status: 200, contentType: 'image/png', body: PNG });
    }
    return route.abort('failed');     // fonts, and photos when photos are off
  });
  await context.route('**/_vercel/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await context.clock.install({ time: clock });

  return {
    context, calls, errors,
    skip: ms => context.clock.fastForward(ms),
    open: async url => {
      const page = await context.newPage();
      page.on('pageerror', e => errors.push('pageerror: ' + e.message));
      page.on('console', m => {
        if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errors.push('console: ' + m.text());
      });
      await page.goto(url);
      return page;
    }
  };
}

const only = process.argv.slice(2);
const results = [];
let skipped = 0;

async function test(name, fn, when = true) {
  if (only.length && !only.some(o => name.toLowerCase().includes(o.toLowerCase()))) return;
  if (!when) { skipped++; console.log(`  skip ${name}  (settings or questions differ from what this test expects)`); return; }
  try {
    await fn();
    results.push([name, true]);
    console.log(`  ok   ${name}`);
  } catch (e) {
    results.push([name, false]);
    console.log(`  FAIL ${name}\n       ${String(e && e.stack || e).split('\n').slice(0, 5).join('\n       ')}`);
  }
}


/* ---------- helpers ---------- */

const right = (cls, q) => {
  const item = QUIZZES[cls].find(x => x.q === q);
  assert.ok(item, 'question not in quiz-data.js: ' + q);
  return item.o[item.a];
};
const posts = (s, action) => s.calls.filter(c => c.method === 'POST' && c.body.action === action);
const text = (page, sel) => page.textContent(sel);
const visible = (page, sel) => page.isVisible(sel);
const qNumber = async page => Number((await text(page, '#qCount')).match(/Question (\d+)/)[1]);
const secondsLeft = async page => Number(await text(page, '#tNum'));
const noErrors = s => assert.deepEqual(s.errors, [], 'no errors on the page');
const resultBody = (name, cls, score, total, tabSwitches, unattempted) =>
  ({ action: 'result', studentName: name, className: cls, score, total, tabSwitches, unattempted });

async function fillForm(page, name, cls) {
  await page.fill('#studentName', name);
  await page.click(`.cls[data-cls="${cls}"]`);
}

async function start(s, page, name = 'Aanya Sharma', cls = C) {
  await fillForm(page, name, cls);
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  await page.click('#beginBtn');
  await s.skip(3000);                                    // the 3-2-1 countdown
  await page.waitForSelector('#quiz:not([hidden]) .opt');
}

async function pick(page, cls, correct = true) {
  const want = right(cls, await text(page, '#qText'));
  const opts = await page.$$eval('.opt .t', ns => ns.map(n => n.textContent));
  assert.ok(opts.includes(want), 'the right answer is among the options shown');
  const i = correct ? opts.indexOf(want) : opts.findIndex(o => o !== want);
  await page.click(`.opt:nth-child(${i + 1})`);
}

async function playAll(page, cls, correct = true) {
  for (let i = 0; i < QUIZZES[cls].length; i++) {
    await page.waitForFunction(k => document.getElementById('qCount').textContent.startsWith('Question ' + k + ' '), i + 1);
    await pick(page, cls, correct);
    await page.click('#nextBtn');
  }
  await page.waitForSelector('#result:not([hidden])');
}

/* Let the question on screen run out of time (waits for its clock to have started). */
async function runOut(s, page) {
  const before = await text(page, '#qCount');
  await page.waitForFunction(() => {
    const k = Object.keys(localStorage).find(x => x.endsWith(':attempt'));
    return k && JSON.parse(localStorage.getItem(k)).deadline;
  });
  await s.skip(46000);
  await page.waitForFunction(b => !document.getElementById('result').hidden || document.getElementById('qCount').textContent !== b, before);
}

/* Switch to another app or tab for a while, then come back. */
async function leave(s, page, ms) {
  const set = hidden => page.evaluate(h => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => h ? 'hidden' : 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  await set(true);
  await s.skip(ms);
  await set(false);
}


/* ============================================================ */

const site = await serve();
const browser = await chromium.launch();
console.log(`${WEEK.emoji} ${WEEK.theme} (${WEEK.date}) — testing mostly with ${CLASS_NAME}, ${N} questions`);

console.log('\nWhat is sent to the Apps Script');

await test('start and result requests are exactly what the sheet expects', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await fillForm(page, 'Aanya Sharma', C);
  await s.skip(800);
  await page.waitForSelector('.name-state.ok');
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  await page.click('#beginBtn');
  await s.skip(3000);
  await playAll(page, C, true);
  await page.waitForSelector('.save.ok');

  assert.deepEqual(s.calls.map(c => c.method), ['GET', 'POST', 'POST'], 'one warm-up, one name check, one result');
  assert.equal(s.calls[1].contentType, 'text/plain;charset=utf-8');
  assert.equal(s.calls[2].contentType, 'text/plain;charset=utf-8');
  assert.deepEqual(Object.keys(s.calls[1].body), ['action', 'studentName', 'className', 'total']);
  assert.deepEqual(Object.keys(s.calls[2].body), ['action', 'studentName', 'className', 'score', 'total', 'tabSwitches', 'unattempted']);
  assert.deepEqual(s.calls[1].body, { action: 'start', studentName: 'Aanya Sharma', className: C, total: N });
  assert.deepEqual(s.calls[2].body, resultBody('Aanya Sharma', C, N, N, 0, 0));
  noErrors(s);
  await s.context.close();
});

await test('name check: only after typing stops, asked again when the name or class changes, reused by Start', async () => {
  const other = Object.keys(QUIZZES).find(c => c !== C);
  const s = await session(browser);
  const page = await s.open(site.url);
  await page.fill('#studentName', 'A');
  await page.click(`.cls[data-cls="${C}"]`);
  await s.skip(1500);
  assert.equal(posts(s, 'start').length, 0, 'a one-letter name is not checked');
  await page.fill('#studentName', 'Aan');
  await s.skip(300);
  await page.fill('#studentName', '  Aanya    Sharma ');
  await s.skip(300);
  assert.equal(posts(s, 'start').length, 0, 'nothing is sent while still typing');
  await s.skip(500);
  await page.waitForSelector('.name-state.ok');
  assert.equal(posts(s, 'start').length, 1);
  assert.equal(posts(s, 'start')[0].body.studentName, 'Aanya Sharma', 'extra spaces are tidied');
  await page.click(`.cls[data-cls="${other}"]`);
  await s.skip(800);
  await page.waitForFunction(() => document.querySelector('.name-state.ok'));
  assert.equal(posts(s, 'start').length, 2);
  assert.equal(posts(s, 'start')[1].body.className, other);
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  assert.equal(posts(s, 'start').length, 2, 'Start reuses the verdict');
  await s.context.close();
});

await test('duplicate name: the quiz never starts, whether found while typing or at Start', async () => {
  const s = await session(browser, { api: { start: () => ({ error: 'duplicate' }) } });
  const page = await s.open(site.url);
  await fillForm(page, 'Aanya Sharma', C);
  await s.skip(800);
  await page.waitForSelector('.name-state.bad');
  assert.match(await text(page, '#formMsg'), /A submission already exists for this name & class/);
  await page.click('#startBtn');
  await s.skip(4000);
  assert.equal(await visible(page, '#readyModal'), false);
  assert.equal(await visible(page, '#quiz'), false);
  await s.context.close();

  let release;
  const gate = new Promise(r => { release = r; });
  const s2 = await session(browser, { api: { start: async () => { await gate; return { error: 'duplicate' }; } } });
  const p2 = await s2.open(site.url);
  await fillForm(p2, 'Aanya Sharma', C);
  await p2.click('#startBtn');                           // tapped before the typing-time check has run
  await p2.waitForSelector('#readyModal:not([hidden])');
  assert.equal(await p2.isDisabled('#beginBtn'), true, 'Start on the rules sheet waits for the name check');
  release();
  await p2.waitForSelector('#readyModal', { state: 'hidden' });
  assert.match(await text(p2, '#formMsg'), /A submission already exists/);
  assert.equal(await visible(p2, '#quiz'), false);
  assert.equal(posts(s2, 'start').length, 1);
  await s2.context.close();
});

await test('name check fails or hangs: the student is not stuck and may start', async () => {
  const s = await session(browser, { api: { start: () => 'fail' } });
  const page = await s.open(site.url);
  await start(s, page);
  assert.equal(await qNumber(page), 1);
  await s.context.close();

  const s2 = await session(browser, { api: { start: () => 'hang' } });
  const p2 = await s2.open(site.url);
  await fillForm(p2, 'Aanya Sharma', C);
  await p2.click('#startBtn');
  await p2.waitForSelector('#readyModal:not([hidden])');
  await s2.skip(5000);
  assert.equal(await p2.isDisabled('#beginBtn'), true);
  await s2.skip(30000);
  await p2.waitForSelector('#beginBtn:not([disabled])');
  await s2.context.close();
});

await test('name and class are both required; Go back and Escape close the rules sheet', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await page.click('#startBtn');
  assert.match(await text(page, '#formMsg'), /enter your name and choose a class/);
  await page.fill('#studentName', 'Aanya');
  await page.click('#startBtn');
  assert.equal(await visible(page, '#readyModal'), false);
  await page.click(`.cls[data-cls="${C}"]`);
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  await page.click('#readyBack');
  assert.equal(await visible(page, '#readyModal'), false);
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  await page.keyboard.press('Escape');
  assert.equal(await visible(page, '#readyModal'), false);
  assert.equal(await visible(page, '#home'), true);
  await s.context.close();
});


console.log('\nThe quiz and its clock');

await test('Next appears only once an answer is chosen; the answer can be changed before Next', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await start(s, page);
  const barShown = () => page.evaluate(() => getComputedStyle(document.getElementById('actBar')).visibility);
  assert.equal(await page.isDisabled('#nextBtn'), true);
  assert.equal(await barShown(), 'hidden');
  await page.click('.opt:nth-child(1)');
  await page.click('.opt:nth-child(2)');
  assert.deepEqual((await page.$$eval('.opt', ns => ns.map(n => n.getAttribute('aria-checked')))).slice(0, 2), ['false', 'true']);
  assert.equal(await barShown(), 'visible');
  await page.click('#nextBtn');
  assert.equal(await qNumber(page), 2);
  assert.equal(await page.isDisabled('#nextBtn'), true);
  await s.context.close();
});

await test('time up moves on; nothing chosen counts as not answered, a chosen answer still counts', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await start(s, page);
  const full = await secondsLeft(page);
  assert.ok(full >= 20 && full <= 120, 'a sensible number of seconds: ' + full);
  await s.skip(10000);
  assert.ok(Math.abs(await secondsLeft(page) - (full - 10)) <= 1, 'ten seconds later the clock shows ten fewer');
  await s.skip((full - 11) * 1000);
  assert.equal(await qNumber(page), 1, 'still on question 1 a second before the end');
  await s.skip(1600);
  await page.waitForFunction(() => document.getElementById('qCount').textContent.startsWith('Question 2'));
  assert.equal(await secondsLeft(page), full, 'the next question gets a full clock');
  await pick(page, C, true);                             // chosen, never confirmed
  for (let i = 1; i < N; i++) await runOut(s, page);
  await page.waitForSelector('#result:not([hidden])');
  assert.deepEqual(posts(s, 'result')[0].body, resultBody('Aanya Sharma', C, 1, N, 0, N - 1));
  await s.context.close();
});

await test('every class: right answers score full marks, whatever the shuffle', async () => {
  for (const cls of Object.keys(QUIZZES)) {
    const n = QUIZZES[cls].length;
    const s = await session(browser);
    const page = await s.open(site.url);
    await start(s, page, 'Test ' + cls, cls);
    await playAll(page, cls, true);
    assert.deepEqual(posts(s, 'result')[0].body, resultBody('Test ' + cls, cls, n, n, 0, 0), 'class ' + cls);
    assert.equal(await text(page, '#scoreDen'), '/' + n);
    assert.equal(await text(page, '#rMsg'), 'Perfect Score!');
    assert.equal(await page.locator('#reviewList li.ok').count(), n);
    noErrors(s);
    await s.context.close();
  }
});

await test('wrong answers score zero, and the review shows the correct ones', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await start(s, page);
  await playAll(page, C, false);
  assert.equal(posts(s, 'result')[0].body.score, 0);
  const rows = await page.$$eval('#reviewList li', ns => ns.map(n => n.innerText));
  assert.equal(rows.length, N);
  for (const row of rows) {
    const item = QUIZZES[C].find(x => row.includes(x.q));
    assert.ok(item && row.includes('Correct answer: ' + item.o[item.a]));
  }
  await s.context.close();
});

await test('different students get the questions and options in a different order', async () => {
  const papers = [];
  for (let k = 0; k < 3; k++) {
    const s = await session(browser);
    const page = await s.open(site.url);
    await start(s, page, 'Student ' + k);
    const paper = [];
    for (let i = 0; i < N; i++) {
      paper.push(await text(page, '#qText') + '|' + (await page.$$eval('.opt .t', ns => ns.map(n => n.textContent))).join('/'));
      await page.click('.opt:nth-child(1)');
      await page.click('#nextBtn');
    }
    assert.equal(new Set(paper.map(p => p.split('|')[0])).size, N, 'each question appears once');
    papers.push(paper.join('\n'));
    await s.context.close();
  }
  assert.equal(new Set(papers).size, 3);
}, RULES.shuffle && N >= 6);

await test('keyboard: number and letter keys choose, Enter moves on, Enter on a focused option only chooses it', async () => {
  const s = await session(browser, { width: 1100, height: 800 });
  const page = await s.open(site.url);
  await start(s, page);
  await page.keyboard.press('2');
  assert.equal(await page.getAttribute('.opt:nth-child(2)', 'aria-checked'), 'true');
  await page.keyboard.press('a');
  assert.equal(await page.getAttribute('.opt:nth-child(1)', 'aria-checked'), 'true');
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('Enter');
  assert.equal(await qNumber(page), 2);
  await page.keyboard.press('1');
  await page.focus('.opt:nth-child(2)');
  await page.keyboard.press('Enter');
  assert.equal(await qNumber(page), 2, 'Enter on option B chose B; it did not hand in A');
  assert.equal(await page.getAttribute('.opt:nth-child(2)', 'aria-checked'), 'true');
  await s.context.close();
});


console.log('\nFair play');

await test('leaving: a warning, then the question is locked, then the quiz ends; the sheet is told how often', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await start(s, page);
  const full = await secondsLeft(page);
  const q1 = await text(page, '#qText');

  await leave(s, page, 1200);
  assert.equal(await visible(page, '#noticeModal'), false, 'under two seconds away is ignored');

  await leave(s, page, 5000);
  assert.equal(await text(page, '#noticeTitle'), 'You left the quiz');
  assert.equal(await page.locator('#strikes i.on').count(), 1);
  await page.click('#noticeOk');
  assert.equal(await text(page, '#qText'), q1, 'after the warning the same question carries on');
  assert.ok(await secondsLeft(page) <= full - 6, 'the clock kept running while away');
  await pick(page, C, true);
  await page.click('#nextBtn');

  await pick(page, C, true);                             // chosen, not confirmed
  await leave(s, page, 5000);
  assert.equal(await text(page, '#noticeTitle'), 'Question locked');
  await page.click('#noticeOk');
  assert.equal(await qNumber(page), 3, 'the locked question is behind us');
  assert.equal(await secondsLeft(page), full, 'the next question starts with a full clock');

  await leave(s, page, 5000);
  assert.equal(await text(page, '#noticeTitle'), 'The quiz has ended');
  await page.click('#noticeOk');
  await page.waitForSelector('#result:not([hidden])');
  assert.equal(await text(page, '#rMsg'), 'Quiz ended early');
  assert.deepEqual(posts(s, 'result')[0].body, resultBody('Aanya Sharma', C, 2, N, 3, N - 2));
  noErrors(s);
  await s.context.close();
}, usualRules && N >= 4);

await test('losing focus (another window, split screen) counts as leaving and blurs the question', async () => {
  const s = await session(browser, { width: 1100, height: 800 });
  const page = await s.open(site.url);
  await start(s, page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  assert.match(await page.evaluate(() => getComputedStyle(document.getElementById('qCard')).filter), /blur/);
  await s.skip(4000);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  assert.equal(await visible(page, '#noticeModal'), true);
  assert.equal(await page.evaluate(() => document.body.classList.contains('away')), false);
  await s.context.close();
});

await test('time away is not paused: the question runs out while the student is gone', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await start(s, page);
  const full = await secondsLeft(page);
  await leave(s, page, 120000);
  await page.click('#noticeOk');
  assert.equal(await qNumber(page), 2, 'question 1 expired during the two minutes away');
  assert.equal(await secondsLeft(page), full);
  await s.context.close();
}, RULES.max > 1);

await test('reload mid-quiz: same question, same options, same clock; it counts as leaving and cannot restart', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await start(s, page);
  const full = await secondsLeft(page);
  await pick(page, C, true);
  await page.click('#nextBtn');
  const q2 = await text(page, '#qText');
  const opts = await page.$$eval('.opt .t', ns => ns.map(n => n.textContent));
  await pick(page, C, false);                            // a wrong answer, chosen but not confirmed
  const chosen = await page.$$eval('.opt', ns => ns.map(n => n.getAttribute('aria-checked')));
  await s.skip(8000);

  await page.reload();
  await page.waitForSelector('#noticeModal:not([hidden])');
  assert.match(await text(page, '#noticeTitle'), /Welcome back, Aanya/);
  assert.equal(await visible(page, '#home'), false, 'a reload does not get back to the start');
  await page.click('#noticeOk');
  assert.equal(await text(page, '#qText'), q2);
  assert.deepEqual(await page.$$eval('.opt .t', ns => ns.map(n => n.textContent)), opts);
  assert.deepEqual(await page.$$eval('.opt', ns => ns.map(n => n.getAttribute('aria-checked'))), chosen);
  const left = await secondsLeft(page);
  assert.ok(left <= full - 8 && left >= full - 15, 'the clock carried on, got ' + left);
  assert.equal(posts(s, 'start').length, 1, 'no second start request');

  await page.reload();
  await page.waitForSelector('#noticeModal:not([hidden])');
  assert.equal(await text(page, '#noticeTitle'), 'Question locked');
  await page.click('#noticeOk');
  assert.equal(await qNumber(page), 3);

  await page.reload();
  await page.waitForSelector('#noticeModal:not([hidden])');
  assert.equal(await text(page, '#noticeTitle'), 'The quiz has ended');
  await page.reload();                                   // reloading on the last notice does not escape it
  await page.waitForSelector('#noticeModal:not([hidden])');
  assert.equal(await text(page, '#noticeTitle'), 'The quiz has ended');
  await page.click('#noticeOk');
  await page.waitForSelector('#result:not([hidden])');
  assert.deepEqual(posts(s, 'result').map(c => c.body), [resultBody('Aanya Sharma', C, 1, N, 4, N - 2)]);
  noErrors(s);
  await s.context.close();
}, usualRules && N >= 4);

await test('a tab closed for an hour cannot be used to start again or to gain time', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await start(s, page);
  await page.close();
  await s.skip(3600 * 1000);
  const again = await s.open(site.url);
  await again.waitForSelector('#noticeModal:not([hidden])');
  await again.click('#noticeOk');
  assert.equal(await qNumber(again), 2, 'question 1 ran out while the tab was closed');
  await s.context.close();
}, RULES.max > 1);

await test('an unfinished quiz left on the device can be handed in from the welcome-back notice', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await start(s, page);
  await pick(page, C, true);
  await page.click('#nextBtn');
  await page.reload();
  await page.waitForSelector('#noticeModal:not([hidden])');
  assert.match(await text(page, '#noticeAlt'), /Not Aanya Sharma\? Hand in this quiz/);
  await page.click('#noticeAlt');
  assert.equal(await text(page, '#noticeTitle'), 'Hand in this quiz?');
  await page.click('#noticeAlt');                        // "No, go back"
  assert.match(await text(page, '#noticeTitle'), /Welcome back/);
  await page.click('#noticeAlt');
  await page.click('#noticeOk');                         // "Yes, hand it in"
  await page.waitForSelector('#result:not([hidden])');
  assert.equal(await text(page, '#rMsg'), 'Quiz handed in');
  assert.deepEqual(posts(s, 'result')[0].body, resultBody('Aanya Sharma', C, 1, N, 1, N - 1));
  await s.context.close();
}, usualRules);

await test('the same quiz opened in a second tab takes over; the first tab stops', async () => {
  const s = await session(browser);
  const a = await s.open(site.url);
  await start(s, a);
  const b = await s.open(site.url);
  await b.waitForSelector('#noticeModal:not([hidden])');
  await a.waitForFunction(() => document.getElementById('noticeTitle').textContent === 'The quiz is open in another tab');
  await b.click('#noticeOk');
  assert.equal(await visible(b, '#quiz'), true);
  await s.context.close();
}, RULES.max > 1);

await test('copying, the long-press menu, print and save are off during the quiz, and only then', async () => {
  const s = await session(browser, { width: 1100, height: 800 });
  const page = await s.open(site.url);
  const blocked = type => page.evaluate(t => {
    const e = new Event(t, { bubbles: true, cancelable: true });
    document.body.dispatchEvent(e);
    return e.defaultPrevented;
  }, type);
  const keyBlocked = key => page.evaluate(k => {
    const e = new KeyboardEvent('keydown', { key: k, ctrlKey: true, bubbles: true, cancelable: true });
    document.body.dispatchEvent(e);
    return e.defaultPrevented;
  }, key);
  assert.equal(await blocked('copy'), false, 'copying still works on the home screen');
  await start(s, page);
  for (const t of ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart']) assert.equal(await blocked(t), true, t);
  for (const k of ['c', 'p', 's', 'u', 'a']) assert.equal(await keyBlocked(k), true, 'Ctrl+' + k);
  assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('quiz')).userSelect), 'none');
  await page.goBack();                                   // the Back button does not leave the quiz either
  await page.waitForSelector('#toast:not([hidden])');
  assert.equal(await visible(page, '#quiz'), true);
  await s.context.close();
});

await test('the questions, answers and photo addresses are not readable in the page source', async () => {
  let checked = 0;
  for (const list of Object.values(QUIZZES)) {
    for (const item of list) {
      if (item.q.length >= 12) assert.equal(html.includes(item.q), false, 'question found in source: ' + item.q);
      for (const o of item.o) if (o.length >= 7) { assert.equal(html.includes(o), false, 'option found in source: ' + o); checked++; }
    }
  }
  for (const url of Object.values(QUESTION_IMAGES)) assert.equal(html.includes(url), false, 'photo address found in source');
  assert.ok(checked > 20);
  const s = await session(browser);
  const page = await s.open(site.url);
  const reachable = await page.evaluate(() => ['BANK', 'DATA', 'QUIZZES', 'WEEK', 'IMAGES', 'att', 'unpack'].filter(k => k in window));
  assert.deepEqual(reachable, [], 'nothing about the quiz is reachable from the console');
  await s.context.close();
});


console.log('\nSaving the result');

await test('a failed save is retried; if it keeps failing the message is clear and Try again works', async () => {
  const s = await session(browser, { api: { result: (b, n) => n < 3 ? 'fail' : { ok: true } } });
  const page = await s.open(site.url);
  await start(s, page);
  await playAll(page, C, true);
  assert.equal(await text(page, '#saveText'), 'Saving your result…');
  await s.skip(2500);
  await s.skip(6500);
  await page.waitForSelector('.save.ok');
  assert.equal(posts(s, 'result').length, 3);
  assert.deepEqual(posts(s, 'result')[2].body, posts(s, 'result')[0].body, 'the retry sends the same result');
  await s.context.close();

  let down = true;
  const s2 = await session(browser, { api: { result: () => down ? 'fail' : { ok: true } } });
  const p2 = await s2.open(site.url);
  await start(s2, p2);
  await playAll(p2, C, true);
  await s2.skip(2500);
  await s2.skip(6500);
  await p2.waitForSelector('.save.fail');
  assert.equal(await text(p2, '#saveText'), 'Could not save your result. Please tell your teacher.');
  down = false;
  await p2.click('#saveRetry');
  await p2.waitForSelector('.save.ok');
  await s2.context.close();
});

await test('a result that never saved is sent again when the page is next opened', async () => {
  let down = true;
  const s = await session(browser, { api: { result: () => down ? 'fail' : { ok: true } } });
  const page = await s.open(site.url);
  await start(s, page);
  await playAll(page, C, true);
  await s.skip(2500);
  await s.skip(6500);
  await page.waitForSelector('.save.fail');
  const before = posts(s, 'result').length;
  down = false;
  await page.reload();
  await page.waitForSelector('#home:not([hidden]) .drow');
  await page.waitForFunction(() => !/not saved yet/.test(document.getElementById('deviceList').textContent));
  assert.equal(posts(s, 'result').length, before + 1);
  assert.deepEqual(posts(s, 'result')[before].body, resultBody('Aanya Sharma', C, N, N, 0, 0));
  await s.context.close();
});

await test('"duplicate" from the sheet: told plainly on a first try, treated as saved after a failed try', async () => {
  const s = await session(browser, { api: { result: () => ({ error: 'duplicate' }) } });
  const page = await s.open(site.url);
  await start(s, page);
  await playAll(page, C, true);
  await page.waitForSelector('.save.fail');
  assert.equal(await text(page, '#saveText'), 'This name already has a saved result for this class — not saved again.');
  assert.equal(posts(s, 'result').length, 1);
  await s.context.close();

  const s2 = await session(browser, { api: { result: (b, n) => n === 1 ? 'fail' : { error: 'duplicate' } } });
  const p2 = await s2.open(site.url);
  await start(s2, p2);
  await playAll(p2, C, true);
  await s2.skip(2500);
  await p2.waitForSelector('.save.ok');
  await s2.context.close();

  const s3 = await session(browser, { api: { result: () => ({ ok: false }) } });
  const p3 = await s3.open(site.url);
  await start(s3, p3);
  await playAll(p3, C, true);
  await s3.skip(2500);
  await s3.skip(6500);
  await p3.waitForSelector('.save.fail');                // a rejected result is not called saved
  await s3.context.close();
});


console.log('\nAnswers, and what the device remembers');

await test('on the quiz day the answers stay locked until 8 PM, then open by themselves', async () => {
  const s = await session(browser, { clock: QUIZ_MORNING });
  const page = await s.open(site.url);
  await start(s, page);
  await playAll(page, C, false);
  assert.equal(await text(page, '#lockTitle'), 'Answers open today at 8:00 PM');
  assert.equal(await page.locator('#reviewList li').count(), 0);
  const shownText = await page.evaluate(() => document.body.innerText);
  for (const item of QUIZZES[C]) {
    if (item.o[item.a].length >= 5) assert.equal(shownText.includes(item.o[item.a]), false, 'a correct answer is on the locked page: ' + item.o[item.a]);
  }
  assert.equal(await text(page, '#scoreNum'), '0', 'the score itself is shown');
  await page.click('#doneBtn');
  await page.click('.drow');
  assert.equal(await visible(page, '#answersLock'), true, 'still locked when reopened from the home screen');
  await s.skip(10.6 * 3600 * 1000);                      // to just after 8 PM in India
  await page.waitForFunction(n => document.querySelectorAll('#reviewList li').length === n, N);
  assert.equal(await visible(page, '#answersLock'), false);
  await s.context.close();

  const s2 = await session(browser, { clock: DAY_BEFORE });
  const p2 = await s2.open(site.url);
  await start(s2, p2);
  await playAll(p2, C, true);
  assert.equal(await text(p2, '#lockTitle'), 'Answers open on ' + niceDate + ' at 8:00 PM');
  await s2.context.close();
}, usualLock);

await test('after the quiz day the answers show straight away', async () => {
  const s = await session(browser, { clock: AFTER });
  const page = await s.open(site.url);
  await start(s, page);
  await playAll(page, C, true);
  assert.equal(await visible(page, '#answersLock'), false);
  assert.equal(await page.locator('#reviewList li').count(), N);
  await s.context.close();
});

await test('finished results are listed on the home screen; the same student cannot go again on this device', async () => {
  const other = Object.keys(QUIZZES).find(c => c !== C);
  const s = await session(browser);
  const page = await s.open(site.url);
  await start(s, page);
  await playAll(page, C, true);
  await page.waitForSelector('.save.ok');
  await page.click('#doneBtn');
  assert.equal(await page.inputValue('#studentName'), '');
  assert.ok((await text(page, '.drow')).includes('Aanya Sharma') && (await text(page, '.drow')).includes(N + '/' + N));

  await fillForm(page, 'aanya   SHARMA', C);
  await page.click('#startBtn');
  assert.match(await text(page, '#formMsg'), /Aanya Sharma has already finished/);
  assert.equal(await visible(page, '#readyModal'), false);

  await fillForm(page, 'Rohan Verma', C);                // a different student, same class: allowed, with a note
  await page.click('#startBtn');
  await page.waitForSelector('#readyModal:not([hidden])');
  assert.match(await text(page, '#readyNote'), /already been used for the .* quiz by Aanya Sharma/);
  await page.click('#readyBack');

  await fillForm(page, 'Rohan Verma', other);            // a brother or sister in another class: no note
  await page.click('#startBtn');
  await page.waitForSelector('#readyModal:not([hidden])');
  assert.equal(await visible(page, '#readyNote'), false);
  await s.context.close();
});

await test('a new week forgets last week; damaged saved work is ignored, never a broken page', async () => {
  const s0 = await session(browser);
  const p0 = await s0.open(site.url);
  await start(s0, p0);
  const key = await p0.evaluate(() => Object.keys(localStorage).find(k => k.endsWith(':attempt')));
  const good = await p0.evaluate(k => localStorage.getItem(k), key);
  await s0.context.close();

  const wrongSig = JSON.stringify(Object.assign(JSON.parse(good), { sig: 'changed' }));
  const pastEnd = JSON.stringify(Object.assign(JSON.parse(good), { qi: N }));
  for (const bad of ['{not json', wrongSig, pastEnd, '{"v":1,"cls":"99"}', '{"v":2}', 'null', '[]']) {
    const s = await session(browser);
    const page = await s.open(site.url);
    await page.evaluate(([k, v]) => {
      localStorage.setItem(k, v);
      localStorage.setItem(k.replace(':attempt', ':done'), '{"not":"a list"}');
      localStorage.setItem('gsq:1999-01-01.old:done', '[{"name":"Last week"}]');
      localStorage.setItem('unrelated', 'keep');
    }, [key, bad]);
    await page.reload();
    await page.waitForSelector('#home:not([hidden])');
    assert.equal(await visible(page, '#noticeModal'), false);
    assert.equal(await visible(page, '#deviceBox'), false);
    const keys = await page.evaluate(() => Object.keys(localStorage));
    assert.equal(keys.includes(key), false, 'the unusable record is cleared');
    assert.equal(keys.some(k => k.includes('1999-01-01')), false, 'last week is forgotten');
    assert.ok(keys.includes('unrelated'), 'other sites\' data is left alone');
    noErrors(s);
    await s.context.close();
  }
});

await test('with browser storage switched off the quiz still runs from start to finish', async () => {
  const s = await session(browser);
  await s.context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('storage disabled'); } });
  });
  const page = await s.open(site.url);
  await start(s, page);
  await playAll(page, C, true);
  await page.waitForSelector('.save.ok');
  assert.deepEqual(posts(s, 'result')[0].body, resultBody('Aanya Sharma', C, N, N, 0, 0));
  noErrors(s);
  await s.context.close();
});


console.log('\nPhotos and layout');

await test('photos show, cannot be long-pressed or dragged, and fall back to the emoji if they fail', async () => {
  const s = await session(browser, { photos: true });
  const page = await s.open(site.url);
  await start(s, page, 'Photo Test', photoClass);
  for (let i = 0; i < QUIZZES[photoClass].length; i++) {
    await page.waitForFunction(k => document.getElementById('qCount').textContent.startsWith('Question ' + k + ' '), i + 1);
    const q = await text(page, '#qText');
    const it = QUIZZES[photoClass].find(x => x.q === q);
    if (it.pic) {
      assert.equal(await text(page, '.media.pic span'), it.pic);
    } else if (it.img) {
      await page.waitForSelector('.media.ready .m-main');
      const im = await page.$eval('.m-main', n => ({ shown: n.naturalWidth > 0, events: getComputedStyle(n).pointerEvents, drag: n.draggable, alt: n.alt }));
      assert.deepEqual(im, { shown: true, events: 'none', drag: false, alt: 'Picture clue for this question' });
    } else {
      assert.ok(await visible(page, '.media.emoji'));
    }
    await pick(page, photoClass, true);
    await page.click('#nextBtn');
  }
  await page.waitForSelector('#result:not([hidden])');
  noErrors(s);
  await s.context.close();

  const s2 = await session(browser, { photos: false });
  const p2 = await s2.open(site.url);
  await start(s2, p2, 'Photo Test', photoClass);
  await p2.waitForSelector('.media.emoji, .media.pic');
  const full = await secondsLeft(p2);
  await s2.skip(3000);
  assert.ok(await secondsLeft(p2) <= full - 2, 'the clock runs even though the photo failed');
  await s2.context.close();
}, !!photoClass);

await test('a slow photo holds the clock back by at most five seconds', async () => {
  const s = await session(browser, { photos: false });
  await s.context.route(/wikimedia\.org/, () => {});      // photos never arrive
  const page = await s.open(site.url);
  await fillForm(page, 'Slow Photo', photoClass);
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  await page.click('#beginBtn');
  await s.skip(3000);
  await page.waitForSelector('#quiz:not([hidden]) .opt');
  while (!(await page.$('.media.loading'))) {            // walk to a question that has a photo
    await page.click('.opt:nth-child(1)');
    await page.click('#nextBtn');
    await page.waitForSelector('.opt');
  }
  const full = await secondsLeft(page);
  await s.skip(3000);
  assert.equal(await secondsLeft(page), full, 'the clock waits while the photo loads');
  await s.skip(2500);
  await s.skip(5000);
  const left = await secondsLeft(page);
  assert.ok(left <= full - 4 && left >= full - 8, 'the clock started after the five-second cap, got ' + left);
  await s.context.close();
}, !!photoClass);

await test('no sideways scrolling and finger-sized buttons, from small phones to a desktop', async () => {
  for (const [w, h] of [[320, 568], [360, 640], [390, 844], [768, 1024], [1280, 800]]) {
    const s = await session(browser, { width: w, height: h, photos: true });
    const page = await s.open(site.url);
    const fits = async where => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `sideways scroll at ${w}px on ${where}`);
    const tall = async (sel, min, where) => {
      const hs = await page.$$eval(sel, ns => ns.filter(n => n.offsetParent).map(n => n.getBoundingClientRect().height));
      assert.ok(hs.length && hs.every(x => x >= min), `${sel} under ${min}px tall at ${w}px on ${where}: ${hs.map(Math.round)}`);
    };
    const inView = sel => page.evaluate(q => { const r = document.querySelector(q).getBoundingClientRect(); return r.top >= 0 && r.bottom <= window.innerHeight; }, sel);

    await fits('home'); await tall('.cls', 44, 'home'); await tall('#startBtn', 48, 'home');
    await fillForm(page, 'Aanya Sharma Kumari Devi Longname', C);
    await page.click('#startBtn');
    await page.waitForSelector('#beginBtn:not([disabled])');
    await fits('rules'); await tall('#beginBtn', 48, 'rules');
    assert.equal(await inView('#beginBtn'), true, `Start on the rules sheet is in view at ${w}x${h}`);
    await page.click('#beginBtn');
    await s.skip(3000);
    await page.waitForSelector('#quiz:not([hidden]) .opt');
    await fits('question'); await tall('.opt', 48, 'question');

    const last = '.opt:nth-child(' + await page.locator('.opt').count() + ')';
    await page.locator(last).scrollIntoViewIfNeeded();
    await page.click(last);
    await page.waitForTimeout(500);
    const clear = await page.evaluate(q => {
      const o = document.querySelector(q).getBoundingClientRect();
      const n = document.getElementById('nextBtn').getBoundingClientRect();
      return o.top >= 0 && o.bottom <= n.top + 1;
    }, last);
    assert.equal(clear, true, `the chosen answer is not hidden behind Next at ${w}x${h}`);
    await tall('#nextBtn', 48, 'question');

    if (RULES.max > 1) {
      await leave(s, page, 5000);
      await fits('notice'); await tall('#noticeOk', 48, 'notice');
      await page.click('#noticeOk');
    }
    await page.click('#nextBtn');
    for (let i = 1; i < N; i++) { await page.waitForSelector('.opt'); await page.click('.opt:nth-child(1)'); await page.click('#nextBtn'); }
    await page.waitForSelector('#result:not([hidden])');
    await fits('result'); await tall('#doneBtn', 48, 'result');
    noErrors(s);
    await s.context.close();
  }
});

await test('text cards (pic), 2 to 6 options, and a plain unscrambled question bank all work', async () => {
  const plain = {
    week: { theme: 'Patterns', emoji: '🧩', date: WEEK.date },
    images: {},
    quizzes: Object.fromEntries(['UKG', '1', '2', '3', '4', '5', '6', '7', '8'].map(c => [c, [
      { q: 'What comes next?', o: ['10', '9', '12'], a: 0, pic: '2, 4, 6, 8, ❓', e: '🔢' },
      { q: 'Which is biggest?', o: ['1 MB', '1 GB'], a: 1, e: '💾' },
      { q: 'Which is a colour?', o: ['Dog', 'Cat', 'Cow', 'Hen', 'Fox', 'Red'], a: 5 }
    ]]))
  };
  const a = html.indexOf('/* QUIZ-DATA:BEGIN'), b = html.indexOf('/* QUIZ-DATA:END */');
  const page2 = html.slice(0, a) + '/* QUIZ-DATA:BEGIN */\nconst BANK = ' + JSON.stringify(plain) + ';\n' + html.slice(b);
  const site2 = await serve(() => page2);
  const s = await session(browser, { width: 360, height: 640 });
  const page = await s.open(site2.url);
  assert.equal(await text(page, '#themeName'), 'Patterns');
  assert.equal(await visible(page, '#photoCredit'), false, 'no photo credit in a week without photos');
  await fillForm(page, 'Aanya', '3');
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  await page.click('#beginBtn');
  await s.skip(3000);
  await page.waitForSelector('#quiz:not([hidden]) .opt');
  const counts = {};
  for (let i = 0; i < 3; i++) {
    await page.waitForFunction(k => document.getElementById('qCount').textContent.startsWith('Question ' + k + ' '), i + 1);
    const q = await text(page, '#qText');
    const item = plain.quizzes['3'].find(x => x.q === q);
    counts[q] = await page.locator('.opt').count();
    if (item.pic) assert.equal(await text(page, '.media.pic span'), item.pic);
    const opts = await page.$$eval('.opt .t', ns => ns.map(n => n.textContent));
    await page.click(`.opt:nth-child(${opts.indexOf(item.o[item.a]) + 1})`);
    await page.click('#nextBtn');
  }
  assert.deepEqual(counts, { 'What comes next?': 3, 'Which is biggest?': 2, 'Which is a colour?': 6 });
  await page.waitForSelector('#result:not([hidden])');
  assert.deepEqual(posts(s, 'result')[0].body, resultBody('Aanya', '3', 3, 3, 0, 0));
  assert.match(await text(page, '#reviewList'), /2, 4, 6, 8, ❓/);
  noErrors(s);
  await s.context.close();
  site2.close();
});

await test('with reduced motion switched on, everything still works', async () => {
  const s = await session(browser, { reducedMotion: true });
  const page = await s.open(site.url);
  await start(s, page);
  await playAll(page, C, true);
  assert.equal(await text(page, '#scoreNum'), String(N));
  assert.equal(await visible(page, '#confetti'), false);
  noErrors(s);
  await s.context.close();
});


/* ============================================================ */

const failed = results.filter(r => !r[1]);
console.log(
  `\n${results.length - failed.length} of ${results.length} passed` +
  (skipped ? `, ${skipped} skipped` : '') +
  (failed.length ? '\nFAILED:\n  ' + failed.map(f => f[0]).join('\n  ') : '')
);
await browser.close();
site.close();
process.exit(failed.length ? 1 : 0);
