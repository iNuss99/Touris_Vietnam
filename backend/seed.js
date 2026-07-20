const { Pool } = require('pg'); const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' });
const seed = async () => {
  const check = await pool.query('SELECT COUNT(*) FROM leads');
  if (parseInt(check.rows[0].count) > 0) { console.log('Data exists'); return pool.end(); }
  await pool.query(INSERT INTO leads(full_name, phone, email, destination, departure_date, guests, service_class, message, status) VALUES
    ('Minh Khoa', '0901234567', 'khoa@example.com', 'Sapa', '2026-08-10', 2, 'luxury', 'Mong muốn ở khách sạn 5 sao', 'NEW'),
    ('Nguyễn Văn A', '0987654321', 'vana@example.com', 'Ha Long', '2026-07-20', 4, 'standard', '', 'IN_PROGRESS'),
    ('Trần Thị B', '0912345678', 'thib@example.com', 'Da Nang', '2026-09-05', 3, 'luxury', 'Có trẻ em đi cùng', 'CONVERTED'),
    ('Lê Văn C', '0933333333', 'vanc@example.com', 'Phu Quoc', '2026-10-15', 2, 'economy', 'Gói tiết kiệm', 'LOST'),
    ('Phạm Thị D', '0944444444', 'thid@example.com', 'Hoi An', '2026-08-25', 5, 'luxury', 'Du lịch gia đình', 'NEW'));
  console.log('Seeded data'); pool.end();
}; seed();
