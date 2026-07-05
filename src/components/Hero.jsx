import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

// URL anh nen tĩnh Ha Long - fallback khi video chua load xong
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=85';

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);
  const { t } = useLanguage();
  const hero = t('hero');

  // Theo doi scroll y de tao hieu ung Parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gioi han video chi phat 30 giay dau
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video && video.currentTime >= 30) {
      video.currentTime = 0;
    }
  }, []);

  // Khi video da tai du de phat -> hien thi video
  const handleCanPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().then(() => {
      setVideoReady(true);
    }).catch(err => {
      console.warn("Video autoplay bi chan:", err);
    });
  }, []);

  return (
    <>
      <section className="parallax-container flex flex-col items-center justify-center">

        {/* === LOP 1: Anh nen tinh fallback — hien thi ngay lap tuc === */}
        <div
          className="absolute inset-0 w-full h-[120%] bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url('${FALLBACK_IMG}')`,
            transform: `translate3d(0, ${scrollY * 0.38}px, 0)`,
            willChange: 'transform',
            top: '-10%',
            // An di khi video da san sang
            opacity: videoReady ? 0 : 1,
            transition: 'opacity 1.5s ease-in-out',
          }}
        />

        {/* === LOP 2: Video nen — hien khi da du buffer de play === */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={handleCanPlay}
          onTimeUpdate={handleTimeUpdate}
          className="absolute inset-0 w-full h-[120%] object-cover pointer-events-none"
          style={{
            transform: `translate3d(0, ${scrollY * 0.38}px, 0)`,
            willChange: 'transform',
            top: '-10%',
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
          }}
        >
          <source src="/Video_background/HaLongBay.mp4" type="video/mp4" />
        </video>

        {/* === LOP 3: Gradient overlay — luon hien tren cung === */}
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 90%, rgba(201,168,76,0.08) 0%, transparent 70%),
              linear-gradient(180deg,
                rgba(4,8,15,0.5) 0%,
                rgba(4,8,15,0.2) 30%,
                rgba(4,8,15,0.5) 65%,
                rgba(4,8,15,0.97) 100%
              )
            `
          }}
        />

        {/* Cac dom sang trang tri phong cach sang trong */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full pointer-events-none z-[3]"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none z-[3]"
          style={{ background: 'radial-gradient(circle, rgba(15,157,138,0.04) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />

        {/* ===== NOI DUNG CHINH (Z-INDEX CAO NHAT) ===== */}
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto" style={{ marginTop: '80px' }}>

          {/* Label tren tieu de */}
          <div className="flex justify-center mb-8">
            <span className="section-label">
              {hero.label}
            </span>
          </div>

          {/* Tieu de chinh (H1) */}
          {/* ap dung hieu ung cuon chu truot tu duoi len (line reveal) phong cach sang trong cua Web 5.0 */}
          <h1 className="font-serif text-white mb-6 leading-[1.05]"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 6.5rem)', fontWeight: 600, letterSpacing: '-0.01em' }}
          >
            <span className="line-reveal-container">
              <span className="line-reveal">{hero.titleLine1}</span>
            </span>
            <span className="line-reveal-container">
              <span className="line-reveal text-gradient-gold italic font-light delay-200"
                style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}
              >
                {hero.titleLine2}
              </span>
            </span>
          </h1>

          {/* Mo ta ngan */}
          <p className="text-white/55 font-light leading-loose mx-auto mb-10"
            style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', maxWidth: '580px', fontWeight: 300 }}
          >
            {hero.description}
          </p>

          {/* CTA Button */}
          <div className="flex items-center justify-center">
            <a
              href="#kham-pha"
              className="btn-glow btn-ripple w-full sm:w-auto text-[12px] uppercase tracking-[0.25em] font-semibold text-luxury-dark bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dim px-10 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-luxury-gold/20"
              style={{ paddingTop: '14px', paddingBottom: '14px' }}
            >
              {hero.ctaButton}
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar Section - Dat duoi Hero fold */}
      <div className="relative z-20 py-14 border-y border-white/5"
        style={{ background: 'linear-gradient(180deg, rgba(4,8,15,0.95) 0%, rgba(10,17,32,0.9) 100%)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {hero.stats?.map(({ value, label }, i) => (
            // ap dung hieu ung reveal-blur (lam mo nhe va truot len) staggered delay giup stats hien thi lan luot rat dep mat
            <div key={i} className={`text-center relative reveal-blur delay-${(i + 1) * 100}`}>
              <div className="stat-number">{value}</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 mt-2 font-medium">{label}</div>
              {/* Vach chia cot doc giua cac cot */}
              {i < 3 && <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-white/10" />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
