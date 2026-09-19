const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createAction,
  getActions,
  updateAction,
  deleteAction,
  likeAction,
  unlikeAction,
  commentAction,
  deleteComment,
  reportAction,
  getFlaggedActions,
} = require("../controllers/actionController");

router.get("/", getActions);
router.post("/", authMiddleware, upload.array("images", 5), createAction);
router.put("/:id", authMiddleware, upload.array("images", 5), updateAction);
router.delete("/:id", authMiddleware, deleteAction);

router.put("/like/:id", authMiddleware, likeAction);
router.put("/unlike/:id", authMiddleware, unlikeAction);

router.post("/comment/:id", authMiddleware, commentAction);
router.delete(
  "/comment/:id/:commentId",
  authMiddleware,
  deleteComment
);

router.post("/report/:id", authMiddleware, reportAction);

router.get("/flagged", [authMiddleware, admin], getFlaggedActions);

module.exports = router;

