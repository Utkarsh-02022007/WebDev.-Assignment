require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./src/events/socket");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:3000", credentials: true }
});
app.set("io", io);
registerSocketHandlers(io);

connectDB()
  .then(() => server.listen(PORT, () => console.log(`E-commerce API listening on http://localhost:${PORT}`)))
  .catch(err => { console.error("Startup failed:", err.message); process.exit(1); });

process.on("unhandledRejection", err => {
  console.error("Unhandled rejection:", err);
  server.close(() => process.exit(1));
});
