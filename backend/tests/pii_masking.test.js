const test = require('node:test');
const assert = require('node:assert/strict');

// Function under test: maskPII
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

test('TDD - PII Masking: Standard 10-digit phone and email', () => {
  const lead = {
    full_name: 'Tran Thi B',
    phone: '0987654321',
    email: 'tranthib@gmail.com'
  };
  const masked = maskPII(lead);
  assert.equal(masked.phone, '***-***-4321');
  assert.equal(masked.email, 'tr***@gmail.com');
  assert.equal(masked.full_name, 'Tran Thi B');
});

test('TDD - PII Masking: Short email username and missing phone', () => {
  const lead = {
    full_name: 'Le C',
    phone: '123',
    email: 'ab@domain.vn'
  };
  const masked = maskPII(lead);
  assert.equal(masked.phone, '***-***-****');
  assert.equal(masked.email, '***@domain.vn');
});

test('TDD - PII Masking: Empty or non-provided details', () => {
  const lead = {
    full_name: 'Khach Vang Lai',
    phone: null,
    email: null
  };
  const masked = maskPII(lead);
  assert.equal(masked.phone, '***-***-****');
  assert.equal(masked.email, '***@***.***');
});
