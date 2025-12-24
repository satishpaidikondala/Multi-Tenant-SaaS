// backend/src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public Routes
router.post("/register-tenant", authController.registerTenant);
router.post("/login", authController.login);

// Protected Routes
router.get("/me", protect, authController.getMe); // <--- THIS WAS MISSING

module.exports = router;
