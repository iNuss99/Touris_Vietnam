import React, { useEffect, useState, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import Culture from './components/Culture';
import TourPackages from './components/TourPackages';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import ChatGreeting from './components/ChatGreeting';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('touris_token');
  if (!token) {
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
      <div
        className={`min-h-screen antialiased transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${isPageVisible ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-4 scale-[0.98] blur-[2px]'
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
          <Navbar />
          <Hero isPageVisible={isPageVisible} />
          <Destinations />
          <Culture />
          <TourPackages />
          <ContactForm />
          <Footer />
        </div>
      </div>
      {!isLoading && <ChatGreeting />}
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

  // ── Scroll Progress Bar ───────────────────────────────────────────────────
  useEffect(() => {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    const onScroll = () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      bar.style.transform = `scaleX(${Math.min(pct, 1)})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Magnetic Cursor ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0, rafId;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
    };
    const lerp = (a, b, t) => a + (b - a) * t;
    const animate = () => {
      rx = lerp(rx, mx, 0.12); ry = lerp(ry, my, 0.12);
      ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      rafId = requestAnimationFrame(animate);
    };

    const addH = () => { dot.classList.add('cursor-hover'); ring.classList.add('cursor-hover'); };
    const rmH = () => { dot.classList.remove('cursor-hover'); ring.classList.remove('cursor-hover'); };
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', addH);
      el.addEventListener('mouseleave', rmH);
    });

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(animate);
    document.documentElement.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      document.documentElement.style.cursor = '';
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
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true" />

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
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/crm" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
