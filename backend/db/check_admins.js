require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admins' ORDER BY ordinal_position").then(r => { console.table(r.rows); return pool.query('SELECT id, email FROM admins'); }).then(r => { console.table(r.rows); process.exit(); }).catch(e => { console.error(e); process.exit(1); });

