const User = require("../models/User");

exports.listUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("username email role createdAt").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) { next(err); }
};
