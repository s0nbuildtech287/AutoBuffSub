'use client';

import React from 'react';
import {
  History,
  RefreshCw,
  ExternalLink,
  Database
} from 'lucide-react';
import { OrderEntity } from '@/types/smm';

interface OrderHistoryViewProps {
  orders: OrderEntity[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="bg-app-surface border border-app-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-app-border">
        <div>
          <h2 className="text-base font-bold text-app-text flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            <span>Lịch Sử Đơn Hàng</span>
          </h2>
          <p className="text-xs text-app-subtle">
            Theo dõi trạng thái và chi tiết các đơn hàng đã đặt
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 bg-app-elevated hover:bg-app-border/40 text-app-text text-xs font-semibold px-3.5 py-2 rounded-xl border border-app-border transition min-h-[40px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-app-subtle space-y-2">
          <Database className="w-10 h-10 mx-auto opacity-30 text-indigo-500" />
          <p className="text-sm font-semibold text-app-text">Chưa có đơn hàng nào</p>
          <p className="text-xs">Các đơn bạn đặt sẽ hiển thị đầy đủ tại đây.</p>
        </div>
      ) : (
        <>
          {/* 1. Mobile Cards View (< 768px) */}
          <div className="space-y-3 md:hidden">
            {orders.map((ord, idx) => (
              <div
                key={ord.orderId || idx}
                className="p-3.5 rounded-xl bg-app-elevated/60 border border-app-border space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-app-text">#{ord.orderId}</span>
                  <span className="px-2.5 py-0.5 rounded-full border text-[10px] font-bold bg-app-surface text-app-text border-app-border">
                    {ord.status}
                  </span>
                </div>

                <div className="text-app-text font-semibold truncate" title={ord.serviceName}>
                  {ord.serviceName}
                </div>

                <div className="truncate">
                  <a
                    href={ord.targetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-500 hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">{ord.targetLink}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="pt-2 border-t border-app-border flex items-center justify-between text-[11.5px]">
                  <span className="text-app-subtle">
                    {ord.createdAt ? new Date(ord.createdAt).toLocaleString('vi-VN') : 'Mới tạo'}
                  </span>
                  <div>
                    <span className="text-app-muted">SL: </span>
                    <strong className="text-app-text">{ord.quantity.toLocaleString('vi-VN')}</strong>
                    <span className="mx-1.5 text-app-border">|</span>
                    <strong className="text-emerald-500 font-bold">
                      {Number(ord.costVnd || 0).toLocaleString('vi-VN')} ₫
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Desktop & Tablet Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-app-border text-app-subtle font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Mã Đơn</th>
                  <th className="py-3 px-3">Thời Gian</th>
                  <th className="py-3 px-3">Gói Dịch Vụ</th>
                  <th className="py-3 px-3">Link Mục Tiêu</th>
                  <th className="py-3 px-3 text-right">Số Lượng</th>
                  <th className="py-3 px-3 text-right">Chi Phí</th>
                  <th className="py-3 px-3 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border/50">
                {orders.map((ord, idx) => (
                  <tr key={ord.orderId || idx} className="hover:bg-app-elevated/50 transition">
                    <td className="py-3 px-3 font-bold text-app-text">#{ord.orderId}</td>
                    <td className="py-3 px-3 text-app-muted whitespace-nowrap">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleString('vi-VN') : 'Mới tạo'}
                    </td>
                    <td className="py-3 px-3 text-app-text max-w-[220px] truncate" title={ord.serviceName}>
                      {ord.serviceName}
                    </td>
                    <td className="py-3 px-3 max-w-[180px] truncate">
                      <a
                        href={ord.targetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-500 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{ord.targetLink}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-app-text">
                      {ord.quantity.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-500 whitespace-nowrap">
                      {Number(ord.costVnd || 0).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold bg-app-elevated text-app-text border-app-border">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
