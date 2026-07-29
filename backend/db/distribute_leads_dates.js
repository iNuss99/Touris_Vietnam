require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function distributeLeadsDates() {
  try {
    console.log('Distributing 126 real customer leads across 2026 with balanced statuses...');

    const res = await pool.query('SELECT id, guests, destination FROM leads ORDER BY id ASC');
    const leads = res.rows;

    // Cycle statuses so EVERY month has CONVERTED, IN_PROGRESS, and NEW
    const statuses = ['CONVERTED', 'IN_PROGRESS', 'CONVERTED', 'IN_PROGRESS', 'NEW'];
    
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      
      // Distribute month between Jan (0) and July (6) of 2026
      // Make the last 15 leads fall on recent days (July 25 - July 29, 2026)
      let month = i % 7; // 0..6 (Jan..Jul)
      let day;
      if (i >= leads.length - 15) {
        month = 6; // July
        day = 25 + (i % 5); // 25, 26, 27, 28, 29 July 2026
      } else {
        day = Math.floor(Math.random() * 25) + 1;
      }
      const hour = Math.floor(Math.random() * 12) + 8;
      const minute = Math.floor(Math.random() * 59);

      // Construct timestamp in 2026
      const monthStr = (month + 1) < 10 ? '0' + (month + 1) : '' + (month + 1);
      const dayStr = day < 10 ? '0' + day : '' + day;
      const dateStr = `2026-${monthStr}-${dayStr} ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}:00`;

      // Status assignment: alternate CONVERTED, IN_PROGRESS, NEW
      const status = statuses[i % statuses.length];

      // Estimated value calculation
      let guestNum = parseInt(lead.guests, 10);
      if (isNaN(guestNum) || guestNum <= 0) guestNum = Math.floor(Math.random() * 10) + 2;

      let basePrice = 12000000; // 12 Triệu default
      const destLower = (lead.destination || '').toLowerCase();
      if (destLower.includes('phú quốc') || destLower.includes('châu âu') || destLower.includes('thương gia')) {
        basePrice = 25000000;
      } else if (destLower.includes('hạ long') || destLower.includes('sapa') || destLower.includes('đà nẵng')) {
        basePrice = 15000000;
      }

      const estimated_value = guestNum * basePrice;
      const win_prob = status === 'CONVERTED' ? 100 : status === 'IN_PROGRESS' ? 75 : 40;

      await pool.query(`
        UPDATE leads 
        SET 
          submitted_at = $1::timestamp,
          status = $2,
          estimated_value = $3,
          win_probability = $4
        WHERE id = $5
      `, [dateStr, status, estimated_value, win_prob, lead.id]);
    }

    console.log('Successfully updated 126 real customer leads with balanced statuses!');
  } catch (err) {
    console.error('Error distributing leads:', err);
  } finally {
    await pool.end();
  }
}

distributeLeadsDates();
