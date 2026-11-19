'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  NavItemKey,
} from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import {
  PlatformSelector,
  PLATFORMS_DATA,
} from '@/components/order/PlatformSelector';
import { CategorySelector } from '@/components/order/CategorySelector';
import { ServerList } from '@/components/order/ServerList';
import { OrderInputForm } from '@/components/order/OrderInputForm';
import { OrderSummarySticky } from '@/components/order/OrderSummarySticky';
import { MobileBottomSheet } from '@/components/order/MobileBottomSheet';
import { OrderHistoryView } from '@/components/views/OrderHistoryView';
import { DepositView } from '@/components/views/DepositView';
import { PricingView } from '@/components/views/PricingView';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal, AuthUser } from '@/components/auth/AuthModal';
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  User as UserIcon,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { BaostarService, OrderEntity } from '@/types/smm';

export default function App() {
  const pathname = usePathname();
  const router = useRouter();
  // Mode: 'landing' (Trang giới thiệu với animation) or 'app' (Web App Dashboard)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');

  // Auth State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authReason, setAuthReason] = useState<string | undefined>(undefined);

  // Navigation
  const [currentView, setCurrentView] = useState<NavItemKey>('order');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);

  // API Data
  const [balance, setBalance] = useState<{
    balanceUsd: number;
    balanceVnd: number;
    currency: string;
  } | null>(null);
  const [services, setServices] = useState<BaostarService[]>([]);
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Stepper / Accordion State
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('facebook');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [isPlatformStepOpen, setIsPlatformStepOpen] = useState<boolean>(true);

  // Order Inputs
  const [targetLink, setTargetLink] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Tự động tắt thông báo toast sau 4.5 giây để giao diện luôn gọn gàng
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const routeViews: Record<string, NavItemKey> = {
      '/dashboard': 'order',
      '/orders': 'history',
      '/deposit': 'deposit',
      '/pricing': 'pricing',
      '/support': 'support',
      '/account': 'account',
    };

    if (pathname && routeViews[pathname]) {
      setCurrentView(routeViews[pathname]);
      setViewMode('app');
    }
  }, [pathname]);

  // Load user from localStorage on mount & sync live balance from Database/Sheet
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auto_buff_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Đồng bộ số dư thực tế từ Google Sheet Database
        fetch(`/api/user/balance?username=${encodeURIComponent(parsed.username)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && typeof data.balanceVnd === 'number') {
              const synced = { ...parsed, balanceVnd: data.balanceVnd };
              setUser(synced);
              localStorage.setItem('auto_buff_user', JSON.stringify(synced));
            }
          })
          .catch((err) => console.warn('Sync balance error:', err));
      }
    } catch (e) {
      console.error('Error loading stored user:', e);
    }
  }, []);

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const srvRes = await fetch('/api/services');
      const srvData = await srvRes.json();

      if (srvData.success && Array.isArray(srvData.data)) {
        setServices(srvData.data);
      }
      fetchOrders();
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auth triggers
  const handleOpenAuth = (tab: 'login' | 'register' = 'login', reason?: string) => {
    setAuthModalTab(tab);
    setAuthReason(reason);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (authUser: AuthUser) => {
    setUser(authUser);
    setIsAuthModalOpen(false);
    setViewMode('app');
    setToastMessage({
      type: 'success',
      text: `🎉 Xin chào, ${authUser.fullName}! Đăng nhập thành công.`,
    });
    // Đồng bộ tài khoản và lấy số dư thực tế từ Google Sheet
    fetch('/api/user/balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: authUser.username,
        email: authUser.email,
        role: authUser.role,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.balanceVnd === 'number') {
          const synced = { ...authUser, balanceVnd: data.balanceVnd };
          setUser(synced);
          localStorage.setItem('auto_buff_user', JSON.stringify(synced));
        }
      })
      .catch((err) => console.warn('Sync user error:', err));
  };

  const handleLogout = () => {
    localStorage.removeItem('auto_buff_user');
    setUser(null);
    setViewMode('landing');
    setToastMessage({
      type: 'success',
      text: 'Đã đăng xuất thành công khỏi hệ thống.',
    });
  };

  // Platform & Category Selection
  const currentPlatform = useMemo(() => {
    return (
      PLATFORMS_DATA.find((p) => p.id === selectedPlatformId) || PLATFORMS_DATA[0]
    );
  }, [selectedPlatformId]);

  const platformCategories = useMemo(() => {
    const prefix = currentPlatform.prefix.toLowerCase();
    const uniqueCats = Array.from(
      new Set(
        services
          .filter((s) => s.category?.toLowerCase().startsWith(prefix))
          .map((s) => s.category)
      )
    );
    return uniqueCats;
  }, [services, currentPlatform]);

  useEffect(() => {
    if (platformCategories.length > 0) {
      setSelectedCategory(platformCategories[0]);
    } else {
      setSelectedCategory('');
    }
    setSelectedServiceId(null);
  }, [platformCategories]);

  const categoryServices = useMemo(() => {
    if (!selectedCategory) return [];
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const currentService = useMemo(() => {
    if (!selectedServiceId && categoryServices.length > 0) {
      return categoryServices[0];
    }
    return (
      services.find((s) => s.service === selectedServiceId) ||
      categoryServices[0] ||
      null
    );
  }, [services, selectedServiceId, categoryServices]);

  useEffect(() => {
    if (categoryServices.length > 0 && !selectedServiceId) {
      setSelectedServiceId(categoryServices[0].service);
    }
  }, [categoryServices, selectedServiceId]);

  // Pricing calculations
  const ratePerUnitVnd = useMemo(() => {
    if (!currentService) return 0;
    const rate1k = currentService.vnd || Number(currentService.rate) * 27000;
    return rate1k / 1000;
  }, [currentService]);

  const totalCostVnd = useMemo(() => {
    return Math.round(quantity * ratePerUnitVnd);
  }, [quantity, ratePerUnitVnd]);

  const canSubmit = useMemo(() => {
    if (!currentService) return false;
    if (!targetLink.trim()) return false;
    if (quantity < currentService.min || quantity > currentService.max) return false;
    return true;
  }, [currentService, targetLink, quantity]);

  // Handle Order Submit (Enforce Auth Check)
  const handleSubmitOrder = async () => {
    // Nếu chưa đăng nhập, bắt buộc hiện modal đăng nhập / đăng ký
    if (!user) {
      handleOpenAuth(
        'login',
        'Vui lòng đăng nhập hoặc đăng ký tài khoản để tạo và thanh toán đơn hàng!'
      );
      return;
    }

    if (!canSubmit || !currentService) return;

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: currentService.service,
          link: targetLink.trim(),
          quantity: Number(quantity),
          username: user.username,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setToastMessage({
          type: 'success',
          text: `🎉 Đặt đơn thành công! Mã đơn: #${data.orderId}`,
        });
        setTargetLink('');
        fetchOrders();
        // Cập nhật số dư thực tế từ Server/Google Sheet trả về
        if (user) {
          const newBal = typeof data.newBalance === 'number' ? data.newBalance : Math.max(0, user.balanceVnd - totalCostVnd);
          const updatedUser = {
            ...user,
            balanceVnd: newBal,
          };
          setUser(updatedUser);
          localStorage.setItem('auto_buff_user', JSON.stringify(updatedUser));
        }
      } else {
        setToastMessage({
          type: 'error',
          text: data.error || 'Có lỗi xảy ra khi tạo đơn hàng.',
        });
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Lỗi kết nối tới máy chủ.',
      });
    } finally {
      setIsSubmitting(false);
      setIsMobileSheetOpen(false);
    }
  };

  // Nav Item click handler with Auth check
  const handleSelectNavView = (key: NavItemKey) => {
    if (['history', 'deposit', 'account'].includes(key) && !user) {
      handleOpenAuth(
        'login',
        `Vui lòng đăng nhập để sử dụng tính năng ${
          key === 'history' ? 'Lịch sử đơn hàng' : key === 'deposit' ? 'Nạp tiền ví' : 'Quản lý tài khoản'
        }.`
      );
      return;
    }
    const routes: Record<NavItemKey, string> = {
      order: '/dashboard',
      history: '/orders',
      deposit: '/deposit',
      pricing: '/pricing',
      support: '/support',
      account: '/account',
    };
    setCurrentView(key);
    router.push(routes[key]);
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans antialiased">
      {/* 1. AUTH MODAL (Global) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        actionReason={authReason}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* 2. CONDITIONAL VIEW: LANDING PAGE vs APP DASHBOARD */}
      {viewMode === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onEnterAppAsGuest={() => setViewMode('app')}
          isLoggedIn={Boolean(user)}
          userName={user?.fullName || user?.username}
          onEnterAppDirect={() => setViewMode('app')}
        />
      ) : (
        <div className="flex min-h-[100dvh] relative">
          {/* Sidebar */}
          <Sidebar
            currentView={currentView}
            onSelectView={handleSelectNavView}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onGoToLanding={() => setViewMode('landing')}
            user={user}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Topbar */}
            <Topbar
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              balance={user ? balance : null}
              onNavigate={handleSelectNavView}
              onRefreshData={fetchData}
              isLoading={isLoading}
              user={user}
              onOpenAuth={handleOpenAuth}
              onLogout={handleLogout}
              onGoToLanding={() => setViewMode('landing')}
            />

            {/* Guest Mode Alert Banner */}
            {!user && (
              <div className="bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border-b border-indigo-500/20 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-app-text font-medium">
                    Bạn đang ở chế độ xem thử nghiệm. Hãy đăng nhập để kích hoạt tài khoản và tạo đơn dịch vụ.
                  </span>
                </div>
                <button
                  onClick={() => handleOpenAuth('login', 'Đăng nhập tài khoản của bạn để sử dụng đầy đủ tính năng')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shrink-0 transition"
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}

            {/* Dynamic Page Views */}
            <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full max-w-[1800px] mx-auto pb-28 lg:pb-8">
              {/* Toast Notification Alert (Tự động ẩn sau 4.5s) */}
              {toastMessage && (
                <div
                  className={`mb-4 p-3.5 sm:p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
                    toastMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {toastMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 font-medium">{toastMessage.text}</div>
                  <button
                    onClick={() => setToastMessage(null)}
                    className="text-xs p-1 opacity-60 hover:opacity-100"
                    aria-label="Đóng thông báo"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* VIEW: ĐẶT ĐƠN DỊCH VỤ (ORDER) */}
              {currentView === 'order' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Wizard Steps */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Accordion Bước 1 & 2: Chọn Nền Tảng & Loại Dịch Vụ */}
                    <div className="bg-app-surface border border-app-border rounded-2xl shadow-xs overflow-hidden transition-all">
                      {/* Collapsed Header Bar */}
                      <div
                        onClick={() => setIsPlatformStepOpen(!isPlatformStepOpen)}
                        className="p-3.5 sm:p-4 bg-app-elevated/40 flex items-center justify-between cursor-pointer hover:bg-app-elevated transition select-none min-h-[48px]"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 font-black text-xs shrink-0 whitespace-nowrap">
                            1 & 2
                          </span>

                          <div className="flex items-center gap-2 truncate">
                            <span className="text-xs font-bold uppercase tracking-wider text-app-muted shrink-0 hidden sm:inline">
                              Đã chọn:
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-app-text truncate">
                              {currentPlatform.name}{' '}
                              <span className="text-app-subtle font-normal mx-1">➔</span>{' '}
                              {selectedCategory
                                ? selectedCategory.replace(
                                    new RegExp(`^${currentPlatform.prefix}-`, 'i'),
                                    ''
                                  )
                                : 'Đang tải...'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 shrink-0 pl-2">
                          <span>{isPlatformStepOpen ? 'Thu gọn' : 'Đổi nền tảng'}</span>
                          {isPlatformStepOpen ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Body */}
                      {isPlatformStepOpen && (
                        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 border-t border-app-border">
                          {/* Bước 1: Chọn Nền Tảng */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-app-muted">
                                Bước 1: Chọn Nền Tảng Mạng Xã Hội
                              </label>
                              <span className="text-[11px] text-app-subtle">
                                {PLATFORMS_DATA.length} Nền tảng
                              </span>
                            </div>
                            <PlatformSelector
                              selectedPlatformId={selectedPlatformId}
                              onSelectPlatform={setSelectedPlatformId}
                            />
                          </div>

                          {/* Bước 2: Chọn Loại Dịch Vụ */}
                          <div className="pt-2 border-t border-app-border">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-app-muted">
                                Bước 2: Chọn Loại Tương Tác
                              </label>
                              <span className="text-[11px] text-app-subtle">
                                {platformCategories.length} Dịch vụ
                              </span>
                            </div>
                            <CategorySelector
                              platformPrefix={currentPlatform.prefix}
                              categories={platformCategories}
                              selectedCategory={selectedCategory}
                              onSelectCategory={setSelectedCategory}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bước 3: Chọn Server */}
                    <div>
                      <ServerList
                        services={categoryServices}
                        selectedServiceId={selectedServiceId}
                        onSelectService={(service) => setSelectedServiceId(service.service)}
                      />
                    </div>

                    {/* Bước 4: Nhập link & Số lượng (Desktop & Tablet) */}
                    <div className="hidden lg:block">
                      <OrderInputForm
                        targetLink={targetLink}
                        onChangeTargetLink={setTargetLink}
                        quantity={quantity}
                        onChangeQuantity={setQuantity}
                        currentService={currentService}
                        platformPrefix={currentPlatform.prefix}
                      />
                    </div>
                  </div>

                  {/* Right Column: Sticky Summary Card & Checkout */}
                  <div className="hidden lg:block lg:col-span-4 sticky top-20 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto no-scrollbar space-y-3.5 z-10">
                    <OrderSummarySticky
                      platformName={currentPlatform.name}
                      currentService={currentService}
                      quantity={quantity}
                      totalCostVnd={totalCostVnd}
                      ratePerUnitVnd={ratePerUnitVnd}
                      isSubmitting={isSubmitting}
                      onSubmitOrder={handleSubmitOrder}
                      canSubmit={canSubmit}
                    />

                    <div className="bg-app-surface border border-app-border rounded-2xl p-4 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-app-text">Quy trình đặt đơn</span>
                        <span className="text-[10px] font-semibold text-emerald-500">Đơn giản & nhanh</span>
                      </div>
                      <div className="space-y-2.5 text-[11px] text-app-muted">
                        {[
                          'Chọn nền tảng và loại tương tác',
                          'Chọn máy chủ phù hợp',
                          'Dán link và nhập số lượng',
                          'Đăng nhập để xác nhận đơn',
                        ].map((step, index) => (
                          <div key={step} className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold shrink-0">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: LỊCH SỬ ĐƠN HÀNG */}
              {currentView === 'history' && (
                <OrderHistoryView
                  orders={orders}
                  onRefresh={fetchOrders}
                  isLoading={isLoading}
                />
              )}

              {/* VIEW: NẠP TIỀN VÍ */}
              {currentView === 'deposit' && (
                <DepositView
                  balanceVnd={user?.balanceVnd ?? 0}
                  user={user}
                  onBalanceUpdate={(newBal) => {
                    if (user) {
                      const updated = { ...user, balanceVnd: newBal };
                      setUser(updated);
                      localStorage.setItem('auto_buff_user', JSON.stringify(updated));
                    }
                  }}
                />
              )}

              {/* VIEW: BẢNG GIÁ DỊCH VỤ */}
              {currentView === 'pricing' && <PricingView services={services} />}

              {/* PLACEHOLDERS */}
              {['support', 'account'].includes(currentView) && (
                <div className="bg-app-surface border border-app-border rounded-2xl p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4 my-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
                    {currentView === 'support' && (
                      <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                    )}
                    {currentView === 'account' && <UserIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-app-text capitalize">
                      {currentView === 'support' && 'Hỗ Trợ Khách Hàng & Ticket'}
                      {currentView === 'account' && 'Cài Đặt Tài Khoản'}
                    </h3>
                    <p className="text-xs text-app-subtle mt-1">
                      Mô-đun đang được hoàn thiện trong kế hoạch giai đoạn tiếp theo.
                    </p>
                  </div>

                  <button
                    onClick={() => setCurrentView('order')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition min-h-[40px]"
                  >
                    <span>Quay lại trang Đặt đơn</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </main>
          </div>

          {/* 3. Mobile Bottom Action Bar & Bottom Sheet (< 1024px) for Order View */}
          {currentView === 'order' && (
            <MobileBottomSheet
              isOpen={isMobileSheetOpen}
              onOpen={() => setIsMobileSheetOpen(true)}
              onClose={() => setIsMobileSheetOpen(false)}
              platformName={currentPlatform.name}
              platformPrefix={currentPlatform.prefix}
              currentService={currentService}
              targetLink={targetLink}
              onChangeTargetLink={setTargetLink}
              quantity={quantity}
              onChangeQuantity={setQuantity}
              totalCostVnd={totalCostVnd}
              ratePerUnitVnd={ratePerUnitVnd}
              isSubmitting={isSubmitting}
              onSubmitOrder={handleSubmitOrder}
              canSubmit={canSubmit}
            />
          )}
        </div>
      )}
    </div>
  );
}
