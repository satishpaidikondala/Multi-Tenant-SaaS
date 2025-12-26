const { pool } = require("../config/db");
const { logAction } = require("../utils/auditLogger");

exports.getTenant = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tenants WHERE id = $1", [
      req.params.tenantId,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Tenant not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      "UPDATE tenants SET name = $1 WHERE id = $2 RETURNING *",
      [name, req.params.tenantId]
    );
    // Log action
    if (result.rows.length > 0) {
      logAction(
        req.user.tenant_id,
        req.user.id,
        "UPDATE_TENANT",
        "tenant",
        req.params.tenantId
      );
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error" });
  }
};
