const Order = require("../models/Order");
const Product = require("../models/Product");
const InventoryLog = require("../models/InventoryLog");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { checkout } = require("../services/checkoutService");
const appEvents = require("../events/emitter");

exports.checkout = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "simulated_cod" } = req.body;
  const required = ["recipient", "phone", "line1", "city", "state", "postalCode"];
  if (!shippingAddress || required.some(k => !shippingAddress[k])) throw new AppError(`shippingAddress requires ${required.join(", ")}`, 400);
  if (!["simulated_cod", "simulated_online"].includes(paymentMethod)) throw new AppError("Unsupported paymentMethod; payment is simulated only", 400);
  const orders = await checkout(req.user, shippingAddress, paymentMethod);
  res.status(201).json({ success: true, message: "Checkout completed; payment simulation only", orders });
});
exports.mine = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const [orders, total] = await Promise.all([
    Order.find({ customer: req.user._id }).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate("seller", "name"),
    Order.countDocuments({ customer: req.user._id })
  ]);
  res.json({ success: true, page, limit, total, orders });
});
exports.sellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ seller: req.user._id }).sort({ createdAt: -1 }).populate("customer", "name email");
  res.json({ success: true, count: orders.length, orders });
});
exports.get = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === "customer") filter.customer = req.user._id;
  if (req.user.role === "seller") filter.seller = req.user._id;
  const order = await Order.findOne(filter).populate("customer", "name email").populate("seller", "name");
  if (!order) throw new AppError("Order not found or not permitted", 404);
  res.json({ success: true, order });
});
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, note = "" } = req.body;
  const allowed = ["confirmed", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) throw new AppError("Invalid requested status", 400);
  const filter = { _id: req.params.id };
  if (req.user.role === "seller") filter.seller = req.user._id;
  const order = await Order.findOne(filter);
  if (!order) throw new AppError("Order not found or not permitted", 404);
  const transitions = { placed: ["confirmed", "cancelled"], confirmed: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [] };
  if (!transitions[order.status].includes(status)) throw new AppError(`Cannot change order from ${order.status} to ${status}`, 409);
  if (status === "cancelled") {
    const session = await require("mongoose").startSession();
    try {
      await session.withTransaction(async () => {
        for (const item of order.items) {
          const product = await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { new: true, session });
          if (product) await InventoryLog.create([{ product: product._id, seller: product.seller, type: "cancellation_restore", quantityChange: item.quantity, stockAfter: product.stock, order: order._id }], { session });
        }
        order.status = "cancelled";
        order.statusHistory.push({ status, changedBy: req.user._id, note });
        await order.save({ session });
      });
    } finally { await session.endSession(); }
  } else {
    order.status = status;
    order.statusHistory.push({ status, changedBy: req.user._id, note });
    await order.save();
  }
  appEvents.emit("orderStatusChanged", { order, customerId: order.customer.toString() });
  res.json({ success: true, order });
});
