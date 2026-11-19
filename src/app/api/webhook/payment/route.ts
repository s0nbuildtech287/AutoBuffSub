import { NextRequest, NextResponse } from 'next/server';

// Lưu trữ lịch sử giao dịch webhook tạm thời trong bộ nhớ (In-memory transaction ledger)
interface TransactionRecord {
  id: string | number;
  gateway: string;
  accountNumber: string;
  amount: number;
  content: string;
  code: string;
  timestamp: string;
  status: 'completed';
}

declare global {
  var globalDepositTransactions: TransactionRecord[] | undefined;
}

if (!global.globalDepositTransactions) {
  global.globalDepositTransactions = [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Hỗ trợ cả 2 định dạng Webhook thông dụng nhất: SePay và PayOS
    let accountNumber = '';
    let amount = 0;
    let content = '';
    let transactionId = '';

    // Định dạng 1: SePay Webhook
    if (body.accountNumber || body.transferAmount !== undefined) {
      accountNumber = String(body.accountNumber || '');
      amount = Number(body.transferAmount || 0);
      content = String(body.content || '');
      transactionId = String(body.id || body.referenceCode || Date.now());
    }
    // Định dạng 2: PayOS Webhook
    else if (body.data) {
      accountNumber = String(body.data.accountNumber || '');
      amount = Number(body.data.amount || 0);
      content = String(body.data.description || '');
      transactionId = String(body.data.reference || body.data.orderCode || Date.now());
    } else {
      accountNumber = String(body.account_number || '');
      amount = Number(body.amount || 0);
      content = String(body.content || body.description || '');
      transactionId = String(body.transaction_id || Date.now());
    }

    // Trích xuất mã định danh nạp tiền (vd: ABS 8492 hoặc ABS8492)
    const match = content.match(/ABS\s*([a-zA-Z0-9_]+)/i);
    const depositCode = match ? match[1].toUpperCase() : '';

    const newRecord: TransactionRecord = {
      id: transactionId,
      gateway: 'MBBank',
      accountNumber: accountNumber || '8350132872007',
      amount: amount,
      content: content,
      code: depositCode || content,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    const transactions = global.globalDepositTransactions || [];
    transactions.unshift(newRecord);
    global.globalDepositTransactions = transactions;

    // Tự động ghi 1 dòng vào Sheet "LichSuNapTien" nếu có GOOGLE_SHEET_WEBHOOK_URL
    const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (sheetWebhook) {
      fetch(sheetWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LOG_DEPOSIT',
          transactionId: newRecord.id,
          username: depositCode || 'Khách Vãng Lai',
          amount: newRecord.amount,
          memo: newRecord.content,
        }),
      }).catch((err) => console.error('[SheetLogDeposit] Error logging to sheet:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Ghi nhận giao dịch nạp tiền thành công',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Webhook payment processing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý webhook nạp tiền' },
      { status: 500 }
    );
  }
}

// Endpoint kiểm tra giao dịch theo mã nạp tiền (Polling)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({
      success: true,
      transactions: global.globalDepositTransactions?.slice(0, 20) || [],
    });
  }

  const cleanCode = code.replace(/^ABS\s*/i, '').trim().toUpperCase();
  const tx = global.globalDepositTransactions?.find((t) =>
    t.code.toUpperCase().includes(cleanCode) || t.content.toUpperCase().includes(cleanCode)
  );

  if (tx) {
    return NextResponse.json({
      success: true,
      paid: true,
      amount: tx.amount,
      transaction: tx,
    });
  }

  return NextResponse.json({
    success: true,
    paid: false,
  });
}
