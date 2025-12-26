const { pool } = require("../config/db");

// 1. Create Project (With Limit Check)
exports.createProject = async (req, res) => {
  const { name, description, status } = req.body;
  const { tenantId, userId } = req.user;

  const client = await pool.connect();
  try {
    // A. Check Subscription Limits
    const limitCheck = await client.query(
      `SELECT t.max_projects, count(p.id) as current_count 
       FROM tenants t 
       LEFT JOIN projects p ON p.tenant_id = t.id 
       WHERE t.id = $1 
       GROUP BY t.max_projects`,
      [tenantId]
    );

    const { max_projects, current_count } = limitCheck.rows[0];

    if (parseInt(current_count) >= max_projects) {
      return res.status(403).json({
        success: false,
        message: `Plan limit reached. Max projects allowed: ${max_projects}`,
      });
    }

    // B. Create Project
    const result = await client.query(
      `INSERT INTO projects (tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tenantId, name, description, status || "active", userId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};

// 2. List Projects (Tenant Isolated)
exports.getProjects = async (req, res) => {
  const { tenantId } = req.user;
  const { search, status } = req.query;

  try {
    let query = `
      SELECT p.*, u.full_name as creator_name, 
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_task_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.tenant_id = $1
    `;

    const params = [tenantId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND p.name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: { projects: result.rows },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. Update Project
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  const { tenantId, role, userId } = req.user;

  try {
    // Check ownership or admin role
    const projectCheck = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND tenant_id = $2",
      [id, tenantId]
    );
    if (projectCheck.rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const project = projectCheck.rows[0];
    if (role !== "tenant_admin" && project.created_by !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this project" });
    }

    const result = await pool.query(
      `UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), status = COALESCE($3, status), updated_at = NOW()
       WHERE id = $4 AND tenant_id = $5 RETURNING *`,
      [name, description, status, id, tenantId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. Delete Project
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const { tenantId, role, userId } = req.user;

  try {
    // Check ownership or admin role
    const projectCheck = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND tenant_id = $2",
      [id, tenantId]
    );
    if (projectCheck.rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const project = projectCheck.rows[0];
    if (role !== "tenant_admin" && project.created_by !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this project" });
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [id]);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
