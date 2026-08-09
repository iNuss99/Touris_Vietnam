require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").then(r => { console.table(r.rows); process.exit(); }).catch(e => { console.error(e); process.exit(1); });

