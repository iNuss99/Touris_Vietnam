import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/images/logo.webp';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://touris-vietnam-api.vercel.app';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('touris_remember_me') === 'true');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        if (rememberMe) {
          localStorage.setItem('touris_remember_me', 'true');
        } else {
          localStorage.removeItem('touris_remember_me');
        }
        
        login(data.token, data.role, data.name, data.must_change_password);
        if (data.must_change_password) {
          navigate('/change-password');
        } else {
          navigate('/crm');
        }
      } else {
        setError(data.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
      }
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối máy chủ backend. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans bg-[#04080f]">
      {/* Background Image with Dark Gradient Tint */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#04080f]/90 via-[#04080f]/80 to-[#04080f]/95 backdrop-blur-md" />
      </div>

      <div className="cursor-glow pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 mx-4 bg-slate-900/60 backdrop-blur-2xl border border-amber-500/20 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-500">
        
        {/* Header with Official Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-teal-500/10 border border-amber-400/30 p-2 shadow-[0_0_20px_rgba(201,168,76,0.15)]">
            <img src={logoImg} alt="Vietnam Tourism Logo" className="h-14 w-auto object-contain drop-shadow-md" />
          </div>
          
          <h1 className="text-3xl font-serif font-bold tracking-tight text-white mb-1.5" style={{ background: 'linear-gradient(135deg, #ffffff, #f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Touris Admin
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-amber-300/70 uppercase tracking-[0.25em] font-semibold">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>Cổng Quản Trị Hệ Thống</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">Email quản trị</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-amber-400/70" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/80 transition-all text-sm"
                  placeholder="admin@touris.vn"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-amber-400/70" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/80 transition-all text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900 accent-amber-500 cursor-pointer"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-amber-400/90 hover:text-amber-300 font-medium transition-colors cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-medium animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-amber-400/30 rounded-xl text-xs uppercase tracking-[0.2em] font-bold text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all shadow-[0_0_20px_rgba(201,168,76,0.3)] disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5 text-slate-950" />
            ) : (
              <span className="flex items-center gap-2">
                Đăng nhập hệ thống
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <HelpCircle size={22} />
              <h3 className="text-lg font-bold text-white">Khôi phục mật khẩu</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              Vì mục đích bảo mật dữ liệu doanh nghiệp, tính năng khôi phục mật khẩu tự động yêu cầu phê duyệt từ Quản trị viên (Super Admin).
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 mb-5 space-y-1">
              <p><strong className="text-slate-200">Email hỗ trợ:</strong> admin@touris.vn</p>
              <p><strong className="text-slate-200">Hotline IT:</strong> 1900 888 999</p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

