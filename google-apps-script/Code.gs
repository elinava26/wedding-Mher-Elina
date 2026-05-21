/**
 * Wedding RSVP → Google Sheets (GitHub Pages static site).
 *
 * Setup:
 * 1. Open your sheet → row 1 headers (optional):
 *    Timestamp | Question | Name | ExtraGuest | Guest
 * 2. From THAT spreadsheet: Extensions → Apps Script → paste this file → Save.
 *    (The script must be bound to the sheet — do not use a standalone script.google.com project.)
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web app URL (ends with /exec) into VITE_RSVP_SUBMIT_URL (.env.local + GitHub secret).
 */

var SHEET_NAME = 'RSVP';

function getRsvpSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error(
      'Open Extensions → Apps Script from your wedding spreadsheet, not script.google.com.',
    );
  }
  var named = spreadsheet.getSheetByName(SHEET_NAME);
  if (named) {
    return named;
  }
  return spreadsheet.getSheets()[0];
}

function joinField(value) {
  if (value === undefined || value === null) {
    return '';
  }
  if (Array.isArray(value)) {
    return value
      .map(function (item) {
        return String(item).trim();
      })
      .filter(function (item) {
        return item.length > 0;
      })
      .join(', ');
  }
  return String(value).trim();
}

/** HtmlService avoids 302 redirect that breaks browser fetch + JSON parsing. */
function jsonResponse(ok, message) {
  var body = { ok: ok };
  if (message) {
    body.message = message;
  }
  return HtmlService.createHtmlOutput(JSON.stringify(body)).setXFrameOptionsMode(
    HtmlService.XFrameOptionsMode.ALLOWALL,
  );
}

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return jsonResponse(false, 'Missing body');
    }

    var payload = JSON.parse(e.postData.contents);
    var question = joinField(payload.Question);
    var name = joinField(payload.Name);
    var extraGuest = joinField(payload.ExtraGuest);
    var guest = joinField(payload.Guest);

    if (!name) {
      return jsonResponse(false, 'Name is required');
    }
    if (!question) {
      return jsonResponse(false, 'Question is required');
    }
    if (!guest) {
      return jsonResponse(false, 'Guest is required');
    }

    var sheet = getRsvpSheet();
    sheet.appendRow([new Date(), question, name, extraGuest, guest]);

    return jsonResponse(true);
  } catch (err) {
    return jsonResponse(false, String(err));
  }
}
