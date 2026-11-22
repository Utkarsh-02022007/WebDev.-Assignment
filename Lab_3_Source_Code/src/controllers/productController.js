const mongoose = require("mongoose");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort = "createdAt", order = "desc" } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const filter = {};
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
  if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }
  const allowedSort = ["name", "price", "quantity", "createdAt", "category"];
  const sortField = allowedSort.includes(sort) ? sort : "createdAt";
  const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ [sortField]: sortOrder }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)
  ]);
  res.json({ success: true, total, page, limit, totalPages: Math.ceil(total / limit), count: products.length, products });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const allowed = ["name", "sku", "category", "price", "quantity", "reorderLevel", "supplier"];
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, message: "Product deleted", id: product._id });
});

exports.adjustStock = asyncHandler(async (req, res) => {
  const change = Number(req.body.change);
  if (!Number.isInteger(change) || change === 0) {
    return res.status(400).json({ success: false, message: "change must be a non-zero integer" });
  }
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  if (product.quantity + change < 0) {
    return res.status(400).json({ success: false, message: "Insufficient stock: quantity cannot become negative" });
  }
  product.quantity += change;
  await product.save();
  res.json({ success: true, message: "Stock updated", product });
});

exports.lowStock = asyncHandler(async (_req, res) => {
  const lowStockItems = await Product.find({ $expr: { $lte: ["$quantity", "$reorderLevel"] } }).sort({ quantity: 1 });
  res.json({ success: true, count: lowStockItems.length, lowStockItems });
});

exports.categorySummary = asyncHandler(async (_req, res) => {
  const summary = await Product.aggregate([
    { $group: {
      _id: "$category",
      totalItems: { $sum: 1 },
      totalQuantity: { $sum: "$quantity" },
      totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
      avgPrice: { $avg: "$price" }
    }},
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, categories: summary.length, summary });
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
