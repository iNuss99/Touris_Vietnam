const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Gửi email chào mừng kèm mật khẩu tạm thời
 */
async function sendWelcomeEmail({ to, fullName, role, tempPassword }) {
  const roleLabels = {
    super_admin: 'Quản trị viên cấp cao',
    sales:       'Nhân viên Kinh doanh',
    editor:      'Biên tập viên',
    viewer:      'Xem báo cáo',
  };

  const loginUrl = process.env.FRONTEND_URL || 'https://tour-vietnam.vercel.app/login';

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
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:2px;">TOURIS CRM</span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:600;">Chào mừng bạn! 🎉</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Tài khoản của bạn đã được tạo thành công</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#334155;font-size:16px;margin:0 0 24px;">
                Xin chào <strong>${fullName}</strong>,
              </p>
              <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 28px;">
                Quản trị viên đã tạo tài khoản CRM cho bạn tại hệ thống <strong>Touris Vietnam</strong>.
                Dưới đây là thông tin đăng nhập của bạn:
              </p>

              <!-- Credentials Box -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:28px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:120px;">Email</td>
                    <td style="padding:8px 0;color:#0f172a;font-size:15px;font-weight:500;">${to}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top:1px solid #e2e8f0;"></td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Mật khẩu</td>
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

              <!-- Warning -->
              <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.5;">
                  ⚠️ <strong>Lưu ý bảo mật:</strong> Đây là mật khẩu tạm thời. Bạn sẽ được yêu cầu đổi mật khẩu ngay sau lần đăng nhập đầu tiên.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0284c7);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.5px;">
                  Đăng nhập ngay →
                </a>
              </div>

              <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
                Nếu bạn không yêu cầu tài khoản này, vui lòng bỏ qua email này hoặc liên hệ quản trị viên.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Touris Vietnam CRM · Được gửi tự động, vui lòng không reply</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Touris Vietnam CRM" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🔑 Thông tin đăng nhập Touris CRM — ${fullName}`,
      html,
    });
    console.log(`[SMTP] Email đã được gửi thành công đến ${to}`);
  } catch (err) {
    console.error('\n❌ Lỗi Gmail SMTP:', err.message);
    console.log('🔄 Đang tự động chuyển sang dùng Ethereal Email (Môi trường giả lập) để gửi test...');
    
    try {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        from: '"Touris Vietnam CRM (DEV)" <no-reply@touris.vn>',
        to,
        subject: `[TEST] 🔑 Thông tin đăng nhập Touris CRM — ${fullName}`,
        html,
      });

      console.log('✅ Email Test đã gửi thành công!');
      console.log('=> 🌟 XEM EMAIL TẠI ĐÂY:', nodemailer.getTestMessageUrl(info));
      console.log('-----------------------------------------------------\n');
    } catch (testErr) {
      console.error('Lỗi Ethereal:', testErr);
      throw err;
    }
  }
}

module.exports = { sendWelcomeEmail };
