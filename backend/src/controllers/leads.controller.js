const pool = require('../config/db');
const { logAuditEvent } = require('../services/audit_service');

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

/**
 * Che dấu PII (SĐT, Email) cho role Editor và Viewer
 */
function maskPII(lead) {
  let maskedPhone = lead.phone;
  if (maskedPhone && maskedPhone !== 'Chưa cung cấp' && maskedPhone.length >= 6) {
    maskedPhone = '***-***-' + maskedPhone.slice(-4);
  } else {
    maskedPhone = '***-***-****';
  }

  let maskedEmail = lead.email;
  if (maskedEmail && maskedEmail !== 'Chưa cung cấp' && maskedEmail.includes('@')) {
    const [local, domain] = maskedEmail.split('@');
    const maskedLocal = local.length > 2 ? local.slice(0, 2) + '***' : '***';
    maskedEmail = `${maskedLocal}@${domain}`;
  } else {
    maskedEmail = '***@***.***';
  }

  return {
    ...lead,
    phone: maskedPhone,
    email: maskedEmail
  };
}

const getLeads = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let query = 'SELECT * FROM leads ORDER BY submitted_at DESC';
    let values = [];

    // Tầng DB Filtering: Sales chỉ được xem Lead phân công cho mình hoặc chưa gán
    if (userRole === 'sales') {
      query = 'SELECT * FROM leads WHERE assigned_to = $1 OR assigned_to IS NULL ORDER BY submitted_at DESC';
      values = [userId];
    }

    const result = await pool.query(query, values);

    const leads = result.rows.map(lead => {
      let processedLead = lead;
      if (!lead.score || lead.score === 0 || !lead.grade) {
        const { score, grade, estimatedValue } = calculateLeadScoreAndGrade({
          phone: lead.phone,
          email: lead.email,
          guests: lead.guests,
          serviceClass: lead.service_class,
          departureDate: lead.departure_date,
          message: lead.message
        });
        processedLead = {
          ...lead,
          score,
          grade,
          estimated_value: lead.estimated_value && String(lead.estimated_value) !== '0' ? lead.estimated_value : estimatedValue
        };
      }

      // Ẩn PII thông tin cá nhân khách hàng cho Editor và Viewer
      if (userRole === 'editor' || userRole === 'viewer') {
        return maskPII(processedLead);
      }

      return processedLead;
    });

    res.json(leads);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createLead = async (req, res) => {
  const body = req.body || {};
  const fullName = body.fullName || body.full_name || body.name || body.customer_name;
  const phone = body.zalo || body.phone || body.phone_number || body.sdt;
  const email = body.email;
  const destination = body.destination || body.tour_destination || body.diem_den;
  const date = body.date || body.departure_date || body.departureDate || body.ngay_di;
  const guests = body.guests || body.num_guests || body.guest_count || body.so_luong;
  const serviceClass = body.serviceClass || body.service_class || body.hang_dich_vu;
  const message = body.message || body.note || body.notes || body.loi_nhan;
  const source = body.source || (body.chatTranscript || body.chat_transcript ? 'chatbox' : 'website');
  const chatTranscript = body.chatTranscript || body.chat_transcript || body.transcript;

  try {
    const safeFullName = fullName || "Khách hàng";
    const safePhone = phone || "Chưa cung cấp";
    const safeEmail = email || "Chưa cung cấp";
    const safeSource = source || "website";
    const safeTranscript = chatTranscript || null;
    
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
      INSERT INTO leads (full_name, phone, email, destination, departure_date, guests, service_class, message, score, grade, estimated_value, source, chat_transcript)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [safeFullName, safePhone, safeEmail, destination, date, parsedGuests, serviceClass, message, score, grade, estimatedValue, safeSource, safeTranscript];
    const result = await pool.query(query, values);

    // Ghi Audit Log cho hệ thống
    await logAuditEvent({
      actorId: 0,
      actorEmail: safeSource === 'chatbox' ? 'bot.gemma4@website.public' : 'system@website.public',
      action: safeSource === 'chatbox' ? 'CREATE_LEAD_CHATBOX' : 'CREATE_LEAD_WEB',
      resourceType: 'LEAD',
      resourceId: result.rows[0].id,
      afterValue: { full_name: safeFullName, destination, source: safeSource }
    });

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

  // Normalize status value
  let normStatus = String(status).toUpperCase().trim();
  if (normStatus === 'THÀNH CÔNG' || normStatus === 'CHỐT' || normStatus === 'SUCCESS') normStatus = 'CONVERTED';
  else if (normStatus === 'ĐANG XỬ LÝ' || normStatus === 'ĐANG ĐÀM PHÁN') normStatus = 'IN_PROGRESS';
  else if (normStatus === 'MỚI') normStatus = 'NEW';
  else if (normStatus === 'HỦY BỎ' || normStatus === 'HỦY') normStatus = 'LOST';

  try {
    const existing = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const oldLead = existing.rows[0];

    const result = await pool.query(
      'UPDATE leads SET status = $1 WHERE id = $2 RETURNING *',
      [normStatus, id]
    );
    
    // Ghi Audit Log append-only
    await logAuditEvent({
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: 'UPDATE_LEAD_STATUS',
      resourceType: 'LEAD',
      resourceId: id,
      beforeValue: { status: oldLead.status },
      afterValue: { status: normStatus }
    });

    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error('Error updating lead status:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

/**
 * Editor Đề xuất đổi trạng thái (Lead Flagging)
 */
const createLeadFlag = async (req, res) => {
  const { id } = req.params;
  const { proposedStatus, reason } = req.body;

  if (!proposedStatus) {
    return res.status(400).json({ success: false, error: 'proposedStatus là bắt buộc.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lead_flags (lead_id, editor_id, editor_name, proposed_status, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, req.user.id, req.user.name || req.user.email, proposedStatus, reason || '']
    );

    // Audit Log cho đề xuất của Editor
    await logAuditEvent({
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: 'PROPOSE_LEAD_STATUS_FLAG',
      resourceType: 'LEAD_FLAG',
      resourceId: result.rows[0].id,
      afterValue: { lead_id: id, proposed_status: proposedStatus, reason }
    });

    res.status(201).json({ success: true, flag: result.rows[0] });
  } catch (err) {
    console.error('Error creating lead flag:', err);
    res.status(500).json({ success: false, error: 'Lỗi tạo đề xuất đổi trạng thái.' });
  }
};

/**
 * Danh sách đề xuất đổi trạng thái
 */
const getLeadFlags = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lead_flags ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching lead flags:', err);
    res.status(500).json({ success: false, error: 'Lỗi tải danh sách đề xuất.' });
  }
};

module.exports = {
  getLeads,
  createLead,
  updateLeadStatus,
  createLeadFlag,
  getLeadFlags
};
