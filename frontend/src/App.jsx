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
import GeminiChatWidget from './components/GeminiChatWidget';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';

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
        className={`min-h-screen antialiased transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${isPageVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'
          }`}
        style={{ background: '#04080f', color: '#e8e4d8' }}
      >
        <div
          className="transition-all duration-300 ease-out"
          style={{
            opacity: isLangChanging ? 0.35 : 1,
            filter: isLangChanging ? 'blur(5px)' : 'blur(0)',
            transform: isLangChanging ? 'scale(0.995)' : 'scale(1)',
            transitionProperty: 'opacity, filter, transform',
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
      {!isLoading && (
        <ErrorBoundary>
          <GeminiChatWidget />
        </ErrorBoundary>
      )}
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
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false, // Tắt trên mobile để dùng native scroll mượt hơn
    });

    const bar = document.querySelector('.scroll-progress');
    let rafId;

    lenis.on('scroll', ({ scroll, limit }) => {
      // Progress bar
      if (bar && limit > 0) bar.style.transform = `scaleX(${Math.min(scroll / limit, 1)})`;
    });

    const tick = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);



  // ── Scroll Reveal ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPageVisible) return;
    let observer;
    const timer = setTimeout(() => {
      const sel = '.reveal,.reveal-up,.reveal-down,.reveal-left,.reveal-right,.reveal-scale,.reveal-blur,.reveal-rotate-left,.reveal-rotate-right';
      const els = document.querySelectorAll(sel);
      observer = new IntersectionObserver(
        (entries) => entries.forEach(e => e.isIntersecting ? e.target.classList.add('active') : e.target.classList.remove('active')),
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
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
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<MainApp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />
              <Route path="/crm" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
