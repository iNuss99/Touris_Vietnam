const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
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
      process.env.JWT_SECRET, 
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
};

const changePassword = async (req, res) => {
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
};

module.exports = {
  login,
  changePassword
};
