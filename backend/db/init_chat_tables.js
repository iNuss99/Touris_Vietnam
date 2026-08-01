require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
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
