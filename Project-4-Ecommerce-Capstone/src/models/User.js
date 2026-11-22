const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["customer", "seller", "admin"], default: "customer" },
  status: { type: String, enum: ["active", "disabled"], default: "active" },
  refreshTokenHash: { type: String, select: false },
  refreshTokenExpiresAt: Date
}, { timestamps: true });
userSchema.index({ role: 1, status: 1 });
module.exports = mongoose.model("User", userSchema);
