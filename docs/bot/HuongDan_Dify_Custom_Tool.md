# HƯỚNG DẪN TÍCH HỢP TỰ ĐỘNG ĐỒNG BỘ LEAD TỪ DIFY CHATBOT VỀ CRM TOURIS VIETNAM

Tài liệu này hướng dẫn cách cấu hình **Dify Custom Tool** để AI Agent tư vấn tự động phát hiện số điện thoại/họ tên của khách hàng trong lúc trò chuyện và gửi thẳng vào hệ thống CRM Touris Vietnam.

---

## 📌 BƯỚC 1: TẠO CUSTOM TOOL TRÊN DIFY STUDIO

1. Đăng nhập vào [Dify Cloud](https://cloud.dify.ai) hoặc Dify Self-hosted của bạn.
2. Ở thanh menu trên cùng, chọn tab **Tools (Công cụ)** -> Chọn **Custom (Tùy chỉnh)** -> Nhấn **Create Custom Tool (Tạo công cụ tùy chỉnh)**.
3. Điền các thông tin cơ bản:
   - **Tên công cụ (Tool Name):** `touris_crm_lead_capture`
   - **Mô tả (Description):** `Đồng bộ thông tin khách hàng và nhật ký chat vào CRM Touris Vietnam`
4. Tại mục **Schema (Định dạng OpenAPI):**
   - Chọn định dạng **YAML**.
   - Sao chép toàn bộ nội dung trong file [dify_crm_tool_openapi.yaml](file:///e:/Touris_Vietnam2/Touris_Vietnam/docs/bot/dify_crm_tool_openapi.yaml) và dán vào ô Schema.
5. Tại mục **Server URL:**
   - Chọn `https://touris-vietnam-api.vercel.app` (Môi trường Production).
6. Nhấn **Save (Lưu)**.

---

## 📌 BƯỚC 2: GÁN CÔNG CỤ VÀO AGENT (TRỢ LÝ AI AN)

1. Mở ứng dụng **Chatbot / Agent** của bạn trong Dify Studio (ví dụ: *Tư Vấn Viên AI An*).
2. Tại mục **Tools (Công cụ):**
   - Bấm **+ Add Tool (Thêm công cụ)**.
   - Tìm và chọn công cụ `touris_crm_lead_capture` -> chọn hành động `saveLeadToCRM`.
3. Tại ô **Instructions (Lời nhắc hệ thống / System Prompt):**
   - Thêm quy tắc kích hoạt công cụ vào prompt của Agent như sau:

```markdown
### QUY TẮC THU THẬP LEAD VÀO CRM:
- Khi khách hàng cung cấp Số điện thoại / Zalo hoặc Họ tên kèm nhu cầu du lịch:
  1. Ngay lập tức kích hoạt công cụ `saveLeadToCRM` với các tham số:
     - `full_name`: Họ tên khách (hoặc "Khách chat AI" nếu khách chưa nói tên)
     - `phone`: Số điện thoại / Zalo mà khách đã nhập
     - `destination`: Điểm đến khách đang hỏi (Hạ Long, Phú Quốc, Sapa, Hội An, v.v.)
     - `departure_date`: Ngày dự kiến đi (nếu có)
     - `guests`: Số lượng khách (nếu có)
     - `service_class`: Hạng dịch vụ (Explorer, Signature, Prestige nếu có)
     - `source`: "chatbox"
     - `chat_transcript`: Toàn bộ tóm tắt hoặc nội dung hội thoại từ đầu đến giờ
  2. Sau khi công cụ báo thành công, hãy gửi tin nhắn phản hồi lịch sự và cam kết thời gian liên hệ (ví dụ: "Dạ em đã lưu thông tin của Anh/Chị. Chuyên viên tư vấn bên em sẽ liên hệ lại qua Zalo trong vòng 15-30 phút ạ!").
```

4. Nhấn **Publish (Xuất bản)** kịch bản trên Dify.

---

## 📌 BƯỚC 3: KIỂM CHỨNG TRÊN CRM DASHBOARD

1. Mở trang web và nhấn vào bong bóng chat để bắt đầu trò chuyện thử nghiệm.
2. Nhập một câu thoại có số điện thoại:
   > *"Chào em, mình muốn hỏi tour Hạ Long 5 sao cho 4 người vào tuần sau, số Zalo của mình là 0931143830, mình tên Khoa"*
3. Truy cập vào CRM Dashboard: `http://localhost:5173/crm` (hoặc `https://tour-vietnam.vercel.app/crm`).
4. Vào mục **Bot AI Gemma**:
   - Khách hàng mới sẽ lập tức xuất hiện trong bảng **Danh Sách Lead Từ AI Chatbox**.
   - Nguồn hiển thị là **AI Chatbox**.
   - Bấm vào nút **Nhật ký chat** để đọc toàn bộ transcript cuộc trò chuyện.

---

## 💡 MẪU PAYLOAD JSON KHI GỌI TRỰC TIẾP API (CHO HTTP REQUEST / WEBHOOK NODE):

- **Method:** `POST`
- **URL:** `https://touris-vietnam-api.vercel.app/api/leads` (hoặc `http://localhost:5000/api/leads` ở Local)
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "full_name": "Nguyễn Minh Khoa",
  "phone": "0931143830",
  "email": "khoa@example.com",
  "destination": "Hạ Long",
  "departure_date": "20/08/2026",
  "guests": 4,
  "service_class": "Prestige (5 sao)",
  "message": "Gia đình có 2 trẻ nhỏ, cần du thuyền VIP",
  "source": "chatbox",
  "chat_transcript": "[10:15] Khách: Tư vấn tour Hạ Long 5 sao cho 4 người\n[10:16] An (AI): Dạ bên em có gói du thuyền Prestige 5 sao rất thích hợp cho gia đình ạ...\n[10:17] Khách: SĐT mình 0931143830"
}
```
