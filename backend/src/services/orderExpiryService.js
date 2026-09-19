const Order = require("../models/Order");
const Product = require("../models/Product");
const { sendOrderCancelledEmail } = require("./orderEmailService");

async function processExpiredOrders() {
    const now = new Date();

    const expiredOrders = await Order.find({
        status: "Pending",
        expiresAt: { $lte: now }
    })
    .populate("product")
    .populate("buyer")
    .populate("seller");

    for (const order of expiredOrders) {
        order.status = "Cancelled";

        if (order.product) {
            order.product.status = "Available";
            await order.product.save();
        }

        await order.save();

        sendOrderCancelledEmail(order, order.product, order.buyer, order.seller, "expired").catch(err => console.error("Email error:", err));

        console.log(`Order ${order._id} expired and cancelled.`);
    }
}

module.exports = { processExpiredOrders };