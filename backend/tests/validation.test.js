require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'touris_vietnam_jwt_secret_key_2026_fallback';
const {
  validateLogin,
  validateChangePassword,
  validateCreateLead,
  validateLeadStatus,
  validateCreateUser,
  validateUserRole,
  validateUserStatus
} = require('../src/middlewares/validation.middleware');

function createMockContext(body = {}) {
  let statusCode = 200;
  let jsonResponse = null;
  let nextCalled = false;

  const req = { body };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    }
  };
  const next = () => {
    nextCalled = true;
  };

  return {
    req,
    res,
    next,
    get statusCode() { return statusCode; },
    get jsonResponse() { return jsonResponse; },
    get nextCalled() { return nextCalled; }
  };
}

test('Validation Middleware - validateLogin flags invalid emails and missing passwords', () => {
  // 1. Invalid email
  const ctx1 = createMockContext({ email: 'bad-email', password: '123' });
  validateLogin(ctx1.req, ctx1.res, ctx1.next);
  assert.equal(ctx1.statusCode, 400);
  assert.equal(ctx1.jsonResponse.error, 'Email không đúng định dạng');
  assert.equal(ctx1.nextCalled, false);

  // 2. Missing password
  const ctx2 = createMockContext({ email: 'admin@tour.vn', password: '' });
  validateLogin(ctx2.req, ctx2.res, ctx2.next);
  assert.equal(ctx2.statusCode, 400);
  assert.equal(ctx2.jsonResponse.error, 'Vui lòng nhập mật khẩu');
  assert.equal(ctx2.nextCalled, false);

  // 3. Valid login
  const ctx3 = createMockContext({ email: 'admin@tour.vn', password: 'admin123' });
  validateLogin(ctx3.req, ctx3.res, ctx3.next);
  assert.equal(ctx3.nextCalled, true);
});

test('Validation Middleware - validateChangePassword requires minimum 8 characters', () => {
  // Short password
  const ctx1 = createMockContext({ newPassword: '123' });
  validateChangePassword(ctx1.req, ctx1.res, ctx1.next);
  assert.equal(ctx1.statusCode, 400);
  assert.equal(ctx1.nextCalled, false);

  // Valid password
  const ctx2 = createMockContext({ newPassword: 'securePassword123' });
  validateChangePassword(ctx2.req, ctx2.res, ctx2.next);
  assert.equal(ctx2.nextCalled, true);
});

test('Validation Middleware - validateCreateLead validates phone, email, and guest counts', () => {
  // Invalid phone format
  const ctx1 = createMockContext({ zalo: '123' });
  validateCreateLead(ctx1.req, ctx1.res, ctx1.next);
  assert.equal(ctx1.statusCode, 400);
  assert.equal(ctx1.jsonResponse.error, 'Số điện thoại/Zalo không hợp lệ');

  // Invalid guests format
  const ctx2 = createMockContext({ guests: -5 });
  validateCreateLead(ctx2.req, ctx2.res, ctx2.next);
  assert.equal(ctx2.statusCode, 400);
  assert.equal(ctx2.jsonResponse.error, 'Số lượng khách phải là số nguyên dương');

  // Valid lead input
  const ctx3 = createMockContext({
    fullName: 'Nguyen Van A',
    zalo: '0912345678',
    email: 'client@example.com',
    guests: 4
  });
  validateCreateLead(ctx3.req, ctx3.res, ctx3.next);
  assert.equal(ctx3.nextCalled, true);
});

test('Validation Middleware - validateLeadStatus ensures valid lifecycle transitions', () => {
  // Invalid status
  const ctx1 = createMockContext({ status: 'RANDOM_STATUS' });
  validateLeadStatus(ctx1.req, ctx1.res, ctx1.next);
  assert.equal(ctx1.statusCode, 400);
  assert.equal(ctx1.jsonResponse.error, 'Trạng thái lead không hợp lệ');

  // Valid status
  const ctx2 = createMockContext({ status: 'CONVERTED' });
  validateLeadStatus(ctx2.req, ctx2.res, ctx2.next);
  assert.equal(ctx2.nextCalled, true);
});

test('Validation Middleware - validateCreateUser and validateUserRole enforce RBAC matrix', () => {
  // Invalid role
  const ctx1 = createMockContext({ email: 'new@tour.vn', full_name: 'Staff', role: 'hacker' });
  validateCreateUser(ctx1.req, ctx1.res, ctx1.next);
  assert.equal(ctx1.statusCode, 400);
  assert.ok(ctx1.jsonResponse.error.includes('Vai trò không hợp lệ'));

  // Valid user creation
  const ctx2 = createMockContext({ email: 'new@tour.vn', full_name: 'Staff Member', role: 'sales' });
  validateCreateUser(ctx2.req, ctx2.res, ctx2.next);
  assert.equal(ctx2.nextCalled, true);

  // Role validation
  const ctx3 = createMockContext({ role: 'super_admin' });
  validateUserRole(ctx3.req, ctx3.res, ctx3.next);
  assert.equal(ctx3.nextCalled, true);
});

test('Validation Middleware - validateUserStatus checks allowed status values', () => {
  const ctx1 = createMockContext({ status: 'deleted' });
  validateUserStatus(ctx1.req, ctx1.res, ctx1.next);
  assert.equal(ctx1.statusCode, 400);

  const ctx2 = createMockContext({ status: 'active' });
  validateUserStatus(ctx2.req, ctx2.res, ctx2.next);
  assert.equal(ctx2.nextCalled, true);
});

test('Token Lifecycle - Verify & Refresh Token endpoints', async () => {
  const token = jwt.sign(
    { role: 'super_admin', email: 'admin@tour.vn', id: 1, name: 'Quản trị viên' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 1. GET /api/verify-token
  const verifyRes = await fetch('http://localhost:5000/api/verify-token', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const verifyData = await verifyRes.json();
  assert.equal(verifyRes.status, 200);
  assert.equal(verifyData.success, true);
  assert.equal(verifyData.user.email, 'admin@tour.vn');

  // 2. POST /api/refresh-token
  const refreshRes = await fetch('http://localhost:5000/api/refresh-token', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const refreshData = await refreshRes.json();
  assert.equal(refreshRes.status, 200);
  assert.equal(refreshData.success, true);
  assert.ok(refreshData.token);
});
