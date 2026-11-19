'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  History,
  CreditCard,
  TableProperties,
  HelpCircle,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  LogOut,
  LogIn,
  Crown
} from 'lucide-react';
import { AuthUser } from '@/components/auth/AuthModal';

export type NavItemKey =
  | 'order'
  | 'history'
  | 'deposit'
  | 'pricing'
  | 'support'
  | 'account';

interface SidebarProps {
  currentView: NavItemKey;
  onSelectView: (view: NavItemKey) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onGoToLanding?: () => void;
  user?: AuthUser | null;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isMobileOpen,
  onCloseMobile,
  onGoToLanding,
  user,
  onOpenAuth,
  onLogout,
}) => {
  // Desktop state: on >=1440px default open (240px), on 1024-1439px default collapsed (64px)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isHoverOverlayOpen, setIsHoverOverlayOpen] = useState<boolean>(false);

  // Auto-detect window width for laptop vs desktop
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024 && width < 1440) {
        setIsCollapsed(true);
      } else if (width >= 1440) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const navItems = [
    { key: 'order' as NavItemKey, label: 'Đặt đơn dịch vụ', icon: ShoppingCart, badge: 'Hot' },
    { key: 'history' as NavItemKey, label: 'Lịch sử đơn hàng', icon: History },
    { key: 'deposit' as NavItemKey, label: 'Nạp tiền ví', icon: CreditCard, badge: 'Auto' },
    { key: 'pricing' as NavItemKey, label: 'Bảng giá tổng hợp', icon: TableProperties },
    { key: 'support' as NavItemKey, label: 'Hỗ trợ khách hàng', icon: HelpCircle },
    { key: 'account' as NavItemKey, label: 'Tài khoản & Bảo mật', icon: User },
  ];

  const handleItemClick = (key: NavItemKey) => {
    onSelectView(key);
    onCloseMobile();
    setIsHoverOverlayOpen(false);
  };

  // Determine effective width and overlay mode
  const showFullMenu = !isCollapsed || isHoverOverlayOpen;

  return (
    <>
      {/* Mobile Drawer Overlay (< 1024px) */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Laptop Overlay Backdrop (1024 - 1439px when expanded overlay) */}
      {isHoverOverlayOpen && (
        <div
          onClick={() => setIsHoverOverlayOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs hidden lg:block xl:hidden transition-opacity"
        />
      )}

      {/* Sidebar Root */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-[100dvh] bg-app-surface border-r border-app-border flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0
          ${/* Mobile Drawer: < 1024px */ ''}
          ${isMobileOpen ? 'translate-x-0 w-[270px] shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${/* Laptop/Desktop widths */ ''}
          ${isCollapsed ? 'lg:w-[68px]' : 'lg:w-[240px]'}
          ${/* Laptop Expanded Overlay mode without pushing layout */ ''}
          ${isHoverOverlayOpen ? 'lg:absolute lg:top-0 lg:left-0 lg:w-[240px] lg:shadow-2xl lg:z-50' : ''}
        `}
      >
        {/* Top Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-app-border">
            <div
              className="flex items-center gap-3 overflow-hidden cursor-pointer"
              onClick={() => {
                if (onGoToLanding) {
                  onGoToLanding();
                } else {
                  handleItemClick('order');
                }
              }}
            >
              <div className="w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0 p-1">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <path d="M54 18 L76 46 L58 46 L68 82 L34 48 L50 48 Z" fill="#ffffff" />
                  <circle cx="80" cy="24" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              {(showFullMenu || isMobileOpen) && (
                <div className="transition-opacity duration-200 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base tracking-tight text-app-text truncate">
                      Auto <span className="text-indigo-500">Buff Sub</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-app-subtle truncate">Auto SMM Hub 24/7</p>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-app-subtle hover:text-app-text lg:hidden"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1">
            {/* Go to Landing Page link in menu */}
            {onGoToLanding && (
              <button
                type="button"
                onClick={() => {
                  onGoToLanding();
                  onCloseMobile();
                }}
                title={isCollapsed && !isHoverOverlayOpen && !isMobileOpen ? 'Trang giới thiệu' : undefined}
                className={`w-full flex items-center gap-3 min-h-[44px] rounded-xl text-sm font-medium transition-all group mb-1 text-app-muted hover:text-indigo-400 hover:bg-app-elevated ${
                  isCollapsed && !isHoverOverlayOpen && !isMobileOpen ? 'justify-center px-0' : 'px-3 py-2.5'
                }`}
              >
                <Globe className="w-5 h-5 shrink-0 text-indigo-500 group-hover:scale-110 transition" />
                {(!isCollapsed || isHoverOverlayOpen || isMobileOpen) && (
                  <span className="truncate">Trang giới thiệu</span>
                )}
              </button>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.key;
              const isCompact = isCollapsed && !isHoverOverlayOpen && !isMobileOpen;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleItemClick(item.key)}
                  title={isCompact ? item.label : undefined}
                  className={`w-full flex items-center gap-3 min-h-[44px] rounded-xl text-sm font-medium transition-all group relative ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'text-app-muted hover:text-app-text hover:bg-app-elevated'
                  } ${isCompact ? 'justify-center px-0' : 'px-3 py-2.5'}`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      isActive ? 'scale-105' : 'group-hover:scale-110'
                    }`}
                  />

                  {!isCompact && (
                    <div className="flex-1 text-left flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold shrink-0 ml-1.5 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: User Status & Collapse Toggle */}
        <div className="border-t border-app-border">
          {/* User Status / Login Prompt in Sidebar */}
          {(!isCollapsed || isHoverOverlayOpen || isMobileOpen) ? (
            <div className="p-3">
              {user ? (
                <div className="p-2.5 bg-app-elevated rounded-xl border border-app-border/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="text-xs font-bold text-app-text truncate">{user.fullName || user.username}</div>
                      <div className="text-[10px] text-emerald-500 font-semibold">
                        {new Intl.NumberFormat('vi-VN').format(user.balanceVnd)} ₫
                      </div>
                    </div>
                  </div>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-1.5 rounded-lg text-app-subtle hover:text-rose-500 hover:bg-rose-500/10 transition"
                      title="Đăng xuất"
                      aria-label="Đăng xuất"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                  className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[40px] shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập / Đăng Ký</span>
                </button>
              )}
            </div>
          ) : null}

          {/* Desktop Collapse Toggle */}
          <div className="p-2.5 hidden lg:block">
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) {
                  setIsHoverOverlayOpen(!isHoverOverlayOpen);
                } else {
                  setIsCollapsed(true);
                }
              }}
              className="w-full flex items-center justify-center min-h-[44px] rounded-xl text-app-subtle hover:text-app-text hover:bg-app-elevated transition"
              title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            >
              {isCollapsed && !isHoverOverlayOpen ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <div className="flex items-center gap-2 text-xs font-medium w-full px-2">
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="truncate">Thu gọn menu</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
