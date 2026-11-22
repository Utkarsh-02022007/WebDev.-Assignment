const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    nameSnapshot: { type: String, required: true },
    skuSnapshot: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  shippingAddress: {
    recipient: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "India" }
  },
  payment: {
    method: { type: String, enum: ["simulated_cod", "simulated_online"], required: true },
    status: { type: String, enum: ["simulated_paid", "pending_cod", "refunded_simulated"], required: true },
    reference: String
  },
  status: { type: String, enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"], default: "placed" },
  statusHistory: [{ status: String, changedBy: mongoose.Schema.Types.ObjectId, changedAt: { type: Date, default: Date.now }, note: String }]
}, { timestamps: true });
schema.index({ customer: 1, createdAt: -1 });
schema.index({ seller: 1, status: 1, createdAt: -1 });
schema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model("Order", schema);
