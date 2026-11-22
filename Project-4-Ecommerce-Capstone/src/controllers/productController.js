const Product = require("../models/Product");
const Category = require("../models/Category");
const InventoryLog = require("../models/InventoryLog");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const appEvents = require("../events/emitter");

exports.list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.seller) filter.seller = req.query.seller;
  if (req.query.search) filter.$text = { $search: req.query.search };
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }
  const sort = ["price", "name", "createdAt"].includes(req.query.sort) ? req.query.sort : "createdAt";
  const direction = req.query.order === "asc" ? 1 : -1;
  const [products, total] = await Promise.all([
    Product.find(filter).populate("category", "name slug").populate("seller", "name").sort({ [sort]: direction }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)
  ]);
  res.json({ success: true, page, limit, total, totalPages: Math.ceil(total / limit), products });
});
exports.get = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate("category", "name").populate("seller", "name");
  if (!product) throw new AppError("Product not found", 404);
  res.json({ success: true, product });
});
exports.create = asyncHandler(async (req, res) => {
  const { name, description, sku, price, category, stock, imageUrl = "" } = req.body;
  if (!name || !description || !sku || price == null || !category || stock == null) throw new AppError("name, description, sku, price, category and stock are required", 400);
  if (!Number.isFinite(Number(price)) || Number(price) <= 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) throw new AppError("price must be positive and stock a non-negative integer", 400);
  if (!await Category.findOne({ _id: category, isActive: true })) throw new AppError("Active category not found", 400);
  const product = await Product.create({ name, description, sku, price, category, stock, imageUrl, seller: req.user._id });
  res.status(201).json({ success: true, product });
});
exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || (req.user.role !== "admin" && product.seller.toString() !== req.user._id.toString())) throw new AppError("Product not found or not permitted", 404);
  const allowed = ["name", "description", "price", "category", "imageUrl", "isActive", "lowStockThreshold"];
  for (const key of allowed) if (req.body[key] !== undefined) product[key] = req.body[key];
  await product.save();
  res.json({ success: true, product });
});
exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || (req.user.role !== "admin" && product.seller.toString() !== req.user._id.toString())) throw new AppError("Product not found or not permitted", 404);
  product.isActive = false;
  await product.save();
  res.json({ success: true, message: "Product deactivated" });
});
exports.restock = asyncHandler(async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) throw new AppError("quantity must be a positive integer", 400);
  const filter = { _id: req.params.id };
  if (req.user.role !== "admin") filter.seller = req.user._id;
  const product = await Product.findOneAndUpdate(filter, { $inc: { stock: quantity } }, { new: true, runValidators: true });
  if (!product) throw new AppError("Product not found or not permitted", 404);
  await InventoryLog.create({ product: product._id, seller: product.seller, type: "restock", quantityChange: quantity, stockAfter: product.stock, note: "Manual restock" });
  res.json({ success: true, product });
});
