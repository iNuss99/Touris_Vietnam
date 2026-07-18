import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function SoundToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Sử dụng đoạn âm thanh sóng biển từ nguồn public
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2; // Âm lượng vừa phải làm ambient

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleSound = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log('Audio play failed', e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-6 left-6 z-[999] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group"
      style={{
        background: 'rgba(4,8,15,0.6)',
        border: '1px solid rgba(201,168,76,0.3)',
        backdropFilter: 'blur(10px)'
      }}
      aria-label="Toggle Ambient Sound"
    >
      {isPlaying ? (
        <Volume2 size={20} className="text-luxury-gold group-hover:scale-110 transition-transform" />
      ) : (
        <VolumeX size={20} className="text-white/50 group-hover:text-white transition-colors" />
      )}
      {/* Hiệu ứng lan tỏa khi đang phát */}
      {isPlaying && (
        <span className="absolute inset-0 rounded-full animate-ping pointer-events-none" style={{ border: '1px solid rgba(201,168,76,0.5)', opacity: 0.5 }}></span>
      )}
    </button>
  );
}
