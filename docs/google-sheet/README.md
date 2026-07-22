# Hướng Dẫn Liên Kết Form Đặt Tour Với Google Sheets (ReactJS)

Thư mục này chứa mã nguồn và hướng dẫn để kết nối trực tiếp biểu mẫu liên hệ 8 trường (Contact Form) trong ứng dụng ReactJS tới một bảng tính **Google Sheets** (thông qua công cụ **Google Apps Script**).

---

## Các bước thực hiện:

### Bước 1: Tạo Google Bảng Tính (Google Sheet)
1. Truy cập [Google Sheets](https://sheets.google.com) và tạo một bảng tính mới.
2. Đổi tên bảng tính thành bất kỳ tên nào bạn muốn (Ví dụ: `Danh Sách Khách Hàng Đặt Tour - Du Lịch Việt Nam`).

### Bước 2: Dán mã Apps Script
1. Trên thanh thực đơn của bảng tính, chọn **Tiện ích mở rộng** (Extensions) > **Apps Script**.
2. Xóa toàn bộ mã mặc định có sẵn trong file `Mã.gs` (hoặc `Code.gs`).
3. Mở file [Code.gs](file:///d:/VietNam_Touris/google-sheet/Code.gs) trong thư mục này, sao chép (copy) toàn bộ mã nguồn và dán (paste) vào trình soạn thái Apps Script của bạn.
4. Nhấn nút **Lưu** (biểu tượng đĩa mềm hoặc bấm `Ctrl + S`).

### Bước 3: Triển khai Apps Script dưới dạng Web App
1. Nhấn nút **Triển khai** (Deploy) ở góc trên bên phải > Chọn **Triển khai mới** (New deployment).
2. Nhấp vào biểu tượng bánh răng bên cạnh "Chọn loại cấu hình" > Chọn **Ứng dụng web** (Web app).
3. Cấu hình các thông số chính xác như sau:
   * **Mô tả (Description)**: `Form Dat Tour Vietnam Journey`
   * **Thực thi dưới quyền (Execute as)**: Chọn **Tôi (Email của bạn)** (Me).
   * **Ai có quyền truy cập (Who has access)**: Chọn **Bất kỳ ai** (Anyone) — *Lưu ý: Đây là bước quan trọng để trang web có thể gửi dữ liệu lên bảng tính của bạn mà không cần đăng nhập.*
4. Nhấn nút **Triển khai** (Deploy).
5. Google sẽ yêu cầu ủy quyền truy cập tài khoản. Hãy nhấn **Ủy quyền truy cập** (Authorize access), chọn tài khoản Google của bạn, nhấn **Nâng cao** (Advanced) ở dưới cùng bên trái, và chọn **Đi tới Dự án không có tiêu đề (không an toàn)** (Go to Untitled project) để xác nhận đồng ý cấp quyền.

### Bước 4: Sao chép URL và cấu hình trang web
1. Sau khi triển khai hoàn tất, Google sẽ cấp cho bạn một đường dẫn **URL ứng dụng web** (Web App URL) dạng:
   `https://script.google.com/macros/s/XXXXX/exec`
2. Hãy sao chép (copy) đường dẫn URL này.
3. Mở file `src/components/ContactForm.jsx` và tìm dòng khai báo:
   ```javascript
   const SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
   ```
4. Thay thế bằng đường dẫn URL của bạn:
   ```javascript
   const SCRIPT_URL = "https://script.google.com/macros/s/XXXXX/exec";
   ```

---

## Cách hoạt động:
* Khi khách hàng điền thông tin vào form liên hệ ở cuối trang và nhấn nút **Gửi yêu cầu**, ứng dụng React sẽ sử dụng JavaScript `fetch()` để gửi yêu cầu POST dạng JSON đến Apps Script của bạn.
* Mã Apps Script sẽ phân tích dữ liệu và ghi vào một hàng mới trên bảng tính Google Sheets gồm 9 cột:
  1. Họ tên (`fullName`)
  2. Số điện thoại Zalo (`zalo`)
  3. Email (`email`)
  4. Điểm đến (`destination`)
  5. Ngày khởi hành (`date`)
  6. Số lượng khách (`guests`)
  7. Hạng dịch vụ (`serviceClass`)
  8. Lời nhắn (`message`)
  9. Thời gian gửi (`submittedAt`)
* Trong trường hợp bạn chưa cấu hình URL thực tế, trang web sẽ chạy ở **chế độ giả lập (Simulation mode)** và hiển thị thông báo gửi thành công giả lập để bạn có thể kiểm tra hiệu ứng và trải nghiệm người dùng ngay lập tức.
