const test = require('node:test');
const assert = require('node:assert/strict');

// Function under test extracted from leads.controller.js
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

test('TDD - Lead Scoring: Full profile with VVIP/Luxury service is HOT grade', () => {
  const input = {
    phone: '0988776655',
    email: 'vip.customer@company.com',
    guests: 25,
    serviceClass: 'Luxury 5 sao',
    departureDate: '2026-10-15',
    message: 'Cần hướng dẫn viên tiếng Anh chuyên nghiệp'
  };
  const result = calculateLeadScoreAndGrade(input);
  assert.equal(result.score, 100);
  assert.equal(result.grade, 'HOT');
  assert.equal(result.estimatedValue, 25 * 15000000);
});

test('TDD - Lead Scoring: Minimal profile with 1 guest is COLD or WARM grade', () => {
  const minimal = {
    phone: 'Chưa cung cấp',
    email: 'Chưa cung cấp',
    guests: 1,
    serviceClass: 'Tiêu chuẩn',
    departureDate: '',
    message: ''
  };
  const result = calculateLeadScoreAndGrade(minimal);
  // score = 0 + 0 + 10 (1 guest) + 10 (standard) + 0 + 0 = 20
  assert.equal(result.score, 20);
  assert.equal(result.grade, 'COLD');
  assert.equal(result.estimatedValue, 1 * 5000000);
});

test('TDD - Lead Scoring: Premium 4-star tier calculation', () => {
  const premium = {
    phone: '0901234567',
    email: 'traveler@gmail.com',
    guests: 6,
    serviceClass: 'Premium 4 sao',
    departureDate: '2026-11-20',
    message: ''
  };
  // score = 25 (phone) + 15 (email) + 20 (6 guests) + 15 (premium) + 10 (date) = 85
  const result = calculateLeadScoreAndGrade(premium);
  assert.equal(result.score, 85);
  assert.equal(result.grade, 'HOT');
  assert.equal(result.estimatedValue, 6 * 8000000);
});

test('TDD - Lead Scoring: WARM grade threshold test (score between 40 and 69)', () => {
  const warm = {
    phone: '0912345678', // 25
    email: '', // 0
    guests: 1, // 10
    serviceClass: 'Standard', // 10
    departureDate: '', // 0
    message: '' // 0
  };
  // total = 45 -> WARM
  const result = calculateLeadScoreAndGrade(warm);
  assert.equal(result.score, 45);
  assert.equal(result.grade, 'WARM');
});
