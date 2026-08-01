import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, RefreshCw, ShieldCheck, UserCircle, Phone, ChevronDown } from 'lucide-react';
import { useDifyChat } from './useDifyChat';

const QUICK_REPLIES = [
  { label: 'Vịnh Hạ Long 🌊', text: 'Tư vấn giúp em tour Vịnh Hạ Long 5 sao' },
  { label: 'Đảo Phú Quốc 🏝️', text: 'Cho em xin lịch trình tour Phú Quốc 4N3Đ' },
  { label: 'Phố cổ Hội An 🏮', text: 'Tour Hội An có gì đặc sắc vậy An?' },
  { label: 'Nhận báo giá chi tiết 📋', text: 'Em muốn đăng ký nhận báo giá tour' },
];

const ChatMessageItem = React.memo(function ChatMessageItem({ msg }) {
  const isUser = msg.sender === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#111827] border border-amber-500/30 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(217,160,91,0.1)]">
          <Bot size={16} className="text-amber-400" />
        </div>
      )}

      <div
        className={`max-w-[82%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed tracking-wide ${
          isUser
            ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 text-white font-semibold rounded-br-none shadow-md shadow-cyan-950/30'
            : 'bg-[#1F2937]/90 border border-slate-600 text-slate-100 font-medium rounded-bl-none shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
        }`}
      >
        {msg.text ? (
          <div className="whitespace-pre-wrap">{msg.text}</div>
        ) : (
          /* Typing indicator */
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        )}

        <div className={`text-[10px] mt-1.5 font-bold text-right ${
          isUser ? 'text-cyan-100/80' : 'text-slate-500'
        }`}>
          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
});

// Dedicated active streaming message component (prevents parent & past messages re-rendering)
const StreamingBotMessage = React.memo(function StreamingBotMessage({ text }) {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-[#111827] border border-amber-500/30 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(217,160,91,0.1)]">
        <Bot size={16} className="text-amber-400" />
      </div>

      <div className="max-w-[82%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed tracking-wide bg-[#1F2937]/90 border border-slate-600 text-slate-100 font-medium rounded-bl-none shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        {text ? (
          <div className="whitespace-pre-wrap">{text}</div>
        ) : (
          /* Typing indicator */
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>
    </div>
  );
});

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [hasUnread, setHasUnread] = useState(true);
  const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);
  
  // Lead Form State
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const userHasScrolledUpRef = useRef(false);
  const lastScrollTopRef = useRef(0);

  const { messages, streamingText, sendMessage, isTyping, resetChat: resetDifyChat } = useDifyChat();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const resetChat = () => {
    setIsRefreshing(true);
    userHasScrolledUpRef.current = true;
    lastScrollTopRef.current = 0;
    setShowScrollBottomButton(false);
    setShowLeadForm(false);
    setLeadSubmitted(false);
    setLeadName('');
    setLeadPhone('');
    setInput('');
    resetDifyChat();

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }

    setTimeout(() => {
      setIsRefreshing(false);
      userHasScrolledUpRef.current = false;
    }, 400);
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const currentScrollTop = container.scrollTop;
    const distanceFromBottom = container.scrollHeight - currentScrollTop - container.clientHeight;
    
    // Only detect scroll UP if user actively scrolled UP (scrollTop decreased by >15px) and is >100px from bottom
    if (currentScrollTop < lastScrollTopRef.current - 15 && distanceFromBottom > 100) {
      userHasScrolledUpRef.current = true;
      setShowScrollBottomButton(true);
    } else if (distanceFromBottom <= 40) {
      // User is back at bottom
      userHasScrolledUpRef.current = false;
      setShowScrollBottomButton(false);
    }

    lastScrollTopRef.current = currentScrollTop;
  };

  const scrollToBottom = () => {
    userHasScrolledUpRef.current = false;
    lastScrollTopRef.current = 999999;
    setShowScrollBottomButton(false);
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  // Auto-scroll on new messages / streaming text ONLY if user has NOT manually scrolled up
  useEffect(() => {
    if (!isOpen) return;
    const container = chatContainerRef.current;
    if (container && !userHasScrolledUpRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, streamingText, isOpen, showLeadForm, isTyping]);

  // Focus input when chat opens without browser window scrolling & pause Lenis
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 150);
      if (window.__lenis) {
        window.__lenis.stop();
      }
    } else {
      if (window.__lenis) {
        window.__lenis.start();
      }
    }

    return () => {
      if (window.__lenis) {
        window.__lenis.start();
      }
    };
  }, [isOpen]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    
    userHasScrolledUpRef.current = false;
    lastScrollTopRef.current = 999999;
    setShowScrollBottomButton(false);
    const text = input.trim();
    sendMessage(text);
    setInput('');
    
    // Bắt keyword kích hoạt form
    if (text.toLowerCase().includes('báo giá') || text.toLowerCase().includes('đăng ký') || text.toLowerCase().includes('tư vấn')) {
        setTimeout(() => setShowLeadForm(true), 1000);
    }
  };

  const handleQuickReply = (text) => {
    if (isTyping) return;
    userHasScrolledUpRef.current = false;
    lastScrollTopRef.current = 999999;
    setShowScrollBottomButton(false);
    sendMessage(text);
    
    if (text.includes('nhận báo giá')) {
        setTimeout(() => setShowLeadForm(true), 1500);
    }
  };

  const handleLeadSubmit = (e) => {
      e.preventDefault();
      if(!leadName.trim() || !leadPhone.trim()) return;
      
      setLeadSubmitted(true);
      setShowLeadForm(false);
      userHasScrolledUpRef.current = false;
      lastScrollTopRef.current = 999999;
      sendMessage(`Tên mình là ${leadName}, số điện thoại: ${leadPhone}`);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleQuickRepliesWheel = (e) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-slate-100 antialiased print:hidden">

      {/* ── Floating Action Button (Luxury Circle - 56x56px) ────────── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="relative group flex items-center justify-center w-14 h-14 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:to-amber-400 text-slate-900 rounded-full shadow-2xl hover:shadow-yellow-500/40 transition-all duration-300 transform hover:scale-110 active:scale-95 border border-yellow-300/50 cursor-pointer"
          aria-label="Chat với AI An - Touris Vietnam"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 opacity-40 blur-md group-hover:opacity-80 transition-opacity" />

          {/* Bot Icon */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs border border-white/40 shadow-inner">
            <Bot size={24} className="text-slate-950 animate-pulse" />
          </div>

          {/* Hover Tooltip */}
          <div className="absolute right-16 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none px-3.5 py-1.5 bg-[#0B0F19]/95 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-xl whitespace-nowrap shadow-2xl flex items-center gap-1.5 backdrop-blur-md translate-x-2 group-hover:translate-x-0">
            <Sparkles size={13} className="text-amber-400" />
            <span>Chat với An</span>
          </div>

          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-slate-900" />
            </span>
          )}
        </button>
      )}

      {/* ── Chat Panel (Luxury Dark - GPU Optimized) ────────────────── */}
      {isOpen && (
        <div
          data-lenis-prevent
          className="flex flex-col w-[92vw] sm:w-[410px] h-[580px] max-h-[82vh] bg-[#0B0F19] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 relative"
          style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 40px rgba(217, 160, 91, 0.15)' }}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#111827] via-[#1F2937] to-[#111827] border-b border-amber-500/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center p-0.5 shadow-md">
                  <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center">
                    <Bot size={22} className="text-amber-400" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#111827] rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100 tracking-wide">An — Chuyên viên Tư vấn</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    AI
                  </span>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-amber-500/70" /> Touris Vietnam Official
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                disabled={isRefreshing}
                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                title="Làm mới cuộc trò chuyện"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-amber-400' : ''} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
                title="Đóng chatbox"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages List Area */}
          <div
            ref={chatContainerRef}
            data-lenis-prevent
            onScroll={handleScroll}
            className="flex-1 p-4 overflow-y-auto space-y-4 overscroll-contain touch-pan-y scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50 hover:scrollbar-thumb-amber-500/60 relative"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
          >
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} msg={msg} />
            ))}

            {/* Active Streaming Bot Message */}
            {isTyping && <StreamingBotMessage text={streamingText} />}

            {/* Inline Lead Form */}
            {showLeadForm && !leadSubmitted && (
                <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300 mt-2">
                    <div className="w-8 h-8 rounded-full bg-[#111827] border border-amber-500/30 flex items-center justify-center shrink-0 mt-1">
                        <Bot size={16} className="text-amber-400" />
                    </div>
                    <form onSubmit={handleLeadSubmit} className="max-w-[85%] w-full bg-[#111827] border border-amber-500/40 rounded-2xl rounded-bl-none p-4 shadow-lg">
                        <p className="text-sm text-slate-200 mb-3 font-medium">
                            Anh/Chị vui lòng để lại thông tin để em gửi báo giá và lịch trình chi tiết nhé:
                        </p>
                        <div className="space-y-3">
                            <div className="relative">
                                <UserCircle size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <input 
                                    type="text" 
                                    required
                                    placeholder="Họ và Tên" 
                                    value={leadName}
                                    onChange={(e) => setLeadName(e.target.value)}
                                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-amber-500/60 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
                                />
                            </div>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <input 
                                    type="tel" 
                                    required
                                    pattern="(84|0[3|5|7|8|9])+([0-9]{8})"
                                    placeholder="Số điện thoại Zalo" 
                                    value={leadPhone}
                                    onChange={(e) => setLeadPhone(e.target.value)}
                                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-amber-500/60 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-bold text-sm rounded-xl transition-all shadow-md mt-1"
                            >
                                Gửi Yêu Cầu
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Floating Scroll To Bottom Button */}
          {showScrollBottomButton && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-20 right-6 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow-xl transition-all cursor-pointer border border-amber-300 animate-bounce"
            >
              <span>Cuộn xuống tin mới</span>
              <ChevronDown size={14} />
            </button>
          )}

          {/* Quick Replies */}
          {messages.length <= 2 && !isTyping && !showLeadForm && (
            <div
              onWheel={handleQuickRepliesWheel}
              className="px-4 py-2 border-t border-slate-800/60 bg-[#0B0F19] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-thin scrollbar-thumb-slate-700 hover:scrollbar-thumb-amber-500/60 pb-2"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
            >
              {QUICK_REPLIES.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(qr.text)}
                  className="px-3 py-1.5 text-xs font-medium bg-[#111827] hover:bg-slate-800 border border-amber-500/20 text-slate-300 hover:text-amber-300 rounded-full whitespace-nowrap transition-all hover:border-amber-500/50 shrink-0 cursor-pointer"
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 bg-[#0B0F19] border-t border-slate-800/80 flex items-center gap-2 relative z-10 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhắn tin cho An..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-[#111827] border border-slate-700/60 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shrink-0"
              aria-label="Gửi tin nhắn"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
