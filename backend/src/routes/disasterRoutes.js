const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { admin } = require("../middleware/authMiddleware");

const {
  createDisaster,
  getDisasters,
  updateDisaster,
  deleteDisaster,
  getLiveFemaDisasters,
  importFemaDisaster,
} = require("../controllers/disasterController");

// 🔥 FEMA
router.get("/live-fema", getLiveFemaDisasters);
router.post("/import-fema", authMiddleware, admin, importFemaDisaster);

// CRUD
router.get("/", authMiddleware, getDisasters);
router.post("/", authMiddleware, admin, createDisaster);
router.put("/:id", authMiddleware, admin, updateDisaster);
router.delete("/:id", authMiddleware, admin, deleteDisaster);

module.exports = router;