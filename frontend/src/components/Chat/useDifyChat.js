import { useState, useRef, useCallback } from 'react';
import { getOrCreateSessionId, extractLeadData, formatChatTranscript } from './chatUtils';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY || '';
const DIFY_BASE_URL = import.meta.env.VITE_DIFY_BASE_URL || 'https://api.dify.ai/v1';

const INITIAL_WELCOME = {
  id: 'welcome-msg',
  sender: 'bot',
  text: 'Dạ em chào Anh/Chị! Em là An - Chuyên viên tư vấn du lịch của Touris Vietnam 🌸. Rất vui được hỗ trợ Anh/Chị. Hôm nay Anh/Chị đang quan tâm đến danh thắng nào ở Việt Nam ạ (như Hạ Long, Hội An, Phú Quốc, Sa Pa...)?',
  timestamp: new Date().toISOString(),
};

export function useDifyChat() {
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [streamingText, setStreamingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sessionIdRef = useRef(getOrCreateSessionId());
  const conversationIdRef = useRef('');
  const hasSubmittedLeadRef = useRef(false);
  const leadCheckedLengthRef = useRef(1);
  const abortControllerRef = useRef(null);

  // Submit lead to CRM (fire-and-forget)
  const submitLead = useCallback((msgs) => {
    if (hasSubmittedLeadRef.current) return;
    const { phone, fullName, destination } = extractLeadData(msgs);
    if (!phone) return;

    hasSubmittedLeadRef.current = true;
    const transcript = formatChatTranscript(msgs);

    fetch(`${BACKEND_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName || 'Khách chat AI',
        zalo: phone,
        destination: destination || 'Tư vấn AI',
        source: 'chatbox',
        message: 'Lead được thu thập tự động qua Gemma4 AI Chatbox',
        chatTranscript: transcript,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) console.log('[Gemma4] Auto-captured lead:', d.lead?.id);
      })
      .catch((e) => console.error('[Gemma4] Lead submission failed:', e));
  }, []);

  const sendMessage = useCallback(async (userText) => {
    if (!userText?.trim() || isTyping) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toISOString(),
    };

    // Append user message to history state once
    setMessages((prev) => {
      const next = [...prev, userMsg];
      if (!hasSubmittedLeadRef.current && next.length > leadCheckedLengthRef.current) {
        leadCheckedLengthRef.current = next.length;
        submitLead(next);
      }
      return next;
    });

    setIsTyping(true);
    setStreamingText('');

    try {
      if (DIFY_API_KEY) {
        const response = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${DIFY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: {},
            query: userText.trim(),
            response_mode: 'streaming',
            conversation_id: conversationIdRef.current || undefined,
            user: sessionIdRef.current,
          }),
          signal,
        });

        if (!response.ok) {
          throw new Error(`Dify API ${response.status}: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let targetText = '';
        let displayedText = '';
        let typewriterInterval = null;

        // Smooth typewriter buffer for streamingText isolated state
        typewriterInterval = setInterval(() => {
          if (displayedText.length < targetText.length) {
            const diff = targetText.length - displayedText.length;
            const step = diff > 40 ? 6 : diff > 20 ? 3 : diff > 8 ? 2 : 1;
            displayedText = targetText.slice(0, displayedText.length + step);
            setStreamingText(displayedText);
          }
        }, 16);

        outer: while (true) {
          if (signal.aborted) {
            if (typewriterInterval) clearInterval(typewriterInterval);
            return;
          }
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (signal.aborted) {
              if (typewriterInterval) clearInterval(typewriterInterval);
              return;
            }
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') break outer;

            try {
              const parsed = JSON.parse(raw);

              if (parsed.conversation_id) {
                conversationIdRef.current = parsed.conversation_id;
              }

              if (parsed.answer) {
                targetText += parsed.answer;
              } else if (parsed.event === 'text_chunk' && parsed.data?.text) {
                targetText += parsed.data.text;
              } else if (parsed.event === 'workflow_finished' && parsed.data?.outputs) {
                const out = parsed.data.outputs;
                const final = out.text || out.result || out.answer || out.output || '';
                if (final) {
                  targetText = final;
                }
              }
            } catch {
              // Ignore malformed SSE chunks
            }
          }
        }

        if (typewriterInterval) clearInterval(typewriterInterval);
        if (signal.aborted) return;
        const finalBotText = targetText || getFallbackReply(userText);

        // Commit completed bot message into messages history
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: finalBotText,
            timestamp: new Date().toISOString(),
          },
        ]);
        setStreamingText('');
      } else {
        // Local dev fallback
        await new Promise((r) => setTimeout(r, 600));
        if (signal.aborted) return;
        const mock = getFallbackReply(userText);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: mock,
            timestamp: new Date().toISOString(),
          },
        ]);
        setStreamingText('');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[Gemma4] Dify error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'Dạ em cảm ơn Anh/Chị. Hệ thống đang bận một chút, Anh/Chị có thể để lại Họ Tên và Số điện thoại (Zalo) để em gửi lịch trình tour ngay nhé!',
          timestamp: new Date().toISOString(),
        },
      ]);
      setStreamingText('');
    } finally {
      if (!signal.aborted) {
        setIsTyping(false);
      }
    }
  }, [isTyping, submitLead]);

  const resetChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([INITIAL_WELCOME]);
    setStreamingText('');
    setIsTyping(false);
    hasSubmittedLeadRef.current = false;
    leadCheckedLengthRef.current = 1;
    sessionIdRef.current = getOrCreateSessionId();
    conversationIdRef.current = '';
  }, []);

  return { messages, streamingText, sendMessage, isTyping, resetChat };
}

// Fallback replies for local dev / Dify outage
function getFallbackReply(query) {
  const q = query.toLowerCase();

  if (q.includes('hạ long') || q.includes('ha long')) {
    return 'Dạ Vịnh Hạ Long bên em có gói Ha Long Luxury Cruise (2 ngày 1 đêm). Lịch trình bao gồm nghỉ dưỡng trên du thuyền 5 sao, chèo Kayak hang Luồn và thưởng thức tiệc hải sản tươi sống. Mức giá ưu đãi trọn gói là 3.850.000 VNĐ/khách. Anh/Chị dự định đi vào dịp nào ạ?';
  }
  if (q.includes('phú quốc') || q.includes('phu quoc')) {
    return 'Dạ tour Phú Quốc Island Retreat (4 ngày 3 đêm) bên em bao gồm nghỉ tại Resort 5 sao sát biển, lặn ngắm san hô Nam Đảo và ngắm hoàng hôn Sunset Sanato. Giá trọn gói 15.800.000 VNĐ/khách (đã bao gồm vé máy bay). Anh/Chị đi cùng gia đình hay nhóm bạn ạ?';
  }
  if (q.includes('hội an') || q.includes('hoi an')) {
    return 'Dạ tour Hội An Ancient Heritage (3 ngày 2 đêm) sẽ đưa Anh/Chị trải nghiệm thả hoa đăng trên sông Hoài, học làm đèn lồng thủ công và thưởng thức ẩm thực Phố Hội. Giá chỉ từ 4.200.000 VNĐ/khách. Anh/Chị nhắn em SĐT Zalo để em gửi lịch trình chi tiết nhé!';
  }
  if (q.includes('sa pa') || q.includes('sapa')) {
    return 'Dạ tour Sa Pa Cloud Hunting (3 ngày 2 đêm) trải nghiệm đỉnh Fansipan, thăm bản Cát Cát và nghỉ tại khách sạn 4 sao view thung lũng Mường Hoa. Mức giá ưu đãi 4.500.000 VNĐ/khách. Anh/Chị dự định đi mấy người ạ?';
  }
  if (q.includes('giá') || q.includes('bao nhiêu') || q.includes('báo giá')) {
    return 'Dạ Touris Vietnam có 3 hạng dịch vụ: Explorer (từ 3.500.000đ), Signature (4-5 sao từ 8.500.000đ) và Prestige (VVIP thiết kế riêng). Để báo giá chính xác nhất, Anh/Chị cho em xin Họ Tên và Số điện thoại (Zalo) nhé!';
  }
  if (q.includes('chào') || q.includes('hello') || q.includes('hi')) {
    return 'Dạ em chào Anh/Chị! Em là An - Chuyên viên tư vấn du lịch Việt Nam của Touris Vietnam. Hôm nay Anh/Chị quan tâm đến danh thắng nào ạ?';
  }

  return 'Dạ em cảm ơn câu hỏi của Anh/Chị! Để em tư vấn chi tiết và gửi lịch trình tour qua Zalo, Anh/Chị cho em xin **Họ Tên** và **Số điện thoại (Zalo)** nhé ạ!';
}
