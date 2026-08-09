require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});


async function testConnection() {
  try {
    await client.connect();
    console.log('Connected to Neon successfully!');
    const res = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('Tables in database:', res.rows);
  } catch (err) {
    console.error('Connection error', err.stack);
  } finally {
    await client.end();
  }
}

testConnection();
