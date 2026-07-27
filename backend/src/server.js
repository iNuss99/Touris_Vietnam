require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { handleChat } = require('./services/chat_service');
const { sendWelcomeEmail } = require('./services/email_service');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Trong môi trường thực tế, nên giới hạn domain cụ thể
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

// Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'touris_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
  };
};

// API Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập email và mật khẩu' });
  }

  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const token = jwt.sign(
      { 
        role: user.role, 
        email: user.email, 
        id: user.id,
        name: user.full_name
      }, 
      process.env.JWT_SECRET || 'touris_secret_key', 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      success: true, 
      token,
      role: user.role,
      name: user.full_name,
      must_change_password: user.must_change_password
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// API Change Password
app.put('/api/change-password', authMiddleware, async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.id;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE admins SET password_hash = $1, must_change_password = false WHERE id = $2',
      [hashedPassword, userId]
    );
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('Lỗi đổi mật khẩu:', err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// =============================================
// TOURS (public GET, protected POST/PUT/DELETE)
// =============================================

app.get('/api/tours', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tours ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/tours', authMiddleware, requireRole('editor', 'super_admin'), async (req, res) => {
  const { title, name, location, subtitle, price, unit, duration, description, features, is_popular, image_url } = req.body;
  const tourName = title || name;
  const tourSubtitle = location || subtitle;
  const tourFeatures = description ? [description] : features;
  try {
    const result = await pool.query(
      'INSERT INTO tours (name, subtitle, price, unit, duration, features, is_popular, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [tourName, tourSubtitle, price, unit, duration, JSON.stringify(tourFeatures || []), is_popular ? true : false, image_url]
    );
    res.status(201).json({ success: true, tour: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});
app.put('/api/tours/:id', authMiddleware, requireRole('editor', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  const { title, name, location, subtitle, price, unit, duration, description, features, is_popular, image_url } = req.body;
  const tourName = title || name;
  const tourSubtitle = location || subtitle;
  const tourFeatures = description ? [description] : features;
  try {
    const result = await pool.query(
      'UPDATE tours SET name=$1, subtitle=$2, price=$3, unit=$4, duration=$5, features=$6, is_popular=$7, image_url=$8 WHERE id=$9 RETURNING *',
      [tourName, tourSubtitle, price, unit, duration, JSON.stringify(tourFeatures || []), is_popular ? true : false, image_url, id]
    );
    res.json({ success: true, tour: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});
app.delete('/api/tours/:id', authMiddleware, requireRole('editor', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tours WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// =============================================
// DESTINATIONS (public GET, protected POST/PUT/DELETE)
// =============================================

app.get('/api/destinations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM destinations ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/destinations', authMiddleware, requireRole('editor', 'super_admin'), async (req, res) => {
  const { title, category, rating, duration, location, description, badge, tour_price, image_url } = req.body;
  const code = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '') : 'newdest';
  try {
    const result = await pool.query(
      'INSERT INTO destinations (code, title, category, rating, duration, location, description, badge, tour_price, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [code, title, category, rating, duration, location, description, badge, tour_price, image_url]
    );
    res.status(201).json({ success: true, destination: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});
app.put('/api/destinations/:id', authMiddleware, requireRole('editor', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  const { title, category, rating, duration, location, description, badge, tour_price, image_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE destinations SET title=$1, category=$2, rating=$3, duration=$4, location=$5, description=$6, badge=$7, tour_price=$8, image_url=$9 WHERE id=$10 RETURNING *',
      [title, category, rating, duration, location, description, badge, tour_price, image_url, id]
    );
    res.json({ success: true, destination: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});
app.delete('/api/destinations/:id', authMiddleware, requireRole('editor', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM destinations WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// =============================================
// USERS (protected super_admin)
// =============================================

app.get('/api/users', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, full_name as name, role, status FROM admins ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users', authMiddleware, requireRole('super_admin'), async (req, res) => {
  const { email, full_name, role } = req.body;
  
  if (!email || !full_name || !role) {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ thông tin' });
  }

  try {
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const result = await pool.query(
      'INSERT INTO admins (email, full_name, role, password_hash, must_change_password, status) VALUES ($1, $2, $3, $4, true, $5) RETURNING id, email, full_name as name, role, status',
      [email, full_name, role, hashedPassword, 'active']
    );
    
    const newUser = result.rows[0];
    
    try {
      await sendWelcomeEmail({
        to: email,
        fullName: full_name,
        role: role,
        tempPassword: tempPassword
      });
    } catch (emailErr) {
      console.error('Lỗi gửi email chào mừng:', emailErr);
    }

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error('Lỗi tạo user:', err);
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ success: false, error: 'Email này đã tồn tại trong hệ thống' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

app.put('/api/users/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params;
  const { name, role, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE admins SET full_name=$1, role=$2, status=$3 WHERE id=$4 RETURNING id, email, full_name as name, role, status',
      [name, role, status, id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Lỗi cập nhật user:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

app.put('/api/users/:id/role', authMiddleware, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const result = await pool.query(
      'UPDATE admins SET role=$1 WHERE id=$2 RETURNING id, email, full_name as name, role, status',
      [role, id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Lỗi cập nhật quyền user:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

app.put('/api/users/:id/status', authMiddleware, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE admins SET status=$1 WHERE id=$2 RETURNING id, email, full_name as name, role, status',
      [status, id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái user:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

app.delete('/api/users/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM admins WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Google Sheets sync removed per user request

// Add a new lead from the contact form or chatbot
app.post('/api/leads', async (req, res) => {
  const { fullName, zalo, email, destination, date, guests, serviceClass, message } = req.body;
  try {
    const query = `
      INSERT INTO leads (full_name, phone, email, destination, departure_date, guests, service_class, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    // Đảm bảo dữ liệu không bị lỗi NOT NULL hoặc lỗi kiểu dữ liệu (Botpress có thể gửi null/undefined)
    const safeFullName = fullName || "Khách hàng";
    const safePhone = zalo || "Chưa cung cấp";
    const safeEmail = email || "Chưa cung cấp";
    
    let parsedGuests = null;
    if (guests) {
      const parsed = parseInt(guests, 10);
      if (!isNaN(parsed)) {
        parsedGuests = parsed;
      }
    }

    const values = [safeFullName, safePhone, safeEmail, destination, date, parsedGuests, serviceClass, message];
    const result = await pool.query(query, values);

    res.status(201).json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error('Error inserting lead:', err);
    res.status(500).json({ success: false, error: 'Failed to save lead data' });
  }
});

// Get all leads
app.get('/api/leads', authMiddleware, requireRole('sales', 'super_admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY submitted_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a lead's status
app.put('/api/leads/:id/status', authMiddleware, requireRole('sales', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE leads SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    
    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error('Error updating lead status:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// API Chat with Gemini
app.post('/api/chat', async (req, res) => {
  const { history } = req.body;
  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ success: false, error: 'Lịch sử chat không hợp lệ' });
  }

  try {
    const reply = await handleChat(history);
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Chat API Error:', err);
    res.status(500).json({ success: false, error: 'Lỗi khi xử lý tin nhắn' });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
}

module.exports = app;
