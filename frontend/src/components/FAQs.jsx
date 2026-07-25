import React, { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import SplitHeading from './SplitHeading';

export default function FAQs() {
  const { t } = useLanguage();
  const fq = t('faqs');
  const [openIndex, setOpenIndex] = useState(0); // Mở sẵn câu đầu tiên

  if (!fq.items || fq.items.length === 0) return null;

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const handleChatClick = (e) => {
    e.preventDefault();
    // Mo GeminiChatWidget neu co API hoac trigger event
    const chatBtn = document.querySelector('.chatbot-toggle-btn');
    if (chatBtn) chatBtn.click();
  };

  return (
    <section className="relative py-24 bg-[#020408] overflow-hidden" id="faqs">
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxury-gold/10 to-transparent" />
      
      <div className="relative z-10 w-full max-w-screen-md mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16 reveal-up">
          <div className="flex justify-center mb-5">
            <span className="section-label">{fq.sectionLabel}</span>
          </div>
          <SplitHeading
            text={fq.sectionTitle}
            className="font-serif text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600 }}
          />
          <p className="text-white/40 font-light text-sm mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
            {fq.sectionDesc}
          </p>
        </div>

        {/* FAQs List */}
        <div className="space-y-4 reveal-up delay-200">
          {fq.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl transition-all duration-300"
                style={{
                  background: isOpen ? 'rgba(201,168,76,0.05)' : 'rgba(10,17,32,0.4)',
                  border: `1px solid ${isOpen ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <h4 className={`text-[15px] font-medium pr-8 transition-colors duration-300 ${isOpen ? 'text-luxury-gold-light' : 'text-white/90 hover:text-white'}`}>
                    {item.q}
                  </h4>
                  <div 
                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-luxury-gold text-luxury-dark' : 'bg-white/5 text-white/50'}`}
                  >
                    <ChevronDown size={16} className={`transition-transform duration-500 ${isOpen ? '-rotate-180' : ''}`} />
                  </div>
                </button>
                
                <div 
                  className="overflow-hidden transition-all duration-500 ease-in-out"
                  style={{ 
                    maxHeight: isOpen ? '300px' : '0',
                    opacity: isOpen ? 1 : 0
                  }}
                >
                  <div className="p-6 pt-0 text-white/50 text-[14px] font-light leading-relaxed">
                    <div className="w-8 h-px bg-luxury-gold/30 mb-4" />
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat CTA */}
        <div className="mt-12 text-center reveal-up delay-300">
          <button 
            onClick={handleChatClick}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest text-luxury-gold-light hover:text-luxury-dark hover:bg-luxury-gold transition-all duration-300 group"
            style={{ border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <MessageSquare size={16} className="group-hover:animate-bounce" />
            {fq.contactCta}
          </button>
        </div>

      </div>
    </section>
  );
}
