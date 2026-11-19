/**
 * Service giao tiếp trực tiếp với Google Apps Script Webhook Database
 */

function getSheetWebhookUrl(): string {
  return process.env.GOOGLE_SHEET_WEBHOOK_URL || '';
}

export async function callSheetWebhook(payload: Record<string, any>): Promise<any> {
  const url = getSheetWebhookUrl();
  if (!url) {
    console.warn('[SheetService] GOOGLE_SHEET_WEBHOOK_URL is not set.');
    return { success: false, error: 'Chưa cấu hình GOOGLE_SHEET_WEBHOOK_URL' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error: any) {
    console.error('[SheetService] callSheetWebhook error:', error);
    return { success: false, error: error.message || 'Lỗi kết nối tới Google Sheet' };
  }
}

/**
 * Đồng bộ hoặc khởi tạo tài khoản trên Google Sheet
 */
export async function syncUserOnSheet(username: string, email?: string, role?: string) {
  return callSheetWebhook({
    action: 'SYNC_USER',
    username,
    email,
    role,
  });
}

/**
 * Lấy số dư thực tế của người dùng từ Google Sheet
 */
export async function getUserBalanceFromSheet(username: string): Promise<number> {
  const url = getSheetWebhookUrl();
  if (!url || !username) return 0;

  try {
    const res = await fetch(`${url}?action=GET_BALANCE&username=${encodeURIComponent(username)}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (data.success && typeof data.balanceVnd === 'number') {
      return data.balanceVnd;
    }
    return 0;
  } catch (e) {
    console.error('[SheetService] getUserBalanceFromSheet error:', e);
    return 0;
  }
}

/**
 * Trừ tiền khi đặt đơn (An toàn, kiểm tra số dư thực trước)
 */
export async function deductBalanceOnSheet(username: string, costVnd: number): Promise<{
  success: boolean;
  error?: string;
  newBalance?: number;
}> {
  return callSheetWebhook({
    action: 'DEDUCT_BALANCE',
    username,
    costVnd,
  });
}

/**
 * Hoàn tiền nếu đơn Baostar API gặp lỗi
 */
export async function refundBalanceOnSheet(username: string, costVnd: number, reason: string): Promise<any> {
  return callSheetWebhook({
    action: 'REFUND_ORDER',
    username,
    costVnd,
    reason,
  });
}

/**
 * Ghi nhận nạp tiền tự động (Có chống giao dịch trùng)
 */
export async function processDepositOnSheet(data: {
  transactionId: string;
  amount: number;
  username: string;
  memo: string;
  bankName?: string;
  accountNumber?: string;
}): Promise<any> {
  return callSheetWebhook({
    action: 'PROCESS_DEPOSIT',
    ...data,
  });
}
