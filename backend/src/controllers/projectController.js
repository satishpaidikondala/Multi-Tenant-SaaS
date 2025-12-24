// backend/src/controllers/projectController.js
const { pool } = require("../config/db");
const { logAction } = require("../utils/auditLogger");

exports.createProject = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, description, status } = req.body;
    const { tenant_id, id: userId } = req.user;

    // 1. Check Project Limits for Tenant
    // Get tenant plan limits and current project count
    const limitQuery = `
      SELECT t.max_projects, count(p.id) as current_count 
      FROM tenants t 
      LEFT JOIN projects p ON p.tenant_id = t.id 
      WHERE t.id = $1 
      GROUP BY t.id
    `;
    const limitResult = await client.query(limitQuery, [tenant_id]);

    if (limitResult.rows.length > 0) {
      const { max_projects, current_count } = limitResult.rows[0];
      if (parseInt(current_count) >= max_projects) {
        return res.status(403).json({
          success: false,
          message: `Project limit reached for your plan (Max: ${max_projects})`,
        });
      }
    }

    // 2. Create Project
    const insertQuery = `
      INSERT INTO projects (tenant_id, name, description, status, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await client.query(insertQuery, [
      tenant_id,
      name,
      description,
      status || "active",
      userId,
    ]);

    const newProject = result.rows[0];

    // 3. Log Action
    logAction(tenant_id, userId, "CREATE_PROJECT", "project", newProject.id);

    res.status(201).json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create project" });
  } finally {
    client.release();
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const { tenant_id } = req.user; // Extracted from JWT by middleware

    // CRITICAL: Filter by tenant_id
    const query = `
      SELECT p.*, u.full_name as creator_name,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.tenant_id = $1
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, [tenant_id]);

    res.status(200).json({
      success: true,
      data: {
        projects: result.rows,
        total: result.rowCount,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch projects" });
  }
};
