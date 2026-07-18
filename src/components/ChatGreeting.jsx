import React, { useState, useEffect } from 'react';

/**
 * ChatGreeting - Bong bong chao hoi tu dong hien ra sau 3 giay
 * Khi nguoi dung bam "Bat dau tu van", no se mo Botpress chat
 * va gui tin hieu kich hoat de bot tra loi ngay lap tuc.
 */
export default function ChatGreeting() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Hien ra sau 3 giay ke tu khi trang load xong
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setDismissed(true);

    // Buoc 1: Mo Botpress chat
    if (window.botpress && window.botpress.open) {
      window.botpress.open();
    }

    // Buoc 2: Sau 1.2s, tu dong kich hoat luong chao hoi bang cach gui tin hieu
    setTimeout(() => {
      // Thu nhieu phuong thuc khac nhau cua Botpress v3
      const bp = window.botpress;
      if (!bp) return;

      // Phuong thuc 1: send (Botpress v3)
      if (typeof bp.send === 'function') {
        bp.send({ type: 'text', text: 'Xin chào' });
        return;
      }
      // Phuong thuc 2: sendPayload (Botpress v2.x)
      if (typeof bp.sendPayload === 'function') {
        bp.sendPayload({ type: 'text', text: 'Xin chào' });
        return;
      }
      // Phuong thuc 3: sendMessage
      if (typeof bp.sendMessage === 'function') {
        bp.sendMessage('Xin chào');
        return;
      }
      // Phuong thuc 4: Bam nut send tren DOM (phuong an cuoi)
      const iframe = document.querySelector('iframe[id*="botpress"], iframe[src*="botpress"]');
      if (!iframe) {
        // Khong co iframe, tim input truc tiep
        const input = document.querySelector('[data-testid="webchat-input"], .bpw-composer textarea, input[placeholder]');
        if (input) {
          input.value = 'Xin chào';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const sendBtn = document.querySelector('[data-testid="send-button"], .bpw-send-button, button[type="submit"]');
          if (sendBtn) sendBtn.click();
        }
      }
    }, 1200);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (dismissed || !visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '24px',
        zIndex: 9998,
        maxWidth: '300px',
        animation: 'greetSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    >
      <style>{`
        @keyframes greetSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-greet-card {
          background: rgba(10, 17, 32, 0.97);
          border: 1px solid rgba(201, 168, 76, 0.35);
          border-radius: 16px;
          padding: 16px 18px;
          box-shadow: 0 20px 60px -10px rgba(0,0,0,0.6), 0 0 30px -10px rgba(201,168,76,0.15);
          backdrop-filter: blur(20px);
        }
        .chat-greet-btn {
          background: linear-gradient(135deg, #c9a84c, #f0d080);
          color: #04080f;
          border: none;
          border-radius: 10px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          margin-top: 12px;
          transition: opacity 0.2s ease, transform 0.2s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .chat-greet-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .chat-greet-dismiss {
          position: absolute;
          top: 10px;
          right: 12px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          padding: 2px 5px;
          transition: color 0.2s;
        }
        .chat-greet-dismiss:hover { color: rgba(255,255,255,0.7); }
      `}</style>

      <div className="chat-greet-card" style={{ position: 'relative' }}>
        <button className="chat-greet-dismiss" onClick={handleDismiss}>✕</button>

        {/* Avatar + Ten */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a84c, #8a6e2a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
          }}>🌏</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#f0d080' }}>ChatBot Tư Vấn</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ color: '#4ade80', marginRight: '4px' }}>●</span>Sẵn sàng hỗ trợ
            </div>
          </div>
        </div>

        {/* Tin nhan chao */}
        <p style={{ fontSize: '13px', color: 'rgba(232,228,216,0.85)', lineHeight: 1.55, margin: 0 }}>
          👋 Xin chào Anh/Chị!<br />
          Mình là chatbot tư vấn <strong style={{ color: '#f0d080' }}>Tour Việt Nam</strong>.
          Anh/Chị đang tìm kiếm tour du lịch nào vậy ạ?
        </p>

        <button className="chat-greet-btn" onClick={handleOpen}>
          💬 Bắt đầu tư vấn ngay
        </button>
      </div>
    </div>
  );
}
