const nodemailer = require('nodemailer');

/**
 * Khởi tạo Transporter cho Nodemailer
 * Hỗ trợ cả Custom SMTP (Host/Port/User/Pass) lẫn Gmail SMTP (GMAIL_USER/GMAIL_APP_PASSWORD)
 */
function getTransporter() {
  // 1. Kiểm tra cấu hình Custom SMTP trước
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  // 2. Kiểm tra cấu hình Gmail SMTP
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('Chưa cấu hình thông tin SMTP. Vui lòng bổ sung GMAIL_USER & GMAIL_APP_PASSWORD (hoặc SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) trong file .env');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Lấy địa chỉ người gửi mặc định
 */
function getDefaultFrom() {
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  if (user) {
    return `"Vietnam Journey" <${user}>`;
  }
  return '"Vietnam Journey" <noreply@vietnamjourney.com>';
}

/**
 * Kiểm tra kết nối SMTP
 */
async function verifySmtpConnection() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true, message: 'Kết nối máy chủ SMTP thành công!' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Gửi email chào mừng kèm mật khẩu tạm thời cho nhân sự mới
 */
async function sendWelcomeEmail({ to, fullName, role, tempPassword }) {
  const roleLabels = {
    super_admin: 'Quản trị viên cấp cao (Super Admin)',
    admin:       'Quản trị viên (Admin)',
    manager:     'Quản lý (Manager)',
    sales:       'Nhân viên Kinh doanh (Sales)',
    staff:       'Chuyên viên Tư vấn (Staff)',
    editor:      'Biên tập viên (Editor)',
    viewer:      'Xem báo cáo (Viewer)',
  };

  const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : 'https://tour-vietnam.vercel.app/login';

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chào mừng đến Touris CRM</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e,#0284c7);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;margin-bottom:16px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:2px;">VIETNAM JOURNEY CRM</span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:600;">Chào mừng bạn! 🎉</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Tài khoản quản trị của bạn đã được khởi tạo thành công</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#334155;font-size:16px;margin:0 0 20px;">
                Xin chào <strong>${fullName || 'Thành viên mới'}</strong>,
              </p>
              <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Quản trị viên đã tạo tài khoản quản trị cho bạn tại hệ thống <strong>Vietnam Journey (Touris Vietnam)</strong>.
                Dưới đây là thông tin đăng nhập cá nhân của bạn:
              </p>

              <!-- Credentials Box -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:120px;">Email đăng nhập</td>
                    <td style="padding:8px 0;color:#0f172a;font-size:15px;font-weight:600;">${to}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top:1px solid #e2e8f0;"></td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Mật khẩu tạm</td>
                    <td style="padding:8px 0;">
                      <span style="background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-family:monospace;font-size:18px;font-weight:700;padding:6px 14px;border-radius:8px;letter-spacing:2px;">${tempPassword}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top:1px solid #e2e8f0;"></td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Phân quyền</td>
                    <td style="padding:8px 0;">
                      <span style="background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:13px;font-weight:600;padding:4px 12px;border-radius:20px;">${roleLabels[role] || role}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Security Notice -->
              <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.5;">
                  ⚠️ <strong>Lưu ý bảo mật:</strong> Đây là mật khẩu khởi tạo ban đầu. Hệ thống sẽ yêu cầu bạn đổi sang mật khẩu bảo mật riêng ngay trong lần đầu đăng nhập.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0284c7);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.5px;">
                  Đăng nhập Cổng Quản Trị →
                </a>
              </div>

              <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
                Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ trực tiếp với Quản trị viên hệ thống.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Vietnam Journey · Nền tảng Du lịch 5 Sao & Quản trị Doanh nghiệp</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getDefaultFrom(),
      to,
      subject: `🔑 Thông tin tài khoản Vietnam Journey CRM — ${fullName || 'Nhân sự mới'}`,
      html,
    });
    console.log(`[SMTP] Email chào mừng đã được gửi thành công đến: ${to}`);
    return { success: true };
  } catch (err) {
    console.error('\n❌ Lỗi SMTP khi gửi email chào mừng:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Gửi email cấp lại mật khẩu tạm thời
 */
async function sendPasswordResetEmail({ to, fullName, tempPassword }) {
  const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : 'https://tour-vietnam.vercel.app/login';

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cấp lại Mật khẩu - Touris CRM</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e,#0284c7);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;margin-bottom:16px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:2px;">VIETNAM JOURNEY CRM</span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;">Cấp lại Mật khẩu 🔑</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Tài khoản của bạn vừa được cấp lại mật khẩu tạm thời</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#334155;font-size:16px;margin:0 0 20px;">
                Xin chào <strong>${fullName || 'Thành viên'}</strong>,
              </p>
              <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Quản trị viên hệ thống đã thực hiện đặt lại mật khẩu cho tài khoản <strong>${to}</strong>.
                Dưới đây là mật khẩu đăng nhập tạm thời mới của bạn:
              </p>

              <!-- Credentials Box -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:140px;">Mật khẩu mới</td>
                    <td style="padding:8px 0;">
                      <span style="background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-family:monospace;font-size:18px;font-weight:700;padding:6px 14px;border-radius:8px;letter-spacing:2px;">${tempPassword}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Warning -->
              <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.5;">
                  ⚠️ <strong>Lưu ý:</strong> Vui lòng sử dụng mật khẩu này để đăng nhập và tiến hành đổi mật khẩu cá nhân mới ngay sau khi đăng nhập.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0284c7);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.5px;">
                  Đăng nhập lại CRM →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Vietnam Journey CRM · Thông báo bảo mật hệ thống</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getDefaultFrom(),
      to,
      subject: `🔑 Thông báo cấp lại mật khẩu Vietnam Journey CRM — ${fullName || 'Nhân sự'}`,
      html,
    });
    console.log(`[SMTP] Email cấp lại mật khẩu đã gửi đến: ${to}`);
    return { success: true };
  } catch (err) {
    console.error('\n❌ Lỗi SMTP khi reset password:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Gửi email xác nhận đặt tour cho Du khách và Thông báo cho Đội ngũ tư vấn
 */
async function sendBookingConfirmationEmail({ to, fullName, phone, destination, departureDate, guests, serviceClass, message }) {
  if (!to || !to.includes('@')) {
    return { success: false, error: 'Email người nhận không hợp lệ' };
  }

  const destinationNames = {
    halong: 'Vịnh Hạ Long — Kỳ quan Thế giới',
    trangan: 'Tràng An Ninh Bình — Quần thể Danh thắng Di sản',
    sapa: 'Sa Pa Tây Bắc — Thiên đường Săn Mây & Ruộng Bậc Thang',
    hoian: 'Phố Cổ Hội An — Di sản Văn hóa & Đêm Hoa Đăng',
    danang: 'Đà Nẵng & Bà Nà Hills — Cầu Vàng & Biển Mỹ Khê',
    phuquoc: 'Đảo Ngọc Phú Quốc — Nghỉ dưỡng Biển Đẳng Cấp',
  };

  const destinationDisplay = destinationNames[destination?.toLowerCase()] || destination || 'Hành trình Việt Nam';

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận Yêu cầu Đặt Tour - Vietnam Journey</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;color:#334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
          
          <!-- Banner Header Luxury -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d4a3e,#134e4a,#042f2e);padding:40px;text-align:center;border-bottom:3px solid #d4af37;">
              <div style="display:inline-block;background:rgba(212,175,55,0.15);border:1px solid #d4af37;border-radius:20px;padding:6px 18px;margin-bottom:16px;">
                <span style="color:#d4af37;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">VIETNAM JOURNEY LUXURY</span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:0.5px;">XÁC NHẬN YÊU CẦU TƯ VẤN TOUR ✨</h1>
              <p style="color:#cbd5e1;margin:10px 0 0;font-size:14px;">Cảm ơn Quý khách đã lựa chọn trải nghiệm cùng Vietnam Journey</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#0f172a;font-size:16px;margin:0 0 16px;">
                Kính gửi <strong>${fullName}</strong>,
              </p>
              <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
                Hệ thống <strong>Vietnam Journey</strong> đã tiếp nhận thành công thông tin yêu cầu tư vấn hành trình du lịch của Quý khách. Chuyên viên tư vấn VVIP của chúng tôi đang hoàn thiện phương án lịch trình và sẽ liên hệ hỗ trợ trực tiếp trong vòng <strong>15 - 30 phút</strong>.
              </p>

              <!-- Booking Details Box -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:24px;margin-bottom:28px;">
                <div style="border-bottom:2px solid #0f766e;padding-bottom:8px;margin-bottom:16px;">
                  <span style="color:#0f766e;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Chi Tiết Hành Trình Đăng Ký</span>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;width:140px;">Điểm đến:</td>
                    <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;">${destinationDisplay}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;">Họ tên khách hàng:</td>
                    <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;">${fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;">Số điện thoại / Zalo:</td>
                    <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;">${phone || 'Chưa cung cấp'}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;">Số lượng khách:</td>
                    <td style="padding:8px 0;color:#0f172a;font-size:14px;"><strong>${guests || 1}</strong> khách</td>
                  </tr>
                  ${departureDate ? `
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;">Ngày dự kiến khởi hành:</td>
                    <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;">${departureDate}</td>
                  </tr>` : ''}
                  ${serviceClass ? `
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;">Hạng dịch vụ:</td>
                    <td style="padding:8px 0;color:#b45309;font-size:14px;font-weight:700;">${serviceClass}</td>
                  </tr>` : ''}
                  ${message ? `
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;vertical-align:top;">Ghi chú đặc biệt:</td>
                    <td style="padding:8px 0;color:#475569;font-size:13px;font-style:italic;">${message}</td>
                  </tr>` : ''}
                </table>
              </div>

              <!-- Guarantee Box -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px;margin-bottom:28px;">
                <p style="margin:0;color:#166534;font-size:13px;line-height:1.6;">
                  🌟 <strong>Cam kết dịch vụ 5 sao:</strong> Đội ngũ quản gia du lịch 24/7, xe đưa đón cao cấp, khách sạn & resort đối tác hàng đầu cùng bảo hiểm du lịch toàn diện cho mọi hành trình.
                </p>
              </div>

              <!-- Contact Box -->
              <p style="color:#64748b;font-size:13px;text-align:center;margin:0 0 8px;">
                Cần hỗ trợ gấp hoặc tư vấn khẩn cấp? Quý khách vui lòng liên hệ Hotline:
              </p>
              <p style="text-align:center;margin:0;font-size:18px;font-weight:800;color:#0f766e;letter-spacing:1px;">
                📞 1900 6868 · 0909 123 456
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:24px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;">
                © ${new Date().getFullYear()} Vietnam Journey — Nền Tảng Du Lịch & Nghỉ Dưỡng Thượng Lưu
              </p>
              <p style="color:#64748b;font-size:11px;margin:0;">
                Email này được gửi tự động từ hệ thống đặt tour trực tuyến.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getDefaultFrom(),
      to,
      subject: `🇻🇳 [Vietnam Journey] Xác nhận yêu cầu tư vấn tour: ${destinationDisplay} — ${fullName}`,
      html,
    });
    console.log(`[SMTP] Email xác nhận đặt tour đã gửi thành công đến: ${to}`);
    return { success: true };
  } catch (err) {
    console.error('\n❌ Lỗi SMTP khi gửi email xác nhận đặt tour:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getTransporter,
  getDefaultFrom,
  verifySmtpConnection,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail
};
