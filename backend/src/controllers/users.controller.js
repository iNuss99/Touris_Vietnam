const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../services/email_service');

const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, full_name as name, role, status FROM admins ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createUser = async (req, res) => {
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
};

const updateUser = async (req, res) => {
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
};

const updateUserRole = async (req, res) => {
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
};

const updateUserStatus = async (req, res) => {
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
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM admins WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser
};
