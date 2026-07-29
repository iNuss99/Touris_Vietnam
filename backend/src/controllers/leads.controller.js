const pool = require('../config/db');

const getLeads = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY submitted_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createLead = async (req, res) => {
  const { fullName, zalo, email, destination, date, guests, serviceClass, message } = req.body;
  try {
    const query = `
      INSERT INTO leads (full_name, phone, email, destination, departure_date, guests, service_class, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    // Đảm bảo dữ liệu không bị lỗi NOT NULL
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
};

const updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }

  // Normalize status value to standard uppercase key
  let normStatus = String(status).toUpperCase().trim();
  if (normStatus === 'THÀNH CÔNG' || normStatus === 'CHỐT' || normStatus === 'SUCCESS') normStatus = 'CONVERTED';
  else if (normStatus === 'ĐANG XỬ LÝ' || normStatus === 'ĐANG ĐÀM PHÁN') normStatus = 'IN_PROGRESS';
  else if (normStatus === 'MỚI') normStatus = 'NEW';
  else if (normStatus === 'HỦY BỎ' || normStatus === 'HỦY') normStatus = 'LOST';

  try {
    const result = await pool.query(
      'UPDATE leads SET status = $1 WHERE id = $2 RETURNING *',
      [normStatus, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    
    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error('Error updating lead status:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  getLeads,
  createLead,
  updateLeadStatus
};
