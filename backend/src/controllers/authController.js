const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
};

// 1. Register Tenant (Transactional)
exports.registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } =
    req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Start Transaction

    // Check if subdomain exists
    const subCheck = await client.query(
      "SELECT id FROM tenants WHERE subdomain = $1",
      [subdomain]
    );
    if (subCheck.rows.length > 0) {
      throw new Error("Subdomain already exists");
    }

    // Create Tenant
    const tenantRes = await client.query(
      `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, 'active', 'free', 5, 3) RETURNING id`,
      [tenantName, subdomain]
    );
    const tenantId = tenantRes.rows[0].id;

    // Hash Password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create Admin User
    const userRes = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin') RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, hashedPassword, adminFullName]
    );

    await client.query("COMMIT"); // Commit Transaction

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId,
        subdomain,
        adminUser: userRes.rows[0],
      },
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback on error
    console.error("Registration error:", error);

    // Handle duplicate email error
    if (error.code === "23505") {
      // Postgres unique violation code
      return res
        .status(409)
        .json({
          success: false,
          message: "Email already registered in this tenant",
        });
    }

    res.status(error.message === "Subdomain already exists" ? 409 : 500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  } finally {
    client.release();
  }
};

// 2. Login
exports.login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  try {
    // A. Verify Tenant
    let tenantId = null;
    if (tenantSubdomain) {
      const tenantRes = await pool.query(
        "SELECT id, status FROM tenants WHERE subdomain = $1",
        [tenantSubdomain]
      );
      if (tenantRes.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Tenant not found" });
      }
      if (tenantRes.rows[0].status !== "active") {
        return res
          .status(403)
          .json({ success: false, message: "Tenant account is not active" });
      }
      tenantId = tenantRes.rows[0].id;
    }

    // B. Verify User (Super admins might login without specific subdomain initially, but for now we assume standard flow)
    // Note: If super_admin, tenantId is NULL in users table.

    // Complex query to handle both Tenant Users (check tenant_id) and Super Admins (tenant_id IS NULL)
    // However, for simplicity and security, we first look up by email.

    // STRICT ISOLATION: User must exist in the REQUESTED tenant (unless super_admin)
    let query = "SELECT * FROM users WHERE email = $1";
    let params = [email];

    // If not super admin logic, strictly enforce tenant_id
    // But we don't know if they are super admin yet.
    // Best approach: Find user by email and tenant_id first.

    const userResult = await pool.query(
      `SELECT * FROM users WHERE email = $1 AND (tenant_id = $2 OR role = 'super_admin')`,
      [email, tenantId]
    );

    if (userResult.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    // C. Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // D. Return Token
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
        },
        token,
        expiresIn: 86400, // 24 hours
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. Get Current User (Me)
exports.getMe = async (req, res) => {
  try {
    // req.user is populated by middleware
    const userRes = await pool.query(
      "SELECT id, email, full_name, role, tenant_id FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (userRes.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const user = userRes.rows[0];
    let tenantInfo = null;

    if (user.tenant_id) {
      const tenantRes = await pool.query(
        "SELECT id, name, subdomain, subscription_plan, max_users, max_projects FROM tenants WHERE id = $1",
        [user.tenant_id]
      );
      tenantInfo = tenantRes.rows[0];
    }

    res.json({
      success: true,
      data: {
        ...user,
        tenant: tenantInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
