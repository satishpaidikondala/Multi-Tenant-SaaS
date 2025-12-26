const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.post("/", userController.addUser);
router.get("/", userController.getUsers);
// THIS WAS MISSING
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

module.exports = router;
