require("dotenv").config();
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const authRoutes = require("./src/routes/authRoutes");
const noteRoutes = require("./src/routes/noteRoutes");\nconst adminRoutes = require("./src/routes/adminRoutes");
const { authenticateSocket } = require("./src/middleware/auth");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");
const { events } = require("./src/events");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.get("/", (_req, res) => res.json({ message: "Secure Connect API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);\napp.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

io.use(authenticateSocket);
io.on("connection", socket => {
  console.log(`User connected: ${socket.user.username}`);
  socket.on("join_room", room => {
    if (typeof room !== "string" || !/^[a-zA-Z0-9_-]{1,40}$/.test(room)) return;
    socket.join(room);
    socket.emit("system_message", { message: `Joined room ${room}` });
  });
  socket.on("chat_message", ({ room = "general", message } = {}) => {
    if (typeof message !== "string" || !message.trim() || message.length > 1000) return;
    const payload = {
      username: socket.user.username,
      message: message.trim(),
      sentAt: new Date().toISOString()
    };
    io.to(room).emit("chat_message", payload);
    events.emit("chatMessage", payload);
  });
  socket.on("disconnect", () => console.log(`User disconnected: ${socket.user.username}`));
});

events.on("userRegistered", user => console.log(`[event] Registered: ${user.email}`));
events.on("noteCreated", note => console.log(`[event] Note created: ${note.title}`));
events.on("chatMessage", msg => console.log(`[event] [${msg.sentAt}] ${msg.username}: ${msg.message}`));

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
