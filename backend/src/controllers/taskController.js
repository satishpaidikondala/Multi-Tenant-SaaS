const { pool } = require("../config/db");

exports.createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority, dueDate } = req.body;
  const { tenantId } = req.user;

  try {
    // Verify Project
    const proj = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND tenant_id = $2",
      [projectId, tenantId]
    );
    if (proj.rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const result = await pool.query(
      `INSERT INTO tasks (project_id, tenant_id, title, description, assigned_to, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        projectId,
        tenantId,
        title,
        description,
        assignedTo,
        priority || "medium",
        dueDate,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;
  try {
    const result = await pool.query(
      `SELECT t.*, u.full_name as assignee_name FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.project_id = $1 AND t.tenant_id = $2 ORDER BY t.created_at DESC`,
      [projectId, tenantId]
    );
    res.json({ success: true, data: { tasks: result.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const { tenantId } = req.user;
  try {
    const result = await pool.query(
      "UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING *",
      [status, taskId, tenantId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Task not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, assignedTo, dueDate } = req.body;
  const { tenantId } = req.user;
  try {
    const result = await pool.query(
      `UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description),
             priority = COALESCE($3, priority), assigned_to = COALESCE($4, assigned_to), 
             due_date = COALESCE($5, due_date), updated_at = NOW()
             WHERE id = $6 AND tenant_id = $7 RETURNING *`,
      [title, description, priority, assignedTo, dueDate, taskId, tenantId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Task not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const { tenantId } = req.user;
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING id",
      [taskId, tenantId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Task not found" });
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
