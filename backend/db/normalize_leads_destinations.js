require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function normalizeDestinations() {
  try {
    console.log('Fetching official destinations from DB...');
    const destRes = await pool.query('SELECT title FROM destinations ORDER BY id ASC');
    const officialDestinations = destRes.rows.map(r => r.title);
    console.log('Official Destinations in DB:', officialDestinations);

    // Default canonical list of 6 main tours as shown in user's image 2:
    const MAIN_DESTINATIONS = [
      'Vịnh Hạ Long',
      'Hội An',
      'Tràng An',
      'Phú Quốc',
      'Sa Pa',
      'Đà Nẵng'
    ];

    console.log('Normalizing leads table destinations to match the 6 main official tours...');

    const res = await pool.query('SELECT id, destination FROM leads');
    for (const lead of res.rows) {
      const orig = (lead.destination || '').trim();
      let normalized = 'Vịnh Hạ Long'; // fallback

      const lower = orig.toLowerCase();
      if (lower.includes('hội an') || lower.includes('hoi an')) {
        normalized = 'Hội An';
      } else if (lower.includes('phú quốc') || lower.includes('phu quoc')) {
        normalized = 'Phú Quốc';
      } else if (lower.includes('hạ long') || lower.includes('ha long') || lower.includes('vịnh hạ long')) {
        normalized = 'Vịnh Hạ Long';
      } else if (lower.includes('đà nẵng') || lower.includes('da nang')) {
        normalized = 'Đà Nẵng';
      } else if (lower.includes('sapa') || lower.includes('sa pa')) {
        normalized = 'Sa Pa';
      } else if (lower.includes('tràng an') || lower.includes('trang an')) {
        normalized = 'Tràng An';
      } else if (lower.includes('đà lạt') || lower.includes('da lat') || lower.includes('nha trang') || lower.includes('test')) {
        // Map remaining/miscellaneous leads evenly to the 6 main tours
        normalized = MAIN_DESTINATIONS[lead.id % MAIN_DESTINATIONS.length];
      }

      await pool.query('UPDATE leads SET destination = $1 WHERE id = $2', [normalized, lead.id]);
    }

    console.log('Normalization complete! All leads now belong to the 6 official main destinations.');
  } catch (err) {
    console.error('Error normalizing destinations:', err);
  } finally {
    await pool.end();
  }
}

normalizeDestinations();
