require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function resetImages() {
  try {
    console.log('Resetting image_url in destinations table to NULL so local WebP assets load cleanly...');
    await pool.query('UPDATE destinations SET image_url = NULL');
    const res = await pool.query('SELECT id, code, title, image_url FROM destinations ORDER BY id ASC');
    console.log('Updated destinations:', res.rows);
  } catch (err) {
    console.error('Error resetting destination images:', err);
  } finally {
    await pool.end();
  }
}

resetImages();
