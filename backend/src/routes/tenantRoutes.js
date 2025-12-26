const express = require("express");
const router = express.Router();
// FIX: Import the function directly
const authenticateToken = require("../middleware/authMiddleware");
const tenantController = require("../controllers/tenantController");

// FIX: Use the imported function
router.use(authenticateToken);

router.get("/:tenantId", tenantController.getTenant);
router.put("/:tenantId", tenantController.updateTenant);

module.exports = router;
