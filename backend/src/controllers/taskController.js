// backend/src/controllers/taskController.js
const { pool } = require("../config/db");
const { logAction } = require("../utils/auditLogger");

exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params; // from URL /projects/:projectId/tasks
    const { title, description, priority, assignedTo, dueDate } = req.body;
    const { tenant_id, id: userId } = req.user;

    // 1. Verify Project belongs to Tenant
    const projectCheck = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND tenant_id = $2",
      [projectId, tenant_id]
    );

    if (projectCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // 2. Create Task
    const insertQuery = `
      INSERT INTO tasks (project_id, tenant_id, title, description, priority, assigned_to, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      projectId,
      tenant_id,
      title,
      description,
      priority || "medium",
      assignedTo || null,
      dueDate || null,
    ]);

    const newTask = result.rows[0];
    logAction(tenant_id, userId, "CREATE_TASK", "task", newTask.id);

    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tenant_id } = req.user;

    // Verify access
    const projectCheck = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND tenant_id = $2",
      [projectId, tenant_id]
    );
    if (projectCheck.rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    // Fetch tasks with assignee name
    const query = `
      SELECT t.*, u.full_name as assignee_name 
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1 AND t.tenant_id = $2
      ORDER BY t.priority DESC, t.due_date ASC
    `;

    const result = await pool.query(query, [projectId, tenant_id]);

    res.status(200).json({ success: true, data: { tasks: result.rows } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};
