#!/usr/bin/env node
/*
  Checks quiz-data.js and writes this week's questions into index.html.

      node tools/build.mjs           check the questions, then update index.html
      node tools/build.mjs --check   only report whether index.html is up to date

  The questions go into the page scrambled, so the answers cannot be read
  with "view source". It is a deterrent, not encryption: the page itself
  has to be able to unscramble them.
*/

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = join(root, 'index.html');
const dataPath = join(root, 'quiz-data.js');

const CLASSES = ['UKG', '1', '2', '3', '4', '5', '6', '7', '8'];
const BEGIN = '/* QUIZ-DATA:BEGIN (written by tools/build.mjs from quiz-data.js) */';
const END = '/* QUIZ-DATA:END */';

const { WEEK, QUESTION_IMAGES, QUIZZES } = await import(pathToFileURL(dataPath).href);


/* ---------- check the questions ---------- */

const errors = [];
const warnings = [];
const isText = v => typeof v === 'string' && v.trim() !== '';

if (!WEEK || !isText(WEEK.theme)) errors.push('WEEK.theme is missing');
if (!WEEK || !isText(WEEK.emoji)) errors.push('WEEK.emoji is missing');
if (
  !WEEK ||
  !/^\d{4}-\d{2}-\d{2}$/.test(WEEK.date || '') ||
  Number.isNaN(Date.parse(WEEK.date + 'T00:00:00+05:30')) ||
  new Date(WEEK.date + 'T00:00:00Z').toISOString().slice(0, 10) !== WEEK.date
) {
  errors.push('WEEK.date must be a real date written YYYY-MM-DD');
}
if (
  WEEK &&
  /^\d{4}-\d{2}-\d{2}$/.test(WEEK.date || '') &&
  new Date(WEEK.date + 'T00:00:00Z').getUTCDay() !== 6
) {
  errors.push('WEEK.date must be a Saturday (the quiz is the Great Saturday Quiz)');
}

for (const [key, url] of Object.entries(QUESTION_IMAGES || {})) {
  if (!/^https:\/\/\S+$/.test(url) && !/^data:image\//.test(url)) {
    errors.push(`QUESTION_IMAGES.${key} is not an https or data: image address`);
  }
}

const extra = Object.keys(QUIZZES || {}).filter(c => !CLASSES.includes(c));
if (extra.length) errors.push('QUIZZES has unknown classes: ' + extra.join(', '));

const usedImages = new Set();
const counts = [];

for (const cls of CLASSES) {
  const list = (QUIZZES || {})[cls];
  if (!Array.isArray(list) || list.length === 0) {
    errors.push(`Class ${cls} has no questions`);
    continue;
  }
  counts.push(`${cls}:${list.length}`);
  const seen = new Set();

  list.forEach((item, i) => {
    const at = `Class ${cls}, question ${i + 1}`;
    for (const k of Object.keys(item)) {
      if (!['q', 'o', 'a', 'img', 'pic', 'e'].includes(k)) errors.push(`${at}: unknown field "${k}"`);
    }
    if (!isText(item.q)) errors.push(`${at}: the question text is missing`);
    else if (seen.has(item.q)) warnings.push(`${at}: the same question appears twice in this class`);
    seen.add(item.q);

    if (!Array.isArray(item.o) || item.o.length < 2 || item.o.length > 6) {
      errors.push(`${at}: needs 2 to 6 options`);
    } else {
      if (!item.o.every(isText)) errors.push(`${at}: an option is empty`);
      if (new Set(item.o.map(o => String(o).trim().toLowerCase())).size !== item.o.length) {
        errors.push(`${at}: two options are the same`);
      }
      if (!Number.isInteger(item.a) || item.a < 0 || item.a >= item.o.length) {
        errors.push(`${at}: "a" must point at one of the options`);
      }
    }
    if (item.img !== undefined) {
      if (!(item.img in (QUESTION_IMAGES || {}))) errors.push(`${at}: img "${item.img}" is not in QUESTION_IMAGES`);
      usedImages.add(item.img);
    }
    if (item.pic !== undefined && !isText(item.pic)) errors.push(`${at}: pic is empty`);
    if (item.img !== undefined && item.pic !== undefined) warnings.push(`${at}: has both img and pic; the pic card is shown`);
    if (item.e !== undefined && !isText(item.e)) errors.push(`${at}: e is empty`);
  });
}

for (const [key, url] of Object.entries(QUESTION_IMAGES || {})) {
  if (!usedImages.has(key)) warnings.push(`QUESTION_IMAGES.${key} is not used by any question`);
  if (/wikimedia\.org\//.test(url) && !/\/thumb\/.*\/960px-/.test(url)) {
    warnings.push(
      `QUESTION_IMAGES.${key} is not a 960px Wikimedia thumbnail. Full-size originals are large and ` +
      `Wikimedia refuses heavy traffic to them; use .../thumb/.../960px-<file name>`
    );
  }
}

if (errors.length) {
  console.error('quiz-data.js has problems:\n  - ' + errors.join('\n  - '));
  process.exit(1);
}


/* ---------- scramble ---------- */

/* Only these fields reach the page, in a fixed order, so the output is stable. Unused photos are left out. */
const bank = {
  week: { theme: WEEK.theme, emoji: WEEK.emoji, date: WEEK.date },
  images: Object.fromEntries(Object.entries(QUESTION_IMAGES).filter(([key]) => usedImages.has(key))),
  quizzes: Object.fromEntries(CLASSES.map(cls => [cls, QUIZZES[cls]]))
};

const plain = JSON.stringify(bank);
const key = createHash('sha256').update(plain).digest('hex').slice(0, 32);

/*
  Each byte is swapped for another using a table shuffled from the key, and
  the result is written as hex. Repeated text stays repeated, so the page
  still compresses well on its way to the phone, but none of it is readable.
*/
function table(k) {
  let seed = 0x811c9dc5;
  for (let i = 0; i < k.length; i++) {
    seed ^= k.charCodeAt(i);
    seed = Math.imul(seed, 0x01000193);
  }
  const next = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const p = [];
  for (let i = 0; i < 256; i++) p.push(i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const t = p[i]; p[i] = p[j]; p[j] = t;
  }
  return p;
}

function scramble(text, k) {
  const p = table(k);
  return Buffer.from(Buffer.from(text, 'utf8').map(b => p[b])).toString('hex');
}

/* Must match unpack() in index.html. */
function unscramble(hex, k) {
  const p = table(k);
  const back = new Uint8Array(256);
  for (let i = 0; i < 256; i++) back[p[i]] = i;
  return Buffer.from(Buffer.from(hex, 'hex').map(b => back[b])).toString('utf8');
}

const packed = scramble(plain, key);
if (unscramble(packed, key) !== plain) {
  console.error('Internal error: the scrambled questions do not unscramble.');
  process.exit(1);
}

const lines = packed.match(/.{1,116}/g).map(l => `  "${l}"`).join(',\n');
const block =
  `${BEGIN}\n` +
  `const BANK = { k: "${key}", d: [\n${lines}\n].join("") };\n` +
  `${END}`;


/* ---------- write into the page ---------- */

const page = readFileSync(pagePath, 'utf8');
const from = page.indexOf(BEGIN);
const to = page.indexOf(END);

if (from === -1 || to === -1 || to < from || page.indexOf(BEGIN, from + 1) !== -1) {
  console.error('index.html must contain exactly one QUIZ-DATA:BEGIN … QUIZ-DATA:END block.');
  process.exit(1);
}

const next = page.slice(0, from) + block + page.slice(to + END.length);
const upToDate = next === page;
const total = CLASSES.reduce((n, cls) => n + QUIZZES[cls].length, 0);

for (const w of warnings) console.warn('note: ' + w);

if (process.argv.includes('--check')) {
  if (!upToDate) {
    console.error('index.html is OUT OF DATE. Run: node tools/build.mjs');
    process.exit(1);
  }
  console.log(`index.html is up to date: ${WEEK.emoji} ${WEEK.theme}, ${WEEK.date}, ${total} questions.`);
} else {
  if (!upToDate) writeFileSync(pagePath, next);
  console.log(
    `${upToDate ? 'index.html already up to date' : 'index.html updated'}: ` +
    `${WEEK.emoji} ${WEEK.theme}, ${WEEK.date}, ${total} questions (${counts.join(' ')}), ` +
    `${usedImages.size} photos.`
  );
}
