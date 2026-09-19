const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createOrder,
  confirmOrder,
  cancelOrder,
  getMyOrders,
  getOrdersReport,
  getAllOrdersAdmin
} = require("../controllers/orderController");

router.post("/", authMiddleware, createOrder);

router.put("/:id/confirm", authMiddleware, confirmOrder);

router.put("/:id/cancel", authMiddleware, cancelOrder);

router.get("/my", authMiddleware, getMyOrders);

router.get("/report", authMiddleware, getOrdersReport);

router.get("/admin", authMiddleware, getAllOrdersAdmin);

module.exports = router;
