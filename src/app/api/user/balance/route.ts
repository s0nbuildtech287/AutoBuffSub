import { NextRequest, NextResponse } from 'next/server';
import { getUserBalanceFromSheet, syncUserOnSheet } from '@/lib/sheetsService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ success: false, error: 'Thiếu username' }, { status: 400 });
    }

    const balanceVnd = await getUserBalanceFromSheet(username);

    return NextResponse.json({
      success: true,
      username,
      balanceVnd,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, role } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: 'Thiếu username' }, { status: 400 });
    }

    const result = await syncUserOnSheet(username, email, role);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

