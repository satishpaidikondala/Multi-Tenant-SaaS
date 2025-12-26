const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const tenantController = require("../controllers/tenantController");

router.use(authenticateToken);

router.get("/:tenantId", tenantController.getTenant);
router.put("/:tenantId", tenantController.updateTenant);

module.exports = router;
