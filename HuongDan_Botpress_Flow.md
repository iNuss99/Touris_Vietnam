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
2. Nối dây từ 3 nút `Tour Hạ Long`, `Tour Phú Quốc`, `Tour Sapa` (nằm ở khối Chào hỏi) sang khối **Lấy Thông Tin** này.
3. Bấm vào khối **Lấy Thông Tin**, ấn dấu **+** và lần lượt thêm 3 thẻ Capture sau (nằm trong mục *Capture Information*):

   **A. Thẻ Person Name (Lấy tên khách):**
   - *Question:* "Dạ để tiện xưng hô, Anh/Chị cho em xin Tên nhé?"
   - *Store in Variable* (cột phải): Tạo biến `khach_ten`.

   **B. Thẻ Phone Number (Lấy SĐT):**
   - *Question:* "Em chào anh/chị {{workflow.khach_ten}}, anh/chị cho em xin SĐT Zalo để tư vấn viên gửi chi tiết lịch trình nhé!"
   - *Store in Variable:* Tạo biến `khach_sdt`.

   **C. Thẻ Raw Input / String (Lấy Text tự do):**
   - *Question:* "Cuối cùng, gia đình mình dự định đi khoảng bao nhiêu người và vào tháng mấy ạ?"

4. Cuối khối này, thêm 1 thẻ **Text** để chốt hạ:
   > *"Cảm ơn anh/chị {{workflow.khach_ten}}. Tư vấn viên sẽ gọi số {{workflow.khach_sdt}} để báo giá trong vòng 24h tới. Chúc anh/chị một ngày vui vẻ!"*

## Bước 4: Chuyển các câu hỏi tự do cho AI trả lời
Nếu khách không bấm chọn tour mà nhấn nút **"Nhờ tư vấn thêm"** (để hỏi FAQ về giá, lịch trình):
1. Kéo dây nối từ chữ `Nhờ tư vấn thêm` (ở khối Chào hỏi) sang khối **AutonomousNode** (khối to ở giữa màn hình).
2. Khi khách vào luồng này, AI sẽ tự động đọc dữ liệu từ file txt bạn đã cung cấp để trả lời.

---

**🔥 LƯU Ý CUỐI CÙNG:**
Sau khi hoàn tất, hãy nhấn nút **Publish** (màu xanh dương ở góc phải trên cùng) để kịch bản chính thức được áp dụng lên website của bạn!
