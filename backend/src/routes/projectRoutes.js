// backend/src/routes/projectRoutes.js
const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const taskController = require("../controllers/taskController"); // Import task controller
const { protect } = require("../middleware/authMiddleware");

// Protect all routes
router.use(protect);

// Project Routes
router.post("/", projectController.createProject);
router.get("/", projectController.getAllProjects);

// Task Routes (Nested under projects)
router.post("/:projectId/tasks", taskController.createTask);
router.get("/:projectId/tasks", taskController.getProjectTasks);

// CRITICAL: This line must exist!
module.exports = router;
