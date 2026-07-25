import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Phone, MessageCircle } from 'lucide-react';

/**
 * ChatWidget — Trợ lý ảo AI cao cấp (Premium UI)
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Dạ chào Anh/Chị! Em là Khoa. Anh/Chị đang quan tâm đến tour du lịch nào, đi khoảng mấy người để em tư vấn chi tiết ạ?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const quickReplies = [
    "Vịnh Hạ Long",
    "Sapa - Fansipan",
    "Đà Nẵng - Hội An",
    "Phú Quốc",
    "Báo giá tour"
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Trap wheel/touch events inside chat — prevents page scroll bleed
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const trapWheel = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // Only stop propagation if there's scrollable content and we're not at bounds
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
        e.stopPropagation();
      }
      // Always prevent the page from scrolling when cursor is in widget
      e.stopPropagation();
    };

    el.addEventListener('wheel', trapWheel, { passive: false });
    return () => el.removeEventListener('wheel', trapWheel);
  }, [isOpen]);

  // Proactive greeting tooltip
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // 60s idle auto-open
  useEffect(() => {
    let idleTimer;
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (isOpen) return;

      idleTimer = setTimeout(() => {
        setIsOpen(true);
        setShowTooltip(false);
      }, 60000); // 60 seconds
    };

    resetIdleTimer();
    
    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('scroll', resetIdleTimer, { passive: true });
    window.addEventListener('keypress', resetIdleTimer, { passive: true });
    window.addEventListener('touchstart', resetIdleTimer, { passive: true });

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('scroll', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
    };
  }, [isOpen]);

  const [msgTimestamps, setMsgTimestamps] = useState([]);

  const handleSend = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend.trim() : input.trim();
    if (!text || isLoading) return;

    const now = Date.now();
    const recentMsgs = msgTimestamps.filter(t => now - t < 60000);
    if (recentMsgs.length >= 5) {
      setMessages(prev => [...prev, { role: 'model', text: 'Anh/Chị đang gửi tin nhắn quá nhanh. Vui lòng chờ một lát rồi thử lại nhé!' }]);
      return;
    }
    setMsgTimestamps([...recentMsgs, now]);

    setShowTooltip(false);
    const newMessages = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newMessages })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessages([...newMessages, { role: 'model', text: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'model', text: 'Xin lỗi Anh/Chị, hiện tại hệ thống đang bận. Vui lòng thử lại sau ạ.' }]);
      }
    } catch (error) {
      console.error('Lỗi khi gọi API chat:', error);
      setMessages([...newMessages, { role: 'model', text: 'Xin lỗi Anh/Chị, em không thể kết nối đến máy chủ lúc này.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const TypingIndicator = () => (
    <div style={{ display: 'flex', gap: '4px', padding: '16px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', borderBottomLeftRadius: '4px', border: '1px solid rgba(201,168,76,0.2)', width: 'fit-content' }}>
      <div style={{ width: '6px', height: '6px', background: '#c9a84c', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both' }}></div>
      <div style={{ width: '6px', height: '6px', background: '#c9a84c', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></div>
      <div style={{ width: '6px', height: '6px', background: '#c9a84c', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .chat-widget-enter { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: none; } }
        .msg-enter { animation: msgFadeIn 0.3s ease-out; }
        @keyframes msgFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .quick-reply-scroll::-webkit-scrollbar { display: none; }
        .chat-messages-area::-webkit-scrollbar { width: 4px; }
        .chat-messages-area::-webkit-scrollbar-track { background: transparent; }
        .chat-messages-area::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 4px; }
        .chat-messages-area::-webkit-scrollbar-thumb:hover { background: rgba(201,168,76,0.5); }
      `}</style>

      {/* Floating Button & Tooltip */}
      <div style={{ 
        position: 'fixed', 
        bottom: 'calc(30px + env(safe-area-inset-bottom))', 
        right: 'calc(30px + env(safe-area-inset-right))', 
        zIndex: 999, 
        display: isOpen ? 'none' : 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-end', 
        gap: '12px' 
      }}>
        {showTooltip && (
          <div className="msg-enter" style={{
            background: 'rgba(6, 11, 22, 0.95)', padding: '12px 16px', borderRadius: '16px', borderBottomRightRadius: '4px',
            border: '1px solid rgba(201,168,76,0.3)', color: '#fff', fontSize: '13px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)', maxWidth: '220px', cursor: 'pointer'
          }} onClick={() => { setIsOpen(true); setShowTooltip(false); }}>
            Chào Anh/Chị, em có thể giúp gì cho chuyến đi sắp tới ạ? 👋
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={() => { setIsOpen(true); setShowTooltip(false); }}
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #c9a84c, #8a6e2a)', border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title="Mở Chatbot"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#04080f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          
          <a
            href="https://zalo.me/0931143830"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat Zalo"
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0068ff 0%, #0050c7 100%)', textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,104,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageCircle size={28} style={{ fill: 'currentColor', color: 'white' }} />
          </a>
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="chat-widget-enter"
          style={{
            position: 'fixed', 
            bottom: 'calc(24px + env(safe-area-inset-bottom))', 
            right: 'calc(24px + env(safe-area-inset-right))', 
            zIndex: 999,
            width: '380px', height: '650px', maxHeight: '85vh',
            borderRadius: '24px',
            boxShadow: '0 32px 80px -12px rgba(0,0,0,0.8), 0 0 40px -15px rgba(201,168,76,0.15)',
            display: 'flex', flexDirection: 'column', fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          {/* Glassmorphism Background — pointer-events:none prevents Chrome scroll bug */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
            background: 'rgba(6, 11, 22, 0.88)', border: '1px solid rgba(201, 168, 76, 0.25)', borderRadius: '24px',
            backdropFilter: 'blur(32px) saturate(150%)', WebkitBackdropFilter: 'blur(32px) saturate(150%)',
            pointerEvents: 'none'
          }}></div>

          {/* All interactive content sits above the blur layer */}
          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {/* Header */}
            <div style={{
              padding: '20px', borderBottom: '1px solid rgba(201,168,76,0.15)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(180deg, rgba(201,168,76,0.08), transparent)',
              borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #8a6e2a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(201,168,76,0.3)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#04080f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path></svg>
                  </div>
                  <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%', border: '2px solid #060b16' }}></div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>Khoa</div>
                  <div style={{ fontSize: '12px', color: '#c9a84c', marginTop: '2px', opacity: 0.8 }}>Chuyên viên tư vấn AI</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '8px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            {/* Messages Area — ref for wheel trap */}
            <div
              ref={messagesContainerRef}
              className="chat-messages-area"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'scroll',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {messages.map((msg, idx) => (
                <div key={idx} className="msg-enter" style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #c9a84c, #8a6e2a)' : 'rgba(255,255,255,0.05)',
                    color: msg.role === 'user' ? '#04080f' : 'rgba(232,228,216,0.95)',
                    padding: '14px 18px', borderRadius: '20px',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '20px',
                    borderBottomLeftRadius: msg.role === 'model' ? '4px' : '20px',
                    fontSize: '14.5px', lineHeight: 1.6,
                    border: msg.role === 'model' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    boxShadow: msg.role === 'user' ? '0 8px 16px rgba(201,168,76,0.2)' : '0 8px 16px rgba(0,0,0,0.2)',
                    wordBreak: 'break-word'
                  }}>
                    {msg.role === 'model' ? (
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p style={{ margin: '0 0 10px 0' }} {...props} />,
                          ul: ({node, ...props}) => <ul style={{ margin: '0 0 10px 0', paddingLeft: '24px' }} {...props} />,
                          li: ({node, ...props}) => <li style={{ marginBottom: '6px' }} {...props} />,
                          strong: ({node, ...props}) => <strong style={{ color: '#f0d080', fontWeight: 600 }} {...props} />
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="msg-enter" style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies & Input Area */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', flexShrink: 0 }}>
              {/* Quick Replies */}
              <div className="quick-reply-scroll" style={{ display: 'flex', gap: '8px', padding: '12px 16px 8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(reply)}
                    disabled={isLoading}
                    style={{
                      background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
                      color: '#c9a84c', borderRadius: '100px', padding: '6px 14px', fontSize: '12px',
                      cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', flexShrink: 0
                    }}
                    onMouseEnter={e => { if(!isLoading) { e.currentTarget.style.background = 'rgba(201,168,76,0.2)'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseLeave={e => { if(!isLoading) { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.color = '#c9a84c'; } }}
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} style={{ padding: '8px 16px 16px', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhắn tin cho Khoa..."
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none',
                    fontFamily: 'inherit', transition: 'border-color 0.2s', cursor: 'text'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  style={{
                    background: (isLoading || !input.trim()) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #c9a84c, #f0d080)',
                    border: 'none', borderRadius: '50%', width: '46px', height: '46px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                    color: (isLoading || !input.trim()) ? 'rgba(255,255,255,0.3)' : '#04080f',
                    boxShadow: (isLoading || !input.trim()) ? 'none' : '0 4px 12px rgba(201,168,76,0.4)',
                    transition: 'all 0.2s', flexShrink: 0
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
