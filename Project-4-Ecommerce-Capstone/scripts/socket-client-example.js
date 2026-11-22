// Optional manual test client. Run from a separate folder after: npm install socket.io-client
const { io } = require("socket.io-client");
const token = process.env.ACCESS_TOKEN;
if (!token) throw new Error("Set ACCESS_TOKEN to a valid login access token");
const socket = io("http://localhost:5000", { auth: { token } });
socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("connect_error", err => console.error("Socket auth/connect error:", err.message));
for (const event of ["connection:ready", "order:placed", "seller:new-order", "order:status", "inventory:low-stock"]) {
  socket.on(event, payload => console.log(event, payload));
}
