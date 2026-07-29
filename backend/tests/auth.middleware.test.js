const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { authMiddleware, requireRole } = require('../src/middlewares/auth.middleware');

// Set a dummy JWT secret for testing environment
process.env.JWT_SECRET = 'test-secret-key-12345';

test('authMiddleware - return 401 if no Authorization header provided', () => {
  let statusCode = null;
  let jsonResponse = null;

  const req = { headers: {} };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      jsonResponse = body;
      return this;
    }
  };
  const next = () => {
    assert.fail('next() should not be called');
  };

  authMiddleware(req, res, next);

  assert.equal(statusCode, 401);
  assert.equal(jsonResponse.success, false);
  assert.equal(jsonResponse.error, 'Unauthorized');
});

test('authMiddleware - return 401 for invalid Bearer token', () => {
  let statusCode = null;
  let jsonResponse = null;

  const req = { headers: { authorization: 'Bearer invalid-token-string' } };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      jsonResponse = body;
      return this;
    }
  };
  const next = () => {
    assert.fail('next() should not be called');
  };

  authMiddleware(req, res, next);

  assert.equal(statusCode, 401);
  assert.equal(jsonResponse.success, false);
  assert.equal(jsonResponse.error, 'Invalid token');
});

test('authMiddleware - calls next() and sets req.user for valid token', () => {
  let nextCalled = false;
  const payload = { id: 1, email: 'admin@touris.vn', role: 'admin' };
  const validToken = jwt.sign(payload, process.env.JWT_SECRET);

  const req = { headers: { authorization: `Bearer ${validToken}` } };
  const res = {};
  const next = () => {
    nextCalled = true;
  };

  authMiddleware(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, payload.id);
  assert.equal(req.user.email, payload.email);
  assert.equal(req.user.role, payload.role);
});

test('requireRole - return 403 when user role is not authorized', () => {
  let statusCode = null;
  let jsonResponse = null;

  const middleware = requireRole('admin', 'ceo');
  const req = { user: { role: 'user' } };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      jsonResponse = body;
      return this;
    }
  };
  const next = () => {
    assert.fail('next() should not be called');
  };

  middleware(req, res, next);

  assert.equal(statusCode, 403);
  assert.equal(jsonResponse.success, false);
  assert.equal(jsonResponse.error, 'Forbidden');
});

test('requireRole - calls next() when user role matches allowed roles', () => {
  let nextCalled = false;

  const middleware = requireRole('admin', 'ceo');
  const req = { user: { role: 'admin' } };
  const res = {};
  const next = () => {
    nextCalled = true;
  };

  middleware(req, res, next);

  assert.equal(nextCalled, true);
});
