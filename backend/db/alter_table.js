require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

client.connect()
  .then(() => client.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'NEW'"))
  .then(res => {
    console.log('Status column added');
    client.end();
  })
  .catch(e => {
    console.error(e);
    client.end();
  });

