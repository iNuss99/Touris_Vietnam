require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


async function createLeadsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        destination VARCHAR(255),
        departure_date VARCHAR(50),
        guests INTEGER,
        service_class VARCHAR(100),
        message TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Leads table created successfully.');
  } catch (err) {
    console.error('Error creating leads table:', err);
  } finally {
    await pool.end();
  }
}

createLeadsTable();
