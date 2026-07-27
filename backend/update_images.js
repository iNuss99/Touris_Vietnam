const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    await pool.query("UPDATE tours SET image_url = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80' WHERE id = 1");
    await pool.query("UPDATE tours SET image_url = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80' WHERE id = 2");
    await pool.query("UPDATE tours SET image_url = 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80' WHERE id = 3");
    console.log('Images updated successfully');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
