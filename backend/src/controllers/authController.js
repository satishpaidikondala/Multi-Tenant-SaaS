// backend/src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { logAction } = require("../utils/auditLogger");

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.registerTenant = async (req, res) => {
  const client = await pool.connect(); // Get a client for transaction
  try {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } =
      req.body;

    // 1. Validation
    if (
      !tenantName ||
      !subdomain ||
      !adminEmail ||
      !adminPassword ||
      !adminFullName
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // 2. Start Transaction
    await client.query("BEGIN");

    // 3. Create Tenant
    // Default plan is 'free', max_users=5, max_projects=3
    const tenantQuery = `
      INSERT INTO tenants (name, subdomain, subscription_plan, max_users, max_projects)
      VALUES ($1, $2, 'free', 5, 3)
      RETURNING id, name, subdomain
    `;
    const tenantResult = await client.query(tenantQuery, [
      tenantName,
      subdomain,
    ]);
    const newTenant = tenantResult.rows[0];

    // 4. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 5. Create Admin User
    const userQuery = `
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, 'tenant_admin')
      RETURNING id, email, full_name, role
    `;
    const userResult = await client.query(userQuery, [
      newTenant.id,
      adminEmail,
      hashedPassword,
      adminFullName,
    ]);
    const newAdmin = userResult.rows[0];

    // 6. Audit Log (using the same transaction client? No, audit log is separate, fine to fail independently)
    // But for strictness, we log after commit.

    // 7. Commit Transaction
    await client.query("COMMIT");

    // 8. Log success (Fire and forget)
    logAction(
      newTenant.id,
      newAdmin.id,
      "REGISTER_TENANT",
      "tenant",
      newTenant.id,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId: newTenant.id,
        subdomain: newTenant.subdomain,
        adminUser: newAdmin,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    // Check for duplicate subdomain
    if (error.code === "23505") {
      // Postgres unique violation code
      if (error.constraint === "tenants_subdomain_key") {
        return res
          .status(409)
          .json({ success: false, message: "Subdomain already exists" });
      }
      if (error.constraint === "users_tenant_id_email_key") {
        // Should not happen on new tenant, but good safety
        return res.status(409).json({
          success: false,
          message: "Email already exists in this tenant",
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    if (!email || !password || !tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and tenant subdomain are required",
      });
    }

    // 1. Find Tenant by Subdomain
    const tenantQuery = `SELECT id, status FROM tenants WHERE subdomain = $1`;
    const tenantResult = await pool.query(tenantQuery, [tenantSubdomain]);

    if (tenantResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Tenant not found" });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tenant account is suspended or inactive",
      });
    }

    // 2. Find User in that Tenant
    const userQuery = `SELECT * FROM users WHERE email = $1 AND tenant_id = $2`;
    const userResult = await pool.query(userQuery, [email, tenant.id]);

    if (userResult.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({ success: false, message: "User account is inactive" });
    }

    // 4. Generate Token
    const token = generateToken(user);

    // 5. Audit Log
    logAction(tenant.id, user.id, "LOGIN", "session", "N/A", req.ip);

    res.status(200).json({
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
        expiresIn: 86400, // 24 hours in seconds
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};
