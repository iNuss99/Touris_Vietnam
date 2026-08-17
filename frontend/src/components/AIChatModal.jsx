import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, RotateCcw, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: 'Dạ em chào Anh/Chị! Em là EV - Chuyên viên Tư vấn Du lịch Cao cấp của Vietnam Journey. Em có thể hỗ trợ Anh/Chị thông tin về tour du lịch nào hôm nay ạ?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const messagesEndRef = useRef(null);

  const apiKey = import.meta.env.VITE_DIFY_API_KEY || 'app-t5YCcAb98pamtDz9BCNGMm5y';
  const apiBaseUrl = import.meta.env.VITE_DIFY_BASE_URL || 'https://api.dify.ai/v1';

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Gửi tin nhắn đến Dify API
  const handleSendMessage = async (customQuery = null) => {
    const query = (customQuery || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsgId = Date.now().toString();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {},
          query: query,
          response_mode: 'blocking',
          conversation_id: conversationId || '',
          user: 'vietnam_journey_guest'
        })
      });

      if (!response.ok) {
        throw new Error(`Dify API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const botReply = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.answer || 'Dạ em cảm ơn Anh/Chị! Bộ phận tư vấn Vietnam Journey đang xử lý thông tin và sẽ phản hồi Anh/Chị ngay ạ.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error('Error sending message to Dify:', error);
      const errorReply = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Dạ em cảm ơn Anh/Chị! Anh/Chị có thể để lại SĐT hoặc Zalo để em gửi báo giá chi tiết nhé ạ! Hoặc Anh/Chị có thể liên hệ trực tiếp qua Zalo/Hotline CSKH: https://zalo.me/0931143830 (Hotline: 0931143830) để được hỗ trợ ngay ạ.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Dạ em chào Anh/Chị! Em là EV - Chuyên viên Tư vấn Du lịch Cao cấp của Vietnam Journey. Em có thể hỗ trợ Anh/Chị thông tin về tour du lịch nào hôm nay ạ?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setConversationId('');
  };

  const quickQuestions = [
    'Xem bảng giá tour',
    'Tư vấn tour Hạ Long 3N2Đ',
    'Chính sách đặt tour & ưu đãi'
  ];

  // Custom renderer cho ReactMarkdown giúp format văn bản sắc nét & đẹp mắt
  const markdownComponents = {
    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold text-luxury-gold-light">{children}</strong>,
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-luxury-gold-light underline font-medium hover:text-luxury-gold transition-colors inline-break-words"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-slate-100">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-slate-100">{children}</ol>,
    li: ({ children }) => <li className="text-slate-100 font-light">{children}</li>,
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[999999] w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] rounded-[1.5rem] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-luxury-gold/40 overflow-hidden backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      style={{
        background: 'linear-gradient(180deg, rgba(11, 15, 25, 0.98) 0%, rgba(4, 8, 15, 0.99) 100%)',
      }}
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-luxury-gold/20 bg-luxury-dark/95">
        <div className="flex items-center gap-3">
          {/* Avatar EV sắc nét sắc sảo */}
          <div className="relative w-10 h-10 rounded-full border border-luxury-gold-light/60 p-0.5 bg-gradient-to-br from-[#f0d080] via-[#c9a84c] to-[#997a29] shadow-lg shadow-luxury-gold/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-luxury-dark flex items-center justify-center relative overflow-hidden">
              <Bot size={20} className="text-luxury-gold-light" />
              <Sparkles size={10} className="absolute top-1 right-1 text-luxury-gold animate-pulse" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-luxury-dark shadow-sm" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif text-sm font-bold text-luxury-gold-light tracking-wide">VIETNAM JOURNEY</h3>
            </div>
            <p className="text-[11px] text-white/70 tracking-wide font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              EV - Tư vấn viên AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="p-2 text-white/60 hover:text-luxury-gold hover:bg-luxury-gold/10 rounded-full transition-colors"
            title="Đặt lại hội thoại"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-luxury-gold hover:bg-luxury-gold/10 rounded-full transition-colors"
            title="Đóng cửa sổ chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ===== MESSAGES BODY ===== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed scrollbar-thin scrollbar-thumb-luxury-gold/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f0d080] to-[#c9a84c] border border-luxury-gold/40 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-luxury-gold/20">
                <Bot size={14} className="text-luxury-dark" />
              </div>
            )}

            <div
              className={`max-w-[84%] px-4 py-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dim text-luxury-dark font-medium rounded-tr-none shadow-md shadow-luxury-gold/15'
                  : 'bg-white/5 border border-luxury-gold/20 text-slate-100 rounded-tl-none shadow-inner'
              }`}
            >
              {msg.sender === 'bot' ? (
                <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
              
              <span
                className={`block text-[9px] mt-1.5 text-right font-light ${
                  msg.sender === 'user' ? 'text-luxury-dark/70' : 'text-white/40'
                }`}
              >
                {msg.time}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-luxury-gold/20 border border-luxury-gold/40 flex items-center justify-center shrink-0 mt-0.5">
                <User size={14} className="text-luxury-gold-light" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f0d080] to-[#c9a84c] border border-luxury-gold/40 flex items-center justify-center shrink-0 shadow-md shadow-luxury-gold/20">
              <Bot size={14} className="text-luxury-dark" />
            </div>
            <div className="bg-white/5 border border-luxury-gold/20 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== QUICK QUESTIONS SUGGESTION PILLS ===== */}
      {messages.length <= 3 && !isLoading && (
        <div className="px-4 py-2 border-t border-white/5 bg-luxury-dark/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[10px] whitespace-nowrap px-3 py-1.5 rounded-full bg-luxury-gold/10 hover:bg-luxury-gold/20 text-luxury-gold-light border border-luxury-gold/25 transition-all duration-200"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ===== INPUT BOX ===== */}
      <div className="p-3 border-t border-luxury-gold/20 bg-luxury-dark/95">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-luxury-gold/30 focus-within:border-luxury-gold transition-colors"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Hỏi tư vấn tour Hạ Long, Sapa, Hội An..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-luxury-gold-light to-luxury-gold text-luxury-dark flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-luxury-gold/20"
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
