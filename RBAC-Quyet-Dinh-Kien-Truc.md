# Quyết Định Kiến Trúc Phân Quyền (RBAC) — CRM Du Lịch
**Phiên bản:** 1.0 | **Trạng thái:** Đã chốt để triển khai | **Ngày:** 31/07/2026

---

## Tóm tắt quyết định (đọc trong 30 giây)

| # | Vấn đề | Quyết định cuối |
|---|--------|------------------|
| 1 | Editor có được đổi trạng thái Lead? | **Không.** Chỉ được "đề xuất" (flag), Sales/Admin xác nhận. |
| 2 | Ai xem được doanh thu/dòng tiền? | **Chỉ `super_admin`.** Sales chỉ xem KPI cá nhân, lọc ở tầng DB. |
| 3 | Sales có xem được Lead của Sales khác? | **Không**, trừ khi được `super_admin` gán quyền "xem toàn team" theo nhóm. |
| 4 | Impersonation ghi log thế nào? | **Bắt buộc tách `actor_id` và `acting_as_id`**, không cho impersonate `super_admin` khác. |
| 5 | Editor thấy PII khách hàng không? | **Không.** Chỉ thấy tour/điểm đến/lịch trình, ẩn SĐT/email khách. |
| 6 | Audit Log có sửa/xóa được không? | **Không.** Append-only, chỉ `super_admin` đọc, giữ tối thiểu 12 tháng. |

---

## 1. Lead Action Matrix (Quyết định thay P0-QĐ1)

**Chọn: Option A có điều chỉnh — "Siết chặt + cơ chế đề xuất"**

Lý do chọn thẳng Option A thuần túy là chưa đủ: nếu editor phát hiện lead sai lệch trạng thái trong lúc làm nội dung tour mà không có cách nào phản ánh, thực tế vận hành sẽ dẫn đến tình trạng nhờ vả ngoài hệ thống (nhắn Zalo nhờ sales đổi hộ) — phá vỡ mục đích kiểm soát ban đầu.

| Role | Xem Lead | Đổi trạng thái | Đề xuất đổi trạng thái | Xem PII khách hàng |
|------|----------|----------------|------------------------|---------------------|
| `super_admin` | ✅ Toàn bộ | ✅ | — | ✅ |
| `sales` | ✅ Lead được gán (mặc định) | ✅ | — | ✅ |
| `editor` | ✅ Chỉ tour/điểm đến liên quan | ❌ | ✅ (tạo flag, không tự apply) | ❌ (ẩn SĐT/email) |
| `viewer` | ✅ Read-only tổng quan | ❌ | ❌ | ❌ |

**Backend enforcement bắt buộc:**
```
PATCH /leads/:id/status  → requireRole(['super_admin','sales']) 
                          + kiểm tra lead.assigned_to === req.user.id (trừ super_admin)
POST /leads/:id/flag     → requireRole(['editor']) — ghi vào bảng lead_flags, KHÔNG update leads.status
```

---

## 2. Data Privacy Matrix (Quyết định thay P1-QĐ2)

**Chọn: Option A — Phân cấp dữ liệu báo cáo, enforce ở tầng query, không phải response mapping**

| Role | Doanh thu công ty | KPI cá nhân | Số lượng khách/tour (ẩn tiền) |
|------|--------------------|-------------|-------------------------------|
| `super_admin` | ✅ | ✅ (mọi người) | ✅ |
| `sales` | ❌ | ✅ (chỉ của mình) | ✅ |
| `editor` / `viewer` | ❌ | ❌ | ✅ |

**Quy tắc bắt buộc:** Mọi endpoint báo cáo phải filter bằng `WHERE user_id = req.user.id` ngay trong câu query DB đối với `sales`. **Cấm** trả về full dataset rồi lọc ở frontend hoặc ở tầng response serializer — đây là lỗ hổng IDOR phổ biến nhất.

---

## 3. Impersonation — Quy tắc bắt buộc (mới, được nâng lên P0)

1. `super_admin` **không được** impersonate một `super_admin` khác.
2. Trước khi impersonate: bắt buộc **re-auth bằng mật khẩu** (không chỉ dựa vào session hiện tại).
3. Trong session impersonation: hiển thị **banner cố định** "Đang xem với quyền: [role] — [tên tài khoản]" ở mọi màn hình.
4. Session impersonation có **timeout riêng** (đề xuất 30 phút), tự thoát về tài khoản gốc.
5. Mọi thao tác trong lúc impersonate ghi log với **2 trường tách biệt**:
   - `actor_id`: người thực sự đăng nhập (super_admin)
   - `acting_as_id`: tài khoản đang bị giả lập

---

## 4. Audit Log — Đặc tả tối thiểu (P2, cụ thể hóa)

| Thuộc tính | Yêu cầu |
|------------|---------|
| Tính bất biến | Append-only — không có API `UPDATE`/`DELETE` bản ghi log |
| Quyền đọc | Chỉ `super_admin` |
| Trường bắt buộc | `timestamp`, `actor_id`, `acting_as_id` (nullable), `action`, `resource_type`, `resource_id`, `before_value`, `after_value` |
| Lưu trữ tối thiểu | 12 tháng, sau đó archive (không xóa) |
| Sự kiện bắt buộc log | Đổi trạng thái Lead, phân quyền tài khoản, bắt đầu/kết thúc impersonation, xóa dữ liệu |

---

## 5. Việc phải làm ngay trước khi triển khai (không thể bỏ qua)

- [ ] Test độc lập từng endpoint bằng token của role thấp nhất (không dựa vào việc Sidebar ẩn menu).
- [ ] Xác nhận mọi query Lead/Report có filter theo `assigned_to`/`user_id` ở tầng DB.
- [ ] Thêm bảng `lead_flags` cho cơ chế "đề xuất đổi trạng thái" của editor.
- [ ] Thêm 2 cột `actor_id` / `acting_as_id` vào bảng audit log hiện có (nếu đã có log nhưng thiếu trường này).
- [ ] Chặn impersonate giữa 2 `super_admin`.

---

## Câu hỏi còn mở (cần anh/chị quyết định thêm, không tự chốt thay được)

1. Quy mô team hiện tại bao nhiêu người — nếu quá nhỏ (2-3 sales), có thể cân nhắc cho sales xem lead lẫn nhau theo nhóm, nhưng vẫn phải audit log rõ ràng.
2. Thời gian timeout của session impersonation: 30 phút có phù hợp với quy trình thực tế không?
3. Editor có cần xem lịch sử flag của chính mình (đã đề xuất, đã được duyệt/từ chối) để biết kết quả không?
