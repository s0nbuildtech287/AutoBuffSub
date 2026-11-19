'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { AuthUser } from '@/components/auth/AuthModal';

interface DepositViewProps {
  balanceVnd: number;
  user?: AuthUser | null;
  onBalanceUpdate?: (newBalance: number) => void;
}

export const DepositView: React.FC<DepositViewProps> = ({
  balanceVnd,
  user,
  onBalanceUpdate,
}) => {
  // Preset denominations (Cho phép nạp tối thiểu từ 5.000 VND)
  const denominations = [5000, 10000, 20000, 50000, 100000, 200000];
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrLoaded, setQrLoaded] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<boolean>(false);
  const [successAmount, setSuccessAmount] = useState<number>(0);

  // Tự động tắt thông báo nạp thành công sau 7 giây
  useEffect(() => {
    if (depositSuccess) {
      const timer = setTimeout(() => {
        setDepositSuccess(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [depositSuccess]);
  const BANK_CONFIG = {
    bankId: 'mbbank',
    bankName: 'MB Bank (Ngân hàng TMCP Quân đội)',
    accountNumber: '8350132872007',
    accountName: 'BUI XUAN SON',
    brandColor: 'bg-blue-600',
  };

  // Unique Transfer Memo for User (e.g., ABS 84920 or ABS <username>)
  const userCode = useMemo(() => {
    if (user?.username) {
      // Create a deterministic short alphanumeric code from username/id
      return user.username.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    }
    return '84920';
  }, [user]);

  const transferMemo = `ABS ${userCode}`;
  const effectiveAmount = customAmount ? Math.max(5000, Number(customAmount)) : selectedAmount;

  // VietQR URL with official Napas247 standard
  const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${effectiveAmount}&addInfo=${encodeURIComponent(
    transferMemo
  )}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Poll server to check if webhook registered a payment for this memo
  const checkPaymentStatus = async (showToast = true) => {
    setIsChecking(true);
    try {
      const res = await fetch(`/api/webhook/payment?code=${encodeURIComponent(userCode)}`);
      const data = await res.json();
      if (data.success) {
        if (data.paid) {
          setDepositSuccess(true);
          setSuccessAmount(data.amount || effectiveAmount);
          if (onBalanceUpdate) {
            onBalanceUpdate(balanceVnd + (data.amount || effectiveAmount));
          }
        } else if (typeof data.currentSheetBalance === 'number' && data.currentSheetBalance > balanceVnd) {
          const added = data.currentSheetBalance - balanceVnd;
          setDepositSuccess(true);
          setSuccessAmount(added);
          if (onBalanceUpdate) {
            onBalanceUpdate(data.currentSheetBalance);
          }
        }
      }
    } catch (e) {
      console.error('Error polling payment status:', e);
    } finally {
      setIsChecking(false);
    }
  };

  // Periodic polling every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      checkPaymentStatus(false);
    }, 8000);
    return () => clearInterval(timer);
  }, [userCode, balanceVnd]);



  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-app-surface border border-app-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-xl font-black text-app-text flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              <span>Nạp Tiền Tự Động Qua VietQR (24/7)</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-app-subtle">
            Quét mã QR chuyển khoản trực tiếp vào tài khoản <strong>MB Bank</strong> của <strong>Bùi Xuân Sơn</strong>. Hệ thống tự động quét và cộng tiền sau 5 đến 30 giây.
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-app-elevated border border-app-border text-left md:text-right shrink-0 min-w-[180px]">
          <div className="text-[11px] text-app-subtle font-medium">Số dư khả dụng</div>
          <div className="text-lg sm:text-2xl font-black text-emerald-500 tracking-tight">
            {new Intl.NumberFormat('vi-VN').format(balanceVnd)} ₫
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {depositSuccess && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-start justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm sm:text-base">Giao dịch nạp tiền thành công!</h4>
              <p className="text-xs mt-0.5">
                Đã cộng thành công <strong>+{new Intl.NumberFormat('vi-VN').format(successAmount)} ₫</strong> vào tài khoản ví của bạn. Bạn có thể bắt đầu tạo đơn dịch vụ ngay bây giờ.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDepositSuccess(false)}
            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 font-bold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column: Denomination Selector & Guides (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Step 1: Chọn mệnh giá */}
          <div className="bg-app-surface border border-app-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-500 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <span>Chọn Số Tiền Cần Nạp</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-500">Tối thiểu 5.000 ₫</span>
            </div>

            {/* Quick Denominations */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {denominations.map((amount) => {
                const isSelected = effectiveAmount === amount && !customAmount;
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                      setQrLoaded(false);
                    }}
                    className={`py-3 px-3 rounded-2xl border font-black text-xs sm:text-sm transition-all min-h-[46px] flex items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 text-white border-transparent shadow-md shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-app-elevated border-app-border text-app-text hover:bg-app-border/40'
                    }`}
                  >
                    {new Intl.NumberFormat('vi-VN').format(amount)} ₫
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-app-muted mb-1.5">
                Hoặc nhập số tiền tùy chọn (VND):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5000"
                  step="1000"
                  placeholder="Tối thiểu 5.000 ₫ (Ví dụ: 5000, 25000...)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setQrLoaded(false);
                  }}
                  className="w-full bg-app-elevated border border-app-border rounded-xl px-4 py-3 text-sm sm:text-base text-app-text font-black focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-app-subtle pointer-events-none">
                  VND
                </span>
              </div>
            </div>
          </div>

          {/* Important Notices */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-app-surface border border-app-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Lưu Ý Quan Trọng Khi Chuyển Khoản</span>
            </h4>
            <ul className="space-y-2 text-xs text-app-muted leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span>
                  <strong>Nội dung chuyển khoản bắt buộc:</strong> Ghi chính xác mã{' '}
                  <code className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold font-mono">
                    {transferMemo}
                  </code>{' '}
                  để hệ thống nhận diện và cộng tiền tức thì.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span>
                  Nếu quên ghi nội dung hoặc ghi sai, vui lòng liên hệ admin hỗ trợ qua Telegram kèm ảnh chụp biên lai chuyển tiền để được cộng thủ công trong 1 phút.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span>
                  Số dư sau khi nạp không giới hạn thời gian sử dụng, không mất phí duy trì tài khoản.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Dynamic VietQR Card & Copy Details (5 Cols) */}
        <div className="lg:col-span-5 bg-app-surface border border-app-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <span>Quét Mã VietQR Ngân Hàng</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Napas 247
            </span>
          </div>

          {/* VietQR Display Box */}
          <div className="relative mx-auto max-w-[280px] bg-white p-3.5 rounded-2xl shadow-lg border border-slate-200 text-center">
            {/* MB Bank Brand Header on QR */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-blue-700 flex items-center justify-center text-white font-black text-[10px]">
                  MB
                </div>
                <span className="text-xs font-black text-slate-800">MB Bank</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                VietQR Pro
              </span>
            </div>

            {/* QR Image with Skeleton Loader */}
            <div className="relative aspect-square w-full bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center">
              {!qrLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-100 animate-pulse">
                  <QrCode className="w-8 h-8 opacity-40 animate-spin" />
                  <span className="text-[11px] font-medium">Đang tạo mã VietQR...</span>
                </div>
              )}
              <img
                src={qrUrl}
                alt={`VietQR ${BANK_CONFIG.accountNumber}`}
                onLoad={() => setQrLoaded(true)}
                className={`w-full h-full object-contain transition-opacity duration-300 ${
                  qrLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>

            {/* QR Footer info */}
            <div className="pt-2 text-[11px] text-slate-500 font-medium">
              Mở App ngân hàng bất kỳ để quét mã
            </div>
          </div>

          {/* Bank Transfer Details with 1-Click Copy */}
          <div className="space-y-2 text-xs">
            {/* Ngân hàng */}
            <div className="p-3 rounded-xl bg-app-elevated border border-app-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-app-subtle uppercase tracking-wider block font-semibold">
                  Ngân hàng thụ hưởng
                </span>
                <span className="font-bold text-app-text text-sm">
                  MB Bank (Quân Đội)
                </span>
              </div>
            </div>

            {/* Số tài khoản */}
            <div className="p-3 rounded-xl bg-app-elevated border border-app-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-app-subtle uppercase tracking-wider block font-semibold">
                  Số tài khoản nhận tiền
                </span>
                <span className="font-mono font-black text-app-text text-base tracking-wider">
                  {BANK_CONFIG.accountNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText(BANK_CONFIG.accountNumber, 'stk')}
                className="px-3 py-1.5 rounded-lg bg-app-surface hover:bg-app-border/40 border border-app-border text-indigo-500 font-bold flex items-center gap-1.5 transition text-xs"
              >
                {copiedKey === 'stk' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'stk' ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Chủ tài khoản */}
            <div className="p-3 rounded-xl bg-app-elevated border border-app-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-app-subtle uppercase tracking-wider block font-semibold">
                  Tên chủ tài khoản
                </span>
                <span className="font-bold text-app-text text-sm tracking-wide">
                  {BANK_CONFIG.accountName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText(BANK_CONFIG.accountName, 'owner')}
                className="px-3 py-1.5 rounded-lg bg-app-surface hover:bg-app-border/40 border border-app-border text-indigo-500 font-bold flex items-center gap-1.5 transition text-xs"
              >
                {copiedKey === 'owner' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'owner' ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Số tiền */}
            <div className="p-3 rounded-xl bg-app-elevated border border-app-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-app-subtle uppercase tracking-wider block font-semibold">
                  Số tiền nạp
                </span>
                <span className="font-black text-emerald-500 text-base">
                  {new Intl.NumberFormat('vi-VN').format(effectiveAmount)} ₫
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText(String(effectiveAmount), 'amount')}
                className="px-3 py-1.5 rounded-lg bg-app-surface hover:bg-app-border/40 border border-app-border text-indigo-500 font-bold flex items-center gap-1.5 transition text-xs"
              >
                {copiedKey === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'amount' ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Nội dung chuyển khoản */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border-2 border-amber-500/40 flex items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider block">
                  Nội dung chuyển khoản (bắt buộc):
                </span>
                <span className="font-mono font-black text-app-text text-base tracking-wider">
                  {transferMemo}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText(transferMemo, 'memo')}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition text-xs shrink-0"
              >
                {copiedKey === 'memo' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'memo' ? 'Đã chép mã' : 'Chép nội dung'}</span>
              </button>
            </div>
          </div>

          {/* Realtime Status Checking Indicator */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-app-subtle">
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Hệ thống tự động kiểm tra mỗi 8 giây...</span>
            </div>

            <button
              type="button"
              onClick={() => checkPaymentStatus(true)}
              disabled={isChecking}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-app-elevated hover:bg-app-border/40 border border-app-border text-app-text font-bold transition flex items-center justify-center gap-1.5 min-h-[38px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Kiểm tra tiền về</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
