const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { attachEventListeners } = require("./listeners");

function registerSocketHandlers(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(payload.sub);
      if (!user || user.status !== "active") return next(new Error("Invalid user"));
      socket.user = user;
      next();
    } catch (_err) { next(new Error("Invalid or expired token")); }
  });
  io.on("connection", socket => {
    socket.join(`user:${socket.user._id}`);
    socket.join(`role:${socket.user.role}`);
    socket.emit("connection:ready", { userId: socket.user._id, role: socket.user.role });
    socket.on("disconnect", reason => console.log(`Socket disconnected ${socket.user.email}: ${reason}`));
  });
  attachEventListeners(io);
}
module.exports = { registerSocketHandlers };
