const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { pool } = require("../config/db");

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log("--- Starting Database Initialization ---");

    // 1. Run Migrations
    const migrationDir = path.join(__dirname, "../../migrations");
    const files = fs.readdirSync(migrationDir).sort();

    for (const file of files) {
      if (file.endsWith(".sql")) {
        const filePath = path.join(migrationDir, file);
        const sql = fs.readFileSync(filePath, "utf8");
        console.log(`Running migration: ${file}`);
        await client.query(sql);
      }
    }

    // 2. Check if Seed Data Exists
    const res = await client.query(
      "SELECT count(*) FROM users WHERE role = $1",
      ["super_admin"]
    );
    if (parseInt(res.rows[0].count) > 0) {
      console.log("Database already seeded. Skipping.");
      return;
    }

    // 3. Insert Seed Data
    console.log("Seeding database...");

    const adminPass = await bcrypt.hash("Admin@123", 10);
    const demoPass = await bcrypt.hash("Demo@123", 10);
    const userPass = await bcrypt.hash("User@123", 10);

    // A. Create Super Admin
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, tenant_id)
       VALUES ($1, $2, $3, 'super_admin', NULL)`,
      ["superadmin@system.com", adminPass, "Super Admin"]
    );

    // B. Create Tenant
    const tenantRes = await client.query(`
      INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
      VALUES ('Demo Company', 'demo', 'active', 'pro', 25, 15)
      RETURNING id
    `);
    const tenantId = tenantRes.rows[0].id;

    // C. Create Tenant Admin
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, tenant_id)
       VALUES ($1, $2, $3, 'tenant_admin', $4)`,
      ["admin@demo.com", demoPass, "Demo Admin", tenantId]
    );

    // D. Create Users
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, tenant_id)
       VALUES ($1, $2, 'User One', 'user', $3), ($4, $2, 'User Two', 'user', $3)`,
      ["user1@demo.com", userPass, tenantId, "user2@demo.com"]
    );

    // E. Create Seed Project (Project Alpha)
    const projectRes = await client.query(
      `
      INSERT INTO projects (tenant_id, name, description, status, created_by)
      VALUES ($1, 'Project Alpha', 'First demo project', 'active', (SELECT id FROM users WHERE email = 'admin@demo.com'))
      RETURNING id
    `,
      [tenantId]
    );
    const projectId = projectRes.rows[0].id;

    // F. Create Seed Task
    await client.query(
      `
      INSERT INTO tasks (project_id, tenant_id, title, description, status, priority, assigned_to)
      VALUES ($1, $2, 'Seed Task 1', 'Created via seeder', 'todo', 'high', (SELECT id FROM users WHERE email = 'user1@demo.com'))
    `,
      [projectId, tenantId]
    );

    console.log("--- Database Initialization Complete ---");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
  }
};

module.exports = runMigrations;
