const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
pool.query("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'leads'").then(r => { console.table(r.rows); process.exit(); }).catch(e => { console.error(e); process.exit(1); });
