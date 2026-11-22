const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const User = require("../models/User");

exports.me = asyncHandler(async (req, res) => res.json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } }));
exports.updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name"];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (!Object.keys(update).length) throw new AppError("Only name can be updated here", 400);
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
  res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
