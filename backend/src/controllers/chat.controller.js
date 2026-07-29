const { handleChat } = require('../services/chat_service');

const chat = async (req, res) => {
  const { history } = req.body;
  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ success: false, error: 'Lịch sử chat không hợp lệ' });
  }

  try {
    const reply = await handleChat(history);
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Chat API Error:', err);
    res.status(500).json({ success: false, error: 'Lỗi khi xử lý tin nhắn' });
  }
};

module.exports = {
  chat
};
