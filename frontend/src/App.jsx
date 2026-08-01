import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import Lenis from 'lenis';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import Culture from './components/Culture';
import Testimonials from './components/Testimonials';
import TourPackages from './components/TourPackages';
import FAQs from './components/FAQs';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import ChatWidget from './components/Chat/ChatWidget';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Login = React.lazy(() => import('./components/Login'));
const ChangePassword = React.lazy(() => import('./components/ChangePassword'));
const NotFound = React.lazy(() => import('./components/NotFound'));

function ProtectedRoute({ children }) {
  const { user, isInitializing } = useAuth();
  
  if (isInitializing) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ─── Helper: get time-of-day key ─────────────────────────────────────────────
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 6 && h < 10) return 'dawn';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

function MainContent({ isLoading, isPageVisible, handleReveal, handleLoadingComplete }) {
  const { lang } = useLanguage();
  const [isLangChanging, setIsLangChanging] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setIsLangChanging(true);
    const timer = setTimeout(() => setIsLangChanging(false), 280);
    return () => clearTimeout(timer);
  }, [lang]);

  return (
    <>
      {isLoading && <LoadingScreen onReveal={handleReveal} onComplete={handleLoadingComplete} />}
      <div className="cursor-glow" />
      <Navbar isPageVisible={isPageVisible} />
      <div
        className={`min-h-screen antialiased transition-[opacity,transform] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${isPageVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'
          }`}
        style={{ background: '#04080f', color: '#e8e4d8' }}
      >
        <div
          className="transition-opacity duration-300 ease-out"
          style={{
            opacity: isLangChanging ? 0.5 : 1,
          }}
        >
          <Hero isPageVisible={isPageVisible} />
          <Destinations />
          <Culture />
          <Testimonials />
          <TourPackages />
          <FAQs />
          <ContactForm />
          <Footer />
        </div>
      </div>
    </>
  );
}

function MainApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(false);

  const handleReveal = useCallback(() => setIsPageVisible(true), []);
  const handleLoadingComplete = useCallback(() => setIsLoading(false), []);

  // ── Time-of-day tint ──────────────────────────────────────────────────────
  useEffect(() => {
    const apply = () => document.documentElement.setAttribute('data-timeofday', getTimeOfDay());
    apply();
    const iv = setInterval(apply, 60_000);
    return () => clearInterval(iv);
  }, []);

  // ── Lenis Smooth Scroll ───────────────────────────────────────────────────
  useEffect(() => {
    // Tắt Lenis nếu người dùng bật chế độ giảm chuyển động
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.12,           // 0.085 quá thấp → lag cảm giác. 0.12 mượt + responsive
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.1, // Tăng nhẹ để trang không bị đứng lag khi lướt
      touchMultiplier: 2.0,
      infinite: false,
    });

    const bar = document.querySelector('.scroll-progress');
    let rafId;

    lenis.on('scroll', ({ scroll, limit, velocity }) => {
      // Progress bar
      if (bar && limit > 0) bar.style.transform = `scaleX(${Math.min(scroll / limit, 1)})`;
      // Phát scroll position ra window để Hero parallax lắng nghe qua Lenis (không double-listen)
      window.__lenisScrollY = scroll;
    });

    const tick = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Expose lenis để Hero có thể dùng
    window.__lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
      window.__lenisScrollY = 0;
    };
  }, []);

  // ── Scroll Reveal (Chỉ kích hoạt 1 lần duy nhất để giải phóng bộ nhớ GPU) ───
  useEffect(() => {
    if (!isPageVisible) return;
    let observer;
    const timer = setTimeout(() => {
      const sel = '.reveal,.reveal-up,.reveal-down,.reveal-left,.reveal-right,.reveal-scale,.reveal-blur,.reveal-rotate-left,.reveal-rotate-right';
      const els = document.querySelectorAll(sel);
      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('active');
              obs.unobserve(e.target); // Ngăn lặp lại animation & giải phóng GPU layer
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
      );
      els.forEach(el => observer.observe(el));
    }, 100);
    return () => { clearTimeout(timer); if (observer) observer.disconnect(); };
  }, [isPageVisible]);

  // ── Ambient cursor glow ───────────────────────────────────────────────────
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) {
      const glow = document.querySelector('.cursor-glow');
      const fn = (e) => { if (glow) glow.style.transform = `translate3d(${e.clientX - 250}px, ${e.clientY - 250}px, 0)`; };
      window.addEventListener('mousemove', fn, { passive: true });
      return () => window.removeEventListener('mousemove', fn);
    }
  }, []);

  return (
    <>
      {/* === AWWWARDS LAYER: global overlays === */}
      <div className="grain-overlay" aria-hidden="true" />
      <div className="tod-overlay" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true" />


      <MainContent
        isLoading={isLoading}
        isPageVisible={isPageVisible}
        handleReveal={handleReveal}
        handleLoadingComplete={handleLoadingComplete}
      />
      <ChatWidget />
    </>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút cache giúp tối ưu tốc độ và không spam BE
      gcTime: 10 * 60 * 1000, // 10 phút lưu bộ nhớ tạm
      refetchOnWindowFocus: false, // Tắt tự động refetch khi chuyển tab trình duyệt
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<LoadingScreen />}>
                  <MainApp />
                </Suspense>
              } />
              <Route path="/login" element={
                <Suspense fallback={null}>
                  <Login />
                </Suspense>
              } />
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <Suspense fallback={null}>
                    <ChangePassword />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/crm" element={
                <ProtectedRoute>
                  <Suspense fallback={null}>
                    <Dashboard />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <Suspense fallback={null}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
