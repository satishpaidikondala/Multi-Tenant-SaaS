const { pool } = require("../config/db");
const { logAction } = require("../utils/auditLogger");

exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, priority } = req.body;
    const { tenant_id, id: userId } = req.user;

    const projCheck = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND tenant_id = $2",
      [projectId, tenant_id]
    );
    if (projCheck.rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const result = await pool.query(
      `INSERT INTO tasks (project_id, tenant_id, title, priority, status) VALUES ($1, $2, $3, $4, 'todo') RETURNING *`,
      [projectId, tenant_id, title, priority || "medium"]
    );

    logAction(tenant_id, userId, "CREATE_TASK", "task", result.rows[0].id);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating task" });
  }
};

exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      "SELECT * FROM tasks WHERE project_id = $1 AND tenant_id = $2",
      [projectId, req.user.tenant_id]
    );
    res.json({ success: true, data: { tasks: result.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching tasks" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, priority } = req.body;
    const result = await pool.query(
      `UPDATE tasks SET title = COALESCE($1, title), priority = COALESCE($2, priority) WHERE id = $3 AND tenant_id = $4 RETURNING *`,
      [title, priority, taskId, req.user.tenant_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Task not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *`,
      [status, taskId, req.user.tenant_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Task not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Status update failed" });
  }
};
