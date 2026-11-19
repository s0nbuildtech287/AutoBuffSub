'use client';

import React, { useMemo } from 'react';
import { Clipboard, AlertCircle, Info } from 'lucide-react';
import { BaostarService } from '@/types/smm';

interface OrderInputFormProps {
  targetLink: string;
  onChangeTargetLink: (link: string) => void;
  quantity: number;
  onChangeQuantity: (quantity: number) => void;
  currentService: BaostarService | null;
  platformPrefix: string;
}

export const OrderInputForm: React.FC<OrderInputFormProps> = ({
  targetLink,
  onChangeTargetLink,
  quantity,
  onChangeQuantity,
  currentService,
  platformPrefix,
}) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChangeTargetLink(text.trim());
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const linkValidation = useMemo(() => {
    if (!targetLink.trim()) return null;

    const lower = targetLink.toLowerCase();
    const plat = platformPrefix.toLowerCase();

    let expectedDomains: string[] = [];
    if (plat.includes('facebook')) expectedDomains = ['facebook.com', 'fb.watch', 'fb.com', 'm.facebook.com'];
    else if (plat.includes('tiktok')) expectedDomains = ['tiktok.com', 'vt.tiktok.com'];
    else if (plat.includes('instagram')) expectedDomains = ['instagram.com', 'instagr.am'];
    else if (plat.includes('youtube')) expectedDomains = ['youtube.com', 'youtu.be'];
    else if (plat.includes('telegram')) expectedDomains = ['t.me', 'telegram.me'];
    else if (plat.includes('shopee')) expectedDomains = ['shopee.vn', 'shopee.com'];
    else if (plat.includes('twitter')) expectedDomains = ['twitter.com', 'x.com'];
    else if (plat.includes('threads')) expectedDomains = ['threads.net'];

    if (expectedDomains.length === 0) return { valid: true };

    const matches = expectedDomains.some((d) => lower.includes(d));
    if (!matches) {
      return {
        valid: false,
        warning: `Đường dẫn có thể không phải của ${platformPrefix} (nên chứa: ${expectedDomains.join(', ')}).`,
      };
    }

    return { valid: true };
  }, [targetLink, platformPrefix]);

  const min = currentService?.min || 10;
  const max = currentService?.max || 1000000;
  const isOutOfRange = quantity < min || quantity > max;

  return (
    <div className="space-y-4">
      {/* Target Link Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-2">
          Đường dẫn (Link) hoặc ID đối tượng
        </label>
        <div className="relative">
          <input
            type="text"
            required
            placeholder={`Dán link ${platformPrefix} cần buff...`}
            value={targetLink}
            onChange={(e) => onChangeTargetLink(e.target.value)}
            className="w-full bg-app-elevated border border-app-border rounded-xl pl-3.5 pr-20 py-2.5 text-base sm:text-sm text-app-text placeholder:text-app-subtle focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition min-h-[44px]"
          />
          <button
            type="button"
            onClick={handlePaste}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center gap-1 bg-app-surface hover:bg-app-border/40 text-app-text text-xs font-bold px-3 py-1.5 rounded-lg border border-app-border transition shadow-xs min-h-[36px]"
          >
            <Clipboard className="w-3.5 h-3.5 text-indigo-500" />
            <span>Dán</span>
          </button>
        </div>

        {linkValidation && !linkValidation.valid && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 mt-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{linkValidation.warning}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11.5px] text-app-subtle mt-1.5">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Để bài viết / tài khoản ở chế độ <strong>Công khai (Public)</strong> trước khi đặt.</span>
        </div>
      </div>

      {/* Quantity Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-app-muted">
            Số lượng cần mua
          </label>
          <span className="text-xs text-app-subtle">
            Min: <strong>{min.toLocaleString('vi-VN')}</strong> | Max: <strong>{max.toLocaleString('vi-VN')}</strong>
          </span>
        </div>

        <div className="relative">
          <input
            type="number"
            required
            min={min}
            max={max}
            step="10"
            value={quantity}
            onChange={(e) => onChangeQuantity(Number(e.target.value))}
            className={`w-full bg-app-elevated border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-app-text font-bold focus:outline-none focus:ring-1 transition min-h-[44px] ${
              isOutOfRange
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                : 'border-app-border focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
        </div>

        {isOutOfRange && (
          <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Số lượng phải nằm trong khoảng từ {min.toLocaleString('vi-VN')} đến {max.toLocaleString('vi-VN')}.</span>
          </p>
        )}

        {/* Quick Add Presets (Grid on mobile to prevent overflow) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2.5">
          {[100, 500, 1000, 2000, 5000, 10000].map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => onChangeQuantity(preset)}
              className={`py-2 rounded-lg text-xs font-bold border transition min-h-[38px] flex items-center justify-center ${
                quantity === preset
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-app-surface border-app-border text-app-muted hover:text-app-text hover:bg-app-elevated'
              }`}
            >
              +{preset >= 1000 ? `${preset / 1000}k` : preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
