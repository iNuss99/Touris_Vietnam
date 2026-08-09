require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});


async function migrate() {
  try {
    // 1. Xóa các tài khoản thừa
    const del = await pool.query("DELETE FROM admins WHERE email != 'admin@tour.vn' RETURNING email");
    console.log('Deleted accounts:', del.rows.map(r => r.email));

    // 2. Set role super_admin cho admin@tour.vn
    await pool.query("UPDATE admins SET role = 'super_admin', status = 'active' WHERE email = 'admin@tour.vn'");
    console.log('Set super_admin role for admin@tour.vn');

    // 3. Verify
    const result = await pool.query('SELECT id, email, role, status FROM admins');
    console.table(result.rows);
    console.log('Migration complete.');
  } catch (e) {
    console.error('Migration error:', e);
  } finally {
    await pool.end();
  }
}

migrate();
