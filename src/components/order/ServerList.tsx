'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  ArrowUpDown,
  Zap,
  AlertTriangle,
  Smile,
  Layers,
  LayoutList,
  Table as TableIcon
} from 'lucide-react';
import { BaostarService } from '@/types/smm';

export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry' | 'default';

interface ReactionMeta {
  key: ReactionType;
  label: string;
  emoji: string;
  activeColor: string;
}

const REACTIONS: ReactionMeta[] = [
  { key: 'like', label: 'Like', emoji: '👍', activeColor: 'bg-blue-600 text-white border-blue-600' },
  { key: 'love', label: 'Love', emoji: '❤️', activeColor: 'bg-rose-600 text-white border-rose-600' },
  { key: 'care', label: 'Care', emoji: '🥰', activeColor: 'bg-amber-500 text-white border-amber-500' },
  { key: 'haha', label: 'Haha', emoji: '😂', activeColor: 'bg-yellow-500 text-white border-yellow-500' },
  { key: 'wow', label: 'Wow', emoji: '😮', activeColor: 'bg-cyan-600 text-white border-cyan-600' },
  { key: 'sad', label: 'Sad', emoji: '😢', activeColor: 'bg-indigo-600 text-white border-indigo-600' },
  { key: 'angry', label: 'Angry', emoji: '😡', activeColor: 'bg-red-600 text-white border-red-600' },
];

export interface GroupedServer {
  baseName: string;
  primaryService: BaostarService;
  variants: {
    reaction: ReactionType;
    service: BaostarService;
  }[];
}

interface ServerListProps {
  services: BaostarService[];
  selectedServiceId: number | null;
  onSelectService: (service: BaostarService) => void;
}

export const ServerList: React.FC<ServerListProps> = ({
  services,
  selectedServiceId,
  onSelectService,
}) => {
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'speed' | 'id'>('price_asc');
  const [onlyWarranty, setOnlyWarranty] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Group services by reaction variant to remove massive repetition
  const groupedServers = useMemo(() => {
    const groups: Record<string, GroupedServer> = {};

    for (const s of services) {
      const match = s.name.match(/\(\s*(like|love|care|haha|wow|sad|angry)\s*\)$/i);
      if (match) {
        const reaction = match[1].toLowerCase() as ReactionType;
        const baseName = s.name
          .replace(/\(\s*(like|love|care|haha|wow|sad|angry)\s*\)$/i, '')
          .trim();

        if (!groups[baseName]) {
          groups[baseName] = {
            baseName,
            primaryService: s,
            variants: [],
          };
        }
        groups[baseName].variants.push({ reaction, service: s });
        if (reaction === 'like') {
          groups[baseName].primaryService = s;
        }
      } else {
        groups[s.name] = {
          baseName: s.name,
          primaryService: s,
          variants: [{ reaction: 'default', service: s }],
        };
      }
    }

    return Object.values(groups);
  }, [services]);

  // Filter & Sort
  const processedGroups = useMemo(() => {
    let result = [...groupedServers];

    if (onlyWarranty) {
      result = result.filter(
        (g) =>
          g.primaryService.refill === 1 ||
          g.baseName.toLowerCase().includes('bảo hành') ||
          !g.baseName.toLowerCase().includes('không bảo hành')
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.baseName.toLowerCase().includes(q) ||
          g.variants.some((v) => v.service.service.toString().includes(q))
      );
    }

    result.sort((a, b) => {
      const priceA = a.primaryService.vnd || Number(a.primaryService.rate) * 27000;
      const priceB = b.primaryService.vnd || Number(b.primaryService.rate) * 27000;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'id') return a.primaryService.service - b.primaryService.service;
      if (sortBy === 'speed') {
        const hasFastA =
          a.baseName.toLowerCase().includes('nhanh') ||
          a.baseName.toLowerCase().includes('tức thì');
        const hasFastB =
          b.baseName.toLowerCase().includes('nhanh') ||
          b.baseName.toLowerCase().includes('tức thì');
        return hasFastA === hasFastB ? 0 : hasFastA ? -1 : 1;
      }
      return 0;
    });

    return result;
  }, [groupedServers, search, sortBy, onlyWarranty]);

  // Find currently selected group
  const activeGroup = useMemo(() => {
    return (
      groupedServers.find((g) =>
        g.variants.some((v) => v.service.service === selectedServiceId)
      ) || null
    );
  }, [groupedServers, selectedServiceId]);

  return (
    <div className="space-y-3">
      {/* Sticky Top Controls */}
      <div className="sticky top-16 z-20 bg-app-surface/95 backdrop-blur-md pt-1 pb-2 border-b border-app-border -mx-1 px-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-app-subtle pointer-events-none" />
          <input
            type="search"
            placeholder="Tìm máy chủ theo tên, mã #ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-app-elevated border border-app-border rounded-xl pl-9 pr-3 py-2 text-xs text-app-text placeholder:text-app-subtle focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[38px]"
          />
        </div>

        {/* Sort, Filter & View Mode */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sort Selector */}
          <div className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-app-elevated border border-app-border rounded-xl px-2.5 py-1.5 text-xs text-app-muted min-h-[38px]">
            <ArrowUpDown className="w-3.5 h-3.5 text-app-subtle shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-app-text focus:outline-none cursor-pointer text-xs w-full"
            >
              <option value="price_asc" className="bg-app-surface text-app-text">
                Giá: Thấp → Cao
              </option>
              <option value="price_desc" className="bg-app-surface text-app-text">
                Giá: Cao → Thấp
              </option>
              <option value="speed" className="bg-app-surface text-app-text">
                Tốc độ nhanh nhất
              </option>
              <option value="id" className="bg-app-surface text-app-text">
                Mã Server
              </option>
            </select>
          </div>

          {/* Warranty Toggle */}
          <button
            type="button"
            onClick={() => setOnlyWarranty(!onlyWarranty)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shrink-0 min-h-[38px] select-none ${
              onlyWarranty
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                : 'bg-app-elevated border-app-border text-app-subtle hover:text-app-text'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Có bảo hành</span>
          </button>

          {/* View Mode Toggle (Desktop only) */}
          <div className="hidden md:flex items-center bg-app-elevated border border-app-border rounded-xl p-0.5 min-h-[38px]">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'cards'
                  ? 'bg-app-surface text-indigo-500 shadow-xs'
                  : 'text-app-subtle hover:text-app-text'
              }`}
              title="Xem dạng thẻ gọn"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-app-surface text-indigo-500 shadow-xs'
                  : 'text-app-subtle hover:text-app-text'
              }`}
              title="Xem dạng bảng"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main List View */}
      {processedGroups.length === 0 ? (
        <div className="p-8 text-center bg-app-surface rounded-2xl border border-app-border text-app-subtle text-xs">
          Không tìm thấy máy chủ nào phù hợp.
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Bảng so sánh máy chủ) */
        <div className="hidden md:block overflow-x-auto border border-app-border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-app-border bg-app-elevated/60 text-app-subtle font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">Chọn</th>
                <th className="py-2.5 px-3">Mã #ID</th>
                <th className="py-2.5 px-3">Tên Máy Chủ</th>
                <th className="py-2.5 px-3">Cảm Xúc</th>
                <th className="py-2.5 px-3 text-right">Đơn Giá / 1</th>
                <th className="py-2.5 px-3 text-right">Min - Max</th>
                <th className="py-2.5 px-3 text-center">Bảo Hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border/40">
              {processedGroups.map((group) => {
                const isGroupSelected = activeGroup?.baseName === group.baseName;
                const srv = group.primaryService;
                const unitPriceVnd = (srv.vnd || Number(srv.rate) * 27000) / 1000;
                const hasWarranty =
                  srv.refill === 1 || !group.baseName.toLowerCase().includes('không bảo hành');
                const hasMultiReactions = group.variants.length > 1;

                return (
                  <tr
                    key={group.baseName}
                    onClick={() => onSelectService(group.primaryService)}
                    className={`cursor-pointer transition select-none ${
                      isGroupSelected
                        ? 'bg-indigo-600/10 font-medium'
                        : 'hover:bg-app-elevated/50'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <div
                        className={`w-4 h-4 mx-auto rounded-full border flex items-center justify-center transition ${
                          isGroupSelected
                            ? 'border-indigo-500 bg-indigo-600'
                            : 'border-app-subtle bg-transparent'
                        }`}
                      >
                        {isGroupSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-indigo-500">#{srv.service}</td>
                    <td className="py-2.5 px-3 font-bold text-app-text max-w-[240px] truncate">
                      {group.baseName}
                    </td>
                    <td className="py-2.5 px-3">
                      {hasMultiReactions ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                          {group.variants.length} Cảm xúc
                        </span>
                      ) : (
                        <span className="text-app-subtle text-[11px]">Mặc định</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-500 whitespace-nowrap">
                      {unitPriceVnd.toFixed(2)} ₫
                    </td>
                    <td className="py-2.5 px-3 text-right text-app-subtle whitespace-nowrap">
                      {srv.min.toLocaleString('vi-VN')} – {srv.max.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {hasWarranty ? (
                        <span className="text-[10px] text-blue-500 font-bold">Có BH</span>
                      ) : (
                        <span className="text-[10px] text-amber-500">KBH</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* COMPACT CARDS VIEW (Thẻ gọn, chỉ ~46px khi đóng, mở reaction khi chọn) */
        <div className="space-y-2">
          {processedGroups.map((group) => {
            const isGroupSelected = activeGroup?.baseName === group.baseName;
            const srv = group.primaryService;
            const unitPriceVnd = (srv.vnd || Number(srv.rate) * 27000) / 1000;
            const hasWarranty =
              srv.refill === 1 || !group.baseName.toLowerCase().includes('không bảo hành');
            const hasMultiReactions = group.variants.length > 1;

            return (
              <div
                key={group.baseName}
                className={`
                  rounded-xl border transition-all overflow-hidden select-none
                  ${isGroupSelected
                    ? 'bg-indigo-600/5 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-app-surface border-app-border hover:border-app-borderSubtle hover:bg-app-elevated'
                  }
                `}
              >
                {/* Main Compact Row */}
                <div
                  onClick={() => onSelectService(group.primaryService)}
                  className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer min-h-[46px]"
                >
                  {/* Left: Radio + ID + Name + Tags */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Radio Button */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition ${
                        isGroupSelected
                          ? 'border-indigo-500 bg-indigo-600'
                          : 'border-app-subtle bg-transparent'
                      }`}
                    >
                      {isGroupSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    {/* ID Badge */}
                    <span className="text-[11px] font-black text-indigo-500 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20 shrink-0">
                      #{srv.service}
                    </span>

                    {/* Server Base Name */}
                    <span
                      className="text-xs sm:text-sm font-bold text-app-text truncate"
                      title={group.baseName}
                    >
                      {group.baseName}
                    </span>

                    {/* Multi Reaction Indicator Badge */}
                    {hasMultiReactions && (
                      <span className="hidden sm:inline-flex text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
                        {group.variants.length} Cảm xúc
                      </span>
                    )}

                    {/* Warranty Tag */}
                    {hasWarranty ? (
                      <span className="hidden md:inline-flex text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                        Bảo hành
                      </span>
                    ) : (
                      <span className="hidden md:inline-flex text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                        KBH
                      </span>
                    )}
                  </div>

                  {/* Right: Price & Min/Max */}
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div className="hidden sm:block text-[11px] text-app-subtle">
                      Min {srv.min.toLocaleString('vi-VN')} – Max {srv.max.toLocaleString('vi-VN')}
                    </div>

                    <div className="text-xs sm:text-sm font-black text-emerald-500 whitespace-nowrap">
                      {unitPriceVnd.toFixed(2)} ₫{' '}
                      <span className="text-[10px] font-normal text-app-subtle">/ 1</span>
                    </div>
                  </div>
                </div>

                {/* Sub-row: Reaction Picker (Only opens when this server is selected & has multiple reactions) */}
                {isGroupSelected && hasMultiReactions && (
                  <div className="px-3 pb-3 pt-1 border-t border-app-border/60 bg-app-elevated/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-app-muted flex items-center gap-1">
                        <Smile className="w-3 h-3 text-indigo-500" />
                        <span>Chọn loại cảm xúc muốn tăng:</span>
                      </span>
                      <span className="text-[10px] text-app-subtle">Bấm để đổi loại</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {group.variants.map((variant) => {
                        const isReactionSelected =
                          selectedServiceId === variant.service.service;
                        const meta =
                          REACTIONS.find((r) => r.key === variant.reaction) || {
                            key: variant.reaction,
                            label: variant.reaction,
                            emoji: '✨',
                            activeColor: 'bg-indigo-600 text-white',
                          };

                        return (
                          <button
                            key={variant.service.service}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectService(variant.service);
                            }}
                            className={`
                              px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 min-h-[34px]
                              ${
                                isReactionSelected
                                  ? `${meta.activeColor} shadow-xs font-black ring-1 ring-white/20`
                                  : 'bg-app-surface border-app-border text-app-muted hover:text-app-text hover:bg-app-elevated'
                              }
                            `}
                          >
                            <span>{meta.emoji}</span>
                            <span>{meta.label}</span>
                            {isReactionSelected && (
                              <span className="text-[10px] opacity-80 pl-0.5">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
