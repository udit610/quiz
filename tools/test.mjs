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
const RESULTS_PAGE = join(root, 'results.html');
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
const QUIZ_MORNING = new Date(quizDay + 4 * 3600 * 1000);           // 9:30 AM in India on the quiz day
const DAY_BEFORE = new Date(quizDay - day + 10 * 3600 * 1000);
/* The submission window runs Saturday 00:00 to Monday 23:59:59, India time. */
const IN_WINDOW = new Date(quizDay + 15 * 3600 * 1000);             // Saturday 8:30 PM in India: inside the window, and the answers are already open
const SUNDAY = new Date(quizDay + day + 15 * 3600 * 1000);          // Sunday 8:30 PM in India: after the quiz day, inside the window, answers open
const MONDAY_NIGHT = new Date(quizDay + (2 * 24 + 18) * 3600 * 1000 + 25 * 60 * 1000);  // Monday 11:55 PM in India: a quiz started now runs past midnight
const MONDAY_LATE = new Date(quizDay + (2 * 24 + 18) * 3600 * 1000 + 29 * 60 * 1000 + 30000);  // Monday 11:59:30 PM in India
const TUESDAY_EARLY = new Date(MONDAY_LATE.getTime() + 35 * 1000); // Tuesday 00:00:05 in India, just after the window closed
const TUESDAY = new Date(quizDay + (2 * 24 + 18.5) * 3600 * 1000);  // Tuesday 00:00 in India: the window has closed
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* Window-message labels derived from this week's Saturday (India time),
   so the tests follow the quiz date instead of one particular week. */
const fmtShort = ms => { const d = new Date(ms + 5.5 * 3600 * 1000); return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };
const SAT_LABEL = fmtShort(quizDay);            // Sat 21 Nov
const MON_LABEL = fmtShort(quizDay + 2 * day);  // Mon 23 Nov
const TUE_LABEL = fmtShort(quizDay + 3 * day);  // Tue 24 Nov
/* Monday night before the 31 October tab's Tuesday (3 Nov): the week
   before that tab's results opened. */
const BEFORE_31OCT_TUESDAY = new Date(Date.parse('2026-11-02T18:00:00Z'));

/* The class the tests mostly use: the one with the most questions. */
const C = Object.keys(QUIZZES).sort((a, b) => QUIZZES[b].length - QUIZZES[a].length)[0];
const N = QUIZZES[C].length;
const CLASS_NAME = C === 'UKG' ? 'UKG' : 'Class ' + C;
const photoClass = Object.keys(QUIZZES).find(c => QUIZZES[c].some(q => q.img && !q.pic));

/* What the page sends to the Apps Script. The device details go with both calls, the timings with the result. */
const START_KEYS = ['action', 'studentName', 'className', 'total'];
const RESULT_KEYS = ['action', 'studentName', 'className', 'score', 'total', 'tabSwitches', 'unattempted'];
const TIME_KEYS = ['timeTaken', 'questionTimes'];
const DEVICE_KEYS = ['phoneModel', 'os', 'browser', 'screen', 'memory', 'cpuCores', 'gpu', 'language', 'timeZone', 'network'];
const core = body => Object.fromEntries((body.action === 'result' ? RESULT_KEYS : START_KEYS).filter(k => k in body).map(k => [k, body[k]]));

/* A tiny real PNG, served in place of every Wikimedia photo. */
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAYAAAD+Bd/7AAAAFUlEQVR42mP8z8Dwn4EIwDiqkL4KAV6SCfgRDXYyAAAAAElFTkSuQmCC', 'base64');


/* ---------- harness ---------- */

function serve(page = () => fs.readFileSync(PAGE), resultsPage = () => fs.readFileSync(RESULTS_PAGE)) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const path = req.url.split('?')[0];
      if (path === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(page());
      } else if (path === '/results.html') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(resultsPage());
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
  csv: { gid: text } serves that CSV for the published results sheet.
  The default clock is inside the submission window, with the answers open.
*/
async function session(browser, { width = 390, height = 844, api = {}, clock = IN_WINDOW, photos = false, reducedMotion = false, csv = {} } = {}) {
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
    /* body: the fields the sheet has always had; full: everything sent, device details and timings included. */
    calls.push({ method: 'POST', contentType: req.headers()['content-type'], body: core(body), full: body });
    const handler = api[body.action];
    const nth = calls.filter(c => c.body && c.body.action === body.action).length;
    const reply = handler ? await handler(body, nth) : { ok: true };
    if (reply === 'fail') return route.abort('failed');
    if (reply === 'hang') return;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(reply) });
  });
  await context.route('**/docs.google.com/**', async route => {
    const gid = new URL(route.request().url()).searchParams.get('gid');
    const body = csv[gid];
    if (body === undefined) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ status: 200, contentType: 'text/csv; charset=utf-8', body });
  });
  await context.route(/^https:\/\/(?!script\.google\.com)(?!docs\.google\.com)/, route => {
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
    setTime: ms => context.clock.setSystemTime(ms),
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

/*
  The answers open only once submissions have closed (Tuesday 00:00 in
  India). Move the clock just past that and wait for the review to appear.
*/
async function seeAnswers(s, page, n) {
  const now = await page.evaluate(() => Date.now());
  await s.skip(TUESDAY.getTime() + 60000 - now);
  await page.waitForFunction(k => document.querySelectorAll('#reviewList li').length === k, n);
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
  await s.skip(1500);
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  await page.click('#beginBtn');
  await s.skip(3000);
  await playAll(page, C, true);
  await page.waitForSelector('.save.ok');

  assert.deepEqual(s.calls.map(c => c.method), ['GET', 'POST', 'POST'], 'one warm-up, one start (at Start), one result');
  assert.equal(s.calls[1].contentType, 'text/plain;charset=utf-8');
  assert.equal(s.calls[2].contentType, 'text/plain;charset=utf-8');
  assert.deepEqual(Object.keys(s.calls[1].full), [...START_KEYS, ...DEVICE_KEYS]);
  assert.deepEqual(Object.keys(s.calls[2].full), [...RESULT_KEYS, ...TIME_KEYS, ...DEVICE_KEYS]);
  assert.deepEqual(s.calls[1].body, { action: 'start', studentName: 'Aanya Sharma', className: C, total: N });
  assert.deepEqual(s.calls[2].body, resultBody('Aanya Sharma', C, N, N, 0, 0));
  for (const call of [s.calls[1], s.calls[2]]) {
    for (const k of DEVICE_KEYS) assert.ok(['string', 'number'].includes(typeof call.full[k]), k + ' is a plain value');
    assert.match(call.full.screen, /^\d+×\d+ @[\d.]+x, window 390×844$/);
    assert.ok(call.full.os && call.full.browser && call.full.language && call.full.timeZone, 'the basics are known');
    assert.ok(call.full.cpuCores > 0);
  }
  assert.equal(typeof s.calls[2].full.timeTaken, 'number');
  assert.equal(s.calls[2].full.questionTimes.split(' · ').length, N, 'a time for every question');
  noErrors(s);
  await s.context.close();
});

/* Pretend to be a particular phone: its user-agent string, client hints, memory and network. */
async function asPhone(s, phone) {
  await s.context.addInitScript(p => {
    const P = Navigator.prototype;
    const def = (k, v) => Object.defineProperty(P, k, { configurable: true, get: () => v });
    def('userAgent', p.ua);
    def('userAgentData', p.hints ? {
      platform: p.hints.platform, mobile: true, brands: p.hints.brands,
      getHighEntropyValues: () => Promise.resolve({
        platform: p.hints.platform, model: p.hints.model,
        platformVersion: p.hints.platformVersion, fullVersionList: p.hints.brands
      })
    } : undefined);
    def('deviceMemory', p.memory);
    def('connection', p.connection);
  }, phone);
}

async function startCall(s, phone) {
  await asPhone(s, phone);
  const page = await s.open(site.url);
  await fillForm(page, 'Aanya Sharma', C);
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  return posts(s, 'start')[0].full;
}

await test('device details: an Android phone that hides its model in the user agent, and an iPhone', async () => {
  const s = await session(browser);
  const android = await startCall(s, {
    ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36',
    hints: {
      platform: 'Android', model: 'SM-A146B', platformVersion: '14.0.0',
      brands: [{ brand: 'Not/A)Brand', version: '8.0.0.0' }, { brand: 'Chromium', version: '125.0.6422.165' }, { brand: 'Samsung Internet', version: '27.0.1.1' }]
    },
    memory: 4,
    connection: { type: 'wifi', effectiveType: '4g', saveData: false }
  });
  assert.equal(android.phoneModel, 'SM-A146B', 'the model comes from the client hints');
  assert.equal(android.os, 'Android 14', 'not the frozen "Android 10" of the user agent');
  assert.equal(android.browser, 'Samsung Internet 27');
  assert.equal(android.memory, '4–8 GB', 'browsers round memory down, so it is a range');
  assert.equal(android.network, 'Wi-Fi · fast', 'browsers cannot tell 4G from 5G, so the top grade is just "fast"');
  await s.context.close();

  const s2 = await session(browser);
  const iphone = await startCall(s2, {
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
  });
  assert.equal(iphone.phoneModel, 'iPhone');
  assert.equal(iphone.os, 'iOS 17.5');
  assert.equal(iphone.browser, 'Safari 17');
  assert.equal(iphone.memory, '', 'Safari does not tell the memory');
  assert.equal(iphone.network, '', 'or the network');
  noErrors(s2);
  await s2.context.close();

  const s3 = await session(browser);
  const old = await startCall(s3, {
    ua: 'Mozilla/5.0 (Linux; Android 11; RMX2185 Build/RP1A.200720.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Mobile Safari/537.36',
    connection: { type: 'cellular', effectiveType: '3g', saveData: true }
  });
  assert.equal(old.phoneModel, 'RMX2185', 'an older browser still names the model in its user agent');
  assert.equal(old.os, 'Android 11');
  assert.equal(old.browser, 'Chrome 99');
  assert.equal(old.network, 'Mobile data · medium (3G speed) · data saver');
  await s3.context.close();
});

/* Wait until the question on screen has its clock running. */
async function clockRunning(page) {
  await page.waitForFunction(() => {
    const k = Object.keys(localStorage).find(x => x.endsWith(':attempt'));
    return k && JSON.parse(localStorage.getItem(k)).deadline;
  });
}

const shownNumber = async page => {
  const q = await text(page, '#qText');
  return QUIZZES[C].findIndex(x => x.q === q) + 1;
};

await test('timings: each question\'s time in the order seen, kept across a reload, and the total', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await start(s, page);
  const full = await secondsLeft(page);
  const seen = [];

  seen.push(await shownNumber(page));
  await clockRunning(page);
  await s.skip(7000);
  await pick(page, C, true);
  await page.click('#nextBtn');

  seen.push(await shownNumber(page));
  await clockRunning(page);
  await s.skip(12000);
  await pick(page, C, false);
  await page.click('#nextBtn');

  seen.push(await shownNumber(page));
  await clockRunning(page);
  await page.reload();                                    // the times so far must survive this
  await page.waitForSelector('#noticeModal:not([hidden])');
  await page.click('#noticeOk');
  await runOut(s, page);                                  // nothing chosen

  for (let i = 3; i < N; i++) {
    seen.push(await shownNumber(page));
    await clockRunning(page);
    await s.skip(1000);
    await pick(page, C, true);
    await page.click('#nextBtn');
  }
  await page.waitForSelector('#result:not([hidden])');

  const sent = posts(s, 'result')[0].full;
  /* The test's own clicks take a moment of real time on top of the skipped seconds, so allow one second over. */
  const want = [[7, ''], [12, ''], [full, ' (no answer)']].concat(seen.slice(3).map(() => [1, '']));
  const got = sent.questionTimes.split(' · ');
  assert.equal(got.length, N, sent.questionTimes);
  got.forEach((part, i) => {
    const m = part.match(/^Q(\d+) (\d+)s( \(no answer\))?$/);
    assert.ok(m, 'format: ' + part);
    assert.equal(Number(m[1]), seen[i], 'in the order seen, numbered as in the question bank');
    assert.ok(Number(m[2]) >= want[i][0] && Number(m[2]) <= want[i][0] + 1, `${part}: about ${want[i][0]}s`);
    assert.equal(m[3] || '', want[i][1]);
  });
  assert.equal(Number(got[2].match(/ (\d+)s/)[1]), full, 'a question that runs out shows exactly its full time');
  const sum = 7 + 12 + full + (N - 3);
  assert.ok(sent.timeTaken >= sum && sent.timeTaken <= sum + 15, `total ${sent.timeTaken}s, questions alone ${sum}s`);
  assert.deepEqual(posts(s, 'result')[0].body, resultBody('Aanya Sharma', C, N - 2, N, 1, 1));
  await s.context.close();
}, N >= 4);

/* Every start call writes a row in the sheet, so a slow typist pausing
   between letters must not send one per half-typed name. */
await test('typing sends nothing: one start call, at Start, with the name as finally typed', async () => {
  const other = Object.keys(QUIZZES).find(c => c !== C);
  const s = await session(browser);
  const page = await s.open(site.url);
  await page.click(`.cls[data-cls="${C}"]`);
  await page.focus('#studentName');
  for (const ch of '  Avneet    Kaur ') {                // a child typing slowly, pausing after every letter
    await page.keyboard.type(ch);
    await s.skip(2000);
  }
  await page.click(`.cls[data-cls="${other}"]`);
  await s.skip(2000);
  await page.click(`.cls[data-cls="${C}"]`);
  await page.locator('#studentName').blur();
  await s.skip(2000);
  assert.equal(posts(s, 'start').length, 0, 'nothing is sent while typing, pausing, changing class or leaving the box');

  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  assert.equal(posts(s, 'start').length, 1);
  assert.deepEqual(posts(s, 'start')[0].body, { action: 'start', studentName: 'Avneet Kaur', className: C, total: N }, 'extra spaces are tidied');

  await page.click('#readyBack');
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  assert.equal(posts(s, 'start').length, 1, 'going back and tapping Start again reuses the verdict');

  await page.click('#readyBack');
  await page.click(`.cls[data-cls="${other}"]`);
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  assert.equal(posts(s, 'start').length, 2, 'a different class is asked about');
  assert.equal(posts(s, 'start')[1].body.className, other);
  await s.context.close();
});

await test('duplicate name: the quiz never starts, and Start again does not ask twice', async () => {
  const s = await session(browser, { api: { start: () => ({ error: 'duplicate' }) } });
  const page = await s.open(site.url);
  await fillForm(page, 'Aanya Sharma', C);
  await s.skip(1500);
  assert.equal(posts(s, 'start').length, 0);
  await page.click('#startBtn');
  await page.waitForSelector('#readyModal', { state: 'hidden' });
  await page.waitForSelector('.name-state.bad');
  assert.match(await text(page, '#formMsg'), /A submission already exists for this name & class/);
  await page.click('#startBtn');
  await s.skip(4000);
  assert.equal(await visible(page, '#readyModal'), false);
  assert.equal(await visible(page, '#quiz'), false);
  assert.match(await text(page, '#formMsg'), /A submission already exists/);
  assert.equal(posts(s, 'start').length, 1, 'the duplicate verdict is reused');
  await s.context.close();

  let release;
  const gate = new Promise(r => { release = r; });
  const s2 = await session(browser, { api: { start: async () => { await gate; return { error: 'duplicate' }; } } });
  const p2 = await s2.open(site.url);
  await fillForm(p2, 'Aanya Sharma', C);
  await p2.click('#startBtn');
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


console.log('\nThe submission window');

await test('before Saturday the quiz is closed: Start is disabled and no name check is sent', async () => {
  const s = await session(browser, { clock: DAY_BEFORE });
  const page = await s.open(site.url);
  assert.equal(await page.isDisabled('#startBtn'), true);
  assert.match(await text(page, '#formMsg'), new RegExp('The quiz opens on ' + SAT_LABEL));
  await fillForm(page, 'Aanya Sharma', C);
  await s.skip(1500);
  assert.equal(posts(s, 'start').length, 0, 'no start call outside the window');
  await page.evaluate(() => document.getElementById('startForm').requestSubmit());
  await s.skip(500);
  assert.equal(await visible(page, '#readyModal'), false);
  assert.match(await text(page, '#formMsg'), /The quiz opens on/);
  noErrors(s);
  await s.context.close();
});

await test('inside the window the quiz starts as before', async () => {
  const s = await session(browser, { clock: QUIZ_MORNING });
  const page = await s.open(site.url);
  assert.equal(await page.isDisabled('#startBtn'), false);
  await start(s, page);
  assert.equal(await qNumber(page), 1);
  await s.context.close();
});

await test('after Monday 23:59:59 the quiz is closed and the results date is named', async () => {
  const s = await session(browser, { clock: TUESDAY });
  const page = await s.open(site.url);
  assert.equal(await page.isDisabled('#startBtn'), true);
  assert.match(await text(page, '#formMsg'), new RegExp('Submissions closed on ' + MON_LABEL));
  assert.match(await text(page, '#formMsg'), new RegExp('Results open on ' + TUE_LABEL));
  /* Once results are open, the way to them is on the home screen itself,
     right under the closed message, not only in the footer. */
  assert.equal(await visible(page, '#resultsBtn'), true, 'results button is visible once results open');
  assert.match(await text(page, '#resultsBtn'), /See the latest results/);
  assert.equal(await page.getAttribute('#resultsBtn', 'href'), 'results.html');
  await fillForm(page, 'Aanya Sharma', C);
  await s.skip(1500);
  assert.equal(posts(s, 'start').length, 0);
  await page.evaluate(() => document.getElementById('startForm').requestSubmit());
  await s.skip(500);
  assert.equal(await visible(page, '#readyModal'), false);
  await s.context.close();
});

await test('the results button stays hidden until results open: not before Saturday, not on Monday night', async () => {
  const s = await session(browser, { clock: DAY_BEFORE });
  const page = await s.open(site.url);
  assert.equal(await visible(page, '#resultsBtn'), false, 'no results button before the quiz opens');
  await s.context.close();

  const s2 = await session(browser, { clock: MONDAY_LATE });
  const p2 = await s2.open(site.url);
  assert.equal(await visible(p2, '#resultsBtn'), false, 'no results button while the window is still open');
  await s2.context.close();
});

await test('an attempt started on Monday evening may finish after midnight', async () => {
  const s = await session(browser, { clock: MONDAY_NIGHT });
  const page = await s.open(site.url);
  await start(s, page);
  /* A quiz lasts at most ten questions, so step the clock a minute at a
     time: each step runs one question out, and the next question's clock
     is set only once its photo has answered. One long jump cannot do
     that, because the photos answer in real time. */
  for (let i = 0; i < 20; i++) {
    if (await visible(page, '#result')) break;
    await page.waitForFunction(() => {
      const k = Object.keys(localStorage).find(x => x.endsWith(':attempt'));
      return k && JSON.parse(localStorage.getItem(k)).deadline;
    });
    await s.skip(60 * 1000);
  }
  await page.waitForSelector('#result:not([hidden])');
  await page.waitForSelector('.save.ok');
  assert.equal(posts(s, 'result').length, 1);
  assert.deepEqual(posts(s, 'result')[0].body, resultBody('Aanya Sharma', C, 0, N, 0, N));
  await s.context.close();
});

await test('a reload after the window has closed drops the quiz instead of resuming it', async () => {
  const s = await session(browser, { clock: MONDAY_LATE });
  const page = await s.open(site.url);
  await start(s, page);
  assert.equal(await qNumber(page), 1);
  await s.setTime(TUESDAY_EARLY);                        // just past midnight, before the question runs out
  await page.reload();
  await page.waitForSelector('#home:not([hidden])');
  assert.equal(await visible(page, '#noticeModal'), false, 'no welcome-back notice');
  assert.match(await text(page, '#formMsg'), new RegExp('Submissions closed on ' + MON_LABEL));
  assert.equal(await page.evaluate(() => Object.keys(localStorage).some(k => k.endsWith(':attempt'))), false);
  noErrors(s);
  await s.context.close();
});

await test('the sheet saying closed is shown plainly, at Start and at save time', async () => {
  let release;
  const gate = new Promise(r => { release = r; });
  const s = await session(browser, { api: { start: async () => { await gate; return { error: 'closed' }; } } });
  const page = await s.open(site.url);
  await fillForm(page, 'Aanya Sharma', C);
  await page.click('#startBtn');                         // the sheet's answer is held back until released
  await page.waitForSelector('#readyModal:not([hidden])');
  release();
  await page.waitForSelector('#readyModal', { state: 'hidden' });
  assert.match(await text(page, '#formMsg'), /Submissions closed on/);
  assert.equal(await visible(page, '#quiz'), false);
  await s.context.close();

  const s2 = await session(browser, { api: { result: () => ({ error: 'closed' }) } });
  const p2 = await s2.open(site.url);
  await start(s2, p2);
  await playAll(p2, C, true);
  await p2.waitForSelector('.save.fail');
  assert.equal(await text(p2, '#saveText'), 'Submissions have closed — this result was not saved. Please tell your teacher.');
  assert.equal(posts(s2, 'result').length, 1, 'a closed result is not retried');
  await p2.reload();
  await p2.waitForSelector('#home:not([hidden])');
  await s2.skip(500);
  assert.equal(posts(s2, 'result').length, 1, 'a closed result is not sent again on the next open');
  await s2.context.close();
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
    await seeAnswers(s, page, n);
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
  await seeAnswers(s, page, N);
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
  const times = posts(s, 'result')[0].full.questionTimes.split(' · ');
  assert.equal(times.length, 3, 'times for the questions reached: answered, locked, and the one it ended on');
  assert.match(times[1], /^Q\d+ [56]s$/, 'the locked question stops at the moment of leaving: ' + times[1]);
  assert.match(times[2], /^Q\d+ [56]s \(no answer\)$/, times[2]);
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
  /* A plain substring check false-positives when an option is part of
     another word in the page (e.g. "The wind" inside "The window"), so
     match only text bounded by non-letters on both sides. */
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const inSource = s => new RegExp('(?<![A-Za-z])' + esc(s) + '(?![A-Za-z])').test(html);
  let checked = 0;
  for (const list of Object.values(QUIZZES)) {
    for (const item of list) {
      if (item.q.length >= 12) assert.equal(inSource(item.q), false, 'question found in source: ' + item.q);
      for (const o of item.o) if (o.length >= 7) { assert.equal(inSource(o), false, 'option found in source: ' + o); checked++; }
    }
  }
  for (const url of Object.values(QUESTION_IMAGES)) assert.equal(inSource(url), false, 'photo address found in source');
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

await test('the answers stay locked while submissions are open, and open by themselves when they close', async () => {
  const s = await session(browser, { clock: QUIZ_MORNING });
  const page = await s.open(site.url);
  await start(s, page);
  await playAll(page, C, false);
  assert.equal(await text(page, '#lockTitle'), 'Answers open on ' + TUE_LABEL);
  assert.equal(await page.locator('#reviewList li').count(), 0);
  const locked = async () => {
    const shown = await page.evaluate(() => document.body.innerText);
    for (const item of QUIZZES[C]) {
      if (item.o[item.a].length >= 5) assert.equal(shown.includes(item.o[item.a]), false, 'a correct answer is on the locked page: ' + item.o[item.a]);
    }
  };
  await locked();
  assert.equal(await text(page, '#scoreNum'), '0', 'the score itself is shown');

  /* Saturday 8 PM used to open the answers while classmates could still play until Monday night. */
  await s.skip(10.6 * 3600 * 1000);                      // Saturday, just after 8 PM in India
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#reviewList li').count(), 0, 'still locked on Saturday night');
  await s.skip(24 * 3600 * 1000);                        // Sunday night, window still open
  await page.click('#doneBtn');
  await page.click('.drow');
  assert.equal(await visible(page, '#answersLock'), true, 'still locked on Sunday, reopened from the home screen');
  await locked();

  await seeAnswers(s, page, N);                          // Tuesday, just after midnight in India
  assert.equal(await visible(page, '#answersLock'), false);
  await s.context.close();

  /* Once the window has closed, a result reopened from the home screen shows its answers at once. */
  const s2 = await session(browser, { clock: MONDAY_NIGHT });
  const p2 = await s2.open(site.url);
  await start(s2, p2);
  await playAll(p2, C, true);
  assert.equal(await text(p2, '#lockTitle'), 'Answers open on ' + TUE_LABEL);
  await s2.skip(24 * 3600 * 1000);
  await p2.reload();
  await p2.click('.drow');
  assert.equal(await visible(p2, '#answersLock'), false);
  assert.equal(await p2.locator('#reviewList li').count(), N);
  await s2.context.close();
}, usualLock);

await test('a page opened before Saturday offers Start on Saturday without a reload', async () => {
  const s = await session(browser, { clock: DAY_BEFORE });
  const page = await s.open(site.url);
  assert.equal(await page.isDisabled('#startBtn'), true);
  assert.match(await text(page, '#formMsg'), /The quiz opens on/);
  await s.skip(20 * 3600 * 1000);                        // Saturday morning, same tab
  await page.waitForFunction(() => !document.getElementById('startBtn').disabled);
  assert.equal(await visible(page, '#formMsg'), false, 'the "opens on" message is gone');
  await start(s, page);
  assert.equal(await qNumber(page), 1);
  await s.context.close();

  /* Also when the timer was held back (a sleeping phone): coming back to the page re-checks. */
  const s2 = await session(browser, { clock: DAY_BEFORE });
  const p2 = await s2.open(site.url);
  await s2.context.clock.setSystemTime(new Date(quizDay + 4 * 3600 * 1000));   // the clock jumps; no timer fires
  await p2.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await p2.waitForFunction(() => !document.getElementById('startBtn').disabled);
  assert.equal(await visible(p2, '#formMsg'), false);
  await s2.context.close();
});


console.log('\nResults page');

/* Fixture rows in the published sheet's format, served as the latest
   week's tab in the tests. (The rows are from the 31 October tab; the
   page shows name, class and marks, never the timestamps.) */
const RESULTS_CSV =
  'Timestamp,Student Name,Class,Score,Total,Percentage,Tab Switches,Unattempted,Status\n' +
  '10/31/2026 14:15:14,Hargun singh,UKG,9,10,90%,0,0,COMPLETED\n' +
  '10/31/2026 15:01:25,Anukaran,UKG,10,10,100%,0,0,COMPLETED\n' +
  '10/31/2026 14:20:12,Taanvi,UKG,9,10,90%,0,0,COMPLETED\n' +
  '10/31/2026 16:00:00,Meera,1,8,10,80%,0,0,COMPLETED\n' +
  '10/31/2026 16:05:00,Arjun,1,10,10,100%,0,0,COMPLETED\n' +
  '10/31/2026 17:00:00,Started Kid,2,,,,0,,STARTED\n';

/* This week's tab name, derived from WEEK.date, so the fixtures follow
   the quiz date instead of one particular week: '21 November'. */
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK_NAME = Number(WEEK.date.slice(8, 10)) + ' ' + MONTHS_FULL[Number(WEEK.date.slice(5, 7)) - 1];
const sheetLine = (text, name) => text.split('\n').find(l => l.includes("'" + name + "'"));

/* results.html with this week's real entry served the fixture CSV under a
   fake gid: the latest week is this week's Saturday, so there is no gap
   note. The real entry's gid is swapped out, never a second entry added,
   so the page fetches the gid the test serves. */
const resultsWithThisWeek = () => {
  const text = fs.readFileSync(RESULTS_PAGE, 'utf8');
  const line = sheetLine(text, WEEK_NAME);
  assert.ok(line, 'this week is in results.html: ' + WEEK_NAME);
  return text.replace(line, line.replace(/gid: \d+/, 'gid: 999999999'));
};

/* results.html with this week's entry removed: the latest week is an
   earlier one, so the gap note shows. */
const resultsWithoutThisWeek = () => {
  const text = fs.readFileSync(RESULTS_PAGE, 'utf8');
  return text.split('\n').filter(l => !l.includes("'" + WEEK_NAME + "'")).join('\n');
};

/* results.html as it stood after the week of `iso`: the latest week is
   that week. Every SHEETS entry dated after `iso` is removed. */
const resultsWithoutAfter = (iso) => {
  const text = fs.readFileSync(RESULTS_PAGE, 'utf8');
  const y = Number(WEEK.date.slice(0, 4));
  return text.split('\n').filter(l => {
    const m = l.match(/\{ name: '(\d+) (\w+)'/);
    if (!m) return true;
    const d = y + '-' + ('0' + (MONTHS_FULL.indexOf(m[2]) + 1)).slice(-2) + '-' + ('0' + m[1]).slice(-2);
    return d <= iso;
  }).join('\n');
};

await test('results: from Tuesday the latest week shows name, class and marks, started rows left out', async () => {
  const week = await serve(undefined, resultsWithThisWeek);
  const s = await session(browser, { clock: TUESDAY, csv: { '999999999': RESULTS_CSV } });
  const page = await s.open(week.url + 'results.html');
  await page.waitForSelector('#resultsTable:not([hidden])');
  assert.match(await text(page, '#weekLabel'), new RegExp(WEEK.theme + ' · ' + SAT_LABEL + ' 2026'));
  /* The latest tab is the most recent Saturday, so there is no gap note. */
  assert.equal(await visible(page, '#weekNote'), false, 'no gap note when the latest tab is the last Saturday');
  const rows = await page.$$eval('#resultsBody tr', ns => ns.map(n => n.innerText));
  assert.equal(rows.length, 5, 'the started row is left out');
  assert.ok(rows[0].includes('Anukaran') && rows[0].includes('10/10'), 'best in UKG first');
  assert.ok(rows.some(r => r.includes('Meera') && r.includes('8/10 · 80%')));
  assert.match(await text(page, '#count'), /5 results/);
  noErrors(s);
  await s.context.close();
});

await test('results: before the latest week\'s Tuesday, no rows are shown', async () => {
  const old = await serve(undefined, () => resultsWithoutAfter('2026-10-31'));
  const s = await session(browser, { clock: BEFORE_31OCT_TUESDAY, csv: { '1788775249': RESULTS_CSV } });
  const page = await s.open(old.url + 'results.html');
  await page.waitForFunction(() => document.getElementById('status').textContent.includes('Results open on'));
  assert.match(await text(page, '#status'), /Results open on Tue 3 Nov 2026/);
  assert.equal(await visible(page, '#resultsTable'), false);
  await s.context.close();
});

await test('results: when the latest tab is older than the last Saturday, the page says those results are not in the sheet yet', async () => {
  const old = await serve(undefined, () => resultsWithoutAfter('2026-10-31'));
  const s = await session(browser, { clock: TUESDAY, csv: { '1788775249': RESULTS_CSV } });
  const page = await s.open(old.url + 'results.html');
  await page.waitForSelector('#resultsTable:not([hidden])');
  assert.match(await text(page, '#weekLabel'), /Festivals & Diwali Celebrations · Sat 31 Oct 2026/);
  assert.equal(await visible(page, '#weekNote'), true, 'the gap note shows when the latest tab is older than the last Saturday');
  assert.match(await text(page, '#weekNote'), /These are the latest results in the sheet/);
  assert.match(await text(page, '#weekNote'), new RegExp('The quiz of ' + SAT_LABEL + ' 2026 has no results tab yet'));
  assert.match(await text(page, '#count'), /5 results/);
  noErrors(s);
  await s.context.close();
});

await test('results: the class filter and the name search narrow the rows', async () => {
  const week = await serve(undefined, resultsWithThisWeek);
  const s = await session(browser, { clock: TUESDAY, csv: { '999999999': RESULTS_CSV } });
  const page = await s.open(week.url + 'results.html');
  await page.waitForSelector('#resultsTable:not([hidden])');
  await page.selectOption('#classFilter', '1');
  assert.equal(await page.locator('#resultsBody tr').count(), 2);
  assert.match(await text(page, '#count'), /2 of 5 results/);
  await page.selectOption('#classFilter', '');
  await page.fill('#nameSearch', 'aan');
  assert.equal(await page.locator('#resultsBody tr').count(), 1);
  assert.match(await text(page, '#resultsBody tr'), /Taanvi/);
  await s.context.close();
});

await test('results: if the sheet cannot be reached, the page says so and offers a retry', async () => {
  const s = await session(browser, { clock: TUESDAY });
  const page = await s.open(site.url + 'results.html');
  await page.waitForSelector('#status.err');
  assert.match(await text(page, '#status'), /Could not load the results/);
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
    if (bad === wrongSig || bad === pastEnd) {
      /* A real attempt that can no longer be used is dropped with a notice, not silently. */
      await page.waitForSelector('#noticeModal:not([hidden])');
      assert.match(await text(page, '#noticeText'), /could not be continued/);
      await page.click('#noticeOk');
    } else {
      assert.equal(await visible(page, '#noticeModal'), false);
    }
    assert.equal(await visible(page, '#deviceBox'), false);
    const keys = await page.evaluate(() => Object.keys(localStorage));
    assert.equal(keys.includes(key), false, 'the unusable record is cleared');
    assert.equal(keys.some(k => k.includes('1999-01-01')), false, 'last week is forgotten');
    assert.ok(keys.includes('unrelated'), 'other sites\' data is left alone');
    noErrors(s);
    await s.context.close();
  }
});


await test('a theme change does not lose this week: an old theme-hash key is migrated to the date-only key', async () => {
  const s0 = await session(browser);
  const p0 = await s0.open(site.url);
  await start(s0, p0);
  const key = await p0.evaluate(() => Object.keys(localStorage).find(k => k.endsWith(':attempt')));
  const good = await p0.evaluate(k => localStorage.getItem(k), key);
  await s0.context.close();

  /* Pretend the page still used the old identity: date plus a hash of the theme. */
  const oldKey = key.replace(':attempt', '.deadbeef:attempt');
  const s = await session(browser);
  const page = await s.open(site.url);
  await page.evaluate(([k, v, nk]) => {
    localStorage.removeItem(nk);
    localStorage.setItem(k, v);
  }, [oldKey, good, key]);
  await page.reload();
  await page.waitForSelector('#quiz:not([hidden]) .opt');
  assert.equal(await qNumber(page), 1, 'the saved quiz resumes under the new key');
  assert.equal(await page.evaluate(k => !!localStorage.getItem(k), key), true, 'the old key was migrated');
  assert.equal(await page.evaluate(k => !!localStorage.getItem(k), oldKey), false, 'the old key is gone');
  noErrors(s);
  await s.context.close();
});

await test('a reload during the 3-2-1 countdown resumes the quiz instead of losing it', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await fillForm(page, 'Aanya Sharma', C);
  await page.click('#startBtn');
  await page.waitForSelector('#beginBtn:not([disabled])');
  await page.click('#beginBtn');
  await page.reload();   /* during the countdown, before the first question */
  await page.waitForSelector('#quiz:not([hidden]) .opt');
  assert.equal(await qNumber(page), 1);
  noErrors(s);
  await s.context.close();
});

await test('an emoji on its own is not a name', async () => {
  const s = await session(browser);
  const page = await s.open(site.url);
  await fillForm(page, '😀', C);
  await page.click('#startBtn');
  assert.match(await text(page, '#formMsg'), /Please enter your name/);
  assert.equal(await visible(page, '#readyModal'), false);
  noErrors(s);
  await s.context.close();
});

await test('an unknown server error does not start the quiz; a network failure still does', async () => {
  const s = await session(browser, { api: { start: () => ({ ok: false }) } });
  const page = await s.open(site.url);
  await fillForm(page, 'Aanya Sharma', C);
  await page.click('#startBtn');
  await page.waitForFunction(() => document.getElementById('formMsg').textContent.includes('Could not check your name'));
  assert.equal(await visible(page, '#readyModal'), false);
  assert.equal(await visible(page, '#quiz'), false);
  noErrors(s);
  await s.context.close();

  const s2 = await session(browser, { api: { start: () => 'fail' } });
  const p2 = await s2.open(site.url);
  await start(s2, p2);
  assert.equal(await qNumber(p2), 1, 'a network failure still lets the student through');
  await s2.context.close();
});

await test('the home screen lists the latest ten finished results, with a button for older ones', async () => {
  const recs = Array.from({ length: 12 }, (_, i) => ({
    id: 'x' + i, name: 'Student ' + (i + 1), cls: '1', sig: 'x', order: [], answers: [],
    score: 5 + (i % 5), total: 10, unattempted: 0, leaves: 0,
    timeTaken: 60, questionTimes: '', how: '', at: Date.now(), saved: 'yes'
  }));
  const s = await session(browser);
  const page = await s.open(site.url);
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), ['gsq:' + WEEK.date + ':done', JSON.stringify(recs)]);
  await page.reload();
  await page.waitForSelector('#deviceBox:not([hidden])');
  assert.equal(await page.locator('#deviceList .drow').count(), 10, 'only the latest ten at first');
  assert.equal(await visible(page, '#olderBtn'), true);
  await page.click('#olderBtn');
  assert.equal(await page.locator('#deviceList .drow').count(), 12, 'ten more after one tap');
  assert.equal(await visible(page, '#olderBtn'), false, 'no button when nothing is left');
  noErrors(s);
  await s.context.close();
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
  await seeAnswers(s, page, 3);
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
