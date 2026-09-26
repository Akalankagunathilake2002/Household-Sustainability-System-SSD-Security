const Product = require("../models/Product");
const { calculateCarbon } = require("../services/carbonService");
const Roles = require("../utils/roles");
const logger = require("../utils/logger");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, lat, lng, locationName } = req.body;
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }

    if (!title || !category) {
      return res.status(400).json({
        message: "Title and category are required to create a product."
      });
    }

    const co2Saved = await calculateCarbon(category);

    const product = new Product({
      title,
      description,
      imageUrl,
      price,
      category,
      condition,
      seller: req.user.id,
      co2Saved,
      status: "Available",
      ...(lat && lng ? { location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] } } : {}),
      ...(locationName ? { locationName } : {})
    });

    await product.save();

    return res.status(201).json({
      message: "Product listed successfully.",
      product
    });

  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Product creation failed", { userId: req.user?.id, error: error.message });
    return res.status(500).json({
      message: "Failed to create product"
    });
  }
};


// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "Available" })
      .populate("seller", "username email mobileNumber");

    return res.json({
      message: "Available products fetched successfully.",
      count: products.length,
      products
    });

  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Failed to retrieve products", { error: error.message });
    return res.status(500).json({
      message: "Failed to retrieve products"
    });
  }
};

// Get All Products (Admin)
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "username email");

    return res.json({
      message: "All products fetched successfully.",
      count: products.length,
      products
    });

  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Admin product fetch failed", { userId: req.user?.id, error: error.message });
    return res.status(500).json({
      message: "Failed to retrieve products"
    });
  }
};

// Get Single Product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "username email mobileNumber");

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    return res.json({
      message: "Product retrieved successfully.",
      product
    });

  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Product retrieval failed", { productId: req.params?.id, error: error.message });
    return res.status(500).json({
      message: "Failed to retrieve product"
    });
  }
};


// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== Roles.ADMIN
    ) {
      return res.status(403).json({
        message: "You are not authorized to update this product."
      });
    }

    if (product.status !== "Available") {
      return res.status(400).json({
          message: "Cannot modify a product that is reserved or sold."
      });
    }

    const { category } = req.body;

    // Recalculate carbon only if category changed
    if (category && category !== product.category) {
      const newCo2 = await calculateCarbon(category);
      product.co2Saved = newCo2;
    }

    // Security: Only allow certain fields to be updated
    // Prevent mass assignment of server-controlled attributes such as seller and co2Saved.
    const allowedFields = ["title", "description", "price", "category", "condition", "status"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.file) {
      product.imageUrl = req.file.path;
    }

    await product.save();

    return res.json({
      message: "Product updated successfully.",
      product
    });

  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Product update failed", { userId: req.user?.id, productId: req.params?.id, error: error.message });
    return res.status(500).json({
      message: "Failed to update product"
    });
  }
};


// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this product."
      });
    }

    if (product.status !== "Available") {
      return res.status(400).json({
        message: "Cannot delete reserved or sold product."
      });
    }

    await product.deleteOne();

    return res.json({
      message: "Product deleted successfully."
    });

  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("Product deletion failed", { userId: req.user?.id, productId: req.params?.id, error: error.message });
    return res.status(500).json({
      message: "Failed to delete product"
    });
  }
};

// Get User Products
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    return res.json({
      message: "Your products retrieved successfully.",
      count: products.length,
      products
    });

  } catch (error) {
    // Security: Prevent internal error details from being exposed to clients.
    // Detailed exception information must remain server-side; return only a safe generic message.
    logger.error("My products retrieval failed", { userId: req.user?.id, error: error.message });
    return res.status(500).json({
      message: "Failed to retrieve your products"
    });
  }
};
