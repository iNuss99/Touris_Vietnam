/**
 * Chat Utilities for Gemma4 Bot Integration
 */

// Generates or retrieves a unique session ID
export function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('touris_chat_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('touris_chat_session_id', sessionId);
  }
  return sessionId;
}

// Phone regex for Vietnam (03x, 05x, 07x, 08x, 09x or +84)
const PHONE_REGEX = /(?:\+84|84|0)(?:3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])\d{7}\b/;

// Extracts lead phone and name from conversation messages
export function extractLeadData(messages) {
  let phone = null;
  let fullName = null;
  let destination = null;

  // Destinations list check
  const destinationsList = ['Hạ Long', 'Phú Quốc', 'Hội An', 'Sa Pa', 'Tràng An', 'Đà Nẵng', 'Nha Trang', 'Quy Nhơn', 'Huế', 'Đà Lạt'];

  messages.forEach((msg) => {
    if (msg.sender === 'user') {
      const text = msg.text;

      // Extract phone
      if (!phone) {
        const phoneMatch = text.match(PHONE_REGEX);
        if (phoneMatch) {
          phone = phoneMatch[0];
        }
      }

      // Extract Name keywords: "tên là X", "mình là X", "em tên X", "anh là X", "chị là X"
      if (!fullName) {
        const nameMatch = text.match(/(?:tên\s+là|mình\s+là|em\s+tên|anh\s+là|chị\s+là|tên\s+:?)\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴa-zàáảãạăắằẳẵặâấầnẩẫậnđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ\s]{2,30})/i);
        if (nameMatch && nameMatch[1]) {
          fullName = nameMatch[1].trim();
        }
      }

      // Extract Destination
      if (!destination) {
        destinationsList.forEach((dest) => {
          if (text.toLowerCase().includes(dest.toLowerCase())) {
            destination = dest;
          }
        });
      }
    }
  });

  return { phone, fullName, destination };
}

// Converts chat messages array into formatted plain text transcript for CRM
export function formatChatTranscript(messages) {
  return messages
    .map((msg) => {
      const time = new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const sender = msg.sender === 'user' ? 'Khách hàng' : 'An (Tư vấn viên AI)';
      return `[${time}] ${sender}: ${msg.text}`;
    })
    .join('\n');
}
