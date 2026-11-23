/*
  DEVICE LOG for the Great Saturday Quiz: paste into the quiz's Apps Script.

  The quiz page sends phone details with every "start" call, and phone
  details plus timings with every "result" call. The existing script
  ignores them. This saves them, ONE ROW PER ATTEMPT: Start adds a row
  marked "Started", and the result fills in that same row and marks it
  "Finished". A row still marked "Started" is an attempt that was never
  finished (or a Start the sheet refused as a duplicate name).

  The rows go into a SEPARATE spreadsheet that is never published. The
  results spreadsheet is published to the web (all of its tabs, the class
  tabs included), so a tab or column added there would be public. Keep
  the log sheet's General access on "Restricted", not "Anyone with the
  link": it holds details about children.

  Setting it up, once:

  1. Create a new Google Sheet, for example "Quiz device log". Do not
     publish it, and share it only with the teachers who need it.
  2. Copy its ID from the address bar, the part between /d/ and /edit:
        docs.google.com/spreadsheets/d/THIS_PART/edit
     and paste it into DEVICE_LOG_SPREADSHEET_ID below.
  3. Paste this whole file into the quiz's Apps Script, as its own file.
  4. Add this as the FIRST line inside the existing doPost function:
        logDevice(e);
     (If doPost names its argument something other than e, use that name.)
  5. Run testDeviceLog once from the editor (allow it if Google asks).
  6. Deploy > Manage deployments > select the deployment the quiz uses
     (its URL ends in HQjHAnDfkJ/exec) > the pencil (Edit) >
     Version: New version > Deploy.
     Do NOT choose "New deployment": that gives the script a new URL, and
     the quiz page would not use it.

  If the first tab of the log sheet has headings from an older version of
  this code, a new tab with the current headings is added in front of it
  and used from then on; the old tab is left as it was.

  A problem in the log never stops a start or a result from being saved:
  every error here is swallowed. Each call takes a moment longer (the
  second spreadsheet is opened), usually well under a second.

  What some columns hold, as sent by index.html:
    Time Taken (s)        seconds from the first question to the end,
                          reloads and time away included
    Seconds per Question  "Q4 12s · Q1 8s · Q9 40s (no answer)": in the
                          order the student saw them, numbered as in that
                          week's question list; a full-time entry means
                          the clock ran out
    Phone Model           "SM-M336BU" (look the code up online), "iPhone"
                          (iPhones never tell the model), or blank
    Memory                a range, "4–8 GB": browsers round it down
    Screen                "384×857 @2.81x, window 384×725"; a window much
                          smaller than the screen means split screen or a
                          pop-up window
    Network               "Mobile data · fast", "Wi-Fi · medium (3G
                          speed)": browsers report speed, not 4G or 5G,
                          and "fast" covers both; blank on iPhones
*/

const DEVICE_LOG_SPREADSHEET_ID = 'PASTE_THE_ID_HERE';

/* [heading, value from the request, filled in at: 'start', 'result' or 'both'] */
const DEVICE_LOG_COLUMNS = [
  ['Started',              function (d) { return new Date(); },             'start'],
  ['Finished',             function (d) { return new Date(); },             'result'],
  ['Status',               function (d) { return d.action === 'result' ? 'Finished' : 'Started'; }, 'both'],
  ['Student Name',         function (d) { return d.studentName; },          'both'],
  ['Class',                function (d) { return d.className; },            'both'],
  ['Score',                function (d) { return d.score; },                'result'],
  ['Total',                function (d) { return d.total; },                'both'],
  ['Tab Switches',         function (d) { return d.tabSwitches; },          'result'],
  ['Time Taken (s)',       function (d) { return d.timeTaken; },            'result'],
  ['Seconds per Question', function (d) { return d.questionTimes; },        'result'],
  ['Phone Model',          function (d) { return d.phoneModel; },           'both'],
  ['OS',                   function (d) { return d.os; },                   'both'],
  ['Browser',              function (d) { return d.browser; },              'both'],
  ['Screen',               function (d) { return d.screen; },               'both'],
  ['Memory',               function (d) { return d.memory; },               'both'],
  ['CPU Cores',            function (d) { return d.cpuCores; },             'both'],
  ['Graphics',             function (d) { return d.gpu; },                  'both'],
  ['Language',             function (d) { return d.language; },             'both'],
  ['Time Zone',            function (d) { return d.timeZone; },             'both'],
  ['Network',              function (d) { return d.network; },              'both']
];

/* How far back a result looks for its Started row. */
const DEVICE_LOG_LOOKBACK = 3000;

function deviceLogCell(column, d) {
  var v = column[1](d);
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') {
    v = v.slice(0, 200);
    /* Text typed into the page must never run as a formula in the sheet. */
    if (/^[=+\-@]/.test(v)) v = "'" + v;
  }
  return v;
}

/* The tab to write to, with the current headings in row 1. */
function deviceLogSheet() {
  var book = SpreadsheetApp.openById(DEVICE_LOG_SPREADSHEET_ID);
  var sheet = book.getSheets()[0];
  var headings = DEVICE_LOG_COLUMNS.map(function (c) { return c[0]; });

  if (sheet.getLastRow() > 0) {
    var have = sheet.getRange(1, 1, 1, headings.length).getValues()[0];
    if (have.join('|') === headings.join('|')) return sheet;
    sheet = book.insertSheet(0);   /* older headings: start a fresh tab in front */
  }
  sheet.getRange(1, 1, 1, headings.length).setValues([headings]);
  sheet.setFrozenRows(1);
  /* Started and Finished show the date and the time (Sheets may otherwise show the date alone). */
  sheet.getRange('A2:B').setNumberFormat('dd mmm yyyy, hh:mm:ss');
  return sheet;
}

function logDevice(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.action !== 'start' && d.action !== 'result') return;

    var sheet = deviceLogSheet();
    var width = DEVICE_LOG_COLUMNS.length;
    var col = function (name) {
      for (var i = 0; i < width; i++) if (DEVICE_LOG_COLUMNS[i][0] === name) return i;
      return -1;
    };

    if (d.action === 'start') {
      sheet.appendRow(DEVICE_LOG_COLUMNS.map(function (c) {
        return c[2] === 'result' ? '' : deviceLogCell(c, d);
      }));
      return;
    }

    /* A result: fill in the latest Started row for this name and class. */
    var last = sheet.getLastRow();
    var first = Math.max(2, last - DEVICE_LOG_LOOKBACK + 1);
    var rows = last >= first ? sheet.getRange(first, 1, last - first + 1, width).getValues() : [];
    var status = col('Status'), name = col('Student Name'), cls = col('Class');
    var score = col('Score'), taken = col('Time Taken (s)');
    var same = function (row) {
      return String(row[name]) === String(d.studentName) && String(row[cls]) === String(d.className);
    };

    for (var i = rows.length - 1; i >= 0; i--) {
      var row = rows[i];
      if (!same(row)) continue;
      if (row[status] === 'Finished' &&
          String(row[score]) === String(d.score) && String(row[taken]) === String(d.timeTaken)) {
        return;   /* the page sent the same result again after a dropped reply */
      }
      if (row[status] === 'Started') {
        var filled = DEVICE_LOG_COLUMNS.map(function (c, k) {
          return c[2] === 'start' ? row[k] : deviceLogCell(c, d);
        });
        sheet.getRange(first + i, 1, 1, width).setValues([filled]);
        return;
      }
    }

    /* No Started row found (for example, it began before this log existed). */
    sheet.appendRow(DEVICE_LOG_COLUMNS.map(function (c) {
      return c[2] === 'start' ? '' : deviceLogCell(c, d);
    }));
  } catch (err) {
    /* Never let the log stop a start or a result from being saved. */
    console.error('logDevice failed:', err);
  }
}

/*
  Run this once from the editor (choose testDeviceLog, then Run). It asks
  for permission the first time, then writes one test row, Started and
  then Finished; delete that row afterwards. A wrong ID shows an error
  here, where logDevice itself would stay silent.
*/
function testDeviceLog() {
  SpreadsheetApp.openById(DEVICE_LOG_SPREADSHEET_ID).getName();
  var call = function (body) { logDevice({ postData: { contents: JSON.stringify(body) } }); };
  call({ action: 'start', studentName: 'TEST - delete this row', className: 'UKG', total: 10, phoneModel: 'test' });
  call({ action: 'result', studentName: 'TEST - delete this row', className: 'UKG', score: 10, total: 10,
         tabSwitches: 0, unattempted: 0, timeTaken: 60, questionTimes: 'Q1 6s', phoneModel: 'test' });
}
