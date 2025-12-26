const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const taskController = require("../controllers/taskController"); // We nest task creation here
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken); // Protect all routes

// Project Routes
router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

// Task Routes (Nested under projects)
router.post("/:projectId/tasks", taskController.createTask);
router.get("/:projectId/tasks", taskController.getTasks);

module.exports = router;
