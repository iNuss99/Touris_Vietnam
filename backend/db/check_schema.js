require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'leads'").then(r => { console.table(r.rows); process.exit(); }).catch(e => { console.error(e); process.exit(1); });

