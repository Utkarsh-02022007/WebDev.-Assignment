const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Product name is required"], trim: true, minlength: 2, maxlength: 100 },
  sku: { type: String, required: [true, "SKU is required"], trim: true, uppercase: true, unique: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: [0.01, "Price must be greater than zero"] },
  quantity: { type: Number, required: true, min: [0, "Quantity cannot be negative"], default: 0, validate: Number.isInteger },
  reorderLevel: { type: Number, min: 0, default: 10, validate: Number.isInteger },
  supplier: { type: String, trim: true, default: "Not specified" }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual("stockValue").get(function () {
  return this.price * this.quantity;
});

module.exports = mongoose.model("Product", productSchema);
