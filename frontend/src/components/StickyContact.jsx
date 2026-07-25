import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export default function StickyContact() {
  const hotline = '0931143830';
  const zaloLink = `https://zalo.me/${hotline}`;
  const phoneLink = `tel:+84${hotline.substring(1)}`;

  return (
    <div className="fixed bottom-6 left-6 z-[999] flex flex-col gap-4">
      {/* Nút Phone */}
      <a
        href={phoneLink}
        className="group relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg shadow-luxury-gold/20 transition-transform duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #f0d080 0%, #c9a84c 100%)',
        }}
        aria-label="Gọi Hotline"
      >
        <Phone size={20} className="text-luxury-dark" style={{ fill: 'currentColor' }} />
        
        {/* Tooltip */}
        <span className="absolute left-full ml-4 px-3 py-1.5 bg-luxury-dark/95 text-luxury-gold-light text-xs font-semibold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-luxury-gold/20 shadow-xl backdrop-blur-md">
          Hotline: {hotline}
        </span>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: '#c9a84c' }} />
      </a>

      {/* Nút Zalo */}
      <a
        href={zaloLink}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg shadow-blue-500/20 transition-transform duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #0068ff 0%, #0050c7 100%)',
        }}
        aria-label="Chat Zalo"
      >
        <MessageCircle size={22} className="text-white" style={{ fill: 'currentColor' }} />
        <span className="absolute text-white font-bold text-[8px] mt-1 tracking-wider" style={{ top: '26px' }}>Zalo</span>
        
        {/* Tooltip */}
        <span className="absolute left-full ml-4 px-3 py-1.5 bg-luxury-dark/95 text-[#0068ff] text-xs font-semibold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-[#0068ff]/30 shadow-xl backdrop-blur-md">
          Chat Zalo ngay!
        </span>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: '#0068ff' }} />
      </a>
    </div>
  );
}
