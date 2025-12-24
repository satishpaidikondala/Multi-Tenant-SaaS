// backend/src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Protect all routes
router.use(protect);

// Routes
// 1. Add User (Only Tenant Admin)
router.post("/", restrictTo("tenant_admin"), userController.addUser);

// 2. Get Users (Any Tenant Member)
router.get("/", userController.getTenantUsers);

// CRITICAL: This line must exist!
module.exports = router;
