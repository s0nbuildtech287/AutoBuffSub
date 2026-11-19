'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Wallet,
  Sun,
  Moon,
  RefreshCw,
  PlusCircle,
  Zap,
  Globe,
  LogIn,
  LogOut,
  UserCheck,
  Crown
} from 'lucide-react';
import { NavItemKey } from './Sidebar';
import { AuthUser } from '@/components/auth/AuthModal';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  balance: { balanceUsd: number; balanceVnd: number; currency: string } | null;
  onNavigate: (view: NavItemKey) => void;
  onRefreshData: () => void;
  isLoading: boolean;
  user: AuthUser | null;
  onOpenAuth: (tab: 'login' | 'register', reason?: string) => void;
  onLogout: () => void;
  onGoToLanding: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileSidebar,
  balance,
  onNavigate,
  onRefreshData,
  isLoading,
  user,
  onOpenAuth,
  onLogout,
  onGoToLanding,
}) => {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // If user is logged in, show user balance, else show system Baostar balance or 0
  const displayBalanceVnd = user ? user.balanceVnd : (balance?.balanceVnd || 0);
  const formattedBalanceVnd = new Intl.NumberFormat('vi-VN').format(displayBalanceVnd) + ' ₫';

  return (
    <header className="h-16 border-b border-app-border bg-app-surface/90 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 shrink-0">
      {/* Left Area: Mobile hamburger & Logo/Server chip */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Button (>= 44x44px target) */}
        <button
          onClick={onOpenMobileSidebar}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-app-subtle hover:text-app-text hover:bg-app-elevated lg:hidden transition"
          aria-label="Mở Menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand name for phone */}
        <div className="flex items-center gap-2 lg:hidden cursor-pointer" onClick={onGoToLanding}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-xs p-1">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <path d="M54 18 L76 46 L58 46 L68 82 L34 48 L50 48 Z" fill="#ffffff" />
            </svg>
          </div>
          <span className="font-black text-sm tracking-tight text-app-text">
            Auto <span className="text-indigo-500">Buff Sub</span>
          </span>
        </div>

        {/* Go to Landing Page Button */}
        <button
          onClick={onGoToLanding}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-app-border bg-app-elevated hover:bg-app-border/40 text-app-muted hover:text-app-text text-xs font-semibold transition"
          title="Xem trang giới thiệu hệ thống"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-500" />
          <span>Trang Giới Thiệu</span>
        </button>

        {/* Server Status Chip (Hidden on small phone < 480px) */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Server Hoạt Động 100%</span>
        </div>
      </div>

      {/* Right Area: Balance, Theme, User Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Wallet Balance (Clickable -> Nạp tiền) */}
        <div
          onClick={() => {
            if (!user) {
              onOpenAuth('login', 'Vui lòng đăng nhập để nạp tiền vào ví.');
            } else {
              onNavigate('deposit');
            }
          }}
          className="group cursor-pointer flex items-center gap-2 sm:gap-2.5 bg-app-elevated hover:bg-app-border/40 border border-app-border rounded-xl px-2.5 sm:px-3.5 py-1.5 transition-all shadow-xs min-h-[44px]"
          title="Nhấn để nạp tiền vào ví"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>

          <div className="text-right">
            <div className="text-[10px] text-app-subtle font-medium hidden sm:flex items-center gap-1 justify-end">
              <span>{user ? 'Số dư tài khoản' : 'Số dư ví'}</span>
              <PlusCircle className="w-3 h-3 text-emerald-500 opacity-80 group-hover:opacity-100 transition" />
            </div>
            <div className="text-xs sm:text-sm font-bold text-emerald-500 tracking-tight whitespace-nowrap">
              {formattedBalanceVnd}
            </div>
          </div>
        </div>

        {/* Refresh Button (Desktop & Tablet) */}
        <button
          onClick={onRefreshData}
          disabled={isLoading}
          className="hidden sm:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-app-border bg-app-elevated hover:bg-app-border/40 text-app-subtle hover:text-app-text transition disabled:opacity-50"
          title="Làm mới số dư và dịch vụ"
          aria-label="Làm mới dữ liệu"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
        </button>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-app-border bg-app-elevated hover:bg-app-border/40 text-app-subtle hover:text-app-text transition"
          title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          aria-label="Đổi giao diện Sáng / Tối"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* User Auth Display */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 sm:pl-3 bg-app-elevated hover:bg-app-border/50 border border-app-border rounded-xl transition min-h-[44px]"
            >
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-app-text truncate max-w-[120px]">
                  {user.fullName || user.username}
                </div>
                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  {user.role} Member
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-app-surface border border-app-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="p-2.5 border-b border-app-border mb-1">
                  <div className="text-xs font-bold text-app-text">{user.fullName || user.username}</div>
                  <div className="text-[11px] text-app-subtle truncate">{user.email}</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                    Số dư: {new Intl.NumberFormat('vi-VN').format(user.balanceVnd)} ₫
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('account')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-app-text hover:bg-app-elevated rounded-xl transition flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-app-subtle" />
                  <span>Cài đặt tài khoản</span>
                </button>

                <button
                  onClick={onGoToLanding}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-app-text hover:bg-app-elevated rounded-xl transition flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-app-subtle" />
                  <span>Về trang giới thiệu</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition flex items-center gap-2 mt-1 border-t border-app-border/60"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3 py-1.5 text-xs font-bold text-app-text hover:bg-app-elevated rounded-xl transition min-h-[40px] flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-app-subtle" />
              <span>Đăng nhập</span>
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-xs transition min-h-[40px]"
            >
              Đăng ký
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
