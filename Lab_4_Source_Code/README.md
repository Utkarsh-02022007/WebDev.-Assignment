# Assignment 4 — Secure Connect and Communication Platform

**Course:** Web Dev III · **Unit:** 4 · **Marks:** 2.5

## Requirements
Node.js 18+ and MongoDB. The project uses Express, bcrypt, jsonwebtoken, dotenv, Mongoose for persistence, and Socket.IO. No authentication or chat starter kit is used.

## Setup
```bash
npm install
cp .env.example .env
# Set a long random JWT_SECRET and confirm MONGODB_URI
npm start
```
Server: `http://localhost:5000`

## REST API
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register account |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| POST | `/api/notes` | JWT | Create own note |
| GET | `/api/notes` | JWT | List own notes |
| GET | `/api/notes/:id` | JWT | Read own note |
| PUT | `/api/notes/:id` | JWT | Update own note |
| DELETE | `/api/notes/:id` | JWT | Delete own note |\n| GET | `/api/admin/users` | Admin JWT | List users (RBAC-protected) |

## Postman examples
Signup (`POST /api/auth/signup`):
```json
{"username":"victor","email":"victor@example.com","password":"StrongPass123"}
```
Login (`POST /api/auth/login`):
```json
{"email":"victor@example.com","password":"StrongPass123"}
```
Copy the returned token. For notes, add header `Authorization: Bearer YOUR_TOKEN`.
Create note (`POST /api/notes`):
```json
{"title":"My First Note","content":"This is my first note for Web Dev III."}
```
List notes: `GET /api/notes`. Update: `PUT /api/notes/NOTE_ID` with `{"title":"Updated title","content":"Updated content"}`. Delete: `DELETE /api/notes/NOTE_ID`.

To test RBAC, register a user, then promote that account to admin in MongoDB (`users` collection: set `role` to `admin`). Call `GET /api/admin/users` with that account’s Bearer token. A normal user receives HTTP 403. The public signup route never accepts a role field, so clients cannot self-assign admin privileges.\n\n## Socket.IO real-time chat
Socket.IO connects to the same server. A client must authenticate using the JWT:
```js
const { io } = require("socket.io-client");
const socket = io("http://localhost:5000", { auth: { token: "YOUR_JWT" } });
socket.emit("join_room", "general");
socket.emit("chat_message", { room: "general", message: "Hello everyone!" });
socket.on("chat_message", data => console.log(data));
```
Install `socket.io-client` in a separate test client (`npm install socket.io-client`) or use a browser client. This client package is for testing only; the server-side platform uses Socket.IO.

## Event-driven features
Node.js EventEmitter emits `userRegistered`, `noteCreated`, and `chatMessage` events. The server logs each event. Socket connections and messages are logged to the console.

## Security notes
Passwords are hashed with bcrypt (12 salt rounds); plaintext passwords are never stored or returned. JWTs are signed with a secret loaded from `.env` and have an expiry. Notes are scoped to the authenticated owner, preventing users from reading or modifying another user's notes. Socket connections also require a valid JWT. Never commit `.env`.

## Submission note
Run the signup, login, unauthorized notes request, authorized note CRUD, and two-client chat tests. Capture your own Postman and terminal screenshots and place them in the report. The sample outputs below are illustrative, not proof of execution.
