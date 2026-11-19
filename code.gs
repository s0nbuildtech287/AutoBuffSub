/**
 * =========================================================================
 * AUTO BUFF SUB - GOOGLE APPS SCRIPT DATABASE (code.gs)
 * Version 2.0 - Tích hợp quản lý Số Dư, Chống Trùng Giao Dịch & Bảo Mật
 * =========================================================================
 * Tệp mã nguồn kết nối Google Sheets làm Database lưu trữ cho Auto Buff Sub.
 * 
 * HƯỚNG DẪN CÀI ĐẶT & TRIỂN KHAI:
 * 1. Mở Google Sheet đã tạo: https://docs.google.com/spreadsheets/d/1Rg0jVoWJP76giX_Q7oguuPGh0eQnoUsfAB_w395TdWk
 * 2. Vào menu "Tiện ích mở rộng" (Extensions) -> "Apps Script"
 * 3. Xóa toàn bộ nội dung cũ trong trình soạn thảo, copy toàn bộ nội dung file này dán vào
 * 4. Bấm "Lưu" (Ctrl + S)
 * 5. Chọn hàm "initSheet" trên thanh công cụ và bấm "Chạy" (Run) để tự động tạo đủ 3 Tab chuẩn.
 * 6. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> "Quản lý bản triển khai" -> Bấm biểu tượng cây bút (Chỉnh sửa)
 *    - Chọn "Phiên bản mới" (New version)
 *    - Bấm "Triển khai" để cập nhật bản mới nhất.
 * =========================================================================
 */

// Tên 3 Sheet dữ liệu
var SHEET_ORDERS = "DonHang";
var SHEET_DEPOSITS = "LichSuNapTien";
var SHEET_USERS = "NguoiDung";

// Spreadsheet ID của Google Sheet database
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

/**
 * Hàm khởi tạo bảng dữ liệu (Chạy 1 lần duy nhất)
 */
function initSheet() {
  var ss = getDatabaseSpreadsheet();

  // 1. Tab Đơn Hàng
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
    "Ghi Chú",
    "Tài Khoản Mua (Username)"
  ]);

  // 2. Tab Lịch Sử Nạp Tiền
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

  // 3. Tab Người Dùng & Số Dư (USERS & BALANCE)
  getOrCreateSheet(ss, SHEET_USERS, [
    "Thời Gian Tạo",
    "Tài Khoản (Username)",
    "Email",
    "Số Dư Hiện Tại (VND)",
    "Tổng Tiền Đã Nạp (VND)",
    "Vai Trò",
    "Cập Nhật Lần Cuối"
  ]);

  Logger.log("Đã khởi tạo đủ 3 Sheet dữ liệu thành công!");
}

/**
 * Xử lý yêu cầu POST từ Web Next.js / SePay Webhook
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Khóa tránh Race Condition (xung đột dữ liệu khi nhiều request tới cùng lúc)
    lock.waitLock(15000);

    var ss = getDatabaseSpreadsheet();
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var action = data.action || "ADD_ORDER";

    // ========================================================
    // 1. ĐỒNG BỘ HOẶC TẠO MỚI TÀI KHOẢN (SYNC_USER)
    // ========================================================
    if (action === "SYNC_USER") {
      var username = String(data.username || "").trim();
      var email = String(data.email || "").trim();

      if (!username) {
        return createJsonResponse({ success: false, error: "Thiếu thông tin username" });
      }

      var sheetUsers = getOrCreateSheet(ss, SHEET_USERS, [
        "Thời Gian Tạo", "Tài Khoản (Username)", "Email", "Số Dư Hiện Tại (VND)", "Tổng Tiền Đã Nạp (VND)", "Vai Trò", "Cập Nhật Lần Cuối"
      ]);

      var uRows = sheetUsers.getDataRange().getValues();
      var foundIndex = -1;
      var userBalance = 0;
      var totalDeposited = 0;
      var role = "user";

      for (var i = 1; i < uRows.length; i++) {
        if (String(uRows[i][1]).toLowerCase() === username.toLowerCase()) {
          foundIndex = i;
          userBalance = Number(uRows[i][3]) || 0;
          totalDeposited = Number(uRows[i][4]) || 0;
          role = String(uRows[i][5]) || "user";
          break;
        }
      }

      var nowStr = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

      if (foundIndex === -1) {
        // Tài khoản mới -> Tạo dòng mới với số dư 0đ
        sheetUsers.appendRow([
          nowStr,
          username,
          email || (username + "@autobuffsub.pro"),
          0,
          0,
          data.role || "user",
          nowStr
        ]);
        return createJsonResponse({
          success: true,
          isNew: true,
          username: username,
          balanceVnd: 0,
          totalDeposited: 0,
          role: data.role || "user"
        });
      } else {
        // Cập nhật lại thời gian truy cập
        sheetUsers.getRange(foundIndex + 1, 7).setValue(nowStr);
        return createJsonResponse({
          success: true,
          isNew: false,
          username: username,
          balanceVnd: userBalance,
          totalDeposited: totalDeposited,
          role: role
        });
      }
    }

    // ========================================================
    // 2. LẤY SỐ DƯ TÀI KHOẢN (GET_BALANCE)
    // ========================================================
    if (action === "GET_BALANCE") {
      var username = String(data.username || "").trim();
      var sheetUsers = getOrCreateSheet(ss, SHEET_USERS, []);
      var uRows = sheetUsers.getDataRange().getValues();

      for (var i = 1; i < uRows.length; i++) {
        if (String(uRows[i][1]).toLowerCase() === username.toLowerCase()) {
          return createJsonResponse({
            success: true,
            username: username,
            balanceVnd: Number(uRows[i][3]) || 0,
            totalDeposited: Number(uRows[i][4]) || 0
          });
        }
      }

      return createJsonResponse({ success: true, username: username, balanceVnd: 0, totalDeposited: 0 });
    }

    // ========================================================
    // 3. XỬ LÝ NẠP TIỀN TỰ ĐỘNG + CHỐNG GIAO DỊCH TRÙNG (PROCESS_DEPOSIT)
    // ========================================================
    if (action === "PROCESS_DEPOSIT") {
      var txId = String(data.transactionId || "").trim();
      var amount = Number(data.amount || 0);
      var memo = String(data.memo || "");
      var targetUsername = String(data.username || "").trim();

      if (!txId || amount <= 0) {
        return createJsonResponse({ success: false, error: "Dữ liệu giao dịch không hợp lệ" });
      }

      var sheetDeposits = getOrCreateSheet(ss, SHEET_DEPOSITS, [
        "Thời Gian", "Mã Giao Dịch", "Người Nạp (Username)", "Số Tiền (VND)", "Cú Pháp Chuyển Khoản", "Ngân Hàng Nhận", "STK Nhận", "Trạng Thái"
      ]);

      // --- KIỂM TRA CHỐNG TRÙNG LẶP (IDEMPOTENCY) ---
      var depRows = sheetDeposits.getDataRange().getValues();
      for (var d = 1; d < depRows.length; d++) {
        if (String(depRows[d][1]) === txId) {
          return createJsonResponse({
            success: true,
            duplicate: true,
            message: "Giao dịch #" + txId + " đã được xử lý trước đó, bỏ qua để chống cộng trùng tiền!"
          });
        }
      }

      var nowStr = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

      // 1. Ghi nhận giao dịch vào tab Lịch Sử Nạp Tiền
      sheetDeposits.appendRow([
        nowStr,
        txId,
        targetUsername || "Khách Vãng Lai",
        amount,
        memo,
        data.bankName || "MB Bank (MB)",
        data.accountNumber || "8350132872007",
        "Thành Công"
      ]);

      // 2. Tìm và cộng số dư trực tiếp cho User trong tab NguoiDung
      var sheetUsers = getOrCreateSheet(ss, SHEET_USERS, [
        "Thời Gian Tạo", "Tài Khoản (Username)", "Email", "Số Dư Hiện Tại (VND)", "Tổng Tiền Đã Nạp (VND)", "Vai Trò", "Cập Nhật Lần Cuối"
      ]);
      var uRows = sheetUsers.getDataRange().getValues();
      var userFound = false;
      var newBalance = amount;

      for (var u = 1; u < uRows.length; u++) {
        if (String(uRows[u][1]).toLowerCase() === targetUsername.toLowerCase()) {
          userFound = true;
          var curBal = Number(uRows[u][3]) || 0;
          var curTotal = Number(uRows[u][4]) || 0;
          newBalance = curBal + amount;
          var newTotal = curTotal + amount;

          // Cập nhật Cột 4 (Số Dư) và Cột 5 (Tổng nạp) và Cột 7 (Cập nhật cuối)
          sheetUsers.getRange(u + 1, 4).setValue(newBalance);
          sheetUsers.getRange(u + 1, 5).setValue(newTotal);
          sheetUsers.getRange(u + 1, 7).setValue(nowStr);
          break;
        }
      }

      // Nếu người dùng chưa từng đăng ký nhưng đã chuyển khoản đúng cú pháp, tạo sẵn tài khoản cho họ
      if (!userFound && targetUsername) {
        sheetUsers.appendRow([
          nowStr,
          targetUsername,
          targetUsername + "@autobuffsub.pro",
          amount,
          amount,
          "user",
          nowStr
        ]);
      }

      return createJsonResponse({
        success: true,
        duplicate: false,
        message: "Nạp tiền thành công! Đã cộng " + amount.toLocaleString("vi-VN") + "đ vào tài khoản " + targetUsername,
        username: targetUsername,
        amount: amount,
        newBalance: newBalance
      });
    }

    // ========================================================
    // 4. KIỂM TRA & TRỪ TIỀN TRƯỚC KHI MUA ĐƠN (DEDUCT_BALANCE)
    // ========================================================
    if (action === "DEDUCT_BALANCE") {
      var username = String(data.username || "").trim();
      var costVnd = Number(data.costVnd || 0);

      if (!username || costVnd <= 0) {
        return createJsonResponse({ success: false, error: "Thông tin thanh toán không hợp lệ" });
      }

      var sheetUsers = getOrCreateSheet(ss, SHEET_USERS, []);
      var uRows = sheetUsers.getDataRange().getValues();
      var userRowIndex = -1;
      var currentBal = 0;

      for (var i = 1; i < uRows.length; i++) {
        if (String(uRows[i][1]).toLowerCase() === username.toLowerCase()) {
          userRowIndex = i;
          currentBal = Number(uRows[i][3]) || 0;
          break;
        }
      }

      if (userRowIndex === -1) {
        return createJsonResponse({
          success: false,
          error: "Tài khoản không tồn tại trong hệ thống. Vui lòng đăng nhập lại."
        });
      }

      if (currentBal < costVnd) {
        return createJsonResponse({
          success: false,
          error: "Số dư không đủ để thanh toán. Bạn đang có " + currentBal.toLocaleString("vi-VN") + "đ, đơn hàng cần " + costVnd.toLocaleString("vi-VN") + "đ. Vui lòng nạp thêm tiền!",
          currentBalance: currentBal,
          costVnd: costVnd
        });
      }

      // Trừ tiền hợp lệ
      var newBal = currentBal - costVnd;
      var nowStr = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
      sheetUsers.getRange(userRowIndex + 1, 4).setValue(newBal);
      sheetUsers.getRange(userRowIndex + 1, 7).setValue(nowStr);

      return createJsonResponse({
        success: true,
        message: "Trừ tiền thành công",
        username: username,
        costVnd: costVnd,
        newBalance: newBal
      });
    }

    // ========================================================
    // 5. HOÀN TIỀN NẾU ĐƠN BAOSTAR GẶP LỖI (REFUND_ORDER)
    // ========================================================
    if (action === "REFUND_ORDER") {
      var username = String(data.username || "").trim();
      var refundAmount = Number(data.costVnd || 0);

      if (username && refundAmount > 0) {
        var sheetUsers = getOrCreateSheet(ss, SHEET_USERS, []);
        var uRows = sheetUsers.getDataRange().getValues();

        for (var i = 1; i < uRows.length; i++) {
          if (String(uRows[i][1]).toLowerCase() === username.toLowerCase()) {
            var curBal = Number(uRows[i][3]) || 0;
            var newBal = curBal + refundAmount;
            sheetUsers.getRange(i + 1, 4).setValue(newBal);
            sheetUsers.getRange(i + 1, 7).setValue(new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }));
            return createJsonResponse({ success: true, message: "Đã hoàn lại tiền thành công", newBalance: newBal });
          }
        }
      }
      return createJsonResponse({ success: false, error: "Không thể hoàn tiền cho tài khoản này" });
    }

    // ========================================================
    // 6. THÊM ĐƠN HÀNG MỚI (ADD_ORDER)
    // ========================================================
    if (action === "ADD_ORDER") {
      var sheetOrders = getOrCreateSheet(ss, SHEET_ORDERS, [
        "Thời Gian", "Mã Đơn Baostar", "Mã Dịch Vụ", "Tên Gói Dịch Vụ", "Link Cần Buff", "Số Lượng", "Giá Thu Khách (VND)", "Trạng Thái", "Còn Lại (Remains)", "Ghi Chú", "Tài Khoản Mua (Username)"
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
        Number(data.remains !== undefined ? data.remains : data.quantity) || 0,
        data.notes || "",
        data.username || "Khách Vãng Lai"
      ]);

      return createJsonResponse({
        success: true,
        message: "Đã lưu đơn hàng #" + data.orderId + " vào Google Sheet"
      });
    }

    // ========================================================
    // 7. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (UPDATE_STATUS)
    // ========================================================
    if (action === "UPDATE_STATUS") {
      var sheetOrders = getOrCreateSheet(ss, SHEET_ORDERS, []);
      var rows = sheetOrders.getDataRange().getValues();
      var targetOrderId = String(data.orderId);
      var updated = false;

      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][1]) === targetOrderId) {
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

    return createJsonResponse({ success: false, error: "Hành động không hợp lệ: " + action });

  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Xử lý yêu cầu GET từ Web Next.js (Lấy danh sách đơn hàng hoặc lấy số dư)
 */
function doGet(e) {
  try {
    var ss = getDatabaseSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) || "";

    // GET BALANCE NHANH
    if (action === "GET_BALANCE") {
      var username = String(e.parameter.username || "").trim();
      var sheetUsers = ss.getSheetByName(SHEET_USERS);
      if (!sheetUsers) {
        return createJsonResponse({ success: true, balanceVnd: 0 });
      }
      var uRows = sheetUsers.getDataRange().getValues();
      for (var i = 1; i < uRows.length; i++) {
        if (String(uRows[i][1]).toLowerCase() === username.toLowerCase()) {
          return createJsonResponse({
            success: true,
            username: username,
            balanceVnd: Number(uRows[i][3]) || 0,
            totalDeposited: Number(uRows[i][4]) || 0
          });
        }
      }
      return createJsonResponse({ success: true, username: username, balanceVnd: 0 });
    }

    // MẶC ĐỊNH: LẤY DANH SÁCH ĐƠN HÀNG
    var sheet = ss.getSheetByName(SHEET_ORDERS);
    if (!sheet) {
      return createJsonResponse({ success: true, data: [] });
    }

    var rows = sheet.getDataRange().getValues();
    var orders = [];

    for (var i = 1; i < rows.length; i++) {
      if (rows[i][1]) {
        orders.push({
          createdAt: rows[i][0],
          orderId: rows[i][1],
          serviceId: rows[i][2],
          serviceName: rows[i][3],
          targetLink: rows[i][4],
          quantity: rows[i][5],
          costVnd: rows[i][6],
          status: rows[i][7],
          remains: rows[i][8],
          username: rows[i][10] || ""
        });
      }
    }

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
    throw new Error("Không tìm thấy Google Spreadsheet.");
  }

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1877F2");
      headerRange.setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
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
