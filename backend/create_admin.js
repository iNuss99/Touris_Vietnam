require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function createAdmin() {
  try {
    // 1. Tạo bảng admins nếu chưa có
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Đã kiểm tra/tạo bảng admins thành công.');

    // 2. Kiểm tra xem tài khoản admin mặc định đã tồn tại chưa
    const checkRes = await pool.query('SELECT * FROM admins WHERE email = $1', ['admin@tour.vn']);
    if (checkRes.rows.length > 0) {
      console.log('Tài khoản admin@tour.vn đã tồn tại, tiến hành cập nhật mật khẩu.');
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      
      await pool.query('UPDATE admins SET password_hash = $1 WHERE email = $2', [hash, 'admin@tour.vn']);
      console.log('Đã cập nhật mật khẩu cho admin@tour.vn thành công.');
    } else {
      console.log('Đang tạo mới tài khoản admin@tour.vn...');
      
      // Băm mật khẩu (Hashing)
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      
      // Chèn vào DB
      await pool.query('INSERT INTO admins (email, password_hash) VALUES ($1, $2)', ['admin@tour.vn', hash]);
      console.log('Đã tạo tài khoản admin@tour.vn thành công.');
    }

  } catch (err) {
    console.error('Lỗi khi thao tác với Database:', err);
  } finally {
    await pool.end();
  }
}

createAdmin();
