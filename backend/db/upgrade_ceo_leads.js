require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function upgradeCeoLeads() {
  try {
    console.log('Migrating leads table schema for CEO Analytics...');
    await pool.query(`
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'MỚI',
      ADD COLUMN IF NOT EXISTS estimated_value BIGINT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS win_probability INTEGER DEFAULT 50;
    `);
    console.log('Columns added successfully.');

    // Check count
    const res = await pool.query('SELECT COUNT(*) FROM leads');
    const count = parseInt(res.rows[0].count, 10);
    console.log(`Current leads count: ${count}`);

    // Update existing records with default estimated_value if 0 or null
    await pool.query(`
      UPDATE leads 
      SET estimated_value = CASE 
        WHEN guests > 0 THEN guests * 15000000 
        ELSE 25000000 
      END,
      win_probability = CASE
        WHEN status = 'THÀNH CÔNG' THEN 100
        WHEN status = 'CHỜ KÝ HỢP ĐỒNG' THEN 90
        WHEN status = 'ĐANG ĐÀM PHÁN' THEN 75
        ELSE 50
      END
      WHERE estimated_value IS NULL OR estimated_value = 0;
    `);

    // Seed B2B high-value leads if total leads < 5
    if (count < 5) {
      console.log('Seeding additional high-value enterprise leads for CEO Dashboard...');
      const sampleLeads = [
        {
          full_name: 'Tập đoàn Dược phẩm XYZ',
          phone: '0901234567',
          email: 'contact@xyzpharm.vn',
          destination: 'Đà Nẵng - Hội An 4N3Đ',
          departure_date: '2026-08-15',
          guests: 120,
          service_class: 'VVIP (5 sao)',
          message: 'Tổ chức Teambuilding cho 120 nhân sự cấp cao',
          status: 'CHỜ KÝ HỢP ĐỒNG',
          estimated_value: 1800000000,
          win_probability: 95
        },
        {
          full_name: 'Đoàn khách Châu Âu (Công ty ABC)',
          phone: '0912345678',
          email: 'booking@abc-corp.com',
          destination: 'Hạ Long - Sapa 5N4Đ',
          departure_date: '2026-09-01',
          guests: 45,
          service_class: 'Thương gia (4 sao)',
          message: 'Đoàn chuyên gia nước ngoài khảo sát',
          status: 'ĐANG ĐÀM PHÁN',
          estimated_value: 850000000,
          win_probability: 80
        },
        {
          full_name: 'Tổng Công ty FPT Partner',
          phone: '0987654321',
          email: 'event@fpt-partner.vn',
          destination: 'Phú Quốc Resort 3N2Đ',
          departure_date: '2026-08-20',
          guests: 80,
          service_class: 'VVIP (5 sao)',
          message: 'Sự kiện Gala Dinner kết hợp nghỉ dưỡng',
          status: 'THÀNH CÔNG',
          estimated_value: 1200000000,
          win_probability: 100
        },
        {
          full_name: 'Khách hàng VIP Nguyễn Văn A',
          phone: '0933445566',
          email: 'nguyenvana@gmail.com',
          destination: 'Nha Trang Luxury 4N3Đ',
          departure_date: '2026-08-10',
          guests: 10,
          service_class: 'Gia đình VIP',
          message: 'Nghỉ dưỡng gia đình riêng biệt',
          status: 'KHẢO SÁT',
          estimated_value: 200000000,
          win_probability: 40
        }
      ];

      for (const l of sampleLeads) {
        await pool.query(`
          INSERT INTO leads (full_name, phone, email, destination, departure_date, guests, service_class, message, status, estimated_value, win_probability)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [l.full_name, l.phone, l.email, l.destination, l.departure_date, l.guests, l.service_class, l.message, l.status, l.estimated_value, l.win_probability]);
      }
    }

    console.log('Migration and seeding completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

upgradeCeoLeads();
