const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

router.use(protect);
router.put("/:taskId", taskController.updateTask);
router.patch("/:taskId/status", taskController.updateTaskStatus);
module.exports = router;
