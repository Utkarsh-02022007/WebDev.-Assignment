const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const hashToken = token => crypto.createHash("sha256").update(token).digest("hex");
const accessToken = user => jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m" });
const refreshToken = user => jwt.sign({ sub: user._id.toString(), type: "refresh" }, process.env.JWT_REFRESH_SECRET, { expiresIn: `${process.env.REFRESH_TOKEN_TTL_DAYS || 7}d` });

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new AppError("name, email and password are required", 400);
  if (password.length < 8) throw new AppError("Password must contain at least 8 characters", 400);
  if (role && role !== "customer") throw new AppError("Public registration is customer-only; seller accounts are created by an administrator", 403);
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role: "customer" });
  res.status(201).json({ success: true, message: "Customer account created", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("email and password are required", 400);
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError("Invalid email or password", 401);
  if (user.status !== "active") throw new AppError("Account disabled", 403);
  const access = accessToken(user);
  const refresh = refreshToken(user);
  user.refreshTokenHash = hashToken(refresh);
  user.refreshTokenExpiresAt = new Date(Date.now() + Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7) * 86400000);
  await user.save();
  res.json({ success: true, accessToken: access, refreshToken: refresh, tokenType: "Bearer", expiresIn: process.env.ACCESS_TOKEN_TTL || "15m",
    user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

exports.refresh = async (req, res) => {
  const token = req.body.refreshToken;
  if (!token) throw new AppError("refreshToken is required", 400);
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
  catch (_e) { throw new AppError("Invalid or expired refresh token", 401); }
  const user = await User.findById(payload.sub).select("+refreshTokenHash +refreshTokenExpiresAt");
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token) || user.refreshTokenExpiresAt < new Date()) {
    throw new AppError("Refresh token revoked or expired", 401);
  }
  const newAccess = accessToken(user);
  const newRefresh = refreshToken(user);
  user.refreshTokenHash = hashToken(newRefresh);
  user.refreshTokenExpiresAt = new Date(Date.now() + Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7) * 86400000);
  await user.save();
  res.json({ success: true, accessToken: newAccess, refreshToken: newRefresh, tokenType: "Bearer" });
};

exports.logout = async (req, res) => {
  const user = await User.findById(req.user._id).select("+refreshTokenHash +refreshTokenExpiresAt");
  user.refreshTokenHash = undefined;
  user.refreshTokenExpiresAt = undefined;
  await user.save();
  res.json({ success: true, message: "Refresh token revoked; access token expires naturally" });
};
