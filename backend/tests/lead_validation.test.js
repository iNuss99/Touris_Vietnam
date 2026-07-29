const test = require('node:test');
const assert = require('node:assert/strict');

// Function under test: Lead form input validator
function validateLeadInput(data) {
  const errors = [];
  if (!data.full_name || typeof data.full_name !== 'string' || data.full_name.trim().length === 0) {
    errors.push('Họ tên không được để trống');
  }
  if (!data.phone || typeof data.phone !== 'string' || !/^(0|\+84)[0-9]{9,10}$/.test(data.phone.trim())) {
    errors.push('Số điện thoại không hợp lệ');
  }
  if (data.email && typeof data.email === 'string' && data.email.trim() !== '') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.push('Email không đúng định dạng');
    }
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

test('TDD - validateLeadInput returns valid for correct input', () => {
  const input = {
    full_name: 'Nguyen Van A',
    phone: '0912345678',
    email: 'test@example.com'
  };
  const result = validateLeadInput(input);
  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
});

test('TDD - validateLeadInput flags empty full_name and invalid phone format', () => {
  const input = {
    full_name: '   ',
    phone: '12345',
    email: 'bad-email'
  };
  const result = validateLeadInput(input);
  assert.equal(result.isValid, false);
  assert.equal(result.errors.length, 3);
  assert.ok(result.errors.includes('Họ tên không được để trống'));
  assert.ok(result.errors.includes('Số điện thoại không hợp lệ'));
  assert.ok(result.errors.includes('Email không đúng định dạng'));
});
