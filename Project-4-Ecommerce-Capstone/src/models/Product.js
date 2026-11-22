const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 3000 },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  price: { type: Number, required: true, min: 0.01 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stock: { type: Number, required: true, min: 0, validate: Number.isInteger },
  lowStockThreshold: { type: Number, min: 0, default: 5 },
  isActive: { type: Boolean, default: true },
  imageUrl: { type: String, default: "" }
}, { timestamps: true });
schema.index({ name: "text", description: "text" });
schema.index({ category: 1, price: 1, isActive: 1 });
schema.index({ seller: 1, createdAt: -1 });
schema.index({ stock: 1, isActive: 1 });
module.exports = mongoose.model("Product", schema);
