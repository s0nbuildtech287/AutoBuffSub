'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  ShieldCheck,
  CheckCheck,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BaostarService } from '@/types/smm';

interface OrderSummaryStickyProps {
  platformName: string;
  currentService: BaostarService | null;
  quantity: number;
  totalCostVnd: number;
  ratePerUnitVnd: number;
  isSubmitting: boolean;
  onSubmitOrder: () => void;
  canSubmit: boolean;
}

export const OrderSummarySticky: React.FC<OrderSummaryStickyProps> = ({
  platformName,
  currentService,
  quantity,
  totalCostVnd,
  ratePerUnitVnd,
  isSubmitting,
  onSubmitOrder,
  canSubmit,
}) => {
  // Service notes collapsed by default per requirement #7
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);

  return (
    <div className="space-y-3.5">
      {/* Payment Details Card */}
      <div className="bg-app-surface border border-app-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-app-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-app-text">Chi Tiết Thanh Toán</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
            Tự Động 24/7
          </span>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-app-muted">
            <span>Nền tảng:</span>
            <span className="font-semibold text-app-text">{platformName}</span>
          </div>

          <div className="flex justify-between items-start text-app-muted gap-2">
            <span className="shrink-0">Gói máy chủ:</span>
            <span className="font-semibold text-indigo-500 text-right truncate max-w-[200px]">
              {currentService ? `#${currentService.service} - ${currentService.name}` : 'Chưa chọn'}
            </span>
          </div>

          <div className="flex justify-between items-center text-app-muted">
            <span>Đơn giá:</span>
            <span className="font-semibold text-app-text">
              {ratePerUnitVnd.toFixed(2)} ₫ / 1 lượt
            </span>
          </div>

          <div className="flex justify-between items-center text-app-muted">
            <span>Số lượng mua:</span>
            <span className="font-bold text-app-text bg-app-elevated border border-app-border px-2 py-0.5 rounded-md">
              {quantity.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Total Cost Display */}
        <div className="pt-3 border-t border-app-border flex items-baseline justify-between">
          <span className="text-xs text-app-muted font-medium">Tổng thanh toán:</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight">
            {totalCostVnd.toLocaleString('vi-VN')}{' '}
            <span className="text-sm font-bold text-app-subtle">₫</span>
          </div>
        </div>

        {/* Submit Order Button (Desktop & Tablet) */}
        <button
          type="button"
          onClick={onSubmitOrder}
          disabled={!canSubmit || isSubmitting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[46px]"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang gửi đơn lên máy chủ...</span>
            </>
          ) : (
            <>
              <span>MUA NGAY (TẠO ĐƠN)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Trust Badges */}
        <div className="pt-3 border-t border-app-border grid grid-cols-3 gap-1.5 text-center text-[10.5px] text-app-muted">
          <div className="flex flex-col items-center gap-0.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Chạy sau 1-5p</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Bảo mật 100%</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Hỗ trợ hoàn tiền</span>
          </div>
        </div>
      </div>

      {/* Service Notes Box (Collapsible by default per rule #7) */}
      {currentService?.notes && (
        <div className="bg-app-surface border border-app-border rounded-2xl p-4 space-y-2 text-xs">
          <div
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Lưu ý quan trọng từ máy chủ</span>
            </div>
            <div className="text-app-subtle flex items-center gap-1 text-[11px]">
              <span>{isNotesOpen ? 'Thu gọn' : 'Xem chi tiết'}</span>
              {isNotesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </div>

          {isNotesOpen && (
            <div
              className="pt-2 border-t border-app-border text-app-muted text-xs leading-relaxed space-y-1.5 [&_*]:text-xs [&_p]:mb-1 [&_ul]:pl-4 [&_ul]:list-disc [&_li]:mb-0.5"
              dangerouslySetInnerHTML={{ __html: currentService.notes }}
            />
          )}
        </div>
      )}
    </div>
  );
};
