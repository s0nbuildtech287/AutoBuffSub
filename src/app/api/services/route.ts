import { NextResponse } from 'next/server';
import { baostarClient } from '@/lib/baostar';
import { calculateSellingRate1k, PROFIT_MULTIPLIER, PROFIT_MARKUP_PERCENT } from '@/lib/pricing';

export async function GET() {
  try {
    const rawServices = await baostarClient.getServices();

    if (!Array.isArray(rawServices)) {
      return NextResponse.json(
        { success: false, error: 'Unexpected response from Baostar API' },
        { status: 500 }
      );
    }

    // Tự động áp dụng mức chênh lệch 30% lợi nhuận cho toàn bộ danh mục & gói máy chủ
    const services = rawServices.map((s) => {
      const originalVnd1k = s.vnd || Number(s.rate) * 27000;
      const sellingVnd1k = calculateSellingRate1k(originalVnd1k);
      const sellingRateUsd = (Number(s.rate) * PROFIT_MULTIPLIER).toFixed(4);

      return {
        ...s,
        vnd: sellingVnd1k,
        rate: sellingRateUsd,
      };
    });

    // Trích xuất danh mục duy nhất
    const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));

    return NextResponse.json({
      success: true,
      total: services.length,
      profitMarkupPercent: PROFIT_MARKUP_PERCENT,
      categories,
      data: services,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
