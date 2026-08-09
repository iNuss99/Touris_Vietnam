require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


async function initChatColumns() {
  try {
    console.log('[Chat Migration] Adding source and chat_transcript columns to leads table...');

    await pool.query(`
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'website',
      ADD COLUMN IF NOT EXISTS chat_transcript TEXT;
    `);

    console.log('[Chat Migration] Successfully updated leads table schema.');
  } catch (err) {
    console.error('[Chat Migration] Error updating schema:', err.message);
  } finally {
    await pool.end();
  }
}

initChatColumns();
