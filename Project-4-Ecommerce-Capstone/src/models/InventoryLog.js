const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["sale", "restock", "cancellation_restore"], required: true },
  quantityChange: { type: Number, required: true },
  stockAfter: { type: Number, required: true, min: 0 },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  note: String
}, { timestamps: true });
schema.index({ product: 1, createdAt: -1 });
module.exports = mongoose.model("InventoryLog", schema);
