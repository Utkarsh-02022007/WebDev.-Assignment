const appEvents = require("./emitter");

function attachEventListeners(io) {
  appEvents.on("orderPlaced", ({ order, customerId, sellerId }) => {
    io.to(`user:${customerId}`).emit("order:placed", { orderNumber: order.orderNumber, orderId: order._id, status: order.status });
    io.to(`user:${sellerId}`).emit("seller:new-order", { orderNumber: order.orderNumber, orderId: order._id });
    console.log(`[event] orderPlaced ${order.orderNumber}`);
  });
  appEvents.on("orderStatusChanged", ({ order, customerId }) => {
    io.to(`user:${customerId}`).emit("order:status", { orderNumber: order.orderNumber, status: order.status });
    console.log(`[event] orderStatusChanged ${order.orderNumber} -> ${order.status}`);
  });
  appEvents.on("stockLow", ({ productId, sellerId, stock }) => {
    io.to(`user:${sellerId}`).emit("inventory:low-stock", { productId, stock });
    io.to("role:admin").emit("inventory:low-stock", { productId, sellerId, stock });
    console.log(`[event] stockLow product=${productId} stock=${stock}`);
  });
}
module.exports = { attachEventListeners };
