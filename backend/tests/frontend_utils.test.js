const test = require('node:test');
const assert = require('node:assert/strict');

// Function under test: normalizeStatus (mirrors SharedUI.jsx)
function normalizeStatus(status) {
  if (!status) return 'NEW';
  const s = String(status).toUpperCase().trim();
  if (s === 'CONVERTED' || s === 'THÀNH CÔNG' || s === 'SUCCESS' || s === 'CHỐT') return 'CONVERTED';
  if (s === 'IN_PROGRESS' || s === 'ĐANG ĐÀM PHÁN' || s === 'ĐANG XỬ LÝ' || s === 'IN PROGRESS') return 'IN_PROGRESS';
  if (s === 'LOST' || s === 'HỦY BỎ' || s === 'HỦY' || s === 'CANCELLED') return 'LOST';
  return 'NEW';
}

test('normalizeStatus - maps CONVERTED variations correctly', () => {
  assert.equal(normalizeStatus('CONVERTED'), 'CONVERTED');
  assert.equal(normalizeStatus('thành công'), 'CONVERTED');
  assert.equal(normalizeStatus('SUCCESS'), 'CONVERTED');
  assert.equal(normalizeStatus('chốt'), 'CONVERTED');
});

test('normalizeStatus - maps IN_PROGRESS variations correctly', () => {
  assert.equal(normalizeStatus('IN_PROGRESS'), 'IN_PROGRESS');
  assert.equal(normalizeStatus('đang đàm phán'), 'IN_PROGRESS');
  assert.equal(normalizeStatus('ĐANG XỬ LÝ'), 'IN_PROGRESS');
  assert.equal(normalizeStatus('In Progress'), 'IN_PROGRESS');
});

test('normalizeStatus - maps LOST variations correctly', () => {
  assert.equal(normalizeStatus('LOST'), 'LOST');
  assert.equal(normalizeStatus('hủy bỏ'), 'LOST');
  assert.equal(normalizeStatus('HỦY'), 'LOST');
  assert.equal(normalizeStatus('cancelled'), 'LOST');
});

test('normalizeStatus - handles null, undefined, empty, and unknown values', () => {
  assert.equal(normalizeStatus(null), 'NEW');
  assert.equal(normalizeStatus(undefined), 'NEW');
  assert.equal(normalizeStatus(''), 'NEW');
  assert.equal(normalizeStatus('  '), 'NEW');
  assert.equal(normalizeStatus('UNKNOWN_STATUS_XYZ'), 'NEW');
});
