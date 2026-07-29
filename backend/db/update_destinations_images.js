require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

const DESTINATION_IMAGES = {
  'halong': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
  'hoian': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
  'trangan': 'https://images.unsplash.com/photo-1596401057633-531022261759?auto=format&fit=crop&w=800&q=80',
  'phuquoc': 'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=800&q=80',
  'sapa': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
  'danang': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'
};

const TOUR_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80'
];

async function updateImages() {
  try {
    console.log('Updating destination images...');
    for (const [code, url] of Object.entries(DESTINATION_IMAGES)) {
      await pool.query('UPDATE destinations SET image_url = $1 WHERE code = $2 OR LOWER(title) LIKE $3', [
        url, code, `%${code}%`
      ]);
    }

    // Update specific destination titles
    await pool.query("UPDATE destinations SET image_url = $1 WHERE title LIKE '%Hạ Long%'", [DESTINATION_IMAGES['halong']]);
    await pool.query("UPDATE destinations SET image_url = $1 WHERE title LIKE '%Hội An%'", [DESTINATION_IMAGES['hoian']]);
    await pool.query("UPDATE destinations SET image_url = $1 WHERE title LIKE '%Tràng An%'", [DESTINATION_IMAGES['trangan']]);
    await pool.query("UPDATE destinations SET image_url = $1 WHERE title LIKE '%Phú Quốc%'", [DESTINATION_IMAGES['phuquoc']]);
    await pool.query("UPDATE destinations SET image_url = $1 WHERE title LIKE '%Sa Pa%' OR title LIKE '%Sapa%'", [DESTINATION_IMAGES['sapa']]);
    await pool.query("UPDATE destinations SET image_url = $1 WHERE title LIKE '%Đà Nẵng%'", [DESTINATION_IMAGES['danang']]);

    console.log('Updating tour images...');
    const toursRes = await pool.query('SELECT id FROM tours ORDER BY id ASC');
    for (let i = 0; i < toursRes.rows.length; i++) {
      const tourId = toursRes.rows[i].id;
      const imageUrl = TOUR_IMAGES[i % TOUR_IMAGES.length];
      await pool.query('UPDATE tours SET image_url = $1 WHERE id = $2', [imageUrl, tourId]);
    }

    console.log('All destination & tour images updated successfully in PostgreSQL Neon DB!');
  } catch (err) {
    console.error('Error updating images:', err);
  } finally {
    await pool.end();
  }
}

updateImages();
