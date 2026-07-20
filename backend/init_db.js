require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        price VARCHAR(100),
        unit VARCHAR(50),
        duration VARCHAR(100),
        features JSONB,
        is_popular BOOLEAN DEFAULT false
      );
    `);
    console.log('Tours table created successfully.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        code VARCHAR(100) UNIQUE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        rating VARCHAR(50),
        duration VARCHAR(100),
        location VARCHAR(255),
        description TEXT,
        badge VARCHAR(100),
        about TEXT,
        best_time VARCHAR(255),
        cuisine VARCHAR(255),
        local_highlights JSONB,
        itinerary JSONB,
        tour_name VARCHAR(255),
        tour_price VARCHAR(100),
        tour_includes JSONB,
        tour_highlights JSONB
      );
    `);
    console.log('Destinations table created successfully.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        destination VARCHAR(255),
        departure_date VARCHAR(50),
        guests INTEGER,
        service_class VARCHAR(100),
        message TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Leads table created successfully.');

    // We can seed data here if needed, but for now we just create the schema.
    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await pool.end();
  }
}

initDB();
