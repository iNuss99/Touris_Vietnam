const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/email_service');

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
    
    let emailSent = false;
    let emailError = null;
    try {
      const mailRes = await sendWelcomeEmail({
        to: email,
        fullName: full_name,
        role: role,
        tempPassword: tempPassword
      });
      emailSent = !!mailRes?.success;
      if (mailRes && !mailRes.success) emailError = mailRes.error;
    } catch (emailErr) {
      console.error('Lỗi gửi email chào mừng:', emailErr);
      emailError = emailErr.message;
    }

    res.status(201).json({ 
      success: true, 
      user: newUser, 
      tempPassword, 
      emailSent, 
      emailError 
    });
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

const resetUserPassword = async (req, res) => {
  const { id } = req.params;
  try {
    const userResult = await pool.query('SELECT id, email, full_name FROM admins WHERE id=$1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Người dùng không tồn tại' });
    }

    const targetUser = userResult.rows[0];
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await pool.query(
      'UPDATE admins SET password_hash=$1, must_change_password=true WHERE id=$2',
      [hashedPassword, id]
    );

    let emailSent = false;
    let emailError = null;
    try {
      const mailRes = await sendPasswordResetEmail({
        to: targetUser.email,
        fullName: targetUser.full_name,
        tempPassword
      });
      emailSent = !!mailRes?.success;
      if (mailRes && !mailRes.success) emailError = mailRes.error;
    } catch (emailErr) {
      console.error('Lỗi gửi email cấp lại mật khẩu:', emailErr);
      emailError = emailErr.message;
    }

    res.json({
      success: true,
      message: 'Cấp lại mật khẩu thành công',
      tempPassword,
      email: targetUser.email,
      full_name: targetUser.full_name,
      emailSent,
      emailError
    });
  } catch (err) {
    console.error('Lỗi cấp lại mật khẩu:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  resetUserPassword
};
