const { pool } = require("../config/db");
const { logAction } = require("../utils/auditLogger");

exports.createProject = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, description, status } = req.body;
    const { tenant_id, id: userId } = req.user;

    const limitCheck = await client.query(
      `SELECT t.max_projects, count(p.id) as count FROM tenants t LEFT JOIN projects p ON p.tenant_id = t.id WHERE t.id = $1 GROUP BY t.id`,
      [tenant_id]
    );
    if (
      limitCheck.rows.length > 0 &&
      parseInt(limitCheck.rows[0].count) >= limitCheck.rows[0].max_projects
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Project limit reached" });
    }

    const result = await client.query(
      `INSERT INTO projects (tenant_id, name, description, status, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tenant_id, name, description, status || "active", userId]
    );

    logAction(
      tenant_id,
      userId,
      "CREATE_PROJECT",
      "project",
      result.rows[0].id
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating project" });
  } finally {
    client.release();
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [req.user.tenant_id]
    );
    res.json({
      success: true,
      data: { projects: result.rows, total: result.rowCount },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching projects" });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const result = await pool.query(
      `UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), status = COALESCE($3, status) WHERE id = $4 AND tenant_id = $5 RETURNING *`,
      [name, description, status, projectId, req.user.tenant_id]
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    await pool.query(`DELETE FROM tasks WHERE project_id = $1`, [projectId]);
    const result = await pool.query(
      `DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [projectId, req.user.tenant_id]
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};
// ... existing code ...

exports.updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const result = await pool.query(
      `UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), status = COALESCE($3, status) WHERE id = $4 AND tenant_id = $5 RETURNING *`,
      [name, description, status, req.params.projectId, req.user.tenant_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Project not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await pool.query(`DELETE FROM tasks WHERE project_id = $1`, [
      req.params.projectId,
    ]);
    const result = await pool.query(
      `DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [req.params.projectId, req.user.tenant_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Project not found" });
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
