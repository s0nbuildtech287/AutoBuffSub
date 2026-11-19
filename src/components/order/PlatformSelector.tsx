'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { PlatformIcon, PLATFORM_BRAND_STYLES } from '@/components/common/PlatformIcon';

export interface PlatformMeta {
  id: string;
  name: string;
  badge?: string;
  color: string;
  iconText: string;
  prefix: string;
}

export const PLATFORMS_DATA: PlatformMeta[] = [
  { id: 'facebook', name: 'Facebook', badge: 'Hot', color: 'bg-blue-600', iconText: 'FB', prefix: 'Facebook' },
  { id: 'tiktok', name: 'TikTok', badge: 'Trend', color: 'bg-pink-600', iconText: 'TT', prefix: 'TikTok' },
  { id: 'instagram', name: 'Instagram', badge: 'VIP', color: 'bg-gradient-to-tr from-purple-600 to-pink-500', iconText: 'IG', prefix: 'Instagram' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600', iconText: 'YT', prefix: 'Youtube' },
  { id: 'telegram', name: 'Telegram', color: 'bg-sky-500', iconText: 'TG', prefix: 'Telegram' },
  { id: 'shopee', name: 'Shopee', color: 'bg-orange-500', iconText: 'SP', prefix: 'Shopee' },
  { id: 'twitter', name: 'X / Twitter', color: 'bg-zinc-700', iconText: '𝕏', prefix: 'X-Twitter' },
  { id: 'threads', name: 'Threads', color: 'bg-neutral-800', iconText: '@', prefix: 'Threads' },
];

interface PlatformSelectorProps {
  selectedPlatformId?: string;
  selectedId?: string;
  onSelectPlatform?: (id: string) => void;
  onSelect?: (id: string) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatformId,
  selectedId,
  onSelectPlatform,
  onSelect,
}) => {
  const activeId = selectedPlatformId || selectedId || 'facebook';
  const handleSelect = onSelectPlatform || onSelect || (() => {});

  return (
    <div className="flex flex-wrap gap-2 sm:gap-2.5">
      {PLATFORMS_DATA.map((plat) => {
        const isSelected = plat.id === activeId;
        return (
          <button
            key={plat.id}
            type="button"
            onClick={() => handleSelect(plat.id)}
            className={`
              relative px-3 sm:px-3.5 py-2.5 rounded-xl border transition-all text-left flex items-center gap-2.5 select-none min-h-[44px] shrink-0
              ${isSelected
                ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/30 text-indigo-500 shadow-xs'
                : 'bg-app-surface border-app-border text-app-muted hover:border-app-borderSubtle hover:text-app-text hover:bg-app-elevated'
              }
            `}
          >
            {/* Square Icon with Brand Color */}
            <div
              className={`w-6 h-6 rounded-lg ${PLATFORM_BRAND_STYLES[plat.id]?.bgGradient || plat.color} text-white flex items-center justify-center shrink-0 shadow-xs p-1`}
            >
              <PlatformIcon id={plat.id} size="sm" />
            </div>

            {/* Platform Full Name (Never truncated) */}
            <span className={`text-xs font-bold whitespace-nowrap ${isSelected ? 'text-indigo-500' : 'text-app-text'}`}>
              {plat.name}
            </span>

            {/* Badge or Checkmark */}
            {isSelected ? (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 text-[10px] ml-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : plat.badge ? (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-app-elevated text-app-subtle border border-app-border shrink-0">
                {plat.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
