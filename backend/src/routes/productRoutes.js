const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getAllProductsAdmin
} = require("../controllers/productController");

// Auth required
router.post("/", authMiddleware, upload.single("image"), createProduct);
router.put("/:id", authMiddleware, upload.single("image"), updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.get("/my", authMiddleware, getMyProducts);
router.get("/admin/", authMiddleware, getAllProductsAdmin);

// Public read
router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
