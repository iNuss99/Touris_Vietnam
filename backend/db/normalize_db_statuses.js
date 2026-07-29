require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function normalizeDbStatuses() {
  try {
    console.log('Normalizing lead status values in PostgreSQL database...');
    
    await pool.query(`
      UPDATE leads SET status = 'CONVERTED' WHERE UPPER(status) IN ('THÀNH CÔNG', 'CHỐT', 'SUCCESS', 'CLOSED');
    `);
    await pool.query(`
      UPDATE leads SET status = 'IN_PROGRESS' WHERE UPPER(status) IN ('ĐANG ĐÀM PHÁN', 'ĐANG XỬ LÝ', 'IN PROGRESS');
    `);
    await pool.query(`
      UPDATE leads SET status = 'NEW' WHERE UPPER(status) IN ('MỚI');
    `);
    await pool.query(`
      UPDATE leads SET status = 'LOST' WHERE UPPER(status) IN ('HỦY BỎ', 'HỦY', 'CANCELLED');
    `);

    const statusRes = await pool.query('SELECT status, COUNT(*) FROM leads GROUP BY status');
    console.log('Normalized Status counts:', statusRes.rows);
  } catch (err) {
    console.error('Error normalizing statuses:', err);
  } finally {
    await pool.end();
  }
}

normalizeDbStatuses();
