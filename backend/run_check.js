const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});
client.connect().then(() => client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = ''public''')).then(res => { console.log('Tables:', res.rows.map(r => r.table_name)); client.end(); }).catch(e => console.error(e));
