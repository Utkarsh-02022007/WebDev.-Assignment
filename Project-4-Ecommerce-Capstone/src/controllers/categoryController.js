const Category = require("../models/Category");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

exports.list = asyncHandler(async (_req, res) => res.json({ success: true, categories: await Category.find({ isActive: true }).sort({ name: 1 }) }));
exports.create = asyncHandler(async (req, res) => {
  const { name, description = "" } = req.body;
  if (!name) throw new AppError("Category name is required", 400);
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const category = await Category.create({ name, slug, description });
  res.status(201).json({ success: true, category });
});
exports.update = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new AppError("Category not found", 404);
  res.json({ success: true, category });
});
exports.remove = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) throw new AppError("Category not found", 404);
  res.json({ success: true, message: "Category deactivated" });
});
