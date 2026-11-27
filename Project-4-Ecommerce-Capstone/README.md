# Project 4 — E-Commerce and Inventory Management System

**Course:** Backend Development Capstone  
**Student:** Utkarsh Yadav · **Roll No.:** 2501730329  
**Programme:** B.Tech CSE (AI & ML) · **Semester:** 3 · **Section:** C  
**Team size:** 1 students

## 1. Overview
A REST API backend for customers, sellers and administrators. Customers browse products, maintain a cart and place orders. Sellers manage their own products, stock and assigned orders. Administrators manage categories, create seller accounts and view platform metrics.

The payment workflow is deliberately simulated. No real card, banking or payment-gateway data is collected.

## 2. Technology
Node.js 20+, Express.js, MongoDB, Mongoose, bcrypt, JWT, Socket.IO, EventEmitter, dotenv, Helmet, CORS, Morgan and Postman.

## 3. Setup
1. Install Node.js 20+ and run MongoDB as a replica set (transactions are used for checkout and cancellation).
2. Extract this folder and run `npm install`.
3. Copy `.env.example` to `.env`; set strong, different JWT secrets and your MongoDB URI.
4. Run `npm run seed` to create demo users, categories and products.
5. Run `npm run dev` or `npm start`.
6. Open `http://localhost:5000/api/health`.

### Demo accounts
All seeded demo accounts use password `Capstone@123`:
- Admin: `admin@demo.com`
- Seller: `seller@demo.com`
- Customer: `customer@demo.com`

Change demo passwords and secrets before any deployment. The seed script is for local academic demonstration only.

## 4. Project structure
```text
src/
  config/       MongoDB connection
  controllers/  Request handlers
  events/       EventEmitter and Socket.IO handlers
  middleware/   Authentication and error handling
  models/       Mongoose schemas
  routes/       REST endpoints
  services/     Checkout business transaction
  utils/        Async wrapper and AppError
scripts/        Seed data
postman/        Importable Postman collection
docs/           Database and API notes
```

## 5. Roles and permissions
| Feature | Customer | Seller | Admin |
|---|---:|---:|---:|
| Browse products/categories | Yes | Yes | Yes |
| Cart and checkout | Own cart | No | No |
| View own orders | Yes | No | Yes |
| Manage products | No | Own products | All products |
| Restock inventory | No | Own products | Any product |
| Update seller orders | No | Own orders | All orders |
| Manage categories | No | No | Yes |
| Create seller accounts | No | No | Yes |
| Reports | No | Own seller data | Platform data |

Public registration always creates a customer. An administrator creates seller accounts. Admin account is seeded for demonstration; do not expose seed credentials in production.

## 6. API summary
All protected endpoints require `Authorization: Bearer <accessToken>`.

### Authentication
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public customer signup |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public with refresh token |
| POST | `/api/auth/logout` | Authenticated |

### Users and categories
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users/me` | Any authenticated |
| PATCH | `/api/users/me` | Any authenticated |
| GET | `/api/categories` | Public |
| POST | `/api/categories` | Admin |
| PATCH | `/api/categories/:id` | Admin |
| DELETE | `/api/categories/:id` | Admin (soft deactivate) |

### Products
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/products` | Public; search/filter/sort/page |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Seller/Admin |
| PATCH | `/api/products/:id` | Owner seller/Admin |
| DELETE | `/api/products/:id` | Owner seller/Admin (soft deactivate) |
| PATCH | `/api/products/:id/restock` | Owner seller/Admin |

### Cart and orders
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/cart` | Customer |
| POST | `/api/cart/items` | Customer |
| PATCH | `/api/cart/items/:productId` | Customer |
| DELETE | `/api/cart/items/:productId` | Customer |
| POST | `/api/orders/checkout` | Customer |
| GET | `/api/orders/mine` | Customer |
| GET | `/api/orders/seller` | Seller |
| GET | `/api/orders/:id` | Owner customer, assigned seller, Admin |
| PATCH | `/api/orders/:id/status` | Assigned seller/Admin |

### Reports and administration
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/reports/sales` | Seller/Admin |
| GET | `/api/reports/inventory` | Seller/Admin |
| POST | `/api/admin/sellers` | Admin |
| GET | `/api/admin/users` | Admin |
| GET | `/api/admin/dashboard` | Admin |

## 7. Order status rules
`placed → confirmed → shipped → delivered`  
Cancellation is allowed only from `placed` or `confirmed`. A cancellation restores stock and writes inventory logs in a MongoDB transaction. Invalid transitions return HTTP 409.

## 8. JWT design
Access tokens expire after the configured short TTL (default 15 minutes). Refresh tokens have a longer lifetime (default 7 days), are stored only as SHA-256 hashes in the user document and are rotated on refresh. Logout revokes the stored refresh token. Access tokens cannot be immediately revoked by this stateless implementation and expire naturally.

## 9. MongoDB indexes
- Unique email and SKU indexes prevent duplicate accounts/products.
- Product text index supports text search.
- `{ category, price, isActive }` supports category/price product browsing.
- `{ seller, createdAt }` supports seller product listings.
- `{ customer, createdAt }` supports customer order history.
- `{ seller, status, createdAt }` supports seller order queues.
- `{ product, createdAt }` supports inventory history.

## 10. Aggregation pipelines
1. `GET /api/reports/sales`: unwinds order items and groups by product to calculate units sold, gross sales and distinct order count.
2. `GET /api/reports/inventory`: groups active products by category, calculates product count, stock units, inventory valuation and low-stock count, then joins category names with `$lookup`.

## 11. EventEmitter and Socket.IO
EventEmitter emits `orderPlaced`, `orderStatusChanged` and `stockLow`. Listeners send notifications through Socket.IO and write server logs. Socket connections must authenticate with `{ auth: { token: accessToken } }`. Each connection joins `user:<userId>` and `role:<role>` rooms.

Socket events:
- Server → client: `connection:ready`, `order:placed`, `seller:new-order`, `order:status`, `inventory:low-stock`.
- The server emits only to the relevant customer, seller or administrator rooms.

## 12. API testing
Import `postman/Project_4_Ecommerce_Capstone.postman_collection.json`. Set `baseUrl`, run login requests for demo roles, then use the token variables. Run positive, validation, not-found and authorization tests. See `docs/TEST_PLAN.md`.

## 13. Known academic scope and limitations
- Payment is simulated; no real money is charged.
- Product images are represented by optional URLs; binary upload is not included.
- Checkout/cancellation require MongoDB transaction support, so use a replica set (MongoDB Atlas works).
- Email/SMS, shipping-provider integration, tax calculation and production deployment are outside this capstone scope.
- This is an academic starter implementation, not a production-audited commerce platform.

## 14. Team division (2 members)
| Member | Primary ownership | Shared work |
|---|---|---|
| Utkarsh Yadav (2501730329) | Authentication/JWT/RBAC, product and category APIs, database schema/indexes | Integration, testing, report and viva |
| Team Member 2 (enter actual name and roll number) | Cart/checkout/order lifecycle, inventory logs, aggregation reports, Socket.IO/EventEmitter | Integration, testing, report and viva |

Both members must understand the complete code and be able to explain their own contribution. Replace the second member placeholder with the actual details before submission.

## 15. Run checks
```bash
npm install
npm run check
npm run seed
npm start
```
Then import the Postman collection and run the test plan. Do not claim a test passed until it has been executed locally.
