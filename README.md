# 🇻🇳 Vietnam Journey — Nền Tảng Du Lịch & Quản Trị Thông Minh

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Dify AI](https://img.shields.io/badge/AI_Agent-Dify.ai-FF6B6B?style=for-the-badge)

**Trải nghiệm du lịch 5 sao cao cấp kết hợp Trợ lý AI cá nhân hóa và Hệ thống quản trị CRM toàn diện.**

[🌐 Trải Nghiệm Trực Tuyến](https://tour-vietnam.vercel.app/) • [📊 Cổng Quản Trị CRM](https://tour-vietnam.vercel.app/crm)

</div>

---

## 📖 1. Giới Thiệu Dự Án

**Vietnam Journey** (Touris Vietnam) là giải pháp chuyển đổi số toàn diện cho ngành du lịch cao cấp tại Việt Nam. Nền tảng kết hợp giữa **giao diện trải nghiệm sang trọng (Luxury Experience)** cho du khách và **hệ thống quản trị kinh doanh CRM / CEO Dashboard** mạnh mẽ cho ban điều hành.

Hệ thống tích hợp **Trợ lý AI thông minh (Dify.ai)** giúp tư vấn lịch trình tự động 24/7, trích xuất nhu cầu và tự động đồng bộ khách hàng tiềm năng vào cơ sở dữ liệu để đội ngũ tư vấn viên chăm sóc kịp thời.

---

## ✨ 2. Tính Năng Nổi Bật

### 🏛️ Trải Nghiệm Khách Hàng (Portal Du Khách)
- **Giao Diện Luxury Dark/Gold:** Phong cách thiết kế hiện đại, bảng màu cao cấp, tối ưu hóa thị giác và trải nghiệm thương hiệu.
- **Chuyển Động Mượt Mà:** Tích hợp **Lenis Smooth Scroll** và **GSAP** cho hiệu ứng cuộn và chuyển động tự nhiên, không gây giật lag.
- **Khám Phá Danh Thắng & Văn Hóa:** Giới thiệu chi tiết các điểm đến nổi tiếng (Hạ Long, Tràng An, Hội An, Sa Pa, Đà Nẵng, Phú Quốc...) cùng nét đẹp văn hóa, ẩm thực Việt Nam.
- **Hỗ Trợ Song Ngữ (i18n):** Chuyển đổi ngôn ngữ mượt mà giữa **Tiếng Việt** và **Tiếng Anh**.
- **Đặt Tour & Tư Vấn Nhanh:** Form liên hệ/đặt tour trực tuyến với xác thực dữ liệu chặt chẽ và gửi email thông báo tự động.

### 🤖 Trợ Lý Ảo Dify AI & Đồng Bộ CRM 2 Chiều
- **AI Consultant 24/7:** Tư vấn lịch trình, dự toán chi phí, giải đáp thắc mắc dịch vụ theo ngữ cảnh thực tế.
- **Auto Lead Capture:** AI nhận diện thông tin đặt tour (Họ tên, SĐT, Email, điểm đến mong muốn, số lượng khách, ngân sách) và tự động gọi Custom API đẩy vào CRM.

### 📊 Hệ Thống Quản Trị Doanh Nghiệp (CRM & CEO Dashboard)
- **Phân Quyền Đa Cấp (RBAC):** Kiểm soát truy cập chặt chẽ theo vai trò (`super_admin`, `admin`, `manager`, `staff`).
- **Quản Trị Khách Hàng Tiềm Năng (Leads):**
  - Tự động chấm điểm (Lead Score), phân loại mức độ tiềm năng (**Hot / Warm / Cold**) và tính toán Grade (**A/B/C/D**).
  - Dự phóng giá trị hợp đồng (Estimated Value).
  - Lọc, tìm kiếm, phân trang và cập nhật trạng thái đơn hàng thời gian thực.
- **CEO Analytics & Biểu Đồ Tương Tác:** Biểu đồ doanh thu dự kiến, phễu chuyển đổi, phân bố nguồn lead trực quan với **Recharts**.
- **Quản Trị Nội Dung & Điểm Đến (CMS):** Cập nhật hình ảnh, giá vé, mô tả điểm đến tức thời mà không cần can thiệp mã nguồn.
- **Nhật Ký Kiểm Toán (Audit Logs):** Ghi nhận đầy đủ hành động đăng nhập, sửa đổi trạng thái, xóa dữ liệu đảm bảo an toàn bảo mật.

---

## 🛠️ 3. Kiến Trúc & Công Nghệ

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT / FRONTEND                        │
│   React 19 • Vite 8 • Tailwind CSS v4 • TanStack Query v5  │
│   Lenis Scroll • GSAP 3 • Recharts • Lucide Icons • i18n   │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP / REST API              │ JSON Response
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                    SERVER / BACKEND                         │
│   Node.js • Express 5 • JWT Auth • Rate Limiting • RBAC    │
│   Nodemailer Service • Audit Service • Lead Scoring Engine  │
└──────────────┬──────────────────────────────▲───────────────┘
               │ SQL Queries (SSL Pool)       │ Neon Cloud
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                    DATABASE & SERVICES                      │
│   PostgreSQL (Neon Serverless) • Dify.ai AI Workflow Engine │
└─────────────────────────────────────────────────────────────┘
```

| Tầng (Layer) | Công nghệ chính |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, TanStack React Query v5, React Router v7, Lenis, GSAP, Recharts, Lucide React |
| **Backend** | Node.js, Express 5, `pg` (PostgreSQL Client), JSON Web Token (JWT), `bcryptjs`, `nodemailer`, `express-rate-limit` |
| **Database** | PostgreSQL Serverless (Neon DB) kết nối SSL an toàn |
| **AI / Bot** | Dify.ai Enterprise Assistant, OpenAPI Custom CRM Lead Tool |
| **Testing** | Node.js Test Runner tích hợp (`node:test`, `node:assert`) |
| **Deploy** | Vercel (Hỗ trợ Frontend SPA + Serverless Backend API) |

---

## 📁 4. Cấu Trúc Thư Mục

```
Touris_Vietnam/
├── frontend/                     # Ứng dụng giao diện người dùng (Client)
│   ├── public/                   # Tài nguyên tĩnh (Favicon, Video background, OG Image)
│   ├── src/
│   │   ├── assets/               # Hình ảnh văn hóa, danh lam thắng cảnh (.webp)
│   │   ├── components/           # Các component giao diện (Hero, Culture, FAQs...)
│   │   │   └── Dashboard/        # Giao diện CRM & CEO Dashboard
│   │   ├── context/              # AuthContext & Quản lý phiên đăng nhập
│   │   ├── i18n/                 # Đa ngôn ngữ (Tiếng Việt / English)
│   │   ├── styles/               # CSS & Cấu hình theme Tailwind v4
│   │   ├── App.jsx               # Cấu hình Router & Providers
│   │   └── main.jsx              # Entry point của React
│   ├── index.html                # Tối ưu SEO, OpenGraph, Schema.org & Dify Widget
│   ├── vite.config.js            # Cấu hình Bundle, Code Splitting & Terser Minify
│   └── package.json
│
├── backend/                      # Máy chủ API & Xử lý nghiệp vụ (Server)
│   ├── api/                      # Handler serverless cho Vercel
│   ├── src/
│   │   ├── config/               # Cấu hình Database Pool (Neon Postgres)
│   │   ├── controllers/          # Bộ điều khiển nghiệp vụ (Auth, Leads, Tours, CEO...)
│   │   ├── middlewares/          # Middleware xác thực JWT, RBAC & Rate limit
│   │   ├── routes/               # Định tuyến API
│   │   ├── services/             # Dịch vụ gửi Mail, Audit Logs
│   │   └── server.js             # Entry point của máy chủ Express
│   ├── tests/                    # Bộ kiểm thử đơn vị & tích hợp (Unit / Integration Tests)
│   ├── db/                       # Bộ script khởi tạo & quản lý schema CSDL
│   └── package.json
│
├── .env.example                  # Mẫu cấu hình biến môi trường
├── vercel.json                   # Cấu hình điều hướng deployment Vercel
└── package.json                  # Root runner quản lý toàn bộ hệ thống
```

---

## 🚀 5. Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu tiên quyết
- **Node.js**: Phiên bản `>= 18.0.0`
- **NPM**: Phiên bản `>= 9.0.0`
- Cơ sở dữ liệu **PostgreSQL** (Khuyến nghị sử dụng [Neon.tech](https://neon.tech/))

---

### Bước 1: Clone mã nguồn
```bash
git clone https://github.com/iNuss99/Touris_Vietnam.git
cd Touris_Vietnam
```

### Bước 2: Cài đặt Dependencies
Cài đặt đồng thời cho cả Root, Backend và Frontend chỉ với 1 lệnh:
```bash
npm run install:all
```

---

### Bước 3: Cấu hình biến môi trường (`.env`)

Tạo file `.env` tại thư mục gốc và thư mục `backend/` dựa theo mẫu:

```bash
# Copy file mẫu cấu hình
cp .env.example .env
cp backend/.env.example backend/.env
```

Điền các thông số tương ứng trong file `.env`:
```env
# Cổng Backend
PORT=5000
NODE_ENV=development

# Kết nối cơ sở dữ liệu PostgreSQL (Neon DB)
DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>/neondb?sslmode=require

# Khóa bí mật ký JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Cấu hình gửi Email thông báo (Gmail SMTP hoặc dịch vụ gửi mail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
EMAIL_FROM="Vietnam Journey" <your_email@gmail.com>
```

---

### Bước 4: Khởi chạy môi trường phát triển (Development)

Chạy đồng thời cả **Backend API** (port `5000`) và **Frontend Vite** (port `5173`):
```bash
npm run dev
```

- 🌐 **Trang chủ du khách:** [http://localhost:5173](http://localhost:5173)
- 📊 **Cổng CRM Quản trị:** [http://localhost:5173/crm](http://localhost:5173/crm)
- 🛠️ **API Backend:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 🧪 6. Chạy Kiểm Thử (Testing)

Dự án trang bị sẵn bộ kiểm thử đơn vị và tích hợp cho backend (xác thực dữ liệu, phân quyền RBAC, middleware, lead validation, status normalization):

```bash
npm test
```
*Tất cả 16/16 test suites đều chạy tự động với tốc độ cao qua Node.js Native Test Runner.*

---

## 📦 7. Đóng Gói Sản Phẩm (Production Bundle)

Để kiểm tra và đóng gói tối ưu frontend trước khi phát hành:
```bash
npm run build
```

Mã nguồn được tối ưu tự động:
- **Terser Minification:** Loại bỏ toàn bộ `console.log` và `debugger` thừa.
- **Granular Code Splitting:** Phân tách các vendor lớn (`charts`, `vendor`, `animation`, `query`, `icons`) thành các chunk riêng biệt giúp tải trang siêu tốc.
- **CSS & Asset Optimizations:** Nén ảnh WebP và chia tách stylesheet theo route.

---

## 📡 8. Danh Sách API Endpoints Chính

| Phương thức | Endpoint | Mô tả | Yêu cầu xác thực |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Đăng nhập hệ thống & nhận JWT token | Công khai |
| `POST` | `/api/auth/change-password` | Đổi mật khẩu người dùng | Bearer Token |
| `GET` | `/api/destinations` | Danh sách các điểm đến du lịch | Công khai |
| `POST` | `/api/leads` | Khách gửi form đặt tour trực tuyến | Công khai / Rate Limited |
| `POST` | `/api/leads/sync-dify` | Webhook / Tool đồng bộ lead từ AI Dify | Khóa API / Bearer |
| `GET` | `/api/leads` | Lấy danh sách leads theo bộ lọc, trang | Manager / Admin |
| `PATCH` | `/api/leads/:id/status` | Cập nhật tiến độ xử lý lead | Staff / Manager / Admin |
| `GET` | `/api/ceo/metrics` | Lấy chỉ số tổng quan doanh thu & phễu CRM | Admin / Super Admin |
| `GET` | `/api/users` | Quản lý danh sách tài khoản nhân viên | Super Admin |

---

## 🔒 9. Bảo Mật & Quy Chuẩn Mã Nguồn

- **Mã hóa:** Toàn bộ mật khẩu được băm an toàn bằng `bcryptjs` với độ phức tạp cao (salt rounds 10).
- **Phân quyền chặt chẽ:** Mọi API quản trị đều kiểm tra JWT và vai trò người dùng (RBAC Middleware).
- **Phòng chống tấn công:** Tích hợp `express-rate-limit` ngăn chặn brute-force và spam lead form.
- **Bảo vệ biến môi trường:** Loại trừ tuyệt đối các file cấu hình nhạy cảm khỏi hệ thống Git.

---

## 📄 10. Giấy Phép & Bản Quyền

Dự án được phát triển và quản lý bởi **Vietnam Journey Team**.

Mọi đóng góp và phản hồi xin vui lòng liên hệ qua email hoặc tạo Issue trên GitHub repository.
