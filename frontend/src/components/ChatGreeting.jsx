import React, { useState, useEffect } from 'react';

/**
 * ChatGreeting — Bubble chào xịn sò, match premium style của site.
 * - Persona: "An" — Tư Vấn Viên Du Lịch
 * - Smart greeting: detect tháng hiện tại → gợi ý tour phù hợp mùa
 * - Design: mỏng, luxury, không emoji thừa
 */



export default function ChatGreeting() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);



  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setDismissed(true);
    if (window.botpress?.open) window.botpress.open();

    setTimeout(() => {
      const bp = window.botpress;
      if (!bp) return;
      const msg = `Xin chào`;
      if (typeof bp.send === 'function') bp.send({ type: 'text', text: msg });
      else if (typeof bp.sendPayload === 'function') bp.sendPayload({ type: 'text', text: msg });
      else if (typeof bp.sendMessage === 'function') bp.sendMessage(msg);
    }, 1200);
  };

  const handleDismiss = () => setDismissed(true);

  if (dismissed || !visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '24px',
        zIndex: 9998,
        width: '300px',
        animation: 'greetSlideIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    >
      <style>{`
        @keyframes greetSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div style={{
        background: 'rgba(6, 11, 22, 0.96)',
        border: '1px solid rgba(201, 168, 76, 0.3)',
        borderRadius: '20px',
        padding: '20px 22px 18px',
        boxShadow: '0 24px 80px -12px rgba(0,0,0,0.7), 0 0 40px -15px rgba(201,168,76,0.12)',
        backdropFilter: 'blur(24px)',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Ambient glow top-right */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '120px', height: '120px',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute', top: '12px', right: '14px',
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.25)', cursor: 'pointer',
            fontSize: '14px', lineHeight: 1, padding: '3px 5px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
        >✕</button>

        {/* Avatar + Persona */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #c9a84c, #8a6e2a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '17px',
            boxShadow: '0 0 16px rgba(201,168,76,0.3)',
          }}>🧳</div>
          <div>
            <div style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700, fontSize: '13px',
              background: 'linear-gradient(135deg, #f0d080, #c9a84c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              letterSpacing: '0.02em',
            }}>An — Tư Vấn Du Lịch</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em', marginTop: '2px' }}>
              <span style={{ color: '#4ade80', marginRight: '5px' }}>●</span>Sẵn sàng tư vấn
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px', marginBottom: '14px',
          background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)',
        }} />

        {/* Simple greeting */}
        <p style={{
          fontSize: '13px', color: 'rgba(232,228,216,0.82)',
          lineHeight: 1.6, margin: 0,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontWeight: 300,
        }}>
          Xin chào Anh/Chị! Anh/Chị cần hỗ trợ thông tin tour du lịch hay điểm đến nào ạ?
        </p>

        {/* CTA */}
        <button
          onClick={handleOpen}
          style={{
            marginTop: '16px',
            width: '100%',
            background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
            color: '#04080f',
            border: 'none',
            borderRadius: '12px',
            padding: '11px 18px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
        >
          Tư vấn ngay
        </button>
      </div>
    </div>
  );
}
