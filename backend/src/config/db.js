const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error("FATAL ERROR: DATABASE_URL is not defined in environment variables.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
