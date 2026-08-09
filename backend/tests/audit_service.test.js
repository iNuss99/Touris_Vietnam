const test = require('node:test');
const assert = require('node:assert/strict');
const { logAuditEvent } = require('../src/services/audit_service');

test('auditService - skips logging when required parameters are missing', async () => {
  let warnCalled = false;
  const originalWarn = console.warn;
  console.warn = (...args) => {
    warnCalled = true;
  };

  try {
    // Missing actorId, action, resourceType
    await logAuditEvent({ actorId: null, action: 'CREATE', resourceType: 'LEAD' });
    assert.equal(warnCalled, true, 'console.warn should be called when actorId is missing');

    warnCalled = false;
    await logAuditEvent({ actorId: 1, action: null, resourceType: 'LEAD' });
    assert.equal(warnCalled, true, 'console.warn should be called when action is missing');

    warnCalled = false;
    await logAuditEvent({ actorId: 1, action: 'CREATE', resourceType: null });
    assert.equal(warnCalled, true, 'console.warn should be called when resourceType is missing');
  } finally {
    console.warn = originalWarn;
  }
});
