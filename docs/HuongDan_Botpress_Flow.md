# Hướng Dẫn Chi Tiết: Xây Dựng Kịch Bản Chatbot Botpress

Tài liệu này lưu lại các bước thiết lập luồng thu thập khách hàng (Lead Capture Flow) kết hợp với Trí tuệ Nhân tạo (Autonomous Node) trên giao diện Botpress Studio v3.

## 📌 Chuẩn bị ban đầu
- Bạn đã nạp thành công file `DuLieuTour_Botpress.txt` vào mục **Knowledge Base**.
- Đang mở giao diện lưới (Canvas) của Botpress Studio.

---

## Bước 1: Tạo khối "Chào hỏi" (Greeting & Options)
1. Xóa sợi dây đang nối từ chữ **Start** (màu xanh lá) sang khối to **AutonomousNode** (nhấn chuột trái vào sợi dây và ấn phím Delete).
2. Click chuột phải vào khoảng trống màu đen trên màn hình -> chọn **Standard Node**.
3. Một khối nhỏ hiện ra, click đúp vào tiêu đề của nó (mặc định là *Standard 1*) và đổi tên thành **Chào hỏi**.
4. Click, giữ và kéo một sợi dây từ nút **Start** nối vào khối **Chào hỏi** vừa tạo.

## Bước 2: Thiết lập câu hỏi và Nút bấm (Single Choice)
1. Bấm vào khối **Chào hỏi** để mở bảng menu bên trái.
2. Chọn biểu tượng chữ T (**Text**). Nhập câu chào:
   > *"Xin chào Anh/Chị! Mình là chatbot tư vấn Tour Việt Nam. Rất vui được hỗ trợ Anh/Chị."*
3. Đưa chuột vào khối đó, bấm dấu **+ (Add card)**, tìm thẻ **Single Choice** (trong mục *Capture Information*) và bấm chọn.
4. Nhìn sang cột bên phải màn hình (cột *Inspector*), tìm mục **Choices** (Các lựa chọn). Nhập tên các nút bấm:
   - `Tour Hạ Long`
   - `Tour Phú Quốc`
   - `Tour Sapa`
   - `Nhờ tư vấn thêm` *(Nút dùng để khách tự do hỏi đáp)*

## Bước 3: Tạo khối "Thu thập Lead"
1. Click chuột phải ra vùng trống, tạo thêm một **Standard Node** nữa, đặt tên là **Lấy Thông Tin**.
2. Nối dây từ các nút `Tour Hạ Long`, `Tour Phú Quốc`, `Tour Sapa` (nằm ở khối Chào hỏi) sang khối **Lấy Thông Tin** này.
3. Bấm vào khối **Lấy Thông Tin**, thêm các thẻ Capture (trong mục *Capture Information*) để lấy đủ 8 thông tin:

   **A. Thẻ Person Name (Tên khách):**
   - *Question:* "Dạ để tiện xưng hô, Anh/Chị cho em xin Họ Tên nhé?" -> Biến: `khach_ten`

   **B. Thẻ Phone Number (SĐT):**
   - *Question:* "Anh/chị cho em xin SĐT Zalo để tư vấn viên gọi lại nhé!" -> Biến: `khach_sdt`

   **C. Thẻ Email Address (Email):**
   - *Question:* "Cho em xin địa chỉ Email để gửi lịch trình chi tiết nhé!" -> Biến: `khach_email`

   **D. Thẻ Single Choice (Điểm đến):**
   - *Question:* "Anh/Chị đang quan tâm điểm đến nào?" (Tạo các nút: Hạ Long, Phú Quốc, Sapa, Đà Nẵng...) -> Biến: `khach_diem_den`

   **E. Thẻ Date (Ngày đi):**
   - *Question:* "Anh/Chị dự định đi vào ngày nào?" -> Biến: `khach_ngay_di`

   **F. Thẻ Number (Số lượng khách):**
   - *Question:* "Đoàn mình đi khoảng bao nhiêu người ạ?" -> Biến: `khach_so_luong`

   **G. Thẻ Single Choice (Hạng dịch vụ):**
   - *Question:* "Mình muốn trải nghiệm hạng dịch vụ nào?" (Tạo các nút: luxury, standard, economy) -> Biến: `khach_hang_dv`

   **H. Thẻ Raw Input (Lời nhắn):**
   - *Question:* "Anh/chị có lưu ý hay yêu cầu đặc biệt gì không ạ?" -> Biến: `khach_loi_nhan`

4. Cuối khối này, thêm 1 thẻ **Text** để chốt hạ:
   > *"Cảm ơn {{workflow.khach_ten}}. Thông tin của anh/chị đã được ghi nhận. Tư vấn viên sẽ liên hệ sớm nhất!"*

## Bước 4: Xây dựng hệ thống FAQ (Hỏi đáp)
Nếu khách chọn **"Nhờ tư vấn thêm"** ở Bước 1:
1. **Tạo khối "Menu FAQ" (Quick Replies):**
   - Tạo Standard Node, nối từ nút `Nhờ tư vấn thêm` sang.
   - Dùng thẻ **Single Choice**, tạo các nút cho câu hỏi phổ biến: `Quy định hoàn hủy`, `Thanh toán`, `Chat với nhân viên`, và `Hỏi câu khác`.
   - Các nút cố định này nối thẳng ra các Node trả lời bằng Text dựng sẵn để phản hồi ngay lập tức.
2. **Nút "Hỏi câu khác" (AI Trả lời):**
   - Kéo dây từ nút `Hỏi câu khác` vào khối **AutonomousNode** (khối to ở giữa màn hình).
   - **Tối ưu Knowledge Base:** Mở file `DuLieuTour_Botpress.txt`, cấu trúc lại nội dung thành dạng [Câu hỏi] - [Trả lời] hoặc các đoạn văn ngắn gọn, đánh đầu dòng rõ ràng để AI đọc hiểu tốt nhất. Tránh viết câu quá dài.
   - **Tối ưu AI Prompt:** Trong AutonomousNode, viết Instructions: *"Bạn là chuyên viên tư vấn du lịch nhiệt tình. Chỉ trả lời dựa trên file tài liệu được cung cấp. Luôn xưng hô 'Dạ/Vâng' và gọi khách là 'Anh/Chị'."*

## Bước 5: Cấu hình Webhook đồng bộ về Backend/Google Sheets
Sau khối **Lấy Thông Tin** (ở Bước 3):
1. Thêm một thẻ **Execute Code** (nằm trong mục *Code* của Node Lấy Thông Tin hoặc tạo Node mới).
2. Dán đoạn mã sau vào thẻ Execute Code:
   ```javascript
   const axios = require('axios');
   
   const payload = {
     fullName: workflow.khach_ten,
     zalo: workflow.khach_sdt,
     email: workflow.khach_email,
     destination: workflow.khach_diem_den,
     date: workflow.khach_ngay_di,
     guests: workflow.khach_so_luong,
     serviceClass: workflow.khach_hang_dv,
     message: workflow.khach_loi_nhan,
     submittedAt: new Date().toISOString()
   };
   
   // URL Backend đã được kích hoạt public qua localtunnel
   const WEBHOOK_URL = 'https://upset-spoons-cheer.loca.lt/api/leads';
   
   try {
     await axios.post(WEBHOOK_URL, payload);
   } catch (error) {
     console.error("Lỗi khi gửi webhook: ", error);
   }
   ```

---

**🔥 LƯU Ý CUỐI CÙNG:**
Sau khi hoàn tất, hãy nhấn nút **Publish** (màu xanh dương ở góc phải trên cùng) để kịch bản chính thức được áp dụng lên website của bạn!
