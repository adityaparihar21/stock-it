const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getInventoryStats,
  deleteAllProducts
} = require("../controllers/productController");

router.route("/")
  .post(createProduct)
  .get(getAllProducts)
  .delete(deleteAllProducts);

router.route("/stats")
  .get(getInventoryStats);

router.route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
