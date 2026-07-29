require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function inspectLeads() {
  try {
    const statusRes = await pool.query('SELECT status, COUNT(*) FROM leads GROUP BY status');
    console.log('Status counts:', statusRes.rows);

    const datesRes = await pool.query('SELECT MIN(submitted_at), MAX(submitted_at), COUNT(*) FROM leads');
    console.log('Date range:', datesRes.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

inspectLeads();
