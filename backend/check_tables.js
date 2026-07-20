const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").then(r => { console.table(r.rows); process.exit(); }).catch(e => { console.error(e); process.exit(1); });
