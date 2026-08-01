// import react va hook useState
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
// import cac icon can thiet tu lucide-react, dong thoi them Check va loai bo code thua
import { ArrowRight, Star, Clock, MapPin, X, Calendar, Compass, Sun, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import SplitHeading from './SplitHeading';

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
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://touris-vietnam-api.vercel.app';

const DestinationCard = ({ data, onViewDetail, index }) => {
  const { t } = useLanguage();
  const dest = t('destinations');

  const getCardImage = (d) => {
    if (IMAGE_MAP[d.code]) return IMAGE_MAP[d.code];
    if (IMAGE_MAP[d.id]) return IMAGE_MAP[d.id];
    const key = (d.title || d.code || '').toLowerCase();
    if (key.includes('hạ long') || key.includes('halong')) return imgHaLong;
    if (key.includes('hội an') || key.includes('hoian')) return imgHoiAn;
    if (key.includes('tràng an') || key.includes('trangan')) return imgTrangAn;
    if (key.includes('phú quốc') || key.includes('phuquoc')) return imgPhuQuoc;
    if (key.includes('sa pa') || key.includes('sapa')) return imgSaPa;
    if (key.includes('đà nẵng') || key.includes('danang')) return imgDaNang;
    if (d.image_url && d.image_url.trim() !== '' && !d.image_url.includes('unsplash.com')) return d.image_url;
    return imgHaLong;
  };

  const image = getCardImage(data);
  const delay = DELAY_MAP[data.code] || DELAY_MAP[data.id] || '0ms';
  const revealClass = (index ?? 0) % 2 === 0 ? 'reveal-rotate-left' : 'reveal-rotate-right';

  return (
    <div
      className={`flip-card ${revealClass} w-full h-[480px] cursor-pointer`}
      style={{ transitionDelay: delay }}
      onClick={() => onViewDetail(data)}
    >
      <div className="flip-card-inner rounded-[20px] shadow-2xl">
        {/* MẶT TRƯỚC (FRONT) */}
        <div className="flip-card-front relative rounded-[20px] overflow-hidden group">
          <img src={image} alt={data.title} loading="lazy" width="480" height="480" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 scroll-skew" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,8,15,0.97) 0%, rgba(4,8,15,0.5) 45%, rgba(4,8,15,0.1) 75%, transparent 100%)' }} />
          
          <div className="absolute top-4 right-4 z-10">
            <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-md shadow-md"
              style={{ background: 'rgba(12,8,2,0.8)', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c' }}>
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
            <h3 className="font-serif text-white font-semibold leading-tight flex items-center justify-between" style={{ fontSize: '1.65rem' }}>
              <span>{data.title}</span>
              <span className="text-xs text-amber-400 font-sans font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Chi tiết</span> <ArrowRight size={14} />
              </span>
            </h3>
          </div>
        </div>

        {/* MẶT SAU (BACK) */}
        <div className="flip-card-back rounded-[20px]">
          <MapPin size={32} className="text-luxury-gold mb-2 opacity-80 animate-bounce" />
          <h3 className="font-serif text-luxury-gold text-2xl mb-2 text-center">{data.title}</h3>
          <p className="text-white/80 text-xs font-normal text-center leading-relaxed line-clamp-4 mb-6">{data.description}</p>
          <button className="btn-glow px-6 py-2.5 rounded-full border border-luxury-gold/50 text-luxury-gold text-xs uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all font-semibold shadow-lg">
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
  const overlayRef = React.useRef(null);

  // Khóa cuộn trang landing page tuyệt đối & tạm dừng Lenis Smooth Scroll
  React.useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Tạm dừng Lenis smooth scroll trên window khi mở modal
    if (window.__lenis) {
      window.__lenis.stop();
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;

      // Khôi phục Lenis smooth scroll khi đóng modal
      if (window.__lenis) {
        window.__lenis.start();
      }
    };
  }, []);

  // neu khong co thong tin diem den thi tra ve null (dat sau hook de khong bi loi)
  if (!destination) return null;
  
  const tour = destination.tour || {};
  const title = destination.title || 'Chi tiết địa danh';
  const rating = destination.rating || '4.9';
  const duration = destination.duration || '2-3 Ngày';
  const location = destination.location || 'Việt Nam';
  const category = destination.category || 'Điểm đến cao cấp';
  const about = destination.about || destination.description || 'Chưa có thông tin chi tiết.';
  const bestTime = destination.bestTime || 'Quanh năm';
  const cuisine = destination.cuisine || 'Đặc sản địa phương phong phú';
  const localHighlights = destination.localHighlights || [];
  const itinerary = tour.itinerary || [];
  const highlights = tour.highlights || [];
  const includes = tour.includes || [];
  const image = destination.image_url || IMAGE_MAP[destination.code] || IMAGE_MAP[destination.id] || imgHaLong;

  return (
    <div
      ref={overlayRef}
      data-lenis-prevent
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-hidden overscroll-contain"
      style={{ 
        background: 'rgba(0,0,0,0.88)', 
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'modalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        overscrollBehavior: 'contain'
      }}
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        className="relative w-full max-w-4xl h-[85vh] max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl shrink-0"
        style={{
          background: 'linear-gradient(160deg, rgba(15,22,42,0.99) 0%, rgba(4,8,15,0.99) 100%)',
          border: '1px solid rgba(201,168,76,0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          animation: 'modalScaleUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
          .custom-scrollbar-modal {
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
          }
          .custom-scrollbar-modal::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar-modal::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.4);
          }
          .custom-scrollbar-modal::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #c9a84c, #8a6e2a);
            border-radius: 6px;
          }
          .custom-scrollbar-modal::-webkit-scrollbar-thumb:hover {
            background: #c9a84c;
          }
        `}</style>

        {/* Nut dong */}
        <button onClick={onClose} className="absolute top-5 right-5 z-30 w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer shadow-lg" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <X size={20} />
        </button>

        {/* Banner anh */}
        <div className="relative h-48 md:h-56 overflow-hidden shrink-0">
          <img src={image} alt={title} loading="lazy" width="877" height="1024" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,22,42,1) 0%, rgba(15,22,42,0.4) 50%, transparent 100%)' }} />
          <div className="absolute bottom-4 left-6 right-6 z-10">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <span className="text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full shadow-md" style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.5)', color: '#FFE29F' }}>{category}</span>
              <div className="flex items-center gap-1"><Star size={14} className="fill-luxury-gold text-luxury-gold" /><span className="text-sm font-semibold text-luxury-gold-light">{rating}</span></div>
              <div className="flex items-center gap-1 text-white/70 text-xs"><Clock size={14} />{duration}</div>
              <div className="flex items-center gap-1 text-white/70 text-xs"><MapPin size={14} />{location}</div>
            </div>
            <h2 className="font-serif text-white leading-tight" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 600 }}>{title}</h2>
          </div>
        </div>

        {/* Navigation Tabs (Co dinh tren dau Pop-up) */}
        <div className="flex border-b border-white/10 bg-[#0F162A] px-6 shrink-0 z-20">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-5 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all duration-300 cursor-pointer ${
              activeTab === 'about' ? 'border-amber-400 text-amber-300' : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            {dest.tabAbout}
          </button>
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`py-3 px-5 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all duration-300 cursor-pointer ${
              activeTab === 'itinerary' ? 'border-amber-400 text-amber-300' : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            {dest.tabItinerary}
          </button>
        </div>

        {/* Noi dung chi tiet (CHỈ CUỘN BÊN TRONG BẢNG POP-UP) */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar-modal p-6 md:p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Cot trai: Tab Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'about' ? (
              // TAB 1: THONG TIN VE DIA DIEM & DAC SAC
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-amber-400 font-semibold mb-3 flex items-center gap-2">
                    <Compass size={14} /> {dest.aboutTitle}
                  </h3>
                  <p className="text-slate-200 text-sm font-normal leading-relaxed text-justify">
                    {about}
                  </p>
                </div>

                {localHighlights.length > 0 && (
                  <div>
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                      <Star size={14} /> {dest.highlightsTitle}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {localHighlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 bg-emerald-500/20">
                            <Check size={12} />
                          </div>
                          <span className="text-slate-300 text-xs font-normal leading-relaxed">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // TAB 2: LICH TRINH TOUR CHI TIET
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-amber-400 font-semibold mb-2">{dest.tourNameTitle}</h3>
                  <p className="text-white font-bold text-lg mb-1">{tour.tourName || title}</p>
                  <p className="text-slate-400 text-xs font-normal">{dest.tourNote}</p>
                </div>

                {itinerary.length > 0 && (
                  <div>
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-emerald-400 font-semibold mb-4">{dest.itineraryTitle}</h3>
                    <div className="space-y-3.5">
                      {itinerary.map((day, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-emerald-400 font-bold bg-emerald-500/20 text-xs">
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p className="text-amber-300 text-xs uppercase tracking-widest font-bold mb-1">{dest.dayLabel} {i + 1}</p>
                            <span className="text-slate-200 text-sm font-normal leading-relaxed">{day.split('→').slice(1).join(' → ') || day}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {highlights.length > 0 && (
                  <div>
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-amber-400 font-semibold mb-3">{dest.tourHighlightsTitle}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {highlights.map((h, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-slate-300 font-normal bg-slate-900/60 border border-slate-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cot phai: Gia + Thong tin du lich nhanh */}
          <div className="space-y-6">
            {/* The dat tour */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1F190B] to-[#0A1120] border border-amber-500/30 shadow-xl">
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1">{dest.priceLabel}</p>
              <div className="font-serif mb-1 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                {tour.price || ' Liên hệ'} {tour.price ? (tour.pricePer || 'VNĐ / người') : ''}
              </div>
              
              <a
                href="#lien-he"
                onClick={onClose}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.18em] text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:scale-[1.02] transition-transform shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>{dest.bookConsult}</span>
                <ArrowRight size={14} />
              </a>
            </div>

            {/* Quick Travel Guide (Cam nang nhanh) */}
            <div className="p-5 rounded-2xl space-y-4 bg-slate-900/40 border border-slate-800">
              <h4 className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2 flex items-center gap-2">
                <Sun size={14} /> {dest.quickGuide}
              </h4>
              
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-medium">{dest.bestTimeLabel}</p>
                  <p className="text-slate-200 font-normal">{bestTime}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-medium">{dest.cuisineLabel}</p>
                  <p className="text-slate-200 font-normal leading-relaxed">{cuisine}</p>
                </div>
              </div>
            </div>

            {/* Tour bao gom */}
            {includes.length > 0 && (
              <div className="px-1">
                <h4 className="text-[10px] uppercase tracking-widest text-amber-400 mb-3 font-bold">{dest.includesLabel}</h4>
                <ul className="space-y-2.5">
                  {includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-slate-300 text-xs font-normal">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
    fetch(`${BACKEND_URL}/api/destinations`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const defaultItems = dest.items || [];
          const mappedData = data.map(d => {
            const codeKey = (d.code || d.id || '').toLowerCase();
            const titleKey = (d.title || '').toLowerCase();

            // Match item với danh sách tri thức đầy đủ trong i18n
            const fallbackItem = defaultItems.find(item => 
              item.id === codeKey || 
              (item.title && titleKey.includes(item.title.toLowerCase())) ||
              (item.title && item.title.toLowerCase().includes(titleKey))
            ) || defaultItems[0] || {};

            const safeTour = {
              tourName: d.tour_name || (fallbackItem.tour && fallbackItem.tour.tourName) || d.title || fallbackItem.title || 'Tour Khám Phá',
              price: d.tour_price || (fallbackItem.tour && fallbackItem.tour.price) || '9,500,000',
              pricePer: 'VNĐ / người',
              highlights: (d.tour_highlights && d.tour_highlights.length > 0) ? d.tour_highlights : (fallbackItem.tour && fallbackItem.tour.highlights) || ['Nghỉ dưỡng 5 sao', 'Đưa đón tận nơi', 'Hướng dẫn viên chuyên nghiệp'],
              includes: (d.tour_includes && d.tour_includes.length > 0) ? d.tour_includes : (fallbackItem.tour && fallbackItem.tour.includes) || ['Khách sạn 4-5 sao', 'Bữa ăn theo chương trình', 'Vé tham quan', 'Bảo hiểm'],
              itinerary: (d.itinerary && d.itinerary.length > 0) ? d.itinerary : (fallbackItem.tour && fallbackItem.tour.itinerary) || ['Ngày 1: Đón khách → Khám phá danh thắng', 'Ngày 2: Trải nghiệm ẩm thực & Trở về'],
            };

            return {
              ...fallbackItem,
              ...d,
              id: d.code || d.id || fallbackItem.id,
              title: d.title || fallbackItem.title,
              category: d.category || fallbackItem.category,
              rating: d.rating || fallbackItem.rating,
              duration: d.duration || fallbackItem.duration,
              location: d.location || fallbackItem.location,
              description: d.description || fallbackItem.description,
              badge: d.badge || fallbackItem.badge,
              about: d.about || fallbackItem.about || d.description || fallbackItem.description,
              bestTime: d.best_time || d.bestTime || fallbackItem.bestTime || 'Quanh năm',
              cuisine: d.cuisine || fallbackItem.cuisine || 'Ẩm thực đặc sản địa phương phong phú',
              localHighlights: (d.local_highlights && d.local_highlights.length > 0) ? d.local_highlights : (fallbackItem.localHighlights || []),
              tour: safeTour,
            };
          });
          setApiItems(mappedData);
        }
      })
      .catch(err => console.error('Failed to fetch destinations:', err));
  }, [dest]);

  const items = apiItems.length > 0 ? apiItems : (dest.items || []);

  const handleViewDetail = (cardData) => {
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
            <SplitHeading
              text={dest.sectionTitle}
              className="font-serif text-white mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1 }}
            />
            <p className="text-white/40 font-light text-sm max-w-lg mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              {dest.sectionDesc}
            </p>
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', margin: '24px auto 0' }} />
          </div>

          {/* Grid 6 diem den */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
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
