const Product = require("../models/productModel");
const mongoose = require("mongoose");

const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, brand, description, imageUrl } = req.body;
    
    if (!name || !category || price === undefined || stock === undefined || !brand) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide name, category, price, stock, and brand."
      });
    }

    const product = new Product({ name, category, price, stock, brand, description, imageUrl });
    const savedProduct = await product.save();
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { search, category, sortBy, sortOrder, page, limit } = req.query;

    let query = {};

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    let sort = {};
    if (sortBy) {
      const order = sortOrder === "asc" ? 1 : -1;
      sort[sortBy] = order;
    } else {
      sort.createdAt = -1;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 8;
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip(skipNum)
      .limit(limitNum);

    const allCategories = await Product.distinct("category");

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      categories: allCategories,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID format. Must be a 24-character hex string."
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID format. Must be a 24-character hex string."
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID format. Must be a 24-character hex string."
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const getInventoryStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          categories: { $addToSet: "$category" },
          outOfStock: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalProducts: 0,
          totalStock: 0,
          inventoryValue: 0,
          outOfStock: 0,
          totalCategories: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalProducts: stats[0].totalProducts,
        totalStock: stats[0].totalStock,
        inventoryValue: stats[0].totalValue || 0,
        outOfStock: stats[0].outOfStock || 0,
        totalCategories: stats[0].categories ? stats[0].categories.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Delete all products
// @route   DELETE /products/all
// @access  Public
const deleteAllProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All products deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getInventoryStats,
  deleteAllProducts
};
