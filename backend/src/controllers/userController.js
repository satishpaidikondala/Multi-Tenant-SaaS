const bcrypt = require("bcrypt");
const { pool } = require("../config/db");
const { logAction } = require("../utils/auditLogger");

exports.addUser = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    const { tenant_id, id: userId } = req.user;

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role`,
      [tenant_id, email, hashed, fullName, role || "user"]
    );

    logAction(tenant_id, userId, "CREATE_USER", "user", result.rows[0].id);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding user" });
  }
};

exports.getTenantUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, full_name, role FROM users WHERE tenant_id = $1",
      [req.user.tenant_id]
    );
    res.json({
      success: true,
      data: { users: result.rows, total: result.rowCount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName } = req.body;
    const result = await pool.query(
      `UPDATE users SET full_name = COALESCE($1, full_name) WHERE id = $2 AND tenant_id = $3 RETURNING id, full_name`,
      [fullName, userId, req.user.tenant_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id)
      return res.status(400).json({ message: "Cannot delete self" });

    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [userId, req.user.tenant_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};
