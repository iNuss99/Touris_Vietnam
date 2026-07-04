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
      const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
      const els = document.querySelectorAll(selectors);

      // thiet lap intersection observer de theo doi cuon trang
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
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

  return (
    <>
      {/* Loading Screen — hien khi F5/reload */}
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

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
