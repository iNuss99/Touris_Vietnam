import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

// URL anh nen tinh Ha Long - fallback khi video chua load xong
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1024&q=60';

export default function Hero({ isPageVisible }) {
  const [scrollY, setScrollY] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [showHeroChat, setShowHeroChat] = useState(false);
  const videoRef = useRef(null);
  const { t } = useLanguage();
  const hero = t('hero');
  const magnetRef = useRef(null);

  // Magnetic button — theo cursor trong vong 60px
  const handleMagnetMove = useCallback((e) => {
    const el = magnetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 80) {
      el.style.transform = `translate(${dx * 0.35}px, ${dy * 0.35}px) scale(1.05)`;
    }
  }, []);

  const handleMagnetLeave = useCallback(() => {
    if (magnetRef.current) magnetRef.current.style.transform = '';
  }, []);

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
            opacity: videoReady ? 0 : 1,
            transition: 'opacity 1.5s ease-in-out',
          }}
        />

        {/* === LOP 2: Video nen — hien khi da du buffer de play === */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="metadata"
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
          <track kind="captions" srcLang="vi" label="Vietnamese" />
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
            <span className={`section-label reveal-down ${isPageVisible ? 'active' : ''}`}>
              {hero.label}
            </span>
          </div>

          {/* Tieu de chinh (H1) */}
          {/* ap dung hieu ung cuon chu truot tu duoi len (line reveal) phong cach sang trong cua Web 5.0 */}
          <h1 className="font-serif text-white mb-6 leading-[1.05]"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 6.5rem)', fontWeight: 600, letterSpacing: '-0.01em' }}
          >
            <span className="line-reveal-container">
              <span className={`line-reveal ${isPageVisible ? 'active' : ''}`}>{hero.titleLine1}</span>
            </span>
            <span className="line-reveal-container">
              <span className={`line-reveal text-gradient-gold italic font-light ${isPageVisible ? 'active' : ''}`}
                style={{ fontSize: 'clamp(3rem, 9vw, 7rem)', animationDelay: '0.2s' }}
              >
                {hero.titleLine2}
              </span>
            </span>
          </h1>

          {/* Mo ta ngan */}
          <p className={`text-white/55 font-light leading-loose mx-auto mb-10 reveal-blur delay-300 ${isPageVisible ? 'active' : ''}`}
            style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', maxWidth: '580px', fontWeight: 300 }}
          >
            {hero.description}
          </p>

          {/* CTA Buttons Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal-blur delay-400">
            <a
              ref={magnetRef}
              href="#kham-pha"
              onMouseMove={handleMagnetMove}
              onMouseLeave={handleMagnetLeave}
              className={`btn-glow btn-liquid btn-ripple w-full sm:w-auto text-[12px] uppercase tracking-[0.25em] font-semibold text-luxury-dark bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dim px-10 rounded-full active:scale-95 shadow-2xl shadow-luxury-gold/20 ${isPageVisible ? 'active' : ''}`}
              style={{ paddingTop: '14px', paddingBottom: '14px', transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease' }}
            >
              <span className="liquid-inner">{hero.ctaButton}</span>
            </a>

            <button
              onClick={() => setShowHeroChat(!showHeroChat)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-[12px] uppercase tracking-[0.2em] font-semibold text-luxury-gold-light hover:text-white bg-white/5 hover:bg-luxury-gold/20 border border-luxury-gold/30 hover:border-luxury-gold px-8 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-lg backdrop-blur-md cursor-pointer"
            >
              <Sparkles size={16} className="text-luxury-gold animate-pulse" />
              <span>{showHeroChat ? 'Ẩn Chatbot Hero' : 'Tư vấn AI ngay'}</span>
            </button>
          </div>

          {/* Embedded Dify Chatbot Card (Only inside Hero section) */}
          {showHeroChat && (
            <div className="mt-8 mx-auto w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
              style={{
                background: 'rgba(6, 11, 22, 0.95)',
                border: '1px solid rgba(201, 168, 76, 0.4)',
                boxShadow: '0 32px 80px -12px rgba(0,0,0,0.9), 0 0 40px rgba(201,168,76,0.25)',
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-luxury-gold/20 bg-gradient-to-r from-luxury-gold/10 via-transparent to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-luxury-gold to-luxury-gold-dim flex items-center justify-center text-luxury-dark font-bold text-xs shadow-md">
                    AI
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-white tracking-wide">Tư Vấn Viên Du lịch (Hero)</h4>
                    <p className="text-[11px] text-luxury-gold-light/80">Trợ lý AI trực tiếp tại Hero section</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHeroChat(false)}
                  className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Đóng chat"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Dify Embedded Iframe */}
              <div className="relative w-full h-[520px] bg-[#04080f]">
                <iframe
                  src="https://udify.app/chatbot/izs7mTBwnLVzrR9F"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    filter: 'hue-rotate(185deg) sepia(0.35) saturate(1.8)'
                  }}
                  allow="microphone"
                  title="Dify Hero Chatbot"
                />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Stats Bar Section - Dat duoi Hero fold */}
      <div className="relative z-20 py-14 border-y border-white/5"
        style={{ background: 'linear-gradient(180deg, rgba(4,8,15,0.95) 0%, rgba(10,17,32,0.9) 100%)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {hero.stats?.map(({ value, label }, i) => (
            // ap dung hieu ung reveal-blur (lam mo nhe va truot len) staggered delay giup stats hien thi lan luot rat dep mat
            <div key={i} className={`text-center relative reveal-blur delay-${(i + 2) * 100} ${isPageVisible ? 'active' : ''}`}>
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
