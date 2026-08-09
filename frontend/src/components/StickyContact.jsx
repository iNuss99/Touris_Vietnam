import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

export default function StickyContact() {
  const hotline = '0931143830';
  const zaloLink = `https://zalo.me/${hotline}`;
  const phoneLink = `tel:+84${hotline.substring(1)}`;

  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const checkOpen = () => {
      const win = document.getElementById('dify-chatbot-bubble-window');
      if (win) {
        const isOpen = win.style.display !== 'none' && win.offsetHeight > 0 && win.style.visibility !== 'hidden';
        setIsChatOpen(isOpen);
      }
    };

    const obs = new MutationObserver(checkOpen);
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    checkOpen();

    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div className="fixed bottom-[5.25rem] right-6 z-[999] flex flex-col gap-3">
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
          <span className="absolute right-full mr-4 px-3 py-1.5 bg-luxury-dark/95 text-luxury-gold-light text-xs font-semibold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-luxury-gold/20 shadow-xl backdrop-blur-md">
            Hotline: {hotline}
          </span>
          
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-full animate-pulse-ring-sync opacity-45 pointer-events-none" style={{ background: '#c9a84c' }} />
        </a>

        {/* Nút Zalo */}
        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg shadow-blue-500/20 transition-transform duration-300 hover:scale-110 active:scale-95"
          aria-label="Chat Zalo"
        >
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNh1D4-GGRpZtlkTWomY8pPjTSyeBeXV02_BQ6ji3S1qJj-LHds16AYcqn&s=10" 
            alt="Zalo" 
            className="w-full h-full rounded-full object-cover"
          />
          
          {/* Tooltip */}
          <span className="absolute right-full mr-4 px-3 py-1.5 bg-luxury-dark/95 text-[#0068ff] text-xs font-semibold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-[#0068ff]/30 shadow-xl backdrop-blur-md">
            Chat Zalo ngay!
          </span>
          
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-full animate-pulse-ring-sync opacity-45 pointer-events-none" style={{ background: '#0068ff' }} />
        </a>
      </div>

      {/* Synchronized Chatbot Pulse Ring (Framelocked with Phone & Zalo) */}
      {!isChatOpen && (
        <div 
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full animate-pulse-ring-sync opacity-45 pointer-events-none z-[999998]"
          style={{ background: '#c9a84c' }}
        />
      )}
    </>
  );
}
