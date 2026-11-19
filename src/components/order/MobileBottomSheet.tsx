'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  X,
  ArrowRight,
  RefreshCw,
  Zap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { BaostarService } from '@/types/smm';
import { OrderInputForm } from './OrderInputForm';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  platformName: string;
  platformPrefix: string;
  currentService: BaostarService | null;
  targetLink: string;
  onChangeTargetLink: (link: string) => void;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
  totalCostVnd: number;
  ratePerUnitVnd: number;
  isSubmitting: boolean;
  onSubmitOrder: () => void;
  canSubmit: boolean;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onOpen,
  onClose,
  platformName,
  platformPrefix,
  currentService,
  targetLink,
  onChangeTargetLink,
  quantity,
  onChangeQuantity,
  totalCostVnd,
  ratePerUnitVnd,
  isSubmitting,
  onSubmitOrder,
  canSubmit,
}) => {
  // Lock scroll when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* 1. Fixed Sticky Bottom Action Bar (< 1024px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-app-surface/95 backdrop-blur-md border-t border-app-border p-3 pb-safe flex items-center justify-between gap-3 shadow-2xl lg:hidden">
        <div>
          <div className="text-[11px] text-app-subtle">Tổng thanh toán</div>
          <div className="text-lg font-black text-emerald-500 tracking-tight">
            {totalCostVnd.toLocaleString('vi-VN')}{' '}
            <span className="text-xs font-bold text-app-subtle">₫</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="flex-1 max-w-[220px] py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition min-h-[44px]"
        >
          <span>MUA NGAY</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Bottom Sheet Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Sheet Canvas */}
          <div className="fixed bottom-0 left-0 right-0 max-h-[90dvh] bg-app-surface border-t border-app-border rounded-t-3xl shadow-2xl z-50 flex flex-col pb-safe animate-in slide-in-from-bottom duration-200">
            {/* Drag Handle & Header */}
            <div className="p-4 pb-2 border-b border-app-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-app-text">Xác Nhận Đặt Đơn</h3>
                  <p className="text-[11px] text-app-subtle">
                    {platformName} ➔ {currentService?.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-app-subtle hover:text-app-text"
                aria-label="Đóng bảng mua"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Selected Server Summary Banner */}
              {currentService && (
                <div className="p-3 rounded-xl bg-app-elevated border border-app-border text-xs flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-bold text-indigo-500">#{currentService.service}</span> -{' '}
                    <span className="text-app-text">{currentService.name}</span>
                  </div>
                  <span className="font-bold text-emerald-500 shrink-0">
                    {ratePerUnitVnd.toFixed(2)} ₫ / 1
                  </span>
                </div>
              )}

              {/* Input Form (Link + Quantity) */}
              <OrderInputForm
                targetLink={targetLink}
                onChangeTargetLink={onChangeTargetLink}
                quantity={quantity}
                onChangeQuantity={onChangeQuantity}
                currentService={currentService}
                platformPrefix={platformPrefix}
              />

              {/* Price Details */}
              <div className="p-3.5 rounded-xl bg-app-elevated/70 border border-app-border space-y-2 text-xs">
                <div className="flex justify-between items-center text-app-muted">
                  <span>Đơn giá:</span>
                  <span className="font-semibold text-app-text">{ratePerUnitVnd.toFixed(2)} ₫ / 1 lượt</span>
                </div>
                <div className="flex justify-between items-center text-app-muted">
                  <span>Số lượng:</span>
                  <span className="font-bold text-app-text">{quantity.toLocaleString('vi-VN')}</span>
                </div>
                <div className="pt-2 border-t border-app-border flex justify-between items-baseline">
                  <span className="font-bold text-app-text">Tổng thanh toán:</span>
                  <div className="text-xl font-black text-emerald-500">
                    {totalCostVnd.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Submit Button */}
            <div className="p-4 pt-2 border-t border-app-border shrink-0">
              <button
                type="button"
                onClick={() => {
                  onSubmitOrder();
                  onClose();
                }}
                disabled={!canSubmit || isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 min-h-[46px]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang gửi đơn...</span>
                  </>
                ) : (
                  <>
                    <span>XÁC NHẬN MUA ({totalCostVnd.toLocaleString('vi-VN')} ₫)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
