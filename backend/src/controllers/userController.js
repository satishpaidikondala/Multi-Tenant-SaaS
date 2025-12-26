const bcrypt = require("bcrypt");
const { pool } = require("../config/db");

// 1. Add User
exports.addUser = async (req, res) => {
  const { email, fullName, password, role } = req.body;
  const { tenantId } = req.user;

  const client = await pool.connect();
  try {
    const limitCheck = await client.query(
      `SELECT t.max_users, count(u.id) as current_count 
       FROM tenants t 
       LEFT JOIN users u ON u.tenant_id = t.id 
       WHERE t.id = $1 
       GROUP BY t.max_users`,
      [tenantId]
    );
    const { max_users, current_count } = limitCheck.rows[0];

    if (parseInt(current_count) >= max_users) {
      return res.status(403).json({
        success: false,
        message: `Plan limit reached. Max users allowed: ${max_users}`,
      });
    }

    const emailCheck = await client.query(
      "SELECT id FROM users WHERE email = $1 AND tenant_id = $2",
      [email, tenantId]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, created_at`,
      [tenantId, email, hashedPassword, fullName, role || "user"]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};

// 2. List Users (With Total Count for scripts)
exports.getUsers = async (req, res) => {
  const { tenantId } = req.user;
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, is_active, created_at 
       FROM users WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId]
    );
    res.json({
      success: true,
      data: { users: result.rows, total: result.rowCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. Update User (THIS WAS MISSING)
exports.updateUser = async (req, res) => {
  const { fullName, role } = req.body;
  const { userId } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           role = COALESCE($2, role), 
           updated_at = NOW() 
       WHERE id = $3 AND tenant_id = $4 
       RETURNING id, full_name, role`,
      [fullName, role, userId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. Delete User
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const { tenantId, userId } = req.user;

  if (id === userId) {
    return res.status(403).json({ message: "Cannot delete yourself" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id",
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
