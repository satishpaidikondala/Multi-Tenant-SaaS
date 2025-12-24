// backend/src/utils/auditLogger.js
const { pool } = require("../config/db");

const logAction = async (
  tenantId,
  userId,
  action,
  entityType,
  entityId,
  ipAddress = null
) => {
  try {
    // If tenantId or userId is missing, we still log what we can
    const query = `
      INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pool.query(query, [
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      ipAddress,
    ]);
  } catch (error) {
    console.error("Audit Log Error:", error.message);
    // We intentionally catch the error so it doesn't crash the main request
  }
};

module.exports = { logAction };
