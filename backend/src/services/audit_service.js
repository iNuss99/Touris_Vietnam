const pool = require('../config/db');

/**
 * Append-only Audit Logger
 */
async function logAuditEvent({
  actorId,
  actorEmail,
  actingAsId = null,
  actingAsRole = null,
  action,
  resourceType,
  resourceId = null,
  beforeValue = null,
  afterValue = null
}) {
  try {
    if (!actorId || !action || !resourceType) {
      console.warn('[Audit Log] Skip logging due to missing required fields:', { actorId, action, resourceType });
      return;
    }

    await pool.query(
      `INSERT INTO audit_logs 
       (actor_id, actor_email, acting_as_id, acting_as_role, action, resource_type, resource_id, before_value, after_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        actorId,
        actorEmail || null,
        actingAsId || null,
        actingAsRole || null,
        action,
        resourceType,
        resourceId ? String(resourceId) : null,
        beforeValue ? JSON.stringify(beforeValue) : null,
        afterValue ? JSON.stringify(afterValue) : null
      ]
    );
  } catch (err) {
    console.error('[Audit Log Error] Failed to write audit log:', err.message);
  }
}

module.exports = { logAuditEvent };
