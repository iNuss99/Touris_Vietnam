import React, { useState, useEffect } from 'react';
import { Star, StarHalf, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import SplitHeading from './SplitHeading';

export default function Testimonials() {
  const { t } = useLanguage();
  const tm = t('testimonials');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto scroll
  useEffect(() => {
    if (isHovered || !tm.items || tm.items.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tm.items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered, tm.items]);

  if (!tm.items || tm.items.length === 0) return null;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % tm.items.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + tm.items.length) % tm.items.length);

  return (
    <section className="relative py-24 bg-[#04080f] overflow-hidden" id="testimonials">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(15,157,138,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16 reveal-blur">
          <div className="flex justify-center mb-5">
            <span className="section-label">{tm.sectionLabel}</span>
          </div>
          <SplitHeading
            text={tm.sectionTitle}
            className="font-serif text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600 }}
          />
          <p className="text-white/40 font-light text-sm max-w-xl mx-auto leading-relaxed mb-6" style={{ fontWeight: 300 }}>
            {tm.sectionDesc}
          </p>
          
          <div className="flex items-center justify-center gap-2 text-luxury-gold">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <span className="text-white/60 text-xs tracking-wider ml-2">{tm.ratingText}</span>
          </div>
        </div>

        {/* Carousel */}
        <div 
          className="relative max-w-4xl mx-auto reveal-up delay-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden relative rounded-2xl" 
               style={{ 
                 background: 'rgba(10,17,32,0.6)', 
                 border: '1px solid rgba(255,255,255,0.05)',
                 backdropFilter: 'blur(20px)'
               }}>
            
            <Quote size={120} className="absolute -top-6 -left-6 text-white/5 rotate-180" />

            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {tm.items.map((item, idx) => (
                <div key={idx} className="w-full shrink-0 flex flex-col items-center text-center p-10 md:p-16">
                  <div className="flex gap-1 text-luxury-gold mb-6 items-center">
                    <span className="text-white/90 font-medium text-sm mr-2">{item.rating || 5}</span>
                    {[...Array(5)].map((_, i) => {
                      const rating = item.rating || 5;
                      if (i < Math.floor(rating)) {
                        return <Star key={i} size={14} fill="currentColor" className="text-luxury-gold" />;
                      } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                        // For half star, we can render a Star with a gradient or simply render it. 
                        // Since lucide's StarHalf might not be imported or supported exactly this way, 
                        // we can just use StarHalf if available or fallback. We'll add StarHalf to imports.
                        return <StarHalf key={i} size={14} fill="currentColor" className="text-luxury-gold" />;
                      } else {
                        return <Star key={i} size={14} className="text-luxury-gold/30" />;
                      }
                    })}
                  </div>
                  <p className="text-white/80 font-serif text-lg md:text-2xl leading-relaxed mb-8 italic">
                    "{item.content}"
                  </p>
                  <div className="mt-auto">
                    <h4 className="text-white font-medium tracking-wide mb-1">{item.name}</h4>
                    <p className="text-luxury-gold-light/60 text-xs uppercase tracking-widest">{item.tour}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Navigation Controls */}
          <button 
            onClick={handlePrev}
            className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-[#0a1120] border border-white/10 text-white/50 hover:text-luxury-gold hover:border-luxury-gold/50 transition-all z-20 shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-[#0a1120] border border-white/10 text-white/50 hover:text-luxury-gold hover:border-luxury-gold/50 transition-all z-20 shadow-lg"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {tm.items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'bg-luxury-gold w-6' : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
