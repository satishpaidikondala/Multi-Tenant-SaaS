const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(authenticateToken);

// Tenant Admin Only Routes
router.post(
  "/",
  authorizeRoles("tenant_admin", "super_admin"),
  userController.addUser
);
router.delete(
  "/:id",
  authorizeRoles("tenant_admin", "super_admin"),
  userController.deleteUser
);

// List Users (Accessible to all members of the tenant)
router.get("/", userController.getUsers);

module.exports = router;
