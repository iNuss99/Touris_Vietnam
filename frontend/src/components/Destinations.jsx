// import react va hook useState
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
// import cac icon can thiet tu lucide-react, dong thoi them Check va loai bo code thua
import { ArrowRight, Star, Clock, MapPin, X, Calendar, Compass, Sun, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

// import cac file hinh anh dia danh phien ban webp da duoc nen de tang toc do load trang
import imgHaLong from '../assets/images/places/halong-bay.webp';
import imgHoiAn from '../assets/images/places/hoi-an.webp';
import imgTrangAn from '../assets/images/places/trang-an.webp';
import imgPhuQuoc from '../assets/images/places/phu-quoc.webp';
import imgSaPa from '../assets/images/places/sapa.webp';
import imgDaNang from '../assets/images/places/da-nang.webp';

// Map image imports theo id de gan anh cho tung diem den
const IMAGE_MAP = {
  halong: imgHaLong,
  hoian: imgHoiAn,
  trangan: imgTrangAn,
  phuquoc: imgPhuQuoc,
  sapa: imgSaPa,
  danang: imgDaNang,
};

// Delay cho moi card (stagger animation)
const DELAY_MAP = {
  halong: '0ms',
  hoian: '100ms',
  trangan: '200ms',
  phuquoc: '300ms',
  sapa: '400ms',
  danang: '500ms',
};

// === DESTINATION CARD COMPONENT ===
// truyen index vao de tinh toan hieu ung cuon trang xoay trai/phai xen ke
const DestinationCard = ({ data, onViewDetail, index }) => {
  const { t } = useLanguage();
  const dest = t('destinations');

  // xac dinh class reveal xoay trai hoac xoay phai dua tren index
  const revealClass = index % 2 === 0 ? 'reveal-rotate-left' : 'reveal-rotate-right';
  const image = IMAGE_MAP[data.id];
  const delay = DELAY_MAP[data.id] || '0ms';

  return (
    <div
      className={`flip-card ${revealClass} w-full h-[480px]`}
      style={{ transitionDelay: delay }}
    >
      <div className="flip-card-inner rounded-[20px] shadow-2xl">
        {/* MẶT TRƯỚC (FRONT) */}
        <div className="flip-card-front relative rounded-[20px] overflow-hidden group">
          <img src={image} alt={data.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,8,15,0.97) 0%, rgba(4,8,15,0.5) 45%, rgba(4,8,15,0.1) 75%, transparent 100%)' }} />
          
          <div className="absolute top-4 right-4 z-10">
            <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-md"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', backdropFilter: 'blur(8px)' }}>
              {data.badge}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-7 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star size={13} className="fill-luxury-gold text-luxury-gold" />
                <span className="text-[11px] font-semibold text-luxury-gold-light">{data.rating}</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1 text-white/50">
                <Clock size={13} /><span className="text-[10px]">{data.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-white/50">
                <MapPin size={13} /><span className="text-[10px]">{data.location}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: 'rgba(201,168,76,0.7)' }}>{data.category}</span>
            <h3 className="font-serif text-white font-semibold leading-tight" style={{ fontSize: '1.65rem' }}>{data.title}</h3>
          </div>
        </div>

        {/* MẶT SAU (BACK) */}
        <div className="flip-card-back rounded-[20px]" onClick={() => onViewDetail(data)}>
          <MapPin size={32} className="text-luxury-gold mb-2 opacity-50" />
          <h3 className="font-serif text-luxury-gold text-2xl mb-2 text-center">{data.title}</h3>
          <p className="text-white/60 text-xs font-light text-center leading-relaxed line-clamp-4 mb-6">{data.description}</p>
          <button className="btn-glow px-6 py-2.5 rounded-full border border-luxury-gold/50 text-luxury-gold text-xs uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-colors font-semibold">
            {dest.viewDetail}
          </button>
        </div>
      </div>
    </div>
  );
};

// modal hien thi chi tiet tour cho tung dia diem
const TourDetailModal = ({ destination, onClose }) => {
  // khoi tao hook activeTab o dau component de dung quy tac hooks (khoi chay vo dieu kien)
  const [activeTab, setActiveTab] = useState('about'); 
  const { t } = useLanguage();
  const dest = t('destinations');

  // ngan cuon trang khi modal dang mo
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // neu khong co thong tin diem den thi tra ve null (dat sau hook de khong bi loi)
  if (!destination) return null;
  
  const { tour, title, rating, duration, location, category, about, bestTime, cuisine, localHighlights } = destination;
  const image = IMAGE_MAP[destination.id];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10 overflow-y-auto"
      style={{ 
        background: 'rgba(0,0,0,0.85)', 
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'modalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl overflow-hidden my-4 md:my-6 flex flex-col max-h-[85vh] md:max-h-[80vh]"
        style={{
          background: 'linear-gradient(160deg, rgba(15,22,42,0.98) 0%, rgba(4,8,15,0.98) 100%)',
          border: '1px solid rgba(201,168,76,0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'modalScaleUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Style block inline de dung keyframes */}
        <style>{`
          @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalScaleUp {
            from { opacity: 0; transform: scale(0.95) translateY(30px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .custom-scrollbar-modal::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar-modal::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.01);
          }
          .custom-scrollbar-modal::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #c9a84c, #8a6e2a);
            border-radius: 4px;
          }
          .custom-scrollbar-modal::-webkit-scrollbar-thumb:hover {
            background: #c9a84c;
          }
        `}</style>
        {/* Nut dong */}
        <button onClick={onClose} className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <X size={20} />
        </button>

        {/* Banner anh */}
        <div className="relative h-52 md:h-60 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,22,42,1) 0%, rgba(15,22,42,0.4) 50%, transparent 100%)' }} />
          <div className="absolute bottom-5 left-6 right-6">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c' }}>{category}</span>
              <div className="flex items-center gap-1"><Star size={14} className="fill-luxury-gold text-luxury-gold" /><span className="text-sm font-semibold text-luxury-gold-light">{rating}</span></div>
              <div className="flex items-center gap-1 text-white/50 text-xs"><Clock size={14} />{duration}</div>
              <div className="flex items-center gap-1 text-white/50 text-xs"><MapPin size={14} />{location}</div>
            </div>
            <h2 className="font-serif text-white leading-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 600 }}>{title}</h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-luxury-dark/40 px-6">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-4 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all duration-300 ${
              activeTab === 'about' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {dest.tabAbout}
          </button>
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`py-3 px-4 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all duration-300 ${
              activeTab === 'itinerary' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {dest.tabItinerary}
          </button>
        </div>

        {/* Noi dung chi tiet */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto custom-scrollbar-modal">

          {/* Cot trai: Tab Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'about' ? (
              // TAB 1: THONG TIN VE DIA DIEM & DAC SAC
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-luxury-gold font-semibold mb-4 flex items-center gap-2">
                    <Compass size={14} /> {dest.aboutTitle}
                  </h3>
                  <p className="text-white/70 text-sm font-light leading-relaxed text-justify" style={{ fontWeight: 300 }}>
                    {about}
                  </p>
                </div>

                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-luxury-emerald-light font-semibold mb-5 flex items-center gap-2">
                    <Star size={14} /> {dest.highlightsTitle}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {localHighlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl" style={{ background: 'rgba(15,157,138,0.03)', border: '1px solid rgba(15,157,138,0.06)' }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-luxury-emerald-light" style={{ background: 'rgba(15,157,138,0.08)' }}>
                          <Check size={12} />
                        </div>
                        <span className="text-white/60 text-xs font-light leading-relaxed" style={{ fontWeight: 300 }}>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // TAB 2: LICH TRINH TOUR CHI TIET
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-luxury-gold font-semibold mb-4">{dest.tourNameTitle}</h3>
                  <p className="text-white font-medium text-lg mb-2">{tour.tourName}</p>
                  <p className="text-white/45 text-xs font-light">{dest.tourNote}</p>
                </div>

                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-luxury-emerald-light font-semibold mb-5">{dest.itineraryTitle}</h3>
                  <div className="space-y-4">
                    {tour.itinerary.map((day, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: 'rgba(15,157,138,0.04)', border: '1px solid rgba(15,157,138,0.08)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-luxury-emerald-light text-xs font-bold" style={{ background: 'rgba(15,157,138,0.12)' }}>
                          <Calendar size={14} />
                        </div>
                        <div>
                          <p className="text-white text-xs uppercase tracking-widest font-semibold mb-1">{dest.dayLabel} {i + 1}</p>
                          <span className="text-white/65 text-sm font-light leading-relaxed" style={{ fontWeight: 300 }}>{day.split('→').slice(1).join(' → ') || day}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-luxury-gold font-semibold mb-4">{dest.tourHighlightsTitle}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tour.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] text-white/50 font-light" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cot phai: Gia + Thong tin du lich nhanh */}
          <div className="space-y-6">
            {/* The dat tour */}
            <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(160deg, rgba(30,24,8,0.5) 0%, rgba(10,17,32,0.8) 100%)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 mb-2">{dest.priceLabel}</p>
              <div className="font-serif mb-1" style={{ fontSize: '2.1rem', fontWeight: 600, background: 'linear-gradient(135deg, #f0d080, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {tour.price}
              </div>
              <p className="text-white/35 text-xs">{tour.pricePer}</p>
              
              <a href="#lien-he" onClick={onClose}
                className="btn-glow mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-[0.18em] text-luxury-dark bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dim hover:scale-102 transition-transform shadow-lg shadow-luxury-gold/10">
                {dest.bookConsult}
                <ArrowRight size={13} />
              </a>
            </div>

            {/* Quick Travel Guide (Cam nang nhanh) */}
            <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2 flex items-center gap-2"><Sun size={12} className="text-luxury-gold" /> {dest.quickGuide}</h4>
              
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-white/30 text-[9px] uppercase tracking-wider mb-1">{dest.bestTimeLabel}</p>
                  <p className="text-white/70 font-light" style={{ fontWeight: 300 }}>{bestTime}</p>
                </div>
                
                <div>
                  <p className="text-white/30 text-[9px] uppercase tracking-wider mb-1">{dest.cuisineLabel}</p>
                  <p className="text-white/70 font-light leading-relaxed" style={{ fontWeight: 300 }}>{cuisine}</p>
                </div>
              </div>
            </div>

            {/* Tour bao gom */}
            <div className="px-1.5">
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-3.5 font-semibold">{dest.includesLabel}</h4>
              <ul className="space-y-2.5">
                {tour.includes.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-luxury-emerald-light shrink-0" />
                    <span className="text-white/55 text-xs font-light" style={{ fontWeight: 300 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === MAIN COMPONENT ===
export default function Destinations() {
  const [selectedDest, setSelectedDest] = useState(null);
  const [apiItems, setApiItems] = useState([]);
  const { t } = useLanguage();
  const dest = t('destinations');
  
  React.useEffect(() => {
    fetch('http://localhost:5000/api/destinations')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setApiItems(data);
        }
      })
      .catch(err => console.error('Failed to fetch destinations:', err));
  }, []);

  const items = apiItems.length > 0 ? apiItems : (dest.items || []);

  // Khi chon 1 card, tim item tuong ung de truyen vao modal
  const handleViewDetail = (cardData) => {
    // cardData chinh la item tu translations, da co day du thong tin
    setSelectedDest(cardData);
  };

  return (
    <>
      <section id="kham-pha">
        <div className="max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="text-center reveal" style={{ marginBottom: '72px' }}>
            <div className="flex justify-center mb-5">
              <span className="section-label">{dest.sectionLabel}</span>
            </div>
            <h2 className="font-serif text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1 }}>
              {dest.sectionTitle}
            </h2>
            <p className="text-white/40 font-light text-sm max-w-lg mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              {dest.sectionDesc}
            </p>
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', margin: '24px auto 0' }} />
          </div>

          {/* Grid 6 diem den */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              // truyen them index vao component con
              <DestinationCard key={idx} data={item} onViewDetail={handleViewDetail} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Modal tour chi tiet */}
      {selectedDest && createPortal(<TourDetailModal destination={selectedDest} onClose={() => setSelectedDest(null)} />, document.body)}
    </>
  );
}
