const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

/**
 * Middleware kiểm tra quyền sở hữu Lead
 * Super Admin: Toàn quyền
 * Sales: Chỉ có quyền sửa Lead chưa phân công hoặc gán cho chính mình
 */
const checkLeadOwnership = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  if (req.user.role === 'super_admin') {
    return next();
  }
  if (req.user.role === 'sales') {
    const leadId = req.params.id;
    try {
      const result = await pool.query('SELECT id, assigned_to FROM leads WHERE id = $1', [leadId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Lead không tồn tại.' });
      }
      const lead = result.rows[0];
      if (lead.assigned_to && Number(lead.assigned_to) !== Number(req.user.id)) {
        return res.status(403).json({ success: false, error: 'Bạn chỉ có thể cập nhật Lead được phân công cho chính mình.' });
      }
      return next();
    } catch (err) {
      console.error('[RBAC Check Error]', err.message);
      return res.status(500).json({ success: false, error: 'Lỗi kiểm tra quyền sở hữu Lead.' });
    }
  }
  return res.status(403).json({ success: false, error: 'Role không có quyền chỉnh sửa trạng thái Lead.' });
};

module.exports = {
  authMiddleware,
  requireRole,
  checkLeadOwnership
};
