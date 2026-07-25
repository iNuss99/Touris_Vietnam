const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || 'dummy_key',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Touris Vietnam Chatbot',
  }
});

// Nạp kiến thức từ file
let systemInstruction = `Bạn là Khoa - chuyên viên tư vấn du lịch cao cấp của Touris Vietnam.

⚠️ QUY TẮC TUYỆT ĐỐI (KHÔNG VI PHẠM DƯỚI BẤT KỲ HÌNH THỨC NÀO):
- CHỈ TRẢ LỜI BẰNG TIẾNG VIỆT. TUYỆT ĐỐI KHÔNG DÙNG TIẾNG ANH, dù chỉ một chữ.
- KHÔNG viết suy nghĩ, phân tích hay bước suy luận ra ngoài. Chỉ viết câu trả lời cuối cùng gửi cho khách.
- KHÔNG bịa đặt thông tin. Nếu không có dữ liệu: nói "Dạ để em xác nhận lại với team rồi báo Anh/Chị sớm ạ".

`;
try {
  const kbPath = path.join(__dirname, '../../../docs/DuLieuTour_Botpress.txt');
  if (fs.existsSync(kbPath)) {
    const kbContent = fs.readFileSync(kbPath, 'utf-8');
    systemInstruction += "DỮ LIỆU TOUR (để tư vấn):\n" + kbContent;
  }
} catch (err) {
  console.error("Lỗi khi đọc file DuLieuTour_Botpress.txt:", err);
}

systemInstruction += `

PHONG CÁCH TƯ VẤN (PROACTIVE SALES AGENT):
1. Xưng "Em/Khoa", gọi khách là "Anh/Chị" hoặc "Quý khách". Thân thiện, nhiệt tình, chuyên nghiệp chuẩn 5 sao.
2. Dùng emoji phù hợp và bullet points khi liệt kê thông tin tour.
3. KHAI THÁC THÔNG TIN (Quan trọng): Trong 1-2 câu trả lời đầu tiên, bắt buộc phải khéo léo hỏi khách: "Anh/Chị dự kiến đi khoảng mấy người?" hoặc "Anh/Chị có dự định đi vào khoảng thời gian nào chưa ạ?" để dễ dàng tư vấn.
4. Khi giới thiệu tour: nêu điểm nổi bật → giá → ưu đãi → mời chốt.
5. Khi khách có ý định đặt tour hoặc cần tư vấn sâu hơn: xin họ tên và số điện thoại/Zalo để bộ phận CSKH liên hệ trực tiếp.
6. Ngay khi có đủ họ tên + số điện thoại: GỌI function 'submit_lead', sau đó báo: "Em đã ghi nhận thông tin, chuyên viên tư vấn sẽ liên hệ Anh/Chị trong vòng 3 phút ạ!"
`;

const tools = [
  {
    type: "function",
    function: {
      name: "submit_lead",
      description: "Lưu thông tin khách hàng vào cơ sở dữ liệu khi khách hàng chốt tour và cung cấp thông tin liên hệ (ít nhất là Tên và Số điện thoại hoặc Email).",
      parameters: {
        type: "object",
        properties: {
          fullName: { type: "string", description: "Họ tên đầy đủ của khách hàng (VD: Nguyễn Văn A)" },
          zalo: { type: "string", description: "Số điện thoại hoặc Zalo của khách hàng" },
          email: { type: "string", description: "Địa chỉ email (nếu có)" },
          destination: { type: "string", description: "Điểm đến hoặc tên tour khách hàng muốn đi" },
          date: { type: "string", description: "Ngày đi dự kiến" },
          guests: { type: "string", description: "Số lượng khách" },
          serviceClass: { type: "string", description: "Hạng dịch vụ mong muốn (Standard, Premium, Luxury...)" }
        },
        required: ["fullName", "zalo"]
      }
    }
  }
];

async function handleChat(history) {
  if (!process.env.OPENROUTER_API_KEY) {
    return "Hệ thống chưa được cấu hình API Key cho OpenRouter (OPENROUTER_API_KEY trong .env). Xin vui lòng thêm OPENROUTER_API_KEY.";
  }

  try {
    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
      }))
    ];

    // Dùng gemma-4-26b ổn định, không bị lộ chain-of-thought
    const modelsToTry = [
      'google/gemma-4-26b-a4b-it:free',
      'google/gemma-4-31b-it:free'
    ];
    
    let response;
    for (const model of modelsToTry) {
      try {
        response = await openai.chat.completions.create({
          model: model,
          messages: messages,
          tools: tools,
          tool_choice: "auto",
          max_tokens: 800,
        });
        break;
      } catch (modelErr) {
        console.warn(`Model ${model} thất bại:`, modelErr.message);
        if (model === modelsToTry[modelsToTry.length - 1]) throw modelErr;
      }
    }

    let message = response.choices[0].message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      messages.push(message);

      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === 'submit_lead') {
          const args = JSON.parse(toolCall.function.arguments);
          const { fullName, zalo, email, destination, date, guests, serviceClass } = args;
          
          try {
            const query = `
              INSERT INTO leads (full_name, phone, email, destination, departure_date, guests, service_class, message)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            const values = [
              fullName || 'Khách hàng', 
              zalo || 'Chưa cung cấp', 
              email || '', 
              destination || '', 
              date || null, 
              guests ? parseInt(guests) || null : null, 
              serviceClass || '', 
              'Được tự động thu thập qua Chatbot OpenRouter (Llama 3)'
            ];
            await pool.query(query, values);
            
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: true, message: 'Lead saved successfully' })
            });
          } catch (dbErr) {
            console.error("Lỗi lưu lead từ chatbot:", dbErr);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: false, error: dbErr.message })
            });
          }
        }
      }

        response = await openai.chat.completions.create({
          model: 'google/gemma-4-26b-a4b-it:free',
          messages: messages,
        });
      message = response.choices[0].message;
    }

    return message.content;
  } catch (error) {
    console.error("Lỗi OpenRouter API:", error);
    throw error;
  }
}

module.exports = { handleChat };
