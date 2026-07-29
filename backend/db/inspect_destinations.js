require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function inspectDestinations() {
  try {
    const res = await pool.query('SELECT id, code, title, image_url FROM destinations ORDER BY id ASC');
    console.log('Destinations in DB:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

inspectDestinations();
