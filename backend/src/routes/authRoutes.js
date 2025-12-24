// backend/src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register-tenant", authController.registerTenant);
router.post("/login", authController.login);

module.exports = router;
