import React, { useState } from 'react';
import { ArrowUpRight, Award, Coffee, Shirt, Music, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

// Import anh tu folder culture da duoc chuyen sang dinh dang webp de toi uu hoa
import imgPho from '../assets/images/culture/pho.webp';
import imgCafePhin from '../assets/images/culture/cafe-phin.webp';
import imgAoDai from '../assets/images/culture/ao-dai.webp';
import imgLantern from '../assets/images/culture/lantern-festival.webp';
import imgBanhMi from '../assets/images/culture/banh-mi.webp';

// Map anh va icon theo id
const IMAGE_MAP = {
  pho: imgPho,
  cafe: imgCafePhin,
  aodai: imgAoDai,
  festival: imgLantern,
  banhmi: imgBanhMi,
};

const ICON_MAP = {
  pho: <UtensilsCrossed size={16} />,
  cafe: <Coffee size={16} />,
  aodai: <Shirt size={16} />,
  festival: <Music size={16} />,
  banhmi: <Award size={16} />,
};

const ACCENT_MAP = {
  pho: '#c9a84c',
  cafe: '#8B6914',
  aodai: '#e8dcc8',
  festival: '#e06030',
  banhmi: '#d4a040',
};

export default function Culture() {
  const [activeItem, setActiveItem] = useState(0);
  const { t } = useLanguage();
  const culture = t('culture');
  const items = culture.items || [];

  const active = items[activeItem];
  if (!active) return null;

  const activeImage = IMAGE_MAP[active.id];
  const activeIcon = ICON_MAP[active.id];
  const activeAccent = ACCENT_MAP[active.id];

  return (
    <section id="van-hoa" className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #04080f 0%, #070d1a 50%, #04080f 100%)' }}>

      {/* Glow decorations */}
      <div className="absolute top-1/4 left-0 w-96 h-96 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(15,157,138,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="max-w-screen-xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center reveal" style={{ marginBottom: '72px' }}>
          <div className="flex justify-center mb-5">
            <span className="section-label">{culture.sectionLabel}</span>
          </div>
          <h2 className="font-serif text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1 }}>
            {culture.sectionTitle}
          </h2>
          <p className="text-white/40 font-light text-sm max-w-lg mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
            {culture.sectionDesc}
          </p>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #0f9d8a, transparent)', margin: '24px auto 0' }} />
        </div>

        {/* Main Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* === COT TRAI: Anh lon cua muc dang chon === */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden group cursor-pointer reveal-left"
            style={{ height: 'clamp(400px, 50vw, 580px)' }}>
            {/* Anh chinh */}
            {items.map((item, idx) => (
              <img key={item.id} src={IMAGE_MAP[item.id]} alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
                style={{
                  opacity: activeItem === idx ? 1 : 0,
                  transform: activeItem === idx ? 'scale(1)' : 'scale(1.06)',
                }}
              />
            ))}

            {/* Gradient overlay */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(160deg, rgba(4,8,15,0.95) 0%, rgba(4,8,15,0.5) 40%, rgba(4,8,15,0.15) 70%, rgba(4,8,15,0.3) 100%)' }}
            />

            {/* Text content */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${activeAccent}20`, border: `1px solid ${activeAccent}40`, color: activeAccent }}>
                  {activeIcon}
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold" style={{ color: `${activeAccent}cc` }}>
                  {active.subtitle}
                </span>
              </div>

              <h3 className="font-serif text-white mb-4 leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 600 }}>
                {active.title}
              </h3>

              <p className="text-white/55 font-light leading-relaxed mb-6 text-sm" style={{ maxWidth: '520px', fontWeight: 300 }}>
                {active.description}
              </p>

              <a href="#dat-tour" className="flex items-center gap-2 text-sm font-medium w-fit group/link"
                style={{ color: `${activeAccent}dd` }}>
                <span className="border-b pb-0.5 transition-colors" style={{ borderColor: `${activeAccent}40` }}>{culture.exploreLink}</span>
                <ArrowUpRight size={16} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* === COT PHAI: Danh sach thumbnail de chon === */}
          <div className="lg:col-span-5 flex flex-col gap-3 reveal-right delay-200">
            {items.map((item, idx) => {
              const isActive = activeItem === idx;
              const itemAccent = ACCENT_MAP[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(idx)}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-400 group/tab w-full"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${itemAccent}10, rgba(10,17,32,0.8))`
                      : 'rgba(10,17,32,0.4)',
                    border: `1px solid ${isActive ? `${itemAccent}35` : 'rgba(255,255,255,0.04)'}`,
                    boxShadow: isActive ? `0 8px 30px -10px ${itemAccent}20` : 'none',
                  }}
                >
                  {/* Thumbnail anh nho */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
                    <img src={IMAGE_MAP[item.id]} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/tab:scale-110" />
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl" style={{ border: `2px solid ${itemAccent}60` }} />
                    )}
                  </div>

                  {/* Text info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: isActive ? itemAccent : 'rgba(255,255,255,0.35)' }} className="transition-colors">
                        {ICON_MAP[item.id]}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest font-medium transition-colors"
                        style={{ color: isActive ? `${itemAccent}aa` : 'rgba(255,255,255,0.25)' }}>
                        {item.subtitle}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-semibold truncate transition-colors"
                      style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.5)' }}>
                      {item.title}
                    </h4>
                  </div>

                  {/* Active indicator */}
                  <div className="w-1.5 rounded-full shrink-0 transition-all duration-300"
                    style={{
                      height: isActive ? '32px' : '16px',
                      background: isActive ? `linear-gradient(180deg, ${itemAccent}, ${itemAccent}40)` : 'rgba(255,255,255,0.08)',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
