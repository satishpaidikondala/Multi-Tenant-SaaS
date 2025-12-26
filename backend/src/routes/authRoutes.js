const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

// Public Routes
router.post("/register-tenant", authController.registerTenant);
router.post("/login", authController.login);

// Protected Routes
router.get("/me", authenticateToken, authController.getMe);
// Logout is client-side only (JWT removal), but we can add an endpoint for audit logging if needed
router.post("/logout", authenticateToken, (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
