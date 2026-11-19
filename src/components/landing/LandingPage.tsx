'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Users,
  DollarSign,
  Sun,
  Moon,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Headphones,
  Flame,
  Star,
  Activity,
  Lock
} from 'lucide-react';
import { PLATFORMS_DATA } from '@/components/order/PlatformSelector';
import { PlatformIcon, PLATFORM_BRAND_STYLES } from '@/components/common/PlatformIcon';

interface LandingPageProps {
  onOpenAuth: (tab: 'login' | 'register', reason?: string) => void;
  onEnterAppAsGuest: () => void;
  isLoggedIn: boolean;
  userName?: string;
  onEnterAppDirect: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterAppAsGuest,
  isLoggedIn,
  userName,
  onEnterAppDirect,
}) => {
  const [isDark, setIsDark] = useState<boolean>(true);

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

  const platformsPricingHighlight = [
    {
      platform: 'TikTok',
      color: 'from-pink-500 to-rose-600',
      badge: 'Bán chạy nhất',
      services: [
        { name: 'View Video TikTok Tốc Độ Cao', price: '0.07 ₫ / view', min: 1000, speed: '1-5 phút' },
        { name: 'Tăng Tim / Like Video TikTok', price: '23.4 ₫ / tim', min: 50, speed: 'Tự nhiên' },
        { name: 'Tăng Follow Kênh TikTok (Bật Live)', price: '110 ₫ / follow', min: 100, speed: 'Ổn định' },
      ],
    },
    {
      platform: 'Facebook',
      color: 'from-blue-600 to-indigo-600',
      badge: 'Giá sỉ tận gốc',
      services: [
        { name: 'Like Bài Viết Facebook Siêu Rẻ', price: '8.33 ₫ / like', min: 10, speed: 'Cực nhanh' },
        { name: 'Follow Profile / Page Chuyên Nghiệp', price: '31.2 ₫ / sub', min: 100, speed: 'Bảo hành' },
        { name: 'Tăng Mắt Xem Livestream Bán Hàng', price: '5.85 ₫ / mắt', min: 50, speed: 'Lên ngay' },
      ],
    },
    {
      platform: 'Instagram',
      color: 'from-purple-600 to-pink-500',
      badge: 'Quốc tế & VN',
      services: [
        { name: 'Like Bài Viết & Reels Instagram', price: '15.6 ₫ / like', min: 50, speed: '30 giây' },
        { name: 'Follower Instagram Chất Lượng Cao', price: '58.5 ₫ / sub', min: 100, speed: 'Không tụt' },
        { name: 'View Story & Video Instagram', price: '1.56 ₫ / view', min: 500, speed: 'Tức thì' },
      ],
    },
    {
      platform: 'YouTube',
      color: 'from-red-600 to-orange-600',
      badge: 'Chuẩn SEO Bật Kiếm Tiền',
      services: [
        { name: 'View Video YouTube Đề Xuất', price: '49.4 ₫ / view', min: 1000, speed: 'An toàn 100%' },
        { name: 'Đăng Ký Kênh (Subscribe) Kèm BH', price: '247 ₫ / sub', min: 100, speed: 'Bảo hành 30 ngày' },
        { name: 'Giờ Xem 4.000 Giờ Bật Kiếm Tiền', price: 'Gói trọn gói', min: 1, speed: 'Đạt chuẩn' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-app-bg text-app-text selection:bg-indigo-500 selection:text-white relative overflow-hidden transition-colors">
      {/* Dynamic Background Glowing Light Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute -top-20 right-1/4 w-[450px] h-[450px] bg-purple-500/15 dark:bg-purple-600/20 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-60 left-1/3 w-[350px] h-[350px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full bg-app-surface/90 backdrop-blur-md border-b border-app-border transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 flex items-center justify-center p-1 shadow-lg shadow-indigo-500/25 shrink-0">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path d="M54 18 L76 46 L58 46 L68 82 L34 48 L50 48 Z" fill="#ffffff" />
                <circle cx="80" cy="24" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-black text-sm sm:text-xl tracking-tight text-app-text whitespace-nowrap">
                  Auto <span className="text-indigo-500">Buff Sub</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-sm bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-app-subtle hidden sm:block">Dịch Vụ Tương Tác Mạng Xã Hội Tự Động</p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-semibold text-app-muted">
            <a href="#platforms" className="hover:text-indigo-500 transition">8 Nền tảng</a>
            <a href="#pricing" className="hover:text-indigo-500 transition">Bảng giá sỉ</a>
            <a href="#features" className="hover:text-indigo-500 transition">Tính năng</a>
            <a href="#how-it-works" className="hover:text-indigo-500 transition">Quy trình</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2.5 rounded-xl bg-app-elevated hover:bg-app-border text-app-subtle hover:text-app-text border border-app-border transition shadow-xs"
              aria-label="Đổi giao diện sáng/tối"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {isLoggedIn ? (
              <button
                onClick={onEnterAppDirect}
                className="px-3 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Vào Bảng Điều Khiển</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  data-testid="btn-login"
                  onClick={() => onOpenAuth('login')}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-app-text hover:text-indigo-500 transition whitespace-nowrap"
                >
                  Đăng Nhập
                </button>
                <button
                  data-testid="btn-register"
                  onClick={() => onOpenAuth('register')}
                  className="px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition flex items-center gap-1 whitespace-nowrap"
                >
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Đăng Ký</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Floating Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-xs sm:text-sm font-bold shadow-xs animate-float">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Hệ Thống Tự Động Hóa Mạng Xã Hội #1 Việt Nam</span>
          </div>

          {/* Giant Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none">
            Bứt Phá Tương Tác MXH <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Tốc Độ Siêu Tốc & Giá Sỉ Tận Gốc
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-app-muted max-w-2xl mx-auto leading-relaxed">
            Nền tảng tăng <strong className="text-app-text font-semibold">Like, Follow, View, Comment, Mắt Live</strong> tự động 100% cho 8 mạng xã hội lớn. Xử lý tức thì sau 3 giây, bảo mật tuyệt đối không cần mật khẩu.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:scale-[1.02] text-white rounded-2xl text-sm sm:text-base font-black shadow-xl shadow-indigo-500/30 transition flex items-center justify-center gap-2.5 min-h-[50px]"
            >
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>Bắt Đầu Ngay</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onEnterAppAsGuest}
              className="w-full sm:w-auto px-6 py-3.5 bg-app-surface hover:bg-app-elevated border border-app-border text-app-text rounded-2xl text-sm sm:text-base font-bold shadow-md transition flex items-center justify-center gap-2 min-h-[50px]"
            >
              <Activity className="w-5 h-5 text-indigo-500" />
              <span>Trải Nghiệm Trực Tiếp (Khách)</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs sm:text-sm text-app-subtle">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Không cần mật khẩu MXH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Bảo hành hoàn tiền 100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Nạp tiền tự động QR 24/7</span>
            </div>
          </div>
        </div>

        {/* 3. HERO INTERACTIVE LIVE VISUAL SHOWCASE */}
        <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
          {/* Glass Card Mockup */}
          <div className="bg-app-surface/90 border border-app-border rounded-3xl p-4 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-app-border">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-app-subtle ml-2">autobuffsub.pro/dashboard — Live Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Cụm Server Online 100%
                </span>
              </div>
            </div>

            {/* Grid of Simulation Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Widget 1: TikTok View Realtime Progress */}
              <div className="p-4 bg-app-elevated rounded-2xl border border-app-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center p-1 shrink-0">
                      <PlatformIcon id="tiktok" size="sm" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-app-text">TikTok Video View</div>
                      <div className="text-[10px] text-app-subtle">Đơn #9482 • Đang chạy</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-500">+85.000</span>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-app-subtle">Tiến độ hoàn thành</span>
                    <span className="text-app-text font-bold">85%</span>
                  </div>
                  <div className="h-2 w-full bg-app-border rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full w-[85%] animate-pulse" />
                  </div>
                </div>
                <div className="text-[10px] text-app-subtle flex items-center justify-between">
                  <span>Tốc độ: 50.000/phút</span>
                  <span className="text-emerald-500 font-medium">Bảo hành 30 ngày</span>
                </div>
              </div>

              {/* Widget 2: Facebook Follower Surge */}
              <div className="p-4 bg-app-elevated rounded-2xl border border-app-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center p-1 shrink-0">
                      <PlatformIcon id="facebook" size="sm" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-app-text">Follow Page & Profile</div>
                      <div className="text-[10px] text-app-subtle">Đơn #9480 • Hoàn thành</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-500">+10.000 Sub</span>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-app-subtle">Trạng thái</span>
                    <span className="text-emerald-500 font-bold">Thành công 100%</span>
                  </div>
                  <div className="h-2 w-full bg-emerald-500 rounded-full" />
                </div>
                <div className="text-[10px] text-app-subtle flex items-center justify-between">
                  <span>Chi phí: 64.100 ₫</span>
                  <span className="text-emerald-500 font-medium">Đã kiểm duyệt</span>
                </div>
              </div>

              {/* Widget 3: Automated Processing Engine (User-friendly & clean) */}
              <div className="p-4 bg-app-elevated rounded-2xl border border-app-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center p-1 shrink-0">
                      <Zap className="w-4 h-4 fill-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-app-text">Tự Động Hóa 24/7</div>
                      <div className="text-[10px] text-app-subtle">Kích hoạt ngay khi bấm mua</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-500">3 Giây</span>
                </div>
                <div className="text-xs text-app-muted leading-relaxed bg-app-surface p-2.5 rounded-xl border border-app-border/60 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-app-text font-semibold">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    Không cần tài khoản/mật khẩu
                  </span>
                  <span className="text-emerald-500 font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    100% An toàn
                  </span>
                </div>
                <div className="text-[10px] text-app-subtle flex items-center justify-between">
                  <span>Khả dụng: 49 Gói máy chủ</span>
                  <span className="text-indigo-400 font-medium">Bảo hành tự động</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. METRICS COUNTER BAR */}
      <section className="border-y border-app-border bg-app-surface/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-indigo-500">1.800.000+</div>
            <div className="text-xs sm:text-sm text-app-muted font-medium">Đơn hàng hoàn tất</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-purple-500">48.500+</div>
            <div className="text-xs sm:text-sm text-app-muted font-medium">Khách hàng tin dùng</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-cyan-400">1 - 3 Giây</div>
            <div className="text-xs sm:text-sm text-app-muted font-medium">Tốc độ tiếp nhận đơn</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-emerald-500">99.98%</div>
            <div className="text-xs sm:text-sm text-app-muted font-medium">Tỷ lệ thành công & ổn định</div>
          </div>
        </div>
      </section>

      {/* 5. 8 NỀN TẢNG MẠNG XÃ HỘI (WITH OFFICIAL LOGOS) */}
      <section id="platforms" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Đa dạng kênh</span>
          <h2 className="text-2xl sm:text-4xl font-black text-app-text">Hỗ Trợ Toàn Diện 8 Nền Tảng Hàng Đầu</h2>
          <p className="text-xs sm:text-sm text-app-muted">
            Dù bạn đang xây kênh bán hàng cá nhân, phát triển thương hiệu doanh nghiệp hay làm dịch vụ truyền thông, chúng tôi đều có sẵn giải pháp tốt nhất.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {PLATFORMS_DATA.map((plat) => {
            const brand = PLATFORM_BRAND_STYLES[plat.id] || {
              bgGradient: 'bg-indigo-600',
              badgeText: 'Mạng xã hội',
            };

            return (
              <div
                key={plat.id}
                onClick={() => onOpenAuth('login', `Vui lòng đăng nhập để sử dụng dịch vụ ${plat.name}`)}
                className="group p-4 sm:p-5 bg-app-surface hover:bg-app-elevated border border-app-border hover:border-indigo-500/50 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Official Logo Badge Container */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-12 h-12 rounded-2xl ${brand.bgGradient} flex items-center justify-center p-2.5 shadow-md shadow-black/20 group-hover:scale-110 transition shrink-0`}>
                      <PlatformIcon id={plat.id} size="lg" />
                    </div>
                    <span className="text-[10px] font-bold text-app-subtle bg-app-elevated px-2 py-0.5 rounded-full border border-app-border/80">
                      {brand.badgeText}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-app-text group-hover:text-indigo-400 transition">
                    {plat.name}
                  </h3>
                  <p className="text-xs text-app-subtle mt-1 line-clamp-2">
                    Tăng like, follow, view video, tương tác bài viết và mắt xem trực tiếp.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-bold text-indigo-500">
                  <span>Khám phá gói</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. LIVE PRICING PREVIEW */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-app-border">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Bảng giá minh bạch</span>
          <h2 className="text-2xl sm:text-4xl font-black text-app-text">Giá Sỉ Tận Gốc - Tiết Kiệm Đến 70%</h2>
          <p className="text-xs sm:text-sm text-app-muted">
            Không qua trung gian. Báo giá trực tiếp từ cụm máy chủ với chi phí cạnh tranh nhất Việt Nam.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {platformsPricingHighlight.map((item, idx) => (
            <div
              key={idx}
              className="bg-app-surface border border-app-border rounded-3xl p-5 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black text-white bg-gradient-to-r ${item.color}`}>
                    {item.platform}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {item.services.map((srv, sIdx) => (
                    <div key={sIdx} className="p-3 bg-app-elevated rounded-xl border border-app-border/60">
                      <div className="text-xs font-bold text-app-text truncate">{srv.name}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs font-black text-indigo-500">{srv.price}</span>
                        <span className="text-[10px] text-app-subtle">Tối thiểu: {srv.min}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onOpenAuth('login', `Đăng nhập để đặt mua dịch vụ ${item.platform}`)}
                className="w-full mt-5 py-2.5 bg-app-elevated hover:bg-indigo-600 hover:text-white border border-app-border text-app-text rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Xem chi tiết & Đặt mua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WHY CHOOSE AUTO BUFF SUB (FEATURES - CUSTOMER FOCUSED) */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-app-border">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Ưu điểm vượt trội</span>
          <h2 className="text-2xl sm:text-4xl font-black text-app-text">Tại Sao Hơn 48.000 Khách Hàng Tin Dùng?</h2>
          <p className="text-xs sm:text-sm text-app-muted">
            Công nghệ hiện đại giúp tối ưu hóa tối đa thời gian, chi phí và hiệu quả cho chiến dịch phát triển kênh của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-app-surface border border-app-border rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-app-text">Khởi Động Tức Thì (Instant Start)</h3>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Ngay khi bấm Mua, hệ thống tự động tiếp nhận và chuyển giao dịch cho cụm máy chủ xử lý ngay sau 1-3 giây.
            </p>
          </div>

          <div className="p-6 bg-app-surface border border-app-border rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-app-text">Bảo Mật Tuyệt Đối 100%</h3>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Chỉ cần đường link công khai (URL hoặc ID bài viết). Không bao giờ yêu cầu mật khẩu hay quyền truy cập tài khoản của bạn.
            </p>
          </div>

          <div className="p-6 bg-app-surface border border-app-border rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-app-text">Chính Sách Bảo Hành Tụt</h3>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Các gói máy chủ có nhãn [Bảo hành] được tự động kiểm tra định kỳ và bù hoàn toàn miễn phí hoặc hoàn tiền nếu có sự cố.
            </p>
          </div>

          <div className="p-6 bg-app-surface border border-app-border rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-app-text">Nạp Tiền Tự Động 24/7 Qua QR</h3>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Quét mã QR VietQR từ bất kỳ ngân hàng nào hoặc ví điện tử. Tiền tự động cộng vào tài khoản sau 5 đến 30 giây.
            </p>
          </div>

          <div className="p-6 bg-app-surface border border-app-border rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-app-text">Tương Tác Thật, Ổn Định Cao</h3>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Nguồn tương tác chất lượng cao, giữ đề xuất tài khoản an toàn tuyệt đối theo đúng tiêu chuẩn các nền tảng mạng xã hội.
            </p>
          </div>

          <div className="p-6 bg-app-surface border border-app-border rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-app-text">Hỗ Trợ Kỹ Thuật Chuyên Nghiệp</h3>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Đội ngũ kỹ thuật viên trực tuyến kênh Telegram 24/7 kể cả ngày lễ tết, giải quyết mọi yêu cầu phát sinh tức thì.
            </p>
          </div>
        </div>
      </section>

      {/* 8. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-app-border">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Đơn giản & Dễ dàng</span>
          <h2 className="text-2xl sm:text-4xl font-black text-app-text">Quy Trình 3 Bước Để Tăng Trưởng</h2>
          <p className="text-xs sm:text-sm text-app-muted">
            Không cần thủ tục phức tạp. Bắt đầu tăng tương tác chỉ với chưa đầy 1 phút.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="relative p-6 bg-app-surface border border-app-border rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-600/30">
              1
            </div>
            <h3 className="text-base font-bold text-app-text">Đăng Ký Tài Khoản Miễn Phí</h3>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Tạo tài khoản nhanh chóng chỉ trong 30 giây, không cần thủ tục rườm rà. Bắt đầu trải nghiệm ngay.
            </p>
          </div>

          <div className="relative p-6 bg-app-surface border border-app-border rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-purple-600/30">
              2
            </div>
            <h3 className="text-base font-bold text-app-text">Nạp Tiền Nhanh Qua Mã QR</h3>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Quét mã QR từ ngân hàng bất kỳ, hệ thống kiểm tra và tự động cộng số dư vào ví trong vòng 10 giây.
            </p>
          </div>

          <div className="relative p-6 bg-app-surface border border-app-border rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-cyan-500/30">
              3
            </div>
            <h3 className="text-base font-bold text-app-text">Dán Link & Nhấn "MUA NGAY"</h3>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Dán liên kết bài viết hoặc kênh của bạn, chọn số lượng và xác nhận. Tương tác bắt đầu tăng ngay lập tức!
            </p>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION FINAL BANNER */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 rounded-3xl p-8 sm:p-14 text-white text-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Sẵn Sàng Bùng Nổ Tương Tác Cùng Auto Buff Sub?
            </h2>
            <p className="text-xs sm:text-base text-white/90 leading-relaxed">
              Gia nhập cùng hơn 48.000 khách hàng đang sử dụng giải pháp tự động hóa truyền thông số 1 hiện nay.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-indigo-700 hover:bg-slate-100 rounded-2xl text-sm sm:text-base font-black shadow-lg transition"
              >
                Tạo Tài Khoản Ngay
              </button>
              <button
                onClick={onEnterAppAsGuest}
                className="w-full sm:w-auto px-6 py-3.5 bg-black/20 hover:bg-black/30 border border-white/30 text-white rounded-2xl text-sm sm:text-base font-bold transition"
              >
                Khám Phá Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="border-t border-app-border bg-app-surface py-12 px-4 sm:px-6 lg:px-8 text-xs sm:text-sm text-app-muted">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center p-1 text-white font-black text-xs">
                ⚡
              </div>
              <span className="font-black text-base text-app-text">Auto Buff Sub</span>
            </div>
            <p className="text-xs text-app-subtle leading-relaxed">
              Nền tảng tự động hóa truyền thông xã hội hàng đầu, cung cấp các giải pháp tăng trưởng tương tác an toàn, bảo mật và hiệu quả cao.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-app-text mb-3">Dịch Vụ Nổi Bật</h4>
            <ul className="space-y-2 text-xs text-app-subtle">
              <li>Tăng like & follow Facebook</li>
              <li>Tăng view video & tim TikTok</li>
              <li>Tăng follow & view story Instagram</li>
              <li>Tăng view đề xuất YouTube</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-app-text mb-3">Chính Sách & Hỗ Trợ</h4>
            <ul className="space-y-2 text-xs text-app-subtle">
              <li>Chính sách bảo hành & hoàn tiền</li>
              <li>Điều khoản sử dụng dịch vụ</li>
              <li>Bảo mật thông tin khách hàng</li>
              <li>Hướng dẫn nạp tiền tự động</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-app-text mb-3">Kênh Liên Hệ 24/7</h4>
            <p className="text-xs text-app-subtle mb-3">
              Kỹ thuật viên hỗ trợ trực tuyến giải quyết đơn hàng trong 1-5 phút.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold hover:bg-indigo-500/20 transition text-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Telegram Support</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-app-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-app-subtle">
          <div>© {new Date().getFullYear()} Auto Buff Sub Pro. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Uptime: 99.98%</span>
            <span>•</span>
            <span>Secure SSL 256-bit</span>
            <span>•</span>
            <span>VietQR Powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
