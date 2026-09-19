const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { admin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");
const scoringController = require("../controllers/scoringController");

// View all users
router.get("/users", auth, admin, adminController.getAllUsers);

// Delete user
router.delete("/users/:id", auth, admin, adminController.deleteUser);

// Update user
router.put("/users/:id", auth, admin, adminController.updateUser);

// Scoring Configuration
router.get("/scoring-config", auth, admin, scoringController.getScoringConfig);
router.put("/scoring-config", auth, admin, scoringController.updateScoringConfig);

module.exports = router;
