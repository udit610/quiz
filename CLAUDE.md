# The Great Saturday Quiz

A one-page weekly quiz for Vardhman Convent School, Moonak (UKG to Class 8).
The site is `index.html` alone, deployed by Vercel from `main`. Names are
checked and results saved by a Google Apps Script web app (`API_URL` in
`index.html`); its code is not in this repository.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The quiz: styles, markup, script, and this week's questions in scrambled form. |
| `results.html` | The results page: name, class and marks for the latest week, from the published results sheet. |
| `quiz-data.js` | This week's questions, readable. **The only file to edit for a new week.** |
| `tools/build.mjs` | Checks `quiz-data.js` and writes the questions into `index.html`. |
| `tools/test.mjs` | Browser tests of every flow, including the submission window and the results page. Needs Playwright with Chromium; uses no network. |
| `.vercelignore` | Keeps `quiz-data.js`, `tools` and `CLAUDE.md` off the public site; `index.html` and `results.html` are deployed. |

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
remembers, sets when the answers unlock (see `answersAt` below), and sets
the submission window (see below).

## Submission window

The quiz takes submissions only from Saturday 00:00 to Monday 23:59:59,
India time, in the quiz week. The window is derived from `WEEK.date`, so
a new week needs no new setting. Outside it, Start is disabled with a
message, the typing-time name check does not run (it would write a
STARTED row), and an in-progress quiz left over from after the close is
dropped instead of resumed. An attempt that started inside the window
may finish and be saved after it closes.

The page alone cannot truly enforce this: a device clock can be changed,
and the Apps Script can be called directly. The Apps Script must enforce
the same window itself, using its own clock in Asia/Kolkata: reject
`action:'start'` and `action:'result'` outside Saturday 00:00 to Monday
23:59:59 with `{ error: 'closed' }`, except that a `result` with a
matching `start` row from inside the window should still be accepted.
The page already handles that reply: at Start it shows the closed
message, and at save time it says "Submissions have closed" and does not
retry. Until the script is changed, the window is a gate on the page
only, not a guarantee.

## Results page

`results.html` shows the latest week's results from Tuesday onwards, for
the screenshots shared on Tuesday. It reads the published results sheet
(the same source as the Quiz Results Dashboard) and shows Name, Class and
Marks (`Score/Total` plus Percentage) for completed rows only, sorted by
class, then marks, then name, with a class filter and a name search.

Each week, after the results are merged into the master sheet as a date
tab (the Tuesday merge), add the new tab to the `SHEETS` list at the top
of `results.html`: the tab name exactly as it appears in the sheet, and
its gid from the sheet's tab list. Do not guess a gid. Until that entry
is added and deployed, the page keeps showing the previous week, and the
week label on the page says which week it is, so a stale week is obvious.
Before the latest week's Tuesday the page says when the results open and
shows no rows.

## Settings (top of the script in `index.html`)

- `RULES.answersAt` — time on the quiz day, India time, when the correct
  answers open (`"20:00"`). Until then a student sees only their score.
  The answers never open while submissions are still open: if this time
  falls inside the window, they open when it closes (Tuesday 00:00), so a
  child who played on Saturday cannot pass the answers to classmates who
  play on Sunday or Monday. `""` shows the answers straight away.
- `RULES.windowDays` — days after the quiz Saturday that submissions stay
  open (`2`: Sunday and Monday, closing Monday 23:59:59, India time).
  Changing it changes the submission window and the Tuesday the results
  open; the tests check the current value.
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
that class. A reply of `{ error: "closed" }` means the submission window
has shut (see above). `tabSwitches` is the number of times the student
left the quiz. `tools/test.mjs` checks these.

## Checking a change

Open the page through a local server (`npx serve .`), not as a file, so the
browser storage and the screen wake lock behave as they do on the site.
