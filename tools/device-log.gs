/*
  DEVICE LOG for the Great Saturday Quiz: paste into the quiz's Apps Script.

  The quiz page sends phone details with every "start" call, and phone
  details plus timings with every "result" call. The existing script
  ignores them. This saves them, one row per call, so a teacher can see
  when two names were played on the same phone, or a quiz finished
  suspiciously fast.

  The rows go into a SEPARATE spreadsheet that is never published. The
  results spreadsheet is published to the web (all of its tabs, the class
  tabs included), so a tab or column added there would be public.

  Setting it up, once:

  1. Create a new Google Sheet, for example "Quiz device log". Do not
     publish it, and share it only with the teachers who need it.
  2. Copy its ID from the address bar, the part between /d/ and /edit:
        docs.google.com/spreadsheets/d/THIS_PART/edit
     and paste it into DEVICE_LOG_SPREADSHEET_ID below.
  3. Paste this whole file at the bottom of the quiz's Apps Script.
  4. Add this as the FIRST line inside the existing doPost function:
        logDevice(e);
     (If doPost names its argument something other than e, use that name.)
  5. Deploy > Manage deployments > the pencil (Edit) on the existing
     deployment > Version: New version > Deploy.
     Do NOT choose "New deployment": that gives the script a new URL, and
     the quiz page would stop reaching it.
     If Google asks to authorise the script again, allow it: it now opens
     a second spreadsheet.

  A problem in the log never stops a start or a result from being saved:
  every error here is swallowed. Each call takes a moment longer (the
  second spreadsheet is opened), usually well under a second.

  What each column holds, as sent by index.html:
    Time Taken (s)        seconds from the first question to the end,
                          reloads and time away included
    Seconds per Question  "Q4 12s · Q1 8s · Q9 40s (no answer)": in the
                          order the student saw them, numbered as in that
                          week's question list; a full-time entry means
                          the clock ran out
    Phone Model           "SM-A146B" (look the code up online), "iPhone"
                          (iPhones never tell the model), or blank
    Screen                "412×915 @2.63x, window 412×780"; a window much
                          smaller than the screen means split screen or a
                          pop-up window
    Network               "Wi-Fi · 4G speed", "Mobile data · 3G speed";
                          blank on iPhones
*/

const DEVICE_LOG_SPREADSHEET_ID = 'PASTE_THE_ID_HERE';

const DEVICE_LOG_COLUMNS = [
  ['Timestamp',            function (d) { return new Date(); }],
  ['Call',                 function (d) { return d.action; }],
  ['Student Name',         function (d) { return d.studentName; }],
  ['Class',                function (d) { return d.className; }],
  ['Score',                function (d) { return d.score; }],
  ['Total',                function (d) { return d.total; }],
  ['Tab Switches',         function (d) { return d.tabSwitches; }],
  ['Time Taken (s)',       function (d) { return d.timeTaken; }],
  ['Seconds per Question', function (d) { return d.questionTimes; }],
  ['Phone Model',          function (d) { return d.phoneModel; }],
  ['OS',                   function (d) { return d.os; }],
  ['Browser',              function (d) { return d.browser; }],
  ['Screen',               function (d) { return d.screen; }],
  ['Memory',               function (d) { return d.memory; }],
  ['CPU Cores',            function (d) { return d.cpuCores; }],
  ['Graphics',             function (d) { return d.gpu; }],
  ['Language',             function (d) { return d.language; }],
  ['Time Zone',            function (d) { return d.timeZone; }],
  ['Network',              function (d) { return d.network; }]
];

function logDevice(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.action !== 'start' && d.action !== 'result') return;

    var sheet = SpreadsheetApp.openById(DEVICE_LOG_SPREADSHEET_ID).getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(DEVICE_LOG_COLUMNS.map(function (c) { return c[0]; }));
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(DEVICE_LOG_COLUMNS.map(function (c) {
      var v = c[1](d);
      if (v === undefined || v === null) return '';
      if (typeof v === 'string') {
        v = v.slice(0, 200);
        /* Text typed into the page must never run as a formula in the sheet. */
        if (/^[=+\-@]/.test(v)) v = "'" + v;
      }
      return v;
    }));
  } catch (err) {
    /* Never let the log stop a start or a result from being saved. */
  }
}
