const { pool } = require("../config/db");

exports.getTenant = async (req, res) => {
  try {
    // Security: Users can only see their own tenant unless Super Admin
    if (
      req.user.role !== "super_admin" &&
      req.user.tenantId !== req.params.tenantId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = await pool.query("SELECT * FROM tenants WHERE id = $1", [
      req.params.tenantId,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Tenant not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const { name } = req.body;
    // Security check
    if (req.user.role !== "super_admin" && req.user.role !== "tenant_admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      "UPDATE tenants SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [name, req.params.tenantId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// THIS IS THE MISSING FUNCTION CAUSING THE CRASH
exports.getAllTenants = async (req, res) => {
  if (req.user.role !== "super_admin")
    return res.status(403).json({ message: "Super Admin only" });
  try {
    const result = await pool.query(
      "SELECT * FROM tenants ORDER BY created_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
