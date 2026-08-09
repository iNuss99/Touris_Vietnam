function doPost(e) {
  try {
    // Parse du lieu JSON gui tu form React
    var data = JSON.parse(e.postData.contents);
    
    // Mo bang tinh dang hoat dong
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Neu bang tinh trong, tu dong tao dong tieu de (headers)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Ho va ten",
        "So dien thoai Zalo",
        "Email",
        "Diem den",
        "Ngay khoi hanh",
        "So luong khach",
        "Hang dich vu",
        "Yeu cau dac biet / Loi nhan",
        "Thoi gian gui"
      ]);
    }
    
    // Them dong du lieu moi tuong ung voi 8 truong cua form + thoi gian
    sheet.appendRow([
      data.fullName,
      data.zalo,
      data.email,
      data.destination,
      data.date,
      data.guests,
      data.serviceClass,
      data.message,
      data.submittedAt
    ]);
    
    // Tra ve phan hoi JSON cho frontend React
    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "message": "Gui yeu cau dat tour thanh cong!"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Tra ve phan hoi loi
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "message": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
