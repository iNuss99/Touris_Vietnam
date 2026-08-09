import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

// Import translation data directly
import translationsData from '../../frontend/src/i18n/translations.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


async function syncData() {
  try {
    const viTranslations = translationsData.vi;
    const tours = viTranslations.tourPackages.packages;
    const destinations = viTranslations.destinations.items;

    console.log(`Found ${tours.length} tours and ${destinations.length} destinations to sync.`);

    // Check if tables already have data
    const toursCheck = await pool.query('SELECT COUNT(*) FROM tours');
    if (parseInt(toursCheck.rows[0].count) === 0) {
      console.log('Syncing tours...');
      for (const tour of tours) {
        await pool.query(
          `INSERT INTO tours (name, subtitle, price, unit, duration, features, is_popular) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            tour.name,
            tour.subtitle,
            tour.price,
            tour.unit,
            tour.duration,
            JSON.stringify(tour.features),
            tour.name === 'Signature' || tour.name === 'Prestige' // logic based on frontend popular tag logic, but lets assume none or hardcode based on translation popularTag, let's just make one popular for now or based on index. In frontend it was meta[1].popular = true.
          ]
        );
      }
      // Update is_popular based on frontend logic: index 1 was popular
      await pool.query(`UPDATE tours SET is_popular = true WHERE id = 2`);
      console.log('Tours synced successfully.');
    } else {
      console.log('Tours table already has data, skipping sync.');
    }

    const destsCheck = await pool.query('SELECT COUNT(*) FROM destinations');
    if (parseInt(destsCheck.rows[0].count) === 0) {
      console.log('Syncing destinations...');
      for (const dest of destinations) {
        await pool.query(
          `INSERT INTO destinations (
            code, title, category, rating, duration, location, description, badge, 
            about, best_time, cuisine, local_highlights, itinerary, 
            tour_name, tour_price, tour_includes, tour_highlights
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            dest.id,
            dest.title,
            dest.category,
            dest.rating,
            dest.duration,
            dest.location,
            dest.description,
            dest.badge,
            dest.about,
            dest.bestTime,
            dest.cuisine,
            JSON.stringify(dest.localHighlights),
            JSON.stringify(dest.tour.itinerary),
            dest.tour.tourName,
            `${dest.tour.price} ${dest.tour.pricePer}`,
            JSON.stringify(dest.tour.includes),
            JSON.stringify(dest.tour.highlights)
          ]
        );
      }
      console.log('Destinations synced successfully.');
    } else {
      console.log('Destinations table already has data, skipping sync.');
    }

  } catch (err) {
    console.error('Error syncing data:', err);
  } finally {
    await pool.end();
  }
}

syncData();
