const { pool } = require("../config/db");

// 1. Create Task
exports.createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority, dueDate } = req.body;
  const { tenantId } = req.user;

  try {
    // A. Verify Project Belongs to Tenant
    const projectCheck = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND tenant_id = $2",
      [projectId, tenantId]
    );
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // B. Verify Assigned User (If provided) Belongs to Tenant
    if (assignedTo) {
      const userCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND tenant_id = $2",
        [assignedTo, tenantId]
      );
      if (userCheck.rows.length === 0) {
        return res
          .status(400)
          .json({ message: "Assigned user does not belong to this tenant" });
      }
    }

    // C. Create Task
    const result = await pool.query(
      `INSERT INTO tasks (project_id, tenant_id, title, description, assigned_to, priority, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'todo')
       RETURNING *`,
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. Get Tasks for Project
exports.getTasks = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;

  try {
    // Verify Project Access
    const projectCheck = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND tenant_id = $2",
      [projectId, tenantId]
    );
    if (projectCheck.rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const result = await pool.query(
      `
      SELECT t.*, u.full_name as assignee_name, u.email as assignee_email
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1 AND t.tenant_id = $2
      ORDER BY 
        CASE t.priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        t.due_date ASC
    `,
      [projectId, tenantId]
    );

    res.json({ success: true, data: { tasks: result.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. Update Task Status (Drag and Drop support)
exports.updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body; // todo, in_progress, completed
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() 
       WHERE id = $2 AND tenant_id = $3 RETURNING *`,
      [status, taskId, tenantId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Task not found" });

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
