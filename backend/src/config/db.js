const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not defined in environment variables.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/touris_vietnam',
});

module.exports = pool;
