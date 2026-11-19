import { NextRequest, NextResponse } from 'next/server';
import { processDepositOnSheet, getUserBalanceFromSheet } from '@/lib/sheetsService';

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

    // 1. Phân tích gói tin Webhook SePay / PayOS
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

    if (!transactionId || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Thông tin giao dịch không hợp lệ' },
        { status: 400 }
      );
    }

    // 2. Trích xuất mã định danh / Username (vd: "ABS XU4NS0N" hoặc "ABS 84920")
    const match = content.match(/ABS\s*([a-zA-Z0-9_]+)/i);
    const depositUsername = match ? match[1].trim() : 'Khách Vãng Lai';

    // 3. Kiểm tra chống giao dịch trùng cấp RAM
    const inMemoryList = global.globalDepositTransactions || [];
    const isAlreadyInRAM = inMemoryList.some((t) => String(t.id) === String(transactionId));

    if (isAlreadyInRAM) {
      return NextResponse.json({
        success: true,
        message: 'Giao dịch đã được xử lý trong phiên này (Chống trùng lặp)',
        duplicate: true,
      });
    }

    // 4. Ghi nhận giao dịch vào Google Sheet Database (Tự động chống trùng & Tự cộng số dư)
    const sheetResult = await processDepositOnSheet({
      transactionId,
      amount,
      username: depositUsername,
      memo: content,
      bankName: 'MB Bank (MB)',
      accountNumber: accountNumber || '8350132872007',
    });

    // 5. Lưu vào bộ nhớ RAM
    const newRecord: TransactionRecord = {
      id: transactionId,
      gateway: 'MBBank',
      accountNumber: accountNumber || '8350132872007',
      amount: amount,
      content: content,
      code: depositUsername,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    inMemoryList.unshift(newRecord);
    global.globalDepositTransactions = inMemoryList.slice(0, 50);

    return NextResponse.json({
      success: true,
      message: sheetResult?.message || 'Ghi nhận nạp tiền thành công',
      data: newRecord,
      sheetResult,
    });
  } catch (error: any) {
    console.error('[API Webhook Payment] Error:', error);
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

  // Nếu không thấy trong RAM, kiểm tra số dư từ Google Sheet
  const sheetBalance = await getUserBalanceFromSheet(cleanCode);

  return NextResponse.json({
    success: true,
    paid: false,
    currentSheetBalance: sheetBalance,
  });
}
