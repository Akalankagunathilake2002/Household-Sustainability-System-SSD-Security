const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { awardSustainabilityPoints } = require("../services/sustainabilityService");
const {
  sendOrderPlacedEmail,
  sendOrderConfirmedEmail,
  sendOrderCancelledEmail
} = require("../services/orderEmailService");

// Create Order (Buy Now)
exports.createOrder = async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId);

    if (!product || product.status !== "Available") {
      return res.status(400).json({
        message: "This product is not available for purchase."
      });
    }

    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot place an order on your own product."
      });
    }
    
    const expiryDays = 5;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000); 
    
    /* For testing purposes, 5 minutes expiry time is set. 
   
    const expiryMinutes = 5;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    */

    const order = new Order({
      product: product._id,
      buyer: req.user.id,
      seller: product.seller,
      status: "Pending",
      expiresAt: expiresAt
    });

    product.status = "Reserved";
    await product.save();
    await order.save();

    const buyer = await User.findById(req.user.id);
    const seller = await User.findById(product.seller);

    sendOrderPlacedEmail(order, product, buyer, seller).catch(err => console.error("Email error:", err));

    return res.status(201).json({
      message: "Order placed successfully. Waiting for seller confirmation.",
      order
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to create order.",
      error: error.message
    });
  }
};


// Confirm Order (Seller)
exports.confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    .populate("product")
    .populate("buyer")
    .populate("seller");

    if (!order) {
      return res.status(404).json({
        message: "Order not found."
      });
    }

    if (order.product.seller.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
            message: "Only the seller or an admin can confirm this order."
        });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending orders can be confirmed."
      });
    }

    order.status = "Confirmed";
    order.product.status = "Sold";

    await awardSustainabilityPoints(order);

    await order.product.save();
    await order.save();

    sendOrderConfirmedEmail(order, order.product, order.buyer, order.seller).catch(err => console.error("Email error:", err));

    return res.json({
      message: "Order confirmed successfully. Sustainability points awarded.",
      order
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to confirm order.",
      error: error.message
    });
  }
};


// Cancel Order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    .populate("product")
    .populate("buyer")
    .populate("seller");

    if (!order) {
        return res.status(404).json({
            message: "Order not found."
        });
    }

    const isBuyer = order.buyer.toString() === req.user.id;
    const isSeller = order.product.seller.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to cancel this order."
      });
    }

    if (order.status !== "Pending" && order.status !== "Confirmed") {
        return res.status(400).json({
            message: "Only pending or confirmed orders can be cancelled."
        });
    }

    order.status = "Cancelled";
    order.product.status = "Available";

    await order.product.save();
    await order.save();

    sendOrderCancelledEmail(order, order.product, order.buyer, order.seller).catch(err => console.error("Email error:", err));

    return res.json({
      message: "Order cancelled successfully.",
      order
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel order.",
      error: error.message
    });
  }
};

// get User Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { buyer: req.user.id },
        { seller: req.user.id }
      ]
    })
    .populate("product", "title price status")
    .populate("buyer", "username email mobileNumber")
    .populate("seller", "username email mobileNumber")
    .sort({ createdAt: -1 });

    return res.json({
      message: "Your orders retrieved successfully.",
      count: orders.length,
      orders
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve your orders.",
      error: error.message
    });
  }
};

// Get All Orders Report 
exports.getOrdersReport = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only."
      });
    }

    const orders = await Order.find()
      .populate("product", "title price")
      .populate("buyer", "username email")
      .populate("seller", "username email")
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;

    const summary = {
      total: totalOrders,
      pending: orders.filter(o => o.status === "Pending").length,
      confirmed: orders.filter(o => o.status === "Confirmed").length,
      cancelled: orders.filter(o => o.status === "Cancelled").length,
      completed: orders.filter(o => o.status === "Completed").length
    };

    const completionRate =
      totalOrders > 0
        ? ((summary.confirmed + summary.completed) / totalOrders * 100).toFixed(2)
        : 0;

    return res.json({
      message: "Order report generated successfully.",
      summary: {
        ...summary,
        completionRate: `${completionRate}%`
      },
      orders
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate order report.",
      error: error.message
    });
  }
};

// Get All Orders (Admin)
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only."
      });
    }

    const orders = await Order.find()
      .populate("product", "title price status")
      .populate("buyer", "username email mobileNumber")
      .populate("seller", "username email mobileNumber")
      .sort({ createdAt: -1 });

    return res.json({
      message: "All orders fetched successfully.",
      count: orders.length,
      orders
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve orders.",
      error: error.message
    });
  }
};