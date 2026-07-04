import React, { useEffect, useState, useCallback } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import Culture from './components/Culture';
import TourPackages from './components/TourPackages';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // khoi tao scroll reveal khi loading hoan tat
  useEffect(() => {
    if (isLoading) return;

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
  }, [isLoading]);

  // hieu ung theo doi con tro chuot (glow follower) dang cap Web 5.0
  useEffect(() => {
    // kiem tra neu thiet bi ho tro pointer dang fine (chuot) thi moi chay
    if (window.matchMedia('(pointer: fine)').matches) {
      const handleMouseMove = (e) => {
        // cap nhat vi tri chuot vao bien CSS de hoat hoa bang GPU cuc ky muot ma
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      };
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <>
      {/* Loading Screen — hien khi F5/reload */}
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* quan sang vang theo duoi chuot phong cach Web 5.0 */}
      <div className="cursor-glow" />

      <div
        className="min-h-screen antialiased"
        style={{
          background: '#04080f',
          color: '#e8e4d8',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      >
        <Navbar />
        <Hero />
        <Destinations />
        <Culture />
        <TourPackages />
        <ContactForm />
        <Footer />
      </div>
    </>
  );
}
