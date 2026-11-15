# The Great Saturday Quiz

A one-page weekly quiz for Vardhman Convent School, Moonak (UKG to Class 8).
The site is `index.html` alone, deployed by Vercel from `main`. Names are
checked and results saved by a Google Apps Script web app (`API_URL` in
`index.html`); its code is not in this repository.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole site: styles, markup, script, and this week's questions in scrambled form. |
| `quiz-data.js` | This week's questions, readable. **The only file to edit for a new week.** |
| `tools/build.mjs` | Checks `quiz-data.js` and writes the questions into `index.html`. |
| `tools/test.mjs` | Browser tests of every flow. Needs Playwright with Chromium; uses no network. |
| `.vercelignore` | Keeps everything except `index.html` off the public site. |

## Weekly update

1. Edit `quiz-data.js` only: `WEEK` (theme, emoji, the quiz Saturday as
   `YYYY-MM-DD`), `QUESTION_IMAGES`, and `QUIZZES` (classes `UKG`, `1` to `8`).
   The field notes are at the top of that file.
2. Run `node tools/build.mjs`. It stops with a list if anything is wrong
   (a missing photo key, two identical options, a bad date).
3. Run `node tools/test.mjs`. All tests should pass.
4. Commit `quiz-data.js` and `index.html` together.

`node tools/build.mjs --check` reports whether `index.html` matches
`quiz-data.js` without changing anything.

Photo links should be Wikimedia thumbnails at 960px
(`https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Name.jpg/960px-Name.jpg`),
not full-size originals: originals are large, and Wikimedia answers heavy
traffic to them with "429 Too many requests". On a slow connection the page
asks for the 500px version of a 960px link. The build prints a note for any
link that is not a 960px thumbnail.

Do not edit the `QUIZ-DATA` block in `index.html` by hand, and do not put
readable questions or answers anywhere in `index.html`: its source is what
a student can open on the site. The scramble is a deterrent, not
encryption. (This repository is public, so `quiz-data.js` can be read on
GitHub by anyone who finds it; `.vercelignore` only keeps it off the site.)

`WEEK.date` matters: it names the week on the page, resets what each device
remembers, and sets when the answers unlock (see `answersAt` below).

## Settings (top of the script in `index.html`)

- `RULES.answersAt` — time on the quiz day, India time, when the correct
  answers open (`"20:00"`). Until then a student sees only their score.
  `""` shows the answers straight away.
- `RULES.freeLeaves`, `RULES.maxLeaves`, `RULES.leaveGraceMs` — how leaving
  the page is treated: warnings, then the question is locked, then the quiz
  is handed in.
- `RULES.shuffleQuestions` — a different question order for every student.
- `QUESTION_SECONDS_BY_CLASS` — seconds per question.

## Things that must not change without the Apps Script changing too

The page sends exactly these, as `text/plain` JSON, and the sheet depends on
them:

    { action: "start",  studentName, className, total }
    { action: "result", studentName, className, score, total, tabSwitches, unattempted }

A reply of `{ error: "duplicate" }` means the name already has a result for
that class. `tabSwitches` is the number of times the student left the quiz.
`tools/test.mjs` checks these.

## Checking a change

Open the page through a local server (`npx serve .`), not as a file, so the
browser storage and the screen wake lock behave as they do on the site.
