# PRODUCT REQUIREMENT DOCUMENT (PRD)
# Touris Vietnam - Nền tảng Đặt Tour & Giới thiệu Du lịch Việt Nam

**Dự án:** Touris Vietnam
**Loại ứng dụng:** Web Application (Landing Page kết hợp CRM & Chatbot)
**Mục tiêu:** Cung cấp trải nghiệm người dùng tương tác cao (Interactive UI) để quảng bá du lịch Việt Nam, thu thập khách hàng tiềm năng (Leads) và quản lý yêu cầu đặt tour qua Dashboard.

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

Touris Vietnam là một website du lịch tập trung vào trải nghiệm thị giác hiện đại (Awwwards style) với hiệu ứng GSAP, con trỏ từ tính (Magnetic Cursor) và giao diện thay đổi theo thời gian trong ngày. Hệ thống kết nối với Backend để quản lý dữ liệu điểm đến, gói tour, và thu thập thông tin khách hàng tiềm năng (CRM), đồng thời tích hợp Chatbot (Botpress) để hỗ trợ tự động.

---

## 2. TECH STACK & KIẾN TRÚC (ARCHITECTURE)

### 2.1 Frontend (React + Vite)
- **Framework:** React 19 + Vite.
- **Routing:** React Router v7 (`react-router-dom`).
- **Styling & UI:** Tailwind CSS v4, Lucide React (Icons).
- **Animations:** GSAP (GreenSock) cho các hiệu ứng chuyển động phức tạp, CSS Transitions.
- **Biểu đồ (Charts):** Recharts (dành cho CRM Dashboard).
- **Đa ngôn ngữ (i18n):** Context-based Custom i18n implementation.

### 2.2 Backend (Node.js + Express)
- **Môi trường:** Node.js (CommonJS).
- **Framework:** Express.js.
- **Cơ sở dữ liệu:** PostgreSQL (Sử dụng dịch vụ Neon DB).
- **Giao tiếp DB:** `pg` (Node-Postgres).
- **Middleware:** `cors`, `dotenv`.

### 2.3 Khác
- **Chatbot:** Botpress (tích hợp dựa trên dữ liệu tour có sẵn).
- **Image Optimization:** Script `optimize-images.js` (Sharp).

---

## 3. CORE UI & UX CỦA FRONTEND

Giao diện được thiết kế mang đậm tính tương tác:
- **Time-of-day Tint:** Giao diện tự động thay đổi tone màu dựa trên thời gian thực tế (Dawn, Day, Dusk, Night) - cập nhật mỗi 60 giây.
- **Magnetic Cursor:** Con trỏ chuột tuỳ chỉnh, hút vào các button/link (chỉ áp dụng trên thiết bị dùng chuột - `pointer: fine`). Cùng hiệu ứng `cursor-glow` mờ ảo chạy theo chuột.
- **Scroll Progress Bar:** Thanh tiến trình cuộn trang trên cùng.
- **Scroll Reveal Animations:** Các class `.reveal`, `.reveal-up`, `.reveal-scale` tự động kích hoạt nhờ `IntersectionObserver`.
- **Awwwards Layer:** Tích hợp lớp màng hạt (grain-overlay) tạo độ sâu cho giao diện.

---

## 4. TÍNH NĂNG CHÍNH (KEY FEATURES)

### 4.1 Người dùng cuối (End-users / Visitors)
- **Trang chủ (Landing Page):**
  - Hero Section: Trình bày hình ảnh và câu slogan cuốn hút.
  - Destinations: Khám phá các điểm đến tại Việt Nam.
  - Culture: Giới thiệu văn hóa, ẩm thực đặc trưng.
  - Tour Packages: Liệt kê các gói tour du lịch (lấy dữ liệu từ API `/api/tours`).
- **Liên hệ đặt Tour (Contact Form):**
  - Thu thập thông tin: Tên, Số điện thoại (Zalo), Email, Điểm đến, Ngày đi, Số lượng khách, Hạng dịch vụ (Service Class), Lời nhắn.
  - Đẩy dữ liệu về API Backend `/api/leads`.
- **Trợ lý ảo Chatbot (ChatGreeting):**
  - Tích hợp Botpress để tư vấn tự động các gói tour và điểm đến.
- **Đa ngôn ngữ:** Hỗ trợ thay đổi ngôn ngữ linh hoạt.

### 4.2 Quản trị viên (CRM / Dashboard)
- **Truy cập:** Thông qua route `/crm` (Dashboard).
- **Quản lý Leads:**
  - Hiển thị danh sách khách hàng liên hệ từ Database (`/api/leads`).
  - Quản lý trạng thái xử lý (Status) của từng Lead (`PUT /api/leads/:id/status`).
- **Thống kê:** (Sử dụng Recharts nếu có triển khai biểu đồ trên Dashboard).

---

## 5. CẤU TRÚC DATABASE (SCHEMA)

Hệ thống sử dụng PostgreSQL với 3 bảng cốt lõi:

**Bảng `tours`**
- Gói tour du lịch: `id`, `name`, `subtitle`, `price`, `unit`, `duration`, `features` (JSONB), `is_popular` (Boolean).

**Bảng `destinations`**
- Chi tiết điểm đến: `id`, `code`, `title`, `category`, `rating`, `duration`, `location`, `description`, `badge`, `about`, `best_time`, `cuisine`, `local_highlights` (JSONB), `itinerary` (JSONB), cùng các thông tin tour liên quan.

**Bảng `leads`**
- Thông tin form liên hệ: `id`, `full_name`, `phone` (Zalo), `email`, `destination`, `departure_date`, `guests`, `service_class`, `message`, `status`, `submitted_at`.

---

## 6. DANH SÁCH API (API CONTRACTS)

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **GET** | `/api/tours` | Lấy danh sách toàn bộ các Tour packages. |
| **GET** | `/api/destinations` | Lấy danh sách điểm đến. |
| **POST** | `/api/leads` | Tạo mới một Lead từ form liên hệ. Payload bao gồm: fullName, zalo, email, destination, date, guests, serviceClass, message. |
| **GET** | `/api/leads` | Lấy danh sách Leads (sắp xếp mới nhất). |
| **PUT** | `/api/leads/:id/status` | Cập nhật trạng thái xử lý của Lead. Body cần `status`. |

---

## 7. QUẢN TRỊ DỰ ÁN & TIẾN TRÌNH

### Scripts & Công cụ
- `npm run dev`: Chạy frontend (Vite).
- `npm run optimize-images`: Tối ưu hoá hình ảnh trong dự án (dùng `sharp`).
- `node server.js` / `npm run dev` (bên trong thư mục backend): Chạy server API.
- Tích hợp Botpress: Tham khảo `HuongDan_Botpress_Flow.md` và file dữ liệu `DuLieuTour_Botpress.txt`.
- Data Extractor: Các tệp `extractor.cjs` và `temp_extractor.js` có thể được dùng để cào hoặc format dữ liệu điểm đến / tour từ nguồn khác trước khi seed vào DB.
