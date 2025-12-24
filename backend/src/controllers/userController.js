// backend/src/controllers/userController.js
const bcrypt = require("bcrypt");
const { pool } = require("../config/db");
const { logAction } = require("../utils/auditLogger");

exports.addUser = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, fullName, role } = req.body;
    const { tenant_id, id: currentUserId } = req.user;

    // 1. Check User Limit
    const limitQuery = `
      SELECT t.max_users, count(u.id) as current_count 
      FROM tenants t 
      LEFT JOIN users u ON u.tenant_id = t.id 
      WHERE t.id = $1 
      GROUP BY t.id
    `;
    const limitResult = await client.query(limitQuery, [tenant_id]);

    if (limitResult.rows.length > 0) {
      const { max_users, current_count } = limitResult.rows[0];
      if (parseInt(current_count) >= max_users) {
        return res.status(403).json({
          success: false,
          message: `User limit reached for your plan (Max: ${max_users})`,
        });
      }
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User
    const insertQuery = `
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, role, is_active, created_at
    `;

    const userRole = role === "tenant_admin" ? "tenant_admin" : "user";

    const result = await client.query(insertQuery, [
      tenant_id,
      email,
      hashedPassword,
      fullName,
      userRole,
    ]);

    const newUser = result.rows[0];

    // 4. Log Action
    logAction(tenant_id, currentUserId, "CREATE_USER", "user", newUser.id);

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already exists in this tenant",
      });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add user" });
  } finally {
    client.release();
  }
};

exports.getTenantUsers = async (req, res) => {
  try {
    const { tenant_id } = req.user;

    const query = `
      SELECT id, email, full_name, role, is_active, created_at 
      FROM users 
      WHERE tenant_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [tenant_id]);

    res.status(200).json({
      success: true,
      data: { users: result.rows, total: result.rowCount },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};
