# Hướng Dẫn Chi Tiết: Xây Dựng Kịch Bản Chatbot Botpress

Tài liệu này lưu lại các bước thiết lập luồng thu thập khách hàng (Lead Capture Flow) kết hợp với Trí tuệ Nhân tạo (Autonomous Node) trên giao diện Botpress Studio v3.

## 📌 Chuẩn bị ban đầu
- Bạn đã nạp thành công file `DuLieuTour_Botpress.txt` (đã có thêm phần FAQ) vào mục **Knowledge Base**.
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
   > *"Xin chào Anh/Chị! Mình là An — tư vấn viên du lịch của Vietnam Tourism. Rất vui được đồng hành cùng Anh/Chị khám phá Việt Nam 🌿"*
3. Đưa chuột vào khối đó, bấm dấu **+ (Add card)**, tìm thẻ **Single Choice** (trong mục *Capture Information*) và bấm chọn.
4. Nhìn sang cột bên phải màn hình (cột *Inspector*), tìm mục **Choices** (Các lựa chọn). Nhập tên các nút bấm:
   - `Tour Hạ Long`
   - `Tour Phú Quốc`
   - `Tour Sapa`
   - `Tour Hội An`
   - `Tour Đà Nẵng`
   - `Nhờ tư vấn thêm` *(Nút dùng để khách tự do hỏi đáp)*

## Bước 3: Tạo khối "Thu thập Lead"
1. Click chuột phải ra vùng trống, tạo thêm một **Standard Node** nữa, đặt tên là **Lấy Thông Tin**.
2. Nối dây từ các nút tour (Tour Hạ Long, Tour Phú Quốc, Tour Sapa, Tour Hội An, Tour Đà Nẵng) sang khối **Lấy Thông Tin** này.
3. Bấm vào khối **Lấy Thông Tin**, thêm các thẻ Capture (trong mục *Capture Information*) để lấy đủ 8 thông tin:

   **A. Thẻ Person Name (Tên khách):**
   - *Question:* "Dạ để tiện xưng hô, Anh/Chị cho em xin Họ Tên nhé?" -> Biến: `khach_ten`

   **B. Thẻ Phone Number (SĐT):**
   - *Question:* "Anh/chị cho em xin SĐT Zalo để tư vấn viên gọi lại nhé!" -> Biến: `khach_sdt`

   **C. Thẻ Email Address (Email):**
   - *Question:* "Cho em xin địa chỉ Email để gửi lịch trình chi tiết nhé!" -> Biến: `khach_email`

   **D. Thẻ Single Choice (Điểm đến):**
   - *Question:* "Anh/Chị đang quan tâm điểm đến nào?" (Tạo các nút: Hạ Long, Phú Quốc, Sapa, Đà Nẵng, Hội An, Tràng An) -> Biến: `khach_diem_den`

   **E. Thẻ Date (Ngày đi):**
   - *Question:* "Anh/Chị dự định đi vào ngày nào?" -> Biến: `khach_ngay_di`

   **F. Thẻ Number (Số lượng khách):**
   - *Question:* "Đoàn mình đi khoảng bao nhiêu người ạ?" -> Biến: `khach_so_luong`

   **G. Thẻ Single Choice (Hạng dịch vụ):**
   - *Question:* "Mình muốn trải nghiệm hạng dịch vụ nào?" (Tạo các nút: Luxury ⭐⭐⭐⭐⭐, Standard ⭐⭐⭐⭐, Economy ⭐⭐⭐) -> Biến: `khach_hang_dv`

   **H. Thẻ Raw Input (Lời nhắn):**
   - *Question:* "Anh/chị có lưu ý hay yêu cầu đặc biệt gì không ạ?" -> Biến: `khach_loi_nhan`

4. Cuối khối này, thêm 1 thẻ **Text** để chốt hạ:
   > *"Cảm ơn {{workflow.khach_ten}} đã tin tưởng Vietnam Tourism! Thông tin của Anh/Chị đã được ghi nhận. Tư vấn viên sẽ liên hệ qua Zalo {{workflow.khach_sdt}} trong vòng 30 phút (giờ hành chính 8:00-20:00) ạ! 🙏"*

## Bước 4: Xây dựng hệ thống FAQ (Hỏi đáp)
Nếu khách chọn **"Nhờ tư vấn thêm"** ở Bước 1:
1. **Tạo khối "Menu FAQ" (Quick Replies):**
   - Tạo Standard Node, nối từ nút `Nhờ tư vấn thêm` sang.
   - Dùng thẻ **Single Choice**, tạo các nút cho câu hỏi phổ biến:
     - `Chính sách hoàn hủy`
     - `Phương thức thanh toán`
     - `Bảo hiểm tour`
     - `Trẻ em tính phí ra sao`
     - `Chat với nhân viên`
     - `Câu hỏi khác`
   - Các nút cố định này nối thẳng ra các Node trả lời bằng Text dựng sẵn (copy nội dung từ file DuLieuTour_Botpress.txt phần FAQ).
2. **Nút "Câu hỏi khác" (AI Trả lời):**
   - Kéo dây từ nút `Câu hỏi khác` vào khối **AutonomousNode**.
   - **Tối ưu Knowledge Base:** Vào tab Knowledge Base, upload lại file `DuLieuTour_Botpress.txt` (đã có phần FAQ mới).

## Bước 5: Cấu hình AI Prompt trong AutonomousNode
Bấm vào khối **AutonomousNode**, tìm ô **Instructions** và dán nội dung sau:

```
Bạn là "An" — chuyên viên tư vấn du lịch nhiệt tình và chuyên nghiệp của Vietnam Tourism.

NGUYÊN TẮC:
- Chỉ trả lời dựa trên thông tin trong tài liệu Knowledge Base được cung cấp.
- Nếu không có thông tin, trả lời: "Dạ câu hỏi này em cần xác nhận thêm với team, Anh/Chị có thể để lại SĐT để tư vấn viên liên hệ không ạ?"
- KHÔNG bịa đặt thông tin, giá cả hay lịch trình không có trong tài liệu.
- KHÔNG tư vấn tour nước ngoài.

PHONG CÁCH:
- Luôn xưng "em", gọi khách là "Anh/Chị"
- Dùng "Dạ/Vâng" khi đồng ý, bắt đầu câu trả lời
- Ngắn gọn, rõ ràng, tối đa 3-4 câu mỗi lần trả lời
- Kết thúc bằng câu hỏi để dẫn dắt khách hành động

UPSELL:
- Khi khách hỏi về tour Economy/Standard: Gợi ý thêm "Anh/Chị có muốn nâng lên gói [Tour cao hơn] để có thêm [lợi ích] không ạ?"
- Khi khách hỏi tour 2 ngày: Gợi ý thêm "Gói 3 ngày chỉ cộng thêm [X] triệu, Anh/Chị sẽ có thêm trải nghiệm [Y] rất đáng giá ạ"
```

## Bước 6: Cấu hình Webhook đồng bộ về Backend
Sau khối **Lấy Thông Tin** (ở Bước 3):
1. Thêm một thẻ **Execute Code** vào Node Lấy Thông Tin.
2. Dán đoạn mã sau vào thẻ Execute Code:
   ```javascript
   const sendToNeon = async () => {
     try {
       const payload = {
         fullName: workflow.khach_name ? workflow.khach_name.toString() : 'Khách Botpress',
         zalo: workflow.khach_sdt ? workflow.khach_sdt.toString() : 'Không có',
         email: workflow.khach_email ? workflow.khach_email.toString() : 'Không có',
         destination: workflow.khach_diem_den ? workflow.khach_diem_den.toString() : 'Chưa chọn',
         date: workflow.khach_ngay_di ? workflow.khach_ngay_di.toString() : 'Chưa chọn',
         guests: workflow.khach_so_luong ? workflow.khach_so_luong.toString() : '1',
         serviceClass: workflow.khach_hang_dv ? workflow.khach_hang_dv.toString() : 'Chưa chọn',
         message: workflow.khach_loi_nhan ? workflow.khach_loi_nhan.toString() : 'Không có'
       }

       const response = await fetch('https://touris-vietnam-api.vercel.app/api/leads', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(payload)
       });

       if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
       }

     } catch (err) {
       console.error('Lỗi đồng bộ API: ', err.message);
       // Fallback: Gửi về Google Sheets nếu backend lỗi
       const SHEETS_URL = 'https://script.google.com/macros/s/<YOUR_GOOGLE_APPS_SCRIPT_ID>/exec';
       try {
         await fetch(SHEETS_URL, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload) // Lưu ý: Google Apps Script cần code xử lý JSON body
         });
       } catch (e) {
         console.error("Fallback Google Sheets cũng lỗi: ", e.message);
       }
     }
   }

   await sendToNeon();
   ```

> ⚠️ **QUAN TRỌNG:** URL `https://touris-vietnam-api.vercel.app` là URL production. Đã có fallback về Google Sheets nếu backend lỗi — không mất data khách hàng.

## Bước 7: Re-engagement (Nhắc lại nếu khách im lặng)
1. Trong khối **Chào hỏi**, tìm phần **Timeout** ở Inspector bên phải.
2. Đặt **Timeout: 30 giây**.
3. Thêm thẻ Text khi timeout:
   > *"Anh/Chị có câu hỏi gì về tour Việt Nam không ạ? Em sẵn sàng tư vấn ngay! 🌿"*

---

**🔥 LƯU Ý CUỐI CÙNG:**
Sau khi hoàn tất, hãy nhấn nút **Publish** (màu xanh dương ở góc phải trên cùng) để kịch bản chính thức được áp dụng lên website của bạn!

Nhớ upload lại file `DuLieuTour_Botpress.txt` vào **Knowledge Base** vì đã có thêm phần FAQ mới.
