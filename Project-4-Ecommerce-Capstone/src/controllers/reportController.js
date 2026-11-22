const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

exports.sales = asyncHandler(async (req, res) => {
  const match = { status: { $ne: "cancelled" } };
  if (req.query.from || req.query.to) {
    match.createdAt = {};
    if (req.query.from) match.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) match.createdAt.$lte = new Date(req.query.to);
  }
  if (req.user.role === "seller") match.seller = req.user._id;
  const pipeline = [
    { $match: match },
    { $unwind: "$items" },
    { $group: { _id: { product: "$items.product", name: "$items.nameSnapshot" },
      unitsSold: { $sum: "$items.quantity" },
      grossSales: { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } },
      orderCount: { $addToSet: "$_id" } } },
    { $project: { _id: 0, productId: "$_id.product", productName: "$_id.name", unitsSold: 1, grossSales: 1, orderCount: { $size: "$orderCount" } } },
    { $sort: { grossSales: -1 } }, { $limit: 20 }
  ];
  const rows = await Order.aggregate(pipeline);
  res.json({ success: true, report: "best-selling products and gross sales", rows });
});

exports.inventory = asyncHandler(async (req, res) => {
  const match = { isActive: true };
  if (req.user.role === "seller") match.seller = new mongoose.Types.ObjectId(req.user._id);
  const pipeline = [
    { $match: match },
    { $group: { _id: "$category", productCount: { $sum: 1 }, unitsInStock: { $sum: "$stock" },
      inventoryValue: { $sum: { $multiply: ["$price", "$stock"] } },
      lowStockCount: { $sum: { $cond: [{ $lte: ["$stock", "$lowStockThreshold"] }, 1, 0] } } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, category: { $ifNull: ["$category.name", "Uncategorized"] }, productCount: 1, unitsInStock: 1, inventoryValue: 1, lowStockCount: 1 } },
    { $sort: { inventoryValue: -1 } }
  ];
  const rows = await Product.aggregate(pipeline);
  res.json({ success: true, report: "category-wise inventory valuation and low-stock counts", rows });
});
