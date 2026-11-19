import { NextResponse } from 'next/server';
import { baostarClient } from '@/lib/baostar';

const USD_TO_VND_RATE = 27000;

export async function GET() {
  try {
    const data = await baostarClient.getBalance();
    const balanceUsd = Number(data.balance || 0);
    const balanceVnd = Math.round(balanceUsd * USD_TO_VND_RATE);

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        balanceUsd,
        balanceVnd,
        rateExchange: USD_TO_VND_RATE,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
