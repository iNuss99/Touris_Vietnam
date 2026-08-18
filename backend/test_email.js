require('dotenv').config();
const { verifySmtpConnection, sendWelcomeEmail } = require('./src/services/email_service');

(async () => {
  console.log('\n========================================');
  console.log('🔍 KIỂM TRA CHẨN ĐOÁN KẾT NỐI SMTP GỬI MAIL');
  console.log('========================================\n');

  console.log('1. Kiểm tra biến môi trường:');
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const hasPass = !!(process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS);
  const host = process.env.SMTP_HOST || 'Gmail Service';
  const port = process.env.SMTP_PORT || 'Default (465/587)';

  console.log(`   - SMTP Host: ${host}`);
  console.log(`   - SMTP Port: ${port}`);
  console.log(`   - SMTP User/Email: ${user || '(Chưa cấu hình)'}`);
  console.log(`   - SMTP Password / App Password: ${hasPass ? '****** (Đã cấu hình)' : '(Chưa cấu hình)'}\n`);

  if (!user || !hasPass) {
    console.log('⚠️ CẢNH BÁO: Chưa tìm thấy thông tin xác thực SMTP trong file .env');
    console.log('👉 Hướng dẫn cấu hình:');
    console.log('   Mở file backend/.env và thêm:');
    console.log('   GMAIL_USER=your_email@gmail.com');
    console.log('   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx (Mật khẩu ứng dụng 16 ký tự của Google)\n');
    return;
  }

  console.log('2. Đang kết nối và xác thực máy chủ SMTP...');
  const verifyRes = await verifySmtpConnection();

  if (!verifyRes.success) {
    console.error('❌ XÁC THỰC THẤT BẠI:', verifyRes.error);
    console.log('\n💡 Gợi ý xử lý:');
    console.log('   1. Đảm bảo tài khoản Google đã bật "Xác minh 2 bước" (2-Step Verification).');
    console.log('   2. Truy cập: https://myaccount.google.com/apppasswords');
    console.log('   3. Tạo mật khẩu ứng dụng mới (App Password), copy 16 ký tự vào GMAIL_APP_PASSWORD.');
    return;
  }

  console.log('✅ ' + verifyRes.message);

  console.log('\n3. Thử nghiệm gửi email mẫu đến:', user);
  const sendRes = await sendWelcomeEmail({
    to: user,
    fullName: 'Quản Trị Viên (Test)',
    role: 'super_admin',
    tempPassword: 'VN' + Math.random().toString(36).slice(-6).toUpperCase()
  });

  if (sendRes.success) {
    console.log('\n🎉 THÀNH CÔNG: Email test đã được gửi đến hòm thư ' + user);
  } else {
    console.error('\n❌ GỬI MAIL THẤT BẠI:', sendRes.error);
  }
})();
