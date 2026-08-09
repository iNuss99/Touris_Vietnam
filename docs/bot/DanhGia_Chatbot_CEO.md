# Đánh Giá & Phương Án Nâng Cấp Chatbot Botpress
*(Từ góc nhìn CEO & Khách hàng khó tính)*

## 1. Nhận Xét Trải Nghiệm (Khách Hàng Khó Tính)

**Tình huống:** Khách hàng click vào popup gợi ý tour Đà Nẵng trên web. Form tự động điền câu "Tôi muốn tìm hiểu về Đà Nẵng City & Beach" và gửi đi.

**Sự thất vọng toàn tập:**
- **Bot bị "điếc":** Khách hàng đã nói thẳng mục đích (muốn đi Đà Nẵng). Thay vì cung cấp thông tin ngay, bot lờ đi hoàn toàn và hiển thị một menu bắt chọn lại từ đầu: *"Anh/chị cần hỗ trợ gì? Đặt tour hay FAQ?"*. Điều này tạo cảm giác đang nói chuyện với một cái máy trả lời tự động rẻ tiền, phá vỡ trải nghiệm cá nhân hóa.
- **Visual & Persona sai lệch:** Ở ngoài web, popup ghi là **"An — Tư Vấn Du Lịch"** rất sang trọng. Tuy nhiên, khi vào trong chat, tên bot lại hiển thị là **"ChatBot Tư Vấn"** và avatar là **Son Goku**. Sự bất nhất này phá vỡ hoàn toàn hình ảnh premium $20,000 của trang web.

---

## 2. Phương Án Phát Triển & Sửa Lỗi (CEO)

Vấn đề kỹ thuật cốt lõi: Luồng (Flow) của Botpress đang được thiết kế theo kiểu **đường thẳng cứng nhắc** (`Start` ➔ `Chào hỏi` ➔ `Bắt chọn Menu`). Nó không phân tích câu đầu tiên của khách.

Để nâng cấp, cần chuyển sang kiến trúc **AI-First (AI tiếp khách trước)**.

### Thay Đổi 1: Đồng bộ Hình thức (Persona)
Trên Botpress Studio:
1. Vào **Chatbot Settings** (biểu tượng bánh răng ⚙️ góc trên trái).
2. Sửa **Bot Name** thành: `An — Tư Vấn Viên`
3. Sửa **Bot Avatar**: Đổi hình Goku thành logo chữ V vàng của Vietnam Tourism hoặc hình một lễ tân chuyên nghiệp.

### Thay Đổi 2: Tái cấu trúc luồng "Chào hỏi" thông minh hơn
Loại bỏ menu cứng nhắc. Khách hỏi gì, AI sẽ trả lời dựa trên Knowledge Base. Chỉ chuyển sang form thu thập thông tin (Lead Capture) khi khách thực sự có nhu cầu đặt tour.

**Các bước thực hiện trên Canvas:**

1. **Gỡ bỏ luồng cũ:**
   - Xóa dây nối từ nút `Start` đến khối `Chào hỏi`.
   - (Tùy chọn) Xóa luôn khối `Chào hỏi` và `Menu_FAQ` cũ vì AI sẽ đảm nhận việc này.

2. **Nối thẳng vào AI:**
   - Kéo dây từ `Start` nối thẳng vào khối **AutonomousNode**.
   - *Tác dụng:* Khi khách chat "Tôi muốn tìm hiểu Đà Nẵng", AI sẽ đọc file `DuLieuTour_Botpress.txt` và trả lời ngay lập tức (VD: *"Dạ tour Đà Nẵng bên em giá 6.5M. Anh/Chị tính đi mấy người?"*).

3. **Dạy AI tự động chuyển luồng xin thông tin:**
   - Bấm vào khối **AutonomousNode** ➔ Tab Inspector ➔ Mục **Transitions**.
   - Bấm **+ Add Transition** ➔ Chọn **AI Transition**.
   - Ở ô **Condition** (Điều kiện kích hoạt), nhập: 
     > *"Khách hàng thể hiện ý muốn đặt tour, muốn được tư vấn chi tiết hơn, hoặc đồng ý để lại thông tin liên hệ."*
   - Kéo sợi dây từ cái **AI Transition** vừa tạo nối vào khối **Lấy Thông Tin** (Nơi chứa các thẻ Capture Name, Phone, Email...).

### Kết quả mong đợi sau khi nâng cấp:
- **Khách:** "Xin chào, tôi muốn tìm hiểu về Đà Nẵng City"
- **Bot (An):** "Dạ chào Anh/Chị! Tour Đà Nẵng - Hội An - Bà Nà Hills bên em kéo dài 3 ngày 2 đêm, ở resort 5 sao. Anh/Chị dự định đi vào tháng mấy ạ?"
- **Khách:** "Tháng sau, tôi đi 2 người"
- **Bot (An):** "Dạ vâng, để em kiểm tra lịch và gửi báo giá. Anh/Chị cho em xin Họ Tên và SĐT Zalo nhé?" ➔ *(Tự động kích hoạt form lấy số điện thoại)*
