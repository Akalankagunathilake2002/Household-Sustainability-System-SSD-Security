const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { admin } = require("../middleware/authMiddleware");

const {
  createTicket,
  getMyTickets,
  getAllTicketsAdmin,
  getTicketById,
  addMessage,
  updateTicketAdmin,
  deleteTicketAdmin,
} = require("../controllers/supportTicketController");

// USER
router.post("/", authMiddleware, createTicket);
router.get("/my", authMiddleware, getMyTickets);
router.get("/:id", authMiddleware, getTicketById);
router.post("/:id/messages", authMiddleware, addMessage);

// ADMIN
router.get("/", authMiddleware, admin, getAllTicketsAdmin);
router.put("/:id", authMiddleware, admin, updateTicketAdmin);
router.delete("/:id", authMiddleware, admin, deleteTicketAdmin);

module.exports = router;