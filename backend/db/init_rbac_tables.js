require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


async function initRbacTables() {
  try {
    console.log('[RBAC Migration] Starting database RBAC schema update...');

    // 1. Add assigned_to column to leads table
    await pool.query(`
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS assigned_to INTEGER;
    `);
    console.log('[RBAC Migration] Added assigned_to column to leads table.');

    // 2. Create lead_flags table for Editor status proposals
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lead_flags (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        editor_id INTEGER NOT NULL,
        editor_name VARCHAR(255),
        proposed_status VARCHAR(100) NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[RBAC Migration] Created lead_flags table.');

    // 3. Create audit_logs table (Append-Only)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actor_id INTEGER NOT NULL,
        actor_email VARCHAR(255),
        acting_as_id INTEGER,
        acting_as_role VARCHAR(100),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        resource_id VARCHAR(100),
        before_value JSONB,
        after_value JSONB
      );
    `);
    console.log('[RBAC Migration] Created audit_logs table.');

    console.log('[RBAC Migration] Database RBAC schema migration completed successfully.');
  } catch (err) {
    console.error('[RBAC Migration] Error updating schema:', err.message);
  } finally {
    await pool.end();
  }
}

initRbacTables();
