/**
 * Centralized Schema Validation Middleware
 * Validates request bodies against business rules and schemas.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;
const VALID_ROLES = ['super_admin', 'sales', 'editor', 'viewer'];
const VALID_USER_STATUSES = ['active', 'inactive', 'suspended'];
const VALID_LEAD_STATUSES = ['NEW', 'IN_PROGRESS', 'CONVERTED', 'LOST', 'MỚI', 'ĐANG ĐÀM PHÁN', 'ĐANG XỬ LÝ', 'THÀNH CÔNG', 'CHỐT', 'HỦY', 'HỦY BỎ'];

const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Email không đúng định dạng' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập mật khẩu' });
  }

  next();
};

const validateChangePassword = (req, res, next) => {
  const { newPassword } = req.body || {};

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' });
  }

  next();
};

const validateCreateLead = (req, res, next) => {
  const { fullName, zalo, email, guests } = req.body || {};

  if (email && typeof email === 'string' && email.trim() !== '' && email !== 'Chưa cung cấp') {
    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Email không đúng định dạng' });
    }
  }

  if (zalo && typeof zalo === 'string' && zalo.trim() !== '' && zalo !== 'Chưa cung cấp') {
    if (!PHONE_REGEX.test(zalo.trim())) {
      return res.status(400).json({ success: false, error: 'Số điện thoại/Zalo không hợp lệ' });
    }
  }

  if (guests !== undefined && guests !== null && guests !== '') {
    const num = parseInt(guests, 10);
    if (isNaN(num) || num <= 0) {
      return res.status(400).json({ success: false, error: 'Số lượng khách phải là số nguyên dương' });
    }
  }

  next();
};

const validateLeadStatus = (req, res, next) => {
  const { status } = req.body || {};

  if (!status || typeof status !== 'string' || status.trim() === '') {
    return res.status(400).json({ success: false, error: 'Trạng thái (status) là bắt buộc' });
  }

  const normalized = status.toUpperCase().trim();
  if (!VALID_LEAD_STATUSES.map(s => s.toUpperCase()).includes(normalized)) {
    return res.status(400).json({ success: false, error: 'Trạng thái lead không hợp lệ' });
  }

  next();
};

const validateCreateUser = (req, res, next) => {
  const { email, full_name, role } = req.body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Email không đúng định dạng' });
  }

  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Họ và tên phải có ít nhất 2 ký tự' });
  }

  if (!role || typeof role !== 'string' || !VALID_ROLES.includes(role.toLowerCase().trim())) {
    return res.status(400).json({ success: false, error: `Vai trò không hợp lệ. Cho phép: ${VALID_ROLES.join(', ')}` });
  }

  next();
};

const validateUserRole = (req, res, next) => {
  const { role } = req.body || {};

  if (!role || typeof role !== 'string' || !VALID_ROLES.includes(role.toLowerCase().trim())) {
    return res.status(400).json({ success: false, error: `Vai trò không hợp lệ. Cho phép: ${VALID_ROLES.join(', ')}` });
  }

  next();
};

const validateUserStatus = (req, res, next) => {
  const { status } = req.body || {};

  if (!status || typeof status !== 'string' || !VALID_USER_STATUSES.includes(status.toLowerCase().trim())) {
    return res.status(400).json({ success: false, error: `Trạng thái không hợp lệ. Cho phép: ${VALID_USER_STATUSES.join(', ')}` });
  }

  next();
};

module.exports = {
  validateLogin,
  validateChangePassword,
  validateCreateLead,
  validateLeadStatus,
  validateCreateUser,
  validateUserRole,
  validateUserStatus
};
