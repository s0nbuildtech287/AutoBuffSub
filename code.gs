/**
 * =========================================================================
 * AUTO BUFF SUB - GOOGLE APPS SCRIPT DATABASE (code.gs)
 * =========================================================================
 * Tệp mã nguồn kết nối Google Sheets làm Database lưu trữ cho Auto Buff Sub.
 * 
 * HƯỚNG DẪN CÀI ĐẶT & TRIỂN KHAI:
 * 1. Mở Google Sheet: https://sheets.new (Đặt tên: AutoBuffSub_Database)
 * 2. Vào menu "Tiện ích mở rộng" (Extensions) -> "Apps Script"
 * 3. Xóa toàn bộ nội dung cũ trong trình soạn thảo, copy toàn bộ nội dung file này dán vào
 * 4. Bấm "Lưu" (Ctrl + S)
 * 5. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> "Tùy chọn triển khai mới" (New deployment)
 * 6. Chọn loại: "Ứng dụng web" (Web app)
 *    - Mô tả: AutoBuffSub API v1
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone) -> BẮT BUỘC ĐỂ NHẬN REQUEST
 * 7. Bấm "Triển khai" -> Cấp quyền truy cập nếu Google hỏi
 * 8. Copy đường link URL Ứng dụng web (có đuôi /exec) dán vào file .env.local:
 *    GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 * =========================================================================
 */

// Tên 2 Sheet lưu trữ
var SHEET_ORDERS = "DonHang";
var SHEET_DEPOSITS = "LichSuNapTien";

// Dán Spreadsheet ID của Google Sheet database vào đây.
var DATABASE_SPREADSHEET_ID = "1Rg0jVoWJP76giX_Q7oguuPGh0eQnoUsfAB_w395TdWk";

function getDatabaseSpreadsheet() {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (activeSpreadsheet) {
    return activeSpreadsheet;
  }

  if (!DATABASE_SPREADSHEET_ID || DATABASE_SPREADSHEET_ID === "DÁN_SPREADSHEET_ID_VÀO_ĐÂY") {
    throw new Error("Chưa cấu hình DATABASE_SPREADSHEET_ID hoặc Apps Script chưa liên kết với Google Sheet.");
  }

  return SpreadsheetApp.openById(DATABASE_SPREADSHEET_ID);
}

function initSheet() {
  var ss = getDatabaseSpreadsheet();

  getOrCreateSheet(ss, SHEET_ORDERS, [
    "Thời Gian",
    "Mã Đơn Baostar",
    "Mã Dịch Vụ",
    "Tên Gói Dịch Vụ",
    "Link Cần Buff",
    "Số Lượng",
    "Giá Thu Khách (VND)",
    "Trạng Thái",
    "Còn Lại (Remains)",
    "Ghi Chú"
  ]);

  getOrCreateSheet(ss, SHEET_DEPOSITS, [
    "Thời Gian",
    "Mã Giao Dịch",
    "Người Nạp (Username)",
    "Số Tiền (VND)",
    "Cú Pháp Chuyển Khoản",
    "Ngân Hàng Nhận",
    "STK Nhận",
    "Trạng Thái"
  ]);

  Logger.log("Đã khởi tạo Sheet thành công");
}

/**
 * Xử lý yêu cầu POST từ Web Next.js (Tạo đơn, Cập nhật trạng thái, Ghi nhận nạp tiền)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Khóa tránh xung đột khi nhiều người cùng đặt đơn cùng 1 giây
    lock.waitLock(10000);

    var ss = getDatabaseSpreadsheet();
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var action = data.action || "ADD_ORDER";

    // ----------------------------------------------------
    // HÀNH ĐỘNG 1: THÊM ĐƠN HÀNG MỚI (ADD_ORDER)
    // ----------------------------------------------------
    if (action === "ADD_ORDER") {
      var sheetOrders = getOrCreateSheet(ss, SHEET_ORDERS, [
        "Thời Gian",
        "Mã Đơn Baostar",
        "Mã Dịch Vụ",
        "Tên Gói Dịch Vụ",
        "Link Cần Buff",
        "Số Lượng",
        "Giá Thu Khách (VND)",
        "Trạng Thái",
        "Còn Lại (Remains)",
        "Ghi Chú"
      ]);

      sheetOrders.appendRow([
        new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
        data.orderId || "",
        data.serviceId || "",
        data.serviceName || "",
        data.targetLink || "",
        Number(data.quantity) || 0,
        Number(data.costVnd) || 0,
        data.status || "Pending",
        data.remains || "",
        data.note || "Tạo tự động từ Web"
      ]);

      return createJsonResponse({
        success: true,
        message: "Đã lưu đơn hàng vào Google Sheet thành công",
        orderId: data.orderId
      });
    }

    // ----------------------------------------------------
    // HÀNH ĐỘNG 2: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (UPDATE_STATUS)
    // ----------------------------------------------------
    if (action === "UPDATE_STATUS") {
      var sheetOrders = ss.getSheetByName(SHEET_ORDERS);
      if (!sheetOrders) {
        return createJsonResponse({ success: false, error: "Sheet DonHang không tồn tại" });
      }

      var rows = sheetOrders.getDataRange().getValues();
      var targetOrderId = String(data.orderId);
      var updated = false;

      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][1]) === targetOrderId) {
          // Cập nhật Cột 8 (Trạng thái) và Cột 9 (Còn lại)
          if (data.status) sheetOrders.getRange(i + 1, 8).setValue(data.status);
          if (data.remains !== undefined) sheetOrders.getRange(i + 1, 9).setValue(data.remains);
          updated = true;
          break;
        }
      }

      return createJsonResponse({
        success: updated,
        message: updated ? "Cập nhật trạng thái thành công" : "Không tìm thấy mã đơn hàng"
      });
    }

    // ----------------------------------------------------
    // HÀNH ĐỘNG 3: GHI NHẬN NẠP TIỀN VIETCOMBANK (LOG_DEPOSIT)
    // ----------------------------------------------------
    if (action === "LOG_DEPOSIT") {
      var sheetDeposits = getOrCreateSheet(ss, SHEET_DEPOSITS, [
        "Thời Gian",
        "Mã Giao Dịch",
        "Người Nạp (Username)",
        "Số Tiền (VND)",
        "Cú Pháp Chuyển Khoản",
        "Ngân Hàng Nhận",
        "STK Nhận",
        "Trạng Thái"
      ]);

      sheetDeposits.appendRow([
        new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
        data.transactionId || ("TX_" + Date.now()),
        data.username || "Khách Vãng Lai",
        Number(data.amount) || 0,
        data.memo || "",
        "MB Bank (MB)",
        "8350132872007",
        "Thành Công"
      ]);

      return createJsonResponse({
        success: true,
        message: "Đã lưu lịch sử nạp tiền vào Google Sheet"
      });
    }

    return createJsonResponse({ success: false, error: "Hành động không hợp lệ: " + action });

  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Xử lý yêu cầu GET từ Web Next.js (Lấy danh sách đơn hàng đã lưu)
 */
function doGet(e) {
  try {
    var ss = getDatabaseSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ORDERS);

    if (!sheet) {
      return createJsonResponse({ success: true, data: [] });
    }

    var rows = sheet.getDataRange().getValues();
    var orders = [];

    // Bỏ qua dòng tiêu đề (i = 0)
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][1]) { // Nếu có mã đơn
        orders.push({
          createdAt: rows[i][0],
          orderId: rows[i][1],
          serviceId: rows[i][2],
          serviceName: rows[i][3],
          targetLink: rows[i][4],
          quantity: rows[i][5],
          costVnd: rows[i][6],
          status: rows[i][7],
          remains: rows[i][8]
        });
      }
    }

    // Đảo ngược để đơn mới nhất lên đầu
    orders.reverse();

    return createJsonResponse({
      success: true,
      total: orders.length,
      data: orders
    });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Hàm phụ trợ: Lấy hoặc tự động tạo Sheet kèm dòng tiêu đề chuẩn
 */
function getOrCreateSheet(ss, sheetName, headers) {
  if (!ss) {
    throw new Error("Không tìm thấy Google Spreadsheet. Kiểm tra Spreadsheet ID.");
  }

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    // Định dạng tiêu đề in đậm và tô màu nền chuyên nghiệp
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1877F2");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Hàm phụ trợ: Trả về kết quả định dạng JSON chuẩn
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
