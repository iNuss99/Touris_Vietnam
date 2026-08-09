import React, { useEffect, useRef, useState } from 'react';
import logoImg from '../assets/images/logo.webp';
import { useLanguage } from '../i18n/LanguageContext';

export default function LoadingScreen({ onReveal, onComplete }) {
  const [phase, setPhase] = useState('loading'); // loading → reveal → done
  const counterRef = useRef(null);   // DOM ref — no re-render per tick
  const arcRef = useRef(null);       // SVG arc DOM ref
  const { t } = useLanguage();
  const loading = t('loading');

  // SVG circle circumference: 2π × 44 ≈ 276.5
  const CIRC = 276.5;

  useEffect(() => {
    const duration = 900; // ms to count 0→100
    let start = null;
    let rafId;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const pct = Math.floor(progress * 100);

      // Direct DOM update — zero React re-renders
      if (counterRef.current) counterRef.current.textContent = `${pct}%`;
      if (arcRef.current) {
        arcRef.current.style.strokeDashoffset = CIRC - progress * CIRC;
      }

      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);

    // Phase 1: start curtain reveal after 1000ms
    const t1 = setTimeout(() => {
      setPhase('reveal');
      if (typeof onReveal === 'function') onReveal();
    }, 1000);

    // Phase 2: unmount after curtain completes at 1800ms
    const t2 = setTimeout(() => {
      setPhase('done');
      if (typeof onComplete === 'function') onComplete();
    }, 1800);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onReveal, onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden flex items-center justify-center"
      style={{ pointerEvents: phase === 'reveal' ? 'none' : 'auto' }}
    >
      {/* Amber curtain panels (behind) */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full"
        style={{
          background: 'linear-gradient(to right, #8a6e2a, #c9a84c)',
          transform: phase === 'reveal' ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.9s cubic-bezier(0.76, 0, 0.24, 1)',
          zIndex: 11,
          willChange: 'transform',
        }}
      />
      <div
        className="absolute top-0 right-0 w-1/2 h-full"
        style={{
          background: 'linear-gradient(to left, #8a6e2a, #c9a84c)',
          transform: phase === 'reveal' ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.9s cubic-bezier(0.76, 0, 0.24, 1)',
          zIndex: 11,
          willChange: 'transform',
        }}
      />

      {/* Dark curtain panels (front) */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full"
        style={{
          background: '#04080f',
          transform: phase === 'reveal' ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 1s cubic-bezier(0.76, 0, 0.24, 1) 100ms',
          zIndex: 12,
          willChange: 'transform',
        }}
      />
      <div
        className="absolute top-0 right-0 w-1/2 h-full"
        style={{
          background: '#04080f',
          transform: phase === 'reveal' ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 1s cubic-bezier(0.76, 0, 0.24, 1) 100ms',
          zIndex: 12,
          willChange: 'transform',
        }}
      />

      {/* Center content */}
      <div
        className="relative z-20 flex flex-col items-center justify-center"
        style={{
          opacity: phase === 'reveal' ? 0 : 1,
          transform: phase === 'reveal' ? 'scale(0.9) translateY(-24px)' : 'scale(1) translateY(0)',
          transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* SVG ring + Logo */}
        <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
          <svg
            width="100" height="100"
            viewBox="0 0 100 100"
            style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
          >
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="1" />
            <circle
              ref={arcRef}
              cx="50" cy="50" r="44" fill="none"
              stroke="url(#goldGrad)" strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC}
            />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a6e2a" />
                <stop offset="50%" stopColor="#f0d080" />
                <stop offset="100%" stopColor="#c9a84c" />
              </linearGradient>
            </defs>
          </svg>
          <img
            src={logoImg}
            alt="Vietnam Tourism"
            className="loader-logo"
            width="80" height="80"
            style={{ height: '68px', width: 'auto', position: 'relative', zIndex: 1 }}
          />
        </div>

        {/* Brand name */}
        <div className="mt-5 flex flex-col items-center leading-none">
          <span
            className="font-serif text-2xl font-bold tracking-[0.25em] loader-text"
            style={{ background: 'linear-gradient(135deg, #f0d080, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            VIETNAM
          </span>
          <span className="text-[10px] tracking-[0.5em] uppercase text-white/40 mt-1.5 loader-text" style={{ animationDelay: '0.15s' }}>
            TOURISM
          </span>
        </div>

        {/* Counter + Loading bar */}
        <div className="mt-10 w-48">
          <div className="flex justify-between mb-2">
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 loader-text" style={{ animationDelay: '0.3s' }}>
              {loading.text}
            </span>
            <span ref={counterRef} className="text-[9px] font-mono text-luxury-gold/60 loader-text" style={{ animationDelay: '0.3s' }}>
              0%
            </span>
          </div>
          <div className="w-full h-[1px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full loader-bar"
              style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, #f0d080, #c9a84c, transparent)' }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .loader-logo {
          animation: fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        .loader-text {
          animation: fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        .loader-bar {
          animation: loadProgress 0.9s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loadProgress {
          from { width: 0; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
