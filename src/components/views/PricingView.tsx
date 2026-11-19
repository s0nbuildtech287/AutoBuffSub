'use client';

import React, { useState, useMemo } from 'react';
import { TableProperties, Search, ShieldCheck, Zap } from 'lucide-react';
import { BaostarService } from '@/types/smm';

interface PricingViewProps {
  services: BaostarService[];
}

export const PricingView: React.FC<PricingViewProps> = ({ services }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    return Array.from(new Set(services.map((s) => s.category).filter(Boolean)));
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.service.toString().includes(search);
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, search]);

  return (
    <div className="bg-app-surface border border-app-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-app-border">
        <div>
          <h2 className="text-base font-bold text-app-text flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-indigo-500" />
            <span>Bảng Giá Dịch Vụ Tổng Hợp</span>
          </h2>
          <p className="text-xs text-app-subtle">
            Xem và so sánh bảng giá 236+ dịch vụ trên toàn hệ thống
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
          {filteredServices.length} Dịch vụ
        </span>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-app-subtle pointer-events-none" />
          <input
            type="search"
            placeholder="Tìm theo tên hoặc mã #ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-app-elevated border border-app-border rounded-xl pl-9 pr-3 py-2 text-xs text-app-text placeholder:text-app-subtle focus:outline-none focus:border-indigo-500 min-h-[40px]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-app-elevated border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:outline-none cursor-pointer min-h-[40px] max-w-full sm:max-w-[240px]"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="space-y-2.5 md:hidden">
        {filteredServices.map((srv) => {
          const unitPriceVnd = (srv.vnd || Number(srv.rate) * 27000) / 1000;
          return (
            <div
              key={srv.service}
              className="p-3.5 rounded-xl bg-app-elevated/60 border border-app-border space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-500">#{srv.service}</span>
                <span className="font-black text-emerald-500 text-sm">
                  {unitPriceVnd.toFixed(2)} ₫ <span className="text-[10px] font-normal text-app-subtle">/ 1</span>
                </span>
              </div>

              <div className="font-bold text-app-text">{srv.name}</div>
              <div className="text-[11px] text-app-subtle">{srv.category}</div>

              <div className="pt-2 border-t border-app-border flex items-center justify-between text-[11px] text-app-muted">
                <span>
                  Min: {srv.min.toLocaleString('vi-VN')} | Max: {srv.max.toLocaleString('vi-VN')}
                </span>
                <span className="text-emerald-500 font-semibold">● Sẵn sàng</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-app-border text-app-subtle font-bold uppercase tracking-wider">
              <th className="py-3 px-3">Mã #ID</th>
              <th className="py-3 px-3">Tên Dịch Vụ</th>
              <th className="py-3 px-3">Danh Mục</th>
              <th className="py-3 px-3 text-right">Đơn Giá / 1</th>
              <th className="py-3 px-3 text-right">Giá / 1.000</th>
              <th className="py-3 px-3 text-right">Min - Max</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border/50">
            {filteredServices.map((srv) => {
              const unitPriceVnd = (srv.vnd || Number(srv.rate) * 27000) / 1000;
              const price1kVnd = srv.vnd || Number(srv.rate) * 27000;
              return (
                <tr key={srv.service} className="hover:bg-app-elevated/50 transition">
                  <td className="py-3 px-3 font-bold text-indigo-500">#{srv.service}</td>
                  <td className="py-3 px-3 font-bold text-app-text max-w-[260px] truncate" title={srv.name}>
                    {srv.name}
                  </td>
                  <td className="py-3 px-3 text-app-muted max-w-[180px] truncate">{srv.category}</td>
                  <td className="py-3 px-3 text-right font-black text-emerald-500 whitespace-nowrap">
                    {unitPriceVnd.toFixed(2)} ₫
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-app-text whitespace-nowrap">
                    {price1kVnd.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="py-3 px-3 text-right text-app-subtle whitespace-nowrap">
                    {srv.min.toLocaleString('vi-VN')} – {srv.max.toLocaleString('vi-VN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
