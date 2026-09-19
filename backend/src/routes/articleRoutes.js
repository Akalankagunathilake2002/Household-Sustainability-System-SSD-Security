const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");

router.get("/", getArticles);

router.get("/:id", getArticleById);

router.post("/", [authMiddleware, admin], upload.single("image"), createArticle);

router.put("/:id", [authMiddleware, admin], upload.single("image"), updateArticle);

router.delete("/:id", [authMiddleware, admin], deleteArticle);

module.exports = router;

