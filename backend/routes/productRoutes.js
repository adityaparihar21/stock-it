const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getInventoryStats
} = require("../controllers/productController");

router.route("/")
  .post(createProduct)
  .get(getAllProducts);

router.route("/stats")
  .get(getInventoryStats);

router.route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
