const pool = require('../config/db');

/**
 * Tự động tính toán Điểm tiềm năng (Score), Phân loại (Grade) & Giá trị ước tính (Estimated Value)
 */
function calculateLeadScoreAndGrade({ phone, email, guests, serviceClass, departureDate, message }) {
  let score = 0;

  // 1. Điện thoại / Zalo (25đ)
  if (phone && phone !== 'Chưa cung cấp' && phone.trim().length >= 8) {
    score += 25;
  }

  // 2. Email (15đ)
  if (email && email !== 'Chưa cung cấp' && email.includes('@')) {
    score += 15;
  }

  // 3. Quy mô đoàn / Số khách (tối đa 25đ)
  const numGuests = parseInt(guests, 10) || 1;
  if (numGuests >= 20) {
    score += 25;
  } else if (numGuests >= 5) {
    score += 20;
  } else if (numGuests >= 2) {
    score += 15;
  } else {
    score += 10;
  }

  // 4. Hạng dịch vụ (tối đa 20đ)
  const sClass = (serviceClass || '').toLowerCase();
  let pricePerGuest = 5000000;
  if (sClass.includes('luxury') || sClass.includes('vvip') || sClass.includes('5 sao')) {
    score += 20;
    pricePerGuest = 15000000;
  } else if (sClass.includes('premium') || sClass.includes('thương gia') || sClass.includes('4 sao')) {
    score += 15;
    pricePerGuest = 8000000;
  } else {
    score += 10;
  }

  // 5. Ngày khởi hành (10đ)
  if (departureDate && String(departureDate).trim() !== '') {
    score += 10;
  }

  // 6. Lời nhắn (5đ)
  if (message && String(message).trim() !== '') {
    score += 5;
  }

  score = Math.min(score, 100);

  let grade = 'COLD';
  if (score >= 70) {
    grade = 'HOT';
  } else if (score >= 40) {
    grade = 'WARM';
  }

  const estimatedValue = numGuests * pricePerGuest;

  return { score, grade, estimatedValue };
}

const getLeads = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY submitted_at DESC');
    const leads = result.rows.map(lead => {
      if (!lead.score || lead.score === 0 || !lead.grade) {
        const { score, grade, estimatedValue } = calculateLeadScoreAndGrade({
          phone: lead.phone,
          email: lead.email,
          guests: lead.guests,
          serviceClass: lead.service_class,
          departureDate: lead.departure_date,
          message: lead.message
        });
        return {
          ...lead,
          score,
          grade,
          estimated_value: lead.estimated_value && String(lead.estimated_value) !== '0' ? lead.estimated_value : estimatedValue
        };
      }
      return lead;
    });
    res.json(leads);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createLead = async (req, res) => {
  const { fullName, zalo, email, destination, date, guests, serviceClass, message } = req.body;
  try {
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

    const { score, grade, estimatedValue } = calculateLeadScoreAndGrade({
      phone: safePhone,
      email: safeEmail,
      guests: parsedGuests,
      serviceClass,
      departureDate: date,
      message
    });

    const query = `
      INSERT INTO leads (full_name, phone, email, destination, departure_date, guests, service_class, message, score, grade, estimated_value)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [safeFullName, safePhone, safeEmail, destination, date, parsedGuests, serviceClass, message, score, grade, estimatedValue];
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
