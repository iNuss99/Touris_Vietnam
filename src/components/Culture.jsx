import React, { useState } from 'react';
import { ArrowUpRight, Award, Coffee, Shirt, Music, UtensilsCrossed } from 'lucide-react';

// Import anh tu folder culture da duoc chuyen sang dinh dang webp de toi uu hoa
import imgPho from '../assets/images/culture/pho.webp';
import imgCafePhin from '../assets/images/culture/cafe-phin.webp';
import imgAoDai from '../assets/images/culture/ao-dai.webp';
import imgLantern from '../assets/images/culture/lantern-festival.webp';
import imgBanhMi from '../assets/images/culture/banh-mi.webp';

// Du lieu cac muc van hoa
const CULTURE_ITEMS = [
  {
    id: 'pho',
    title: 'Hương Vị Phở Việt',
    subtitle: 'Tinh hoa ẩm thực quốc gia',
    description: 'Không chỉ là một món ăn, Phở là tác phẩm nghệ thuật ẩm thực. Nước dùng trong, ngọt từ xương hầm niêm nhỏ lửa, thoang thoảng hương quế hồi — phối hợp hài hòa cùng bánh phở tươi và thịt bò thơm ngon.',
    image: imgPho,
    icon: <UtensilsCrossed size={16} />,
    accent: '#c9a84c',
  },
  {
    id: 'cafe',
    title: 'Cà Phê Phin',
    subtitle: 'Nét sống thường nhật',
    description: 'Những giọt cà phê nhỉ nhàn, hòa quyện ngọt ngào cùng sữa đặc — một phần ký niệm của bất cứ ai đã từng đến Việt Nam.',
    image: imgCafePhin,
    icon: <Coffee size={16} />,
    accent: '#8B6914',
  },
  {
    id: 'aodai',
    title: 'Áo Dài Truyền Thống',
    subtitle: 'Quốc phục nghìn năm',
    description: 'Biểu tượng nữ tính Việt, tôn lên vẻ đẹp thanh thoát, kín đáo mà kiêu sa — tác phẩm nghệ thuật sống trong mỗi lễ hội và khoảnh khắc đáng nhớ.',
    image: imgAoDai,
    icon: <Shirt size={16} />,
    accent: '#e8dcc8',
  },
  {
    id: 'festival',
    title: 'Lễ Hội & Đèn Lồng',
    subtitle: 'Di sản phi vật thể',
    description: 'Từ tiếng đàn bầu réo rắt đến hàng trăm chiếc đèn lồng lung linh trên sông — dòng chảy văn hóa bất diệt của dân tộc Việt.',
    image: imgLantern,
    icon: <Music size={16} />,
    accent: '#e06030',
  },
  {
    id: 'banhmi',
    title: 'Bánh Mì Sài Gòn',
    subtitle: 'Street food huyền thoại',
    description: 'Sự giao thoa hoàn hảo giữa ẩm thực Pháp và Việt — vỏ giòn rụm ôm trọn nhân thịt, pate, rau thơm và gia vị đậm đà khó quên.',
    image: imgBanhMi,
    icon: <Award size={16} />,
    accent: '#d4a040',
  },
];

export default function Culture() {
  const [activeItem, setActiveItem] = useState(0);
  const active = CULTURE_ITEMS[activeItem];

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
            <span className="section-label">Kiệt tác tinh hoa</span>
          </div>
          <h2 className="font-serif text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1 }}>
            Văn Hóa & Ẩm Thực
          </h2>
          <p className="text-white/40 font-light text-sm max-w-lg mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
            Nơi tinh hoa văn hóa ngàn đời hòa quyện với dư vị ẩm thực độc đáo — một hành trình cảm xúc đầy hương vị và sắc màu.
          </p>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #0f9d8a, transparent)', margin: '24px auto 0' }} />
        </div>

        {/* Main Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 reveal">

          {/* === COT TRAI: Anh lon cua muc dang chon === */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden group cursor-pointer"
            style={{ height: 'clamp(400px, 50vw, 580px)' }}>
            {/* Anh chinh */}
            {CULTURE_ITEMS.map((item, idx) => (
              <img key={item.id} src={item.image} alt={item.title}
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
                  style={{ background: `${active.accent}20`, border: `1px solid ${active.accent}40`, color: active.accent }}>
                  {active.icon}
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold" style={{ color: `${active.accent}cc` }}>
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
                style={{ color: `${active.accent}dd` }}>
                <span className="border-b pb-0.5 transition-colors" style={{ borderColor: `${active.accent}40` }}>Khám phá hành trình</span>
                <ArrowUpRight size={16} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* === COT PHAI: Danh sach thumbnail de chon === */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {CULTURE_ITEMS.map((item, idx) => {
              const isActive = activeItem === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(idx)}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-400 group/tab w-full"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${item.accent}10, rgba(10,17,32,0.8))`
                      : 'rgba(10,17,32,0.4)',
                    border: `1px solid ${isActive ? `${item.accent}35` : 'rgba(255,255,255,0.04)'}`,
                    boxShadow: isActive ? `0 8px 30px -10px ${item.accent}20` : 'none',
                  }}
                >
                  {/* Thumbnail anh nho */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/tab:scale-110" />
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl" style={{ border: `2px solid ${item.accent}60` }} />
                    )}
                  </div>

                  {/* Text info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: isActive ? item.accent : 'rgba(255,255,255,0.35)' }} className="transition-colors">
                        {item.icon}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest font-medium transition-colors"
                        style={{ color: isActive ? `${item.accent}aa` : 'rgba(255,255,255,0.25)' }}>
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
                      background: isActive ? `linear-gradient(180deg, ${item.accent}, ${item.accent}40)` : 'rgba(255,255,255,0.08)',
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
