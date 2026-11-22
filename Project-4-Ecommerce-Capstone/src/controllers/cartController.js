const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

exports.get = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.user._id }).populate({ path: "items.product", select: "name sku price stock isActive seller" });
  const items = (cart?.items || []).filter(i => i.product && i.product.isActive).map(i => ({
    product: i.product, quantity: i.quantity, lineTotal: i.product.price * i.quantity
  }));
  res.json({ success: true, items, total: items.reduce((sum, i) => sum + i.lineTotal, 0) });
});
exports.add = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !Number.isInteger(quantity) || quantity < 1) throw new AppError("productId and positive integer quantity are required", 400);
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw new AppError("Product not found", 404);
  if (product.stock < quantity) throw new AppError("Requested quantity exceeds available stock", 409);
  let cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) cart = new Cart({ customer: req.user._id, items: [] });
  const existing = cart.items.find(i => i.product.toString() === productId);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ product: productId, quantity });
  await cart.save();
  res.status(201).json({ success: true, message: "Item added to cart" });
});
exports.update = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1) throw new AppError("quantity must be a positive integer", 400);
  const cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) throw new AppError("Cart not found", 404);
  const item = cart.items.find(i => i.product.toString() === req.params.productId);
  if (!item) throw new AppError("Cart item not found", 404);
  const product = await Product.findById(req.params.productId);
  if (!product || product.stock < quantity) throw new AppError("Insufficient stock or product unavailable", 409);
  item.quantity = quantity;
  await cart.save();
  res.json({ success: true, message: "Cart quantity updated" });
});
exports.remove = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) throw new AppError("Cart not found", 404);
  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, message: "Item removed if it existed" });
});
