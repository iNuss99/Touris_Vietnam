import React, { useEffect, useRef } from 'react';

const LUXURY_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=80';

export default function HeroBackground({ scrollY }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frameId;

    const onMouseMove = (e) => {
      // Chỉ tính toán khi chưa cuộn qua khỏi màn hình đầu tiên
      if (window.scrollY > window.innerHeight * 1.2) return;
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const animate = () => {
      // Nội suy tuyến tính (Lerp) mượt mà 60fps
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      const layers = container.querySelectorAll('.parallax-layer');
      layers.forEach((layer) => {
        const depth = parseFloat(layer.getAttribute('data-depth')) || 0;
        const scrollFactor = parseFloat(layer.getAttribute('data-scroll')) || 0;
        const rotate = layer.getAttribute('data-rotate') === 'true';
        
        // Dịch chuyển X/Y
        const moveX = currentX * depth * 50; 
        const moveY = currentY * depth * 50;
        
        let transformStr = `translate3d(${moveX}px, ${moveY + window.scrollY * scrollFactor}px, 0)`;
        
        // Tilt 3D
        if (rotate) {
          const rotateX = currentY * 5; // Tối đa 5 độ
          const rotateY = -currentX * 5; 
          transformStr += ` rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
        
        // Trừ hao viền bị cắt khi nghiêng
        transformStr += ` scale(1.1)`;
        layer.style.transform = transformStr;
      });

      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []); // [] dependency array giup animation loop chay 60fps mượt mà không bị destroy/re-create khi scroll

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-[120%] overflow-hidden bg-[#02040a] pointer-events-none"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      {/* 1. Cinematic Background Image (Slow Zoom + 3D Parallax) */}
      <div 
        className="parallax-layer absolute inset-0 w-full h-full bg-cover bg-center origin-center cinematic-zoom"
        data-depth="0.15"
        data-scroll="0.35"
        data-rotate="true"
        style={{ 
          backgroundImage: `url('${LUXURY_IMG}')`,
          willChange: 'transform',
          filter: 'contrast(1.1) brightness(0.65) saturate(1.15)'
        }}
      />

      {/* 2. Color Grading Overlays (Giữ bóng tối ở góc) */}
      <div 
        className="parallax-layer absolute inset-0 opacity-80"
        data-depth="0.1"
        data-scroll="0.1"
        style={{ background: 'linear-gradient(135deg, rgba(2,4,10,0.95) 0%, rgba(5,10,25,0.2) 50%, rgba(4,8,15,0.95) 100%)' }}
      />
      
      {/* 3. Golden Aura (Tỏa sáng khi lia chuột) */}
      <div 
        className="parallax-layer absolute top-[-10%] left-[10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full mix-blend-screen opacity-20 blur-[120px]"
        data-depth="0.4"
        data-scroll="0.25"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.7) 0%, transparent 70%)' }}
      />

      {/* 4. Môi trường 3D Particles (Cảm giác không gian cực sâu) */}
      <div 
        className="parallax-layer absolute inset-0 w-full h-full"
        data-depth="1.2"
        data-scroll="0.5"
      >
        <div className="absolute top-[25%] left-[20%] w-[4px] h-[4px] rounded-full bg-luxury-gold blur-[1px] opacity-90 shadow-[0_0_15px_rgba(201,168,76,0.8)] animate-pulse" />
        <div className="absolute top-[55%] right-[25%] w-[6px] h-[6px] rounded-full bg-white blur-[2px] opacity-60" />
        <div className="absolute bottom-[35%] left-[38%] w-[3px] h-[3px] rounded-full bg-luxury-gold blur-[1px] shadow-[0_0_10px_rgba(201,168,76,0.6)]" />
        <div className="absolute top-[75%] right-[15%] w-[8px] h-[8px] rounded-full bg-luxury-gold blur-[3px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* 5. Film Grain / SVG Noise Overlay (Texture điện ảnh) */}
      <div className="absolute inset-0 mix-blend-overlay z-10"
        style={{ 
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}
      />

      {/* 6. Bottom Mist (Lớp sương mù chân mây) */}
      <div 
        className="parallax-layer absolute bottom-0 left-0 w-full h-[50vh] z-20" 
        data-depth="0.05"
        data-scroll="0.4"
        style={{ 
          background: 'linear-gradient(to top, #04080f 0%, rgba(4,8,15,0.95) 20%, rgba(4,8,15,0.3) 60%, transparent 100%)',
          willChange: 'transform'
        }} 
      />
    </div>
  );
}
