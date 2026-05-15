/**
 * Google Apps Script to store website technical details.
 * 
 * Instructions:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1lZq1dQAmvsYNkiVyusU4mM8CQbOrN8QEw8AuGq0xefc/edit
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this code.
 * 4. Click 'Save' and name it 'WebsiteDataStore'.
 * 5. Click 'Deploy' > 'New Deployment'.
 * 6. Select 'Web App'.
 * 7. Set 'Execute as' to 'Me'.
 * 8. Set 'Who has access' to 'Anyone'.
 * 9. Click 'Deploy', authorize the permissions, and copy the 'Web App URL'.
 * 10. Paste the URL into your .env.local file as NEXT_PUBLIC_SHEETS_SCRIPT_URL.
 */

const SPREADSHEET_ID = "1lZq1dQAmvsYNkiVyusU4mM8CQbOrN8QEw8AuGq0xefc";

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    const data = JSON.parse(e.postData.contents);
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", 
        "URL", 
        "Strategy", 
        "Performance", 
        "Accessibility", 
        "Best Practices", 
        "SEO", 
        "Security Score", 
        "Security Grade", 
        "Technologies",
        "FCP", 
        "LCP", 
        "CLS", 
        "TBT", 
        "Speed Index", 
        "Interactive"
      ]);
      // Format headers
      sheet.getRange(1, 1, 1, 16).setFontWeight("bold").setBackground("#f3f3f3");
    }

    // Prepare data for row
    const row = [
      new Date(),
      data.url || "N/A",
      data.strategy || "N/A",
      data.performance || 0,
      data.accessibility || 0,
      data.bestPractices || 0,
      data.seo || 0,
      data.securityScore || 0,
      data.securityGrade || "N/A",
      data.techStack || "",
      data.fcp || "N/A",
      data.lcp || "N/A",
      data.cls || "N/A",
      data.tbt || "N/A",
      data.speedIndex || "N/A",
      data.interactive || "N/A"
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to handle CORS preflight requests
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
