import React, { useEffect, useState, useCallback, useRef } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import Culture from './components/Culture';
import TourPackages from './components/TourPackages';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

function MainContent({ isLoading, isPageVisible, handleReveal, handleLoadingComplete }) {
  const { lang } = useLanguage();
  const [isLangChanging, setIsLangChanging] = useState(false);
  const isFirstRender = useRef(true);

  // Hieu ung chuyen doi ngon ngu hoa quyen (Cross-dissolve Transition)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsLangChanging(true);
    const timer = setTimeout(() => {
      setIsLangChanging(false);
    }, 280); // 280ms duration
    return () => clearTimeout(timer);
  }, [lang]);

  return (
    <>
      {/* Loading Screen — hien khi F5/reload */}
      {isLoading && (
        <LoadingScreen 
          onReveal={handleReveal} 
          onComplete={handleLoadingComplete} 
        />
      )}

      {/* quan sang vang theo duoi chuot phong cach Web 5.0 */}
      <div className="cursor-glow" />

      <div
        className={`min-h-screen antialiased transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isPageVisible ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-4 scale-[0.98] blur-[2px]'
        }`}
        style={{
          background: '#04080f',
          color: '#e8e4d8',
        }}
      >
        {/* Lớp mat na hoa quyen khi doi ngon ngu */}
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
    </>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(false);

  const handleReveal = useCallback(() => {
    setIsPageVisible(true);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // khoi tao scroll reveal khi loading hoan tat
  useEffect(() => {
    if (!isPageVisible) return;

    // bien de luu tru doi tuong observer giup disconnect luc don dep
    let observer;

    // tri hoan nhe de cho toan bo DOM duoc render xong
    const timer = setTimeout(() => {
      // danh sach cac class hieu ung cuon trang duoc ho tro trong du an
      const selectors = '.reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-rotate-left, .reveal-rotate-right';
      const els = document.querySelectorAll(selectors);

      // thiet lap intersection observer de theo doi cuon trang
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
            } else {
              // xoa class active khi phan tu cuon ra khoi khung nhin de khi cuon lai van co hoat canh
              entry.target.classList.remove('active');
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      );

      // bat dau quan sat (reveal) tung phan tu
      els.forEach((el) => observer.observe(el));
    }, 100);

    // don dep timer va ngat ket noi observer khi component unmount de tranh memory leak
    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isPageVisible]);

  // hieu ung theo doi con tro chuot (glow follower) dang cap Web 5.0
  useEffect(() => {
    // kiem tra neu thiet bi ho tro pointer dang fine (chuot) thi moi chay
    if (window.matchMedia('(pointer: fine)').matches) {
      const glowEl = document.querySelector('.cursor-glow');
      const handleMouseMove = (e) => {
        // Cap nhat truc tiep vi tri len phan tu quan sang bang inline style de GPU hoat hoa muot ma
        if (glowEl) {
          glowEl.style.transform = `translate3d(${e.clientX - 250}px, ${e.clientY - 250}px, 0)`;
        }
      };
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <LanguageProvider>
      <MainContent 
        isLoading={isLoading}
        isPageVisible={isPageVisible}
        handleReveal={handleReveal}
        handleLoadingComplete={handleLoadingComplete}
      />
    </LanguageProvider>
  );
}
