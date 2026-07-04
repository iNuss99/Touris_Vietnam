import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
// Import anh logo da chuyen sang webp de tang toc do tai trang
import logoImg from '../assets/images/logo.webp';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Xu ly doi nen navbar va active section khi cuon trang
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);

      // Xac dinh section dang hien thi de highlight link nav tuong ung
      const sections = ['kham-pha', 'van-hoa', 'dat-tour', 'lien-he'];
      const current = sections.find(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 120 && rect.bottom >= 120;
      });
      setActiveSection(current || '');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navLinks = [
    { href: '#kham-pha', label: 'Khám Phá', id: 'kham-pha' },
    { href: '#van-hoa',   label: 'Văn Hóa',  id: 'van-hoa'  },
    { href: '#dat-tour',  label: 'Đặt Tour', id: 'dat-tour' },
    { href: '#lien-he',   label: 'Liên Hệ',  id: 'lien-he'  },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'bg-luxury-dark/92 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.6)] border-b border-luxury-gold/8 py-3'
            : 'py-5'
        }`}
        style={{ paddingLeft: '2rem', paddingRight: '2rem' }}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">

          {/* ===== LOGO (TO HAN, KEM TEN THUONG HIEU) ===== */}
          <a href="#" className="flex items-center gap-3 group shrink-0">
            <img
              src={logoImg}
              alt="Vietnam Tourism Logo"
              className="logo-img object-contain"
              style={{ height: '72px', width: 'auto' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {/* Ten thuong hieu theo phong cach logo vang - VIETNAM TOURISM */}
            <div className="flex flex-col leading-none select-none">
              <span
                className="font-serif text-2xl font-bold tracking-[0.18em] uppercase"
                style={{
                  background: 'linear-gradient(135deg, #f0d080 0%, #c9a84c 50%, #f0d080 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  backgroundSize: '200% auto',
                  letterSpacing: '0.22em',
                }}
              >
                VIETNAM
              </span>
              <span
                className="text-[10px] font-light tracking-[0.55em] uppercase text-luxury-gold-light/80 mt-0.5"
                style={{ letterSpacing: '0.5em' }}
              >
                TOURISM
              </span>
            </div>
          </a>

          {/* ===== DESKTOP NAVIGATION ===== */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map(({ href, label, id }) => (
              // ap dung class active-nav-link khi section dang active de gach chan cung sang len
              <a
                key={id}
                href={href}
                className={`nav-link ${activeSection === id ? 'active-nav-link' : ''}`}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* ===== CTA BUTTON ===== */}
          <div className="hidden lg:flex items-center gap-4">
            {/* bo sung class active-nav-link cho link dang chon tren menu de lam sang duong gach chan */}
            {/* da bo so hotline nho va thanh gach chia de navbar rong rai va sach se hon */}
            <a
              href="#dat-tour"
              className="btn-glow btn-ripple inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-luxury-dark bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dim px-7 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-luxury-gold/20"
            >
              Đặt Tour Ngay
            </a>
          </div>

          {/* ===== MOBILE TOGGLE ===== */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden text-white/80 hover:text-luxury-gold transition-colors p-2"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* ===== MOBILE DRAWER ===== */}
      <div
        className={`fixed inset-0 z-40 flex flex-col transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(4,8,15,0.97)', backdropFilter: 'blur(24px)' }}
      >
        <div className="flex justify-end p-6">
          <button onClick={toggleMobileMenu} className="text-white/60 hover:text-luxury-gold transition-colors">
            <X size={28} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-8">
          {navLinks.map(({ href, label, id }) => (
            <a
              key={id}
              href={href}
              onClick={toggleMobileMenu}
              className="font-serif text-3xl font-light text-white/70 hover:text-luxury-gold transition-colors tracking-widest"
            >
              {label}
            </a>
          ))}
          <a
            href="#dat-tour"
            onClick={toggleMobileMenu}
            className="mt-6 btn-glow px-10 py-4 rounded-full text-sm font-semibold uppercase tracking-widest text-luxury-dark bg-gradient-to-r from-luxury-gold-light to-luxury-gold"
          >
            Đặt Tour Ngay
          </a>
        </div>
        {/* Logo o day mobile drawer */}
        <div className="flex justify-center items-center gap-3 pb-10 opacity-30">
          <img src={logoImg} alt="" style={{ height: '40px' }} />
          <span className="font-serif text-base tracking-widest text-luxury-gold">VIETNAM TOURISM</span>
        </div>
      </div>
    </>
  );
}
