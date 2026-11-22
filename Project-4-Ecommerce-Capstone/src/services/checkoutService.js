const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const InventoryLog = require("../models/InventoryLog");
const AppError = require("../utils/AppError");
const appEvents = require("../events/emitter");
const crypto = require("crypto");

async function checkout(customer, shippingAddress, paymentMethod) {
  const session = await mongoose.startSession();
  const createdOrders = [];
  try {
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ customer: customer._id }).populate("items.product").session(session);
      if (!cart || !cart.items.length) throw new AppError("Cart is empty", 400);
      const groups = new Map();
      for (const item of cart.items) {
        const product = await Product.findById(item.product._id).session(session);
        if (!product || !product.isActive) throw new AppError(`Product unavailable: ${item.product.name}`, 400);
        if (product.stock < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 409);
        const key = product.seller.toString();
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({ product, quantity: item.quantity });
      }
      for (const [sellerId, items] of groups) {
        const orderItems = [];
        let subtotal = 0;
        for (const item of items) {
          const updated = await Product.findOneAndUpdate(
            { _id: item.product._id, isActive: true, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true, session }
          );
          if (!updated) throw new AppError(`Stock changed during checkout for ${item.product.name}; retry checkout`, 409);
          const lineTotal = item.product.price * item.quantity;
          subtotal += lineTotal;
          orderItems.push({ product: item.product._id, nameSnapshot: item.product.name, skuSnapshot: item.product.sku, unitPrice: item.product.price, quantity: item.quantity });
          await InventoryLog.create([{ product: updated._id, seller: updated.seller, type: "sale", quantityChange: -item.quantity, stockAfter: updated.stock, note: "Checkout sale" }], { session });
          if (updated.stock <= updated.lowStockThreshold) {
            appEvents.emit("stockLow", { productId: updated._id.toString(), sellerId: updated.seller.toString(), stock: updated.stock });
          }
        }
        const order = new Order({
          orderNumber: `EC-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
          customer: customer._id, seller: sellerId, items: orderItems, subtotal,
          shippingAddress,
          payment: { method: paymentMethod, status: paymentMethod === "simulated_online" ? "simulated_paid" : "pending_cod", reference: `SIM-${crypto.randomBytes(5).toString("hex").toUpperCase()}` },
          status: "placed", statusHistory: [{ status: "placed", changedBy: customer._id, note: "Order placed" }]
        });
        await order.save({ session });
        createdOrders.push(order);
      }
      cart.items = [];
      await cart.save({ session });
    });
  } finally {
    await session.endSession();
  }
  for (const order of createdOrders) {
    appEvents.emit("orderPlaced", { order, customerId: customer._id.toString(), sellerId: order.seller.toString() });
  }
  return createdOrders;
}
module.exports = { checkout };
