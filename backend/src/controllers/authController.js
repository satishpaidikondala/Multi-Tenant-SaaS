const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { logAction } = require("../utils/auditLogger");

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, tenantId: user.tenant_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

exports.registerTenant = async (req, res) => {
  const client = await pool.connect();
  try {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } =
      req.body;

    await client.query("BEGIN");

    // 1. Create Tenant
    const tenantRes = await client.query(
      "INSERT INTO tenants (name, subdomain, subscription_plan) VALUES ($1, $2, 'free') RETURNING id, subdomain",
      [tenantName, subdomain]
    );
    const newTenant = tenantRes.rows[0];

    // 2. Create Admin
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(adminPassword, salt);
    const userRes = await client.query(
      "INSERT INTO users (tenant_id, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, 'tenant_admin') RETURNING id, email, full_name, role",
      [newTenant.id, adminEmail, hashed, adminFullName]
    );
    const newUser = userRes.rows[0];

    await client.query("COMMIT");

    // Log Action (Fire & Forget)
    try {
      logAction(
        newTenant.id,
        newUser.id,
        "REGISTER_TENANT",
        "tenant",
        newTenant.id
      );
    } catch (e) {}

    res.status(201).json({
      success: true,
      data: { tenantId: newTenant.id, adminUser: newUser },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505")
      return res
        .status(409)
        .json({ success: false, message: "Subdomain or Email exists" });
    res.status(500).json({ success: false, message: "Registration failed" });
  } finally {
    client.release();
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    // 1. Find Tenant
    const tenantRes = await pool.query(
      "SELECT id, status FROM tenants WHERE subdomain = $1",
      [tenantSubdomain]
    );
    if (tenantRes.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Tenant not found" });
    const tenant = tenantRes.rows[0];

    // 2. Find User
    const userRes = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND tenant_id = $2",
      [email, tenant.id]
    );
    if (userRes.rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    const user = userRes.rows[0];

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user);

    // 4. Log Action
    try {
      logAction(tenant.id, user.id, "LOGIN", "session", user.id);
    } catch (e) {}

    res.status(200).json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Login error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    // FIX: Using req.user.id (from middleware) instead of req.user.userId
    const query = `SELECT u.id, u.email, u.full_name, u.role, t.name as tenant_name FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.id = $1`;
    const result = await pool.query(query, [req.user.id]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// ... existing code ...

exports.getMe = async (req, res) => {
  try {
    // FIX: Use req.user.id (not userId) because your DB column is 'id'
    const query = `SELECT u.id, u.email, u.full_name, u.role, t.name as tenant_name FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.id = $1`;
    const result = await pool.query(query, [req.user.id]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
