# Socket.IO Event Contract

## Authentication
Connect to `http://localhost:5000` with handshake auth:
```js
io("http://localhost:5000", { auth: { token: "<JWT access token>" } })
```
Unauthenticated or expired tokens are rejected.

## Rooms
- `user:<userId>` — private user notifications.
- `role:admin` — administrator inventory alerts.

## Server-to-client events
| Event | Recipient | Payload |
|---|---|---|
| `connection:ready` | Connected user | `{ userId, role }` |
| `order:placed` | Customer | `{ orderNumber, orderId, status }` |
| `seller:new-order` | Seller | `{ orderNumber, orderId }` |
| `order:status` | Customer | `{ orderNumber, status }` |
| `inventory:low-stock` | Product seller and admins | `{ productId, stock }` |

The REST API persists orders and inventory changes first; the EventEmitter listener then publishes notifications. Events are transient notifications; MongoDB remains the system of record.
