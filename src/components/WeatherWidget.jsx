import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain } from 'lucide-react';

// Dữ liệu mô phỏng thời tiết thực tế
const WEATHER_DATA = [
  { city: 'Hạ Long', temp: '24°C', condition: 'cloudy', icon: <Cloud size={16} className="text-white/80" /> },
  { city: 'Sapa', temp: '15°C', condition: 'rainy', icon: <CloudRain size={16} className="text-blue-300" /> },
  { city: 'Đà Nẵng', temp: '28°C', condition: 'sunny', icon: <Sun size={16} className="text-yellow-400" /> }
];

export default function WeatherWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Chuyển đổi giữa các thành phố mỗi 5 giây
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % WEATHER_DATA.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = WEATHER_DATA[currentIndex];

  return (
    <div 
      className="fixed top-24 right-6 z-[999] px-4 py-2.5 rounded-2xl flex items-center gap-3 transition-all duration-500 hover:scale-105 shadow-xl"
      style={{
        background: 'rgba(4,8,15,0.45)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
      }}
    >
      <div className="flex items-center gap-3" key={current.city} style={{ animation: 'weatherFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
          {current.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-white/50 uppercase tracking-widest leading-none mb-1.5 font-semibold">{current.city}</span>
          <span className="text-[15px] font-bold text-white leading-none font-serif">{current.temp}</span>
        </div>
      </div>
      <style>{`
        @keyframes weatherFadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
