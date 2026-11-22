function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];
    const data = JSON.parse(e.postData.contents);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Name', 'House Name', 'Father Name', 'Job',
        'Mother/Guardian', 'DOB', 'DOB Words', 'Madrasa Info', 'Samastha Reg',
        'School Info', 'Address', 'Phone', 'PIN', 'District',
        'WhatsApp', 'Aadhar', 'ID Marks', 'Samastha Agree', 'Photo URL'
      ]);
    }

    sheet.appendRow([
      new Date(), data.name || '', data.house_name || '', data.father_name || '', data.job || '',
      data.mother_name || '', data.dob || '', data.dob_words || '', data.madrasa_info || '', data.samastha_reg || '',
      data.school_info || '', data.address || '', data.phone || '', data.pin || '', data.district || '',
      data.whatsapp || '', data.aadhar || '', data.id_marks || '', data.samastha_agree || '', data.photo_url || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
