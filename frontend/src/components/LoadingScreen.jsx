import React, { useEffect, useState } from 'react';
// Import logo duoi webp de hien thi nhanh hon o man hinh loading
import logoImg from '../assets/images/logo.webp';
import { useLanguage } from '../i18n/LanguageContext';

export default function LoadingScreen({ onReveal, onComplete }) {
  const [phase, setPhase] = useState('loading'); // loading -> reveal -> done
  const [counter, setCounter] = useState(0);
  const { t } = useLanguage();
  const loading = t('loading');

  useEffect(() => {
    // Counter: 0 → 100 over 1.9s using requestAnimationFrame for 60fps smoothness
    let start = null;
    const duration = 1900;
    let rafId;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min((progress / duration) * 100, 100);
      
      setCounter(Math.floor(percentage));
      
      if (progress < duration) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);

    // Phase 1: Loading animation plays for 2s
    const t1 = setTimeout(() => {
      setPhase('reveal');
      if (onReveal) onReveal();
    }, 2000);
    // Phase 2: Reveal transition for 1.3s then signal complete
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3300);
    return () => { cancelAnimationFrame(rafId); clearTimeout(t1); clearTimeout(t2); };
  }, [onReveal, onComplete]);

  if (phase === 'done') return null;

  // SVG stroke circle: circumference = 2π × 44 ≈ 276.5
  const CIRC = 276.5;
  const strokeDashoffset = CIRC - (counter / 100) * CIRC;

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden flex items-center justify-center"
      style={{
        pointerEvents: phase === 'reveal' ? 'none' : 'auto',
      }}
    >
      {/* Lớp cánh cổng phụ màu Vàng Cát/Gold bên dưới (Amber Layer) */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full"
        style={{
          background: 'linear-gradient(to right, #8a6e2a, #c9a84c)',
          transform: phase === 'reveal' ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 1.0s cubic-bezier(0.76, 0, 0.24, 1)',
          zIndex: 11,
        }}
      />
      <div
        className="absolute top-0 right-0 w-1/2 h-full"
        style={{
          background: 'linear-gradient(to left, #8a6e2a, #c9a84c)',
          transform: phase === 'reveal' ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 1.0s cubic-bezier(0.76, 0, 0.24, 1)',
          zIndex: 11,
        }}
      />

      {/* Lớp cánh cổng chính màu Tối bên trên (Main Dark Layer) */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full"
        style={{
          background: '#04080f',
          transform: phase === 'reveal' ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 1.1s cubic-bezier(0.76, 0, 0.24, 1) 120ms',
          zIndex: 12,
        }}
      />
      <div
        className="absolute top-0 right-0 w-1/2 h-full"
        style={{
          background: '#04080f',
          transform: phase === 'reveal' ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 1.1s cubic-bezier(0.76, 0, 0.24, 1) 120ms',
          zIndex: 12,
        }}
      />

      {/* Noi dung loading o giua */}
      <div
        className="relative z-20 flex flex-col items-center justify-center transition-all duration-[0.6s]"
        style={{
          opacity: phase === 'reveal' ? 0 : 1,
          transform: phase === 'reveal' ? 'scale(0.9) translateY(-30px)' : 'scale(1) translateY(0)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Ambient glow removed */}

        {/* SVG stroke ring + Logo */}
        <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
          <svg
            width="100" height="100"
            viewBox="0 0 100 100"
            style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
          >
            {/* Track */}
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="1" />
            {/* Progress arc */}
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke="url(#goldGrad)" strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
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
          <span className="font-serif text-2xl font-bold tracking-[0.25em] loader-text"
            style={{ background: 'linear-gradient(135deg, #f0d080, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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
            <span className="text-[9px] font-mono text-luxury-gold/60 loader-text" style={{ animationDelay: '0.3s' }}>
              {counter}%
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
          animation: logoFloat 2s ease-in-out infinite, fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        .loader-text {
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        .loader-bar {
          animation: loadProgress 2s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes loadProgress {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
