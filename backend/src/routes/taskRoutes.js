const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController"); // Correct Controller
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

// Update entire task
router.put("/:taskId", taskController.updateTask);

// Update just status
router.patch("/:taskId/status", taskController.updateTaskStatus);

// Delete task
router.delete("/:taskId", taskController.deleteTask);

module.exports = router;
