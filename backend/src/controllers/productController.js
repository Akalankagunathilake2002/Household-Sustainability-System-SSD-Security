const Product = require("../models/Product");
const { calculateCarbon } = require("../services/carbonService");
const Roles = require("../utils/roles");

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
    return res.status(500).json({
      message: "An error occurred while creating the product.",
      error: error.message
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
    return res.status(500).json({
      message: "Failed to retrieve products.",
      error: error.message
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
    return res.status(500).json({
      message: "Failed to retrieve products.",
      error: error.message
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
    return res.status(500).json({
      message: "Error retrieving product.",
      error: error.message
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

    if (req.file) {
      req.body.imageUrl = req.file.path;
    }

    Object.assign(product, req.body);

    await product.save();

    return res.json({
      message: "Product updated successfully.",
      product
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to update product.",
      error: error.message
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
    return res.status(500).json({
      message: "Error deleting product.",
      error: error.message
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
    return res.status(500).json({
      message: "Failed to retrieve your products.",
      error: error.message
    });
  }
};
