import React, { useState } from 'react';
import { Check, Sparkles, Zap, Crown, Gem, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const PACKAGE_META = [
  { icon: <Zap size={20} />, gradient: 'from-blue-500/20 to-cyan-500/20', accentColor: '#38bdf8', popular: false },
  { icon: <Crown size={20} />, gradient: 'from-luxury-gold/20 to-amber-500/20', accentColor: '#c9a84c', popular: true },
  { icon: <Gem size={20} />, gradient: 'from-purple-500/20 to-pink-500/20', accentColor: '#a78bfa', popular: false },
];

export default function TourPackages() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [apiPackages, setApiPackages] = useState([]);
  const { t } = useLanguage();
  const tp = t('tourPackages');
  
  React.useEffect(() => {
    fetch('http://localhost:5000/api/tours')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setApiPackages(data);
        }
      })
      .catch(err => console.error('Failed to fetch tours:', err));
  }, []);

  const packages = apiPackages.length > 0 ? apiPackages : (tp.packages || []);

  const contactPriceValues = ['Contact Us', 'Liên hệ'];

  return (
    <section id="dat-tour" className="relative py-24 bg-[#04080f] overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[1000px] h-[800px]" style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 55%)', filter: 'blur(40px)' }} />
        <div className="absolute -left-32 top-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -right-32 bottom-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center px-6 mb-16">
          <div className="flex justify-center mb-5">
            <span className="section-label">{tp.sectionLabel}</span>
          </div>
          <h2 className="font-serif text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600 }}>
            {tp.sectionTitle}
          </h2>
          <p className="text-white/40 font-light text-sm max-w-lg mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
            {tp.sectionDesc}
          </p>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', margin: '24px auto 0' }} />
        </div>

        {/* Bố cục Grid tĩnh thay vì Scroll ngang để tương thích mọi thiết bị */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-12">
          {packages.map((pkg, idx) => {
            const meta = PACKAGE_META[idx] || PACKAGE_META[0];
            const isHovered = hoveredIndex === idx;
            const isPopular = meta.popular;
            const isContactPrice = contactPriceValues.includes(pkg.price);

            return (
              <div
                key={idx}
                className="relative group w-full"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className="relative h-full flex flex-col transition-transform duration-500 overflow-hidden hover:-translate-y-2"
                  style={{
                    background: isPopular
                      ? 'linear-gradient(170deg, rgba(30,24,8,0.85) 0%, rgba(10,17,32,0.95) 100%)'
                      : 'rgba(10,17,32,0.5)',
                    borderRadius: '24px',
                    border: isPopular ? '1px solid rgba(201,168,76,0.45)' : '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: isPopular ? '0 15px 40px -10px rgba(201,168,76,0.15)' : '0 10px 30px -15px rgba(0,0,0,0.5)',
                  }}
                >
                  {isPopular && (
                    <div className="flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-[0.25em]"
                      style={{ background: 'linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c)', color: '#04080f' }}>
                      <Sparkles size={12} />
                      {tp.popularTag}
                    </div>
                  )}

                  <div className="p-8 md:p-10 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${meta.accentColor}15, ${meta.accentColor}08)`,
                          border: `1px solid ${meta.accentColor}30`,
                          color: meta.accentColor,
                          boxShadow: isHovered ? `0 0 25px -5px ${meta.accentColor}30` : 'none',
                        }}>
                        {meta.icon}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] mb-0.5 font-medium" style={{ color: `${meta.accentColor}90` }}>
                          {pkg.subtitle}
                        </p>
                        <h3 className="font-serif text-white" style={{ fontSize: '1.6rem', fontWeight: 600 }}>{pkg.name}</h3>
                      </div>
                    </div>

                    <div className="mb-7 pb-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="font-serif text-white leading-none"
                        style={{
                          fontSize: isContactPrice ? '1.7rem' : '2.4rem',
                          fontWeight: 600,
                          ...(isPopular ? { background: 'linear-gradient(135deg, #f0d080, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}),
                        }}>
                        {pkg.price}
                      </div>
                      <p className="text-white/25 text-[11px] mt-2">{pkg.unit}</p>
                      <p className="text-white/20 text-[10px] mt-1">⏱ {pkg.duration}</p>
                    </div>

                    <ul className="space-y-3.5 mb-8 flex-1">
                      {pkg.features.map((feat, fi) => (
                        <li key={fi} className="flex items-start gap-3 group/item">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300"
                            style={{
                              background: isPopular ? 'rgba(201,168,76,0.12)' : `${meta.accentColor}10`,
                              border: `1px solid ${isPopular ? 'rgba(201,168,76,0.35)' : `${meta.accentColor}20`}`,
                            }}>
                            <Check size={10} style={{ color: isPopular ? '#c9a84c' : meta.accentColor }} />
                          </div>
                          <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <a href="#lien-he"
                      className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl text-[12px] font-semibold uppercase tracking-[0.18em] transition-all duration-400 ${
                        isPopular
                          ? 'btn-glow text-luxury-dark bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dim hover:scale-[1.03] shadow-lg shadow-luxury-gold/15'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      style={{
                        border: isPopular ? 'none' : `1px solid ${isHovered ? `${meta.accentColor}40` : 'rgba(255,255,255,0.08)'}`,
                        backdropFilter: 'blur(8px)',
                      }}>
                      {isContactPrice ? tp.getQuote : tp.bookNow}
                      <ChevronRight size={14} />
                    </a>
                  </div>

                  <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${meta.accentColor}08 0%, transparent 60%)`,
                      opacity: isHovered ? 1 : 0,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center pb-10">
          <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
            {(tp.trustBadges || []).map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-white/25 text-[10px] uppercase tracking-widest">
                <div className="w-1 h-1 rounded-full bg-luxury-gold" />
                {badge}
              </div>
            ))}
          </div>
          <p className="text-center text-white/15 text-xs font-light px-6" style={{ fontWeight: 300 }}>
            {tp.priceNote}
          </p>
        </div>

      </div>
    </section>
  );
}
