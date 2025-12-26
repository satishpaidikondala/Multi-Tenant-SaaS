const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const tenantController = require("../controllers/tenantController");

router.use(protect);
router.get("/:tenantId", tenantController.getTenant);
router.put("/:tenantId", tenantController.updateTenant);

module.exports = router;
