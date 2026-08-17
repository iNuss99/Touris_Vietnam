import { useState } from 'react';
import { Phone, Bot, Sparkles } from 'lucide-react';
import AIChatModal from './AIChatModal';

export default function StickyContact() {
  const hotline = '0931143830';
  const zaloLink = `https://zalo.me/${hotline}`;
  const phoneLink = `tel:+84${hotline.substring(1)}`;

  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <>
      {/* ===== FLOATING WIDGET BUTTONS (SYNCHRONIZED STACK) ===== */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3.5 items-center">
        
        {/* Nút 1: Zalo */}
        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-110 active:scale-95 bg-[#0068ff]"
          aria-label="Chat Zalo"
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNh1D4-GGRpZtlkTWomY8pPjTSyeBeXV02_BQ6ji3S1qJj-LHds16AYcqn&s=10"
            alt="Zalo"
            className="w-full h-full rounded-full object-cover p-0.5"
          />

          {/* Tooltip */}
          <span className="absolute right-full mr-3.5 px-3 py-1.5 bg-luxury-dark/95 text-[#0068ff] text-xs font-semibold uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-[#0068ff]/30 shadow-2xl backdrop-blur-md">
            Chat Zalo 24/7
          </span>

          {/* Synchronized Pulse Effect */}
          <div className="absolute inset-0 rounded-full animate-pulse-ring-sync opacity-45 pointer-events-none bg-[#0068ff]" />
        </a>

        {/* Nút 2: Phone Hotline */}
        <a
          href={phoneLink}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full shadow-xl shadow-luxury-gold/25 transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #f0d080 0%, #c9a84c 100%)',
          }}
          aria-label="Gọi Hotline"
        >
          <Phone size={20} className="text-luxury-dark" style={{ fill: 'currentColor' }} />

          {/* Tooltip */}
          <span className="absolute right-full mr-3.5 px-3 py-1.5 bg-luxury-dark/95 text-luxury-gold-light text-xs font-semibold uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-luxury-gold/30 shadow-2xl backdrop-blur-md">
            Hotline: {hotline}
          </span>

          {/* Synchronized Pulse Effect */}
          <div className="absolute inset-0 rounded-full animate-pulse-ring-sync opacity-45 pointer-events-none bg-[#c9a84c]" />
        </a>

        {/* Nút 3: Chatbot AI Dify */}
        <button
          onClick={toggleChat}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full shadow-xl shadow-luxury-gold/30 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #f0d080 0%, #c9a84c 50%, #b89235 100%)',
            border: '1.5px solid rgba(240, 208, 128, 0.6)',
          }}
          aria-label="Mở Chatbot AI"
        >
          <div className="relative flex items-center justify-center">
            <Bot size={22} className="text-luxury-dark" />
            <Sparkles size={11} className="absolute -top-1.5 -right-1.5 text-luxury-dark font-bold animate-pulse" />
          </div>

          {/* Tooltip */}
          <span className="absolute right-full mr-3.5 px-3 py-1.5 bg-luxury-dark/95 text-luxury-gold-light text-xs font-semibold uppercase tracking-wider rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-luxury-gold/30 shadow-2xl backdrop-blur-md">
            Tư vấn AI 24/7
          </span>

          {/* Synchronized Pulse Effect (Chỉ hiện khi chưa mở chat) */}
          {!isChatOpen && (
            <div className="absolute inset-0 rounded-full animate-pulse-ring-sync opacity-55 pointer-events-none bg-[#f0d080]" />
          )}
        </button>
      </div>

      {/* ===== CUSTOM REACT AI CHAT MODAL ===== */}
      <AIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
