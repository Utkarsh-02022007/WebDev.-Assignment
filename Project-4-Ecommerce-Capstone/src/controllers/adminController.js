const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

exports.createSeller = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) throw new AppError("name, email and password (min 8 chars) are required", 400);
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: "seller" });
  res.status(201).json({ success: true, seller: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
exports.listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("name email role status createdAt").sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});
exports.dashboard = asyncHandler(async (_req, res) => {
  const [users, products, orders, sales] = await Promise.all([
    User.countDocuments(), Product.countDocuments({ isActive: true }), Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$subtotal" } } }])
  ]);
  res.json({ success: true, metrics: { users, activeProducts: products, orders, grossSales: sales[0]?.total || 0 } });
});
