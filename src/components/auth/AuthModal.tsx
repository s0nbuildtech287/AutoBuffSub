'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Crown
} from 'lucide-react';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  balanceVnd: number;
  role: 'user' | 'vip' | 'admin';
}

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  actionReason?: string; // Reason why auth was triggered (e.g. "Vui lòng đăng nhập để tạo đơn hàng")
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onSuccess,
  actionReason,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state (Private, blank by default)
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register form state
  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Reset tab when modal opens with new initialTab
  React.useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanId = loginIdentifier.trim().toLowerCase();

    if (!cleanId) {
      setError('Vui lòng nhập tên tài khoản hoặc email.');
      return;
    }
    if (!loginPassword) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    // ========================================================
    // PRIVATE PERSONAL ACCOUNT (xu4ns0n)
    // ========================================================
    if (cleanId === 'xu4ns0n') {
      if (loginPassword !== 'sondeptrai123ok') {
        setError('Tài khoản hoặc mật khẩu không chính xác.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const myUser: AuthUser = {
          id: 'usr_xu4ns0n',
          username: 'xu4ns0n',
          email: 'xu4ns0n@autobuffsub.pro',
          fullName: 'Bùi Xuân Sơn',
          balanceVnd: 0, // 0đ như bình thường
          role: 'user',
        };
        localStorage.setItem('auto_buff_user', JSON.stringify(myUser));
        onSuccess(myUser);
      }, 350);
      return;
    }

    // Normal User Login
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: AuthUser = {
        id: 'usr_' + Date.now().toString(36),
        username: loginIdentifier.trim(),
        email: loginIdentifier.includes('@') ? loginIdentifier.trim() : `${loginIdentifier.trim()}@autobuffsub.pro`,
        fullName: loginIdentifier.trim() === 'khachhang_vip' ? 'Nguyễn Hoàng Long' : loginIdentifier.trim(),
        balanceVnd: 500000,
        role: 'vip',
      };
      localStorage.setItem('auto_buff_user', JSON.stringify(user));
      onSuccess(user);
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanReg = regUsername.trim().toLowerCase();

    if (!cleanReg || cleanReg.length < 3) {
      setError('Tên tài khoản tối thiểu 3 ký tự (viết liền không dấu).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với điều khoản dịch vụ để tiếp tục.');
      return;
    }

    // ========================================================
    // PRIVATE PERSONAL ACCOUNT AUTO-REGISTER (xu4ns0n)
    // ========================================================
    if (cleanReg === 'xu4ns0n') {
      if (regPassword !== 'sondeptrai123ok') {
        setError('Tên tài khoản này đã được sử dụng.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const myUser: AuthUser = {
          id: 'usr_xu4ns0n',
          username: 'xu4ns0n',
          email: regEmail.trim() || 'xu4ns0n@autobuffsub.pro',
          fullName: 'Bùi Xuân Sơn',
          balanceVnd: 0,
          role: 'user',
        };
        localStorage.setItem('auto_buff_user', JSON.stringify(myUser));
        onSuccess(myUser);
      }, 400);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: AuthUser = {
        id: 'usr_' + Date.now().toString(36),
        username: regUsername.trim(),
        email: regEmail.trim(),
        fullName: regUsername.trim(),
        balanceVnd: 0,
        role: 'user',
      };
      localStorage.setItem('auto_buff_user', JSON.stringify(user));
      onSuccess(user);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-app-surface border border-app-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 transition-all">
        {/* Glow decorative banner */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 flex items-center justify-center p-1 shadow-md shadow-indigo-500/25">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <path d="M54 18 L76 46 L58 46 L68 82 L34 48 L50 48 Z" fill="#ffffff" />
                  <circle cx="80" cy="24" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-app-text">
                  Auto <span className="text-indigo-500">Buff Sub</span>
                </h3>
                <p className="text-xs text-app-subtle">Hệ thống dịch vụ MXH tự động 24/7</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-app-subtle hover:text-app-text hover:bg-app-elevated transition"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Reason Banner (if redirected from an action) */}
          {actionReason && (
            <div className="mt-4 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>{actionReason}</span>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-app-elevated border border-app-border rounded-xl mt-4">
            <button
              type="button"
              data-testid="tab-login"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-app-surface text-app-text shadow-xs'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              data-testid="tab-register"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-app-surface text-app-text shadow-xs'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              <span>Đăng Ký</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <div className="px-5 sm:px-6 pb-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-app-muted mb-1.5">
                  Tên tài khoản hoặc Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-app-subtle">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Nhập tên đăng nhập hoặc email..."
                    className="w-full pl-9 pr-3 py-2.5 bg-app-elevated border border-app-border rounded-xl text-xs sm:text-sm text-app-text placeholder:text-app-subtle/50 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-app-muted">
                    Mật khẩu
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Vui lòng liên hệ Admin / Hỗ trợ kỹ thuật 24/7 để cấp lại mật khẩu nhanh.');
                    }}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-app-subtle">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-app-elevated border border-app-border rounded-xl text-xs sm:text-sm text-app-text placeholder:text-app-subtle/50 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-app-subtle hover:text-app-text"
                    aria-label="Ẩn hiện mật khẩu"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-app-subtle">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-app-border bg-app-elevated text-indigo-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng Nhập Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-app-muted mb-1">
                  Tên đăng nhập <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-app-subtle">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="vi_du: hoanglong99"
                    className="w-full pl-9 pr-3 py-2 bg-app-elevated border border-app-border rounded-xl text-xs sm:text-sm text-app-text placeholder:text-app-subtle/50 focus:outline-hidden focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-muted mb-1">
                  Email kích hoạt <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-app-subtle">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-app-elevated border border-app-border rounded-xl text-xs sm:text-sm text-app-text placeholder:text-app-subtle/50 focus:outline-hidden focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-app-muted mb-1">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-3 py-2 bg-app-elevated border border-app-border rounded-xl text-xs sm:text-sm text-app-text placeholder:text-app-subtle/50 focus:outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-muted mb-1">
                    Nhập lại mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full px-3 py-2 bg-app-elevated border border-app-border rounded-xl text-xs sm:text-sm text-app-text placeholder:text-app-subtle/50 focus:outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1 text-xs text-app-subtle">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded-sm border-app-border bg-app-elevated text-indigo-600 focus:ring-0"
                  />
                  <span>
                    Tôi đồng ý với <a href="#" className="text-indigo-400 hover:underline">Điều khoản & Chính sách</a> của Auto Buff Sub.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Đang khởi tạo tài khoản...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tạo Tài Khoản Ngay</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 text-center text-xs text-app-subtle">
            {tab === 'login' ? (
              <p>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setError(null);
                  }}
                  className="font-bold text-indigo-400 hover:underline"
                >
                  Đăng ký miễn phí ngay
                </button>
              </p>
            ) : (
              <p>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError(null);
                  }}
                  className="font-bold text-indigo-400 hover:underline"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
