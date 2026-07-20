require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ap7OnRLFjZ8q@ep-dark-firefly-azj7ve04-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

// API Get Tours
app.get('/api/tours', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tours ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// API Get Destinations
app.get('/api/destinations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM destinations ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Sync lead to Google Sheet (CRM)
const syncToGoogleSheet = async (leadData) => {
  const sheetUrl = process.env.GOOGLE_SHEETS_URL;
  if (!sheetUrl) {
    console.warn('Warning: GOOGLE_SHEETS_URL is not configured in backend .env');
    return;
  }
  
  try {
    const payload = {
      fullName: leadData.fullName,
      zalo: leadData.zalo,
      email: leadData.email,
      destination: leadData.destination,
      date: leadData.date,
      guests: leadData.guests,
      serviceClass: leadData.serviceClass,
      message: leadData.message,
      submittedAt: new Date().toLocaleString('vi-VN')
    };

    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    
    // fetch with mode 'no-cors' (if from browser) is opaque, but from Node it works fine and can be checked
    // Note: Google Apps Script Web App might return a redirect (302) which fetch follows automatically
    if (!response.ok) {
      console.warn(`Google Sheet sync warning: status ${response.status} - check if URL is correct and deployed properly.`);
    } else {
      console.log('Successfully synced lead to Google Sheets CRM.');
    }
  } catch (error) {
    console.error('Failed to sync lead to Google Sheets:', error.message);
  }
};

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
    
    // Gửi đồng bộ sang Google Sheet bất đồng bộ
    syncToGoogleSheet({ fullName: safeFullName, zalo: safePhone, email: safeEmail, destination, date, guests, serviceClass, message }).catch(err => {
      console.error('Async Google Sheet sync error:', err);
    });

    res.status(201).json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error('Error inserting lead:', err);
    res.status(500).json({ success: false, error: 'Failed to save lead data' });
  }
});

// Get all leads
app.get('/api/leads', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY submitted_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a lead's status
app.put('/api/leads/:id/status', async (req, res) => {
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

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
}

module.exports = app;
