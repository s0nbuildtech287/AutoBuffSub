/**
 * Cấu hình tỷ lệ lợi nhuận cho các dịch vụ SMM Auto Buff Sub
 * Mặc định: 30% lợi nhuận trên giá gốc
 */
export const PROFIT_MARKUP_PERCENT = Number(process.env.PROFIT_MARKUP_PERCENT) || 30;
export const PROFIT_MULTIPLIER = 1 + PROFIT_MARKUP_PERCENT / 100; // 1.30

/**
 * Tính giá bán (VND trên 1.000 lượt) đã cộng 30% lợi nhuận
 */
export function calculateSellingRate1k(originalRateVnd: number): number {
  return Math.round(originalRateVnd * PROFIT_MULTIPLIER);
}

/**
 * Tính đơn giá bán (VND trên 1 lượt) đã cộng 30% lợi nhuận
 */
export function calculateSellingUnitPrice(originalRateVnd: number): number {
  return calculateSellingRate1k(originalRateVnd) / 1000;
}

/**
 * Tính tổng chi phí đơn hàng (VND) đã cộng 30% lợi nhuận
 */
export function calculateOrderTotalCost(originalRateVnd: number, quantity: number): number {
  const sellingRate1k = calculateSellingRate1k(originalRateVnd);
  return Math.round((quantity / 1000) * sellingRate1k);
}

