const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

// Update Status
router.patch("/:taskId/status", taskController.updateTaskStatus);

module.exports = router;
