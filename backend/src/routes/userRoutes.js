const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(authenticateToken);

// Admin Routes
router.post(
  "/",
  authorizeRoles("tenant_admin", "super_admin"),
  userController.addUser
);
router.put(
  "/:userId",
  authorizeRoles("tenant_admin", "super_admin"),
  userController.updateUser
); // Fixed
router.delete(
  "/:id",
  authorizeRoles("tenant_admin", "super_admin"),
  userController.deleteUser
);

// List Users
router.get("/", userController.getUsers);

module.exports = router;
