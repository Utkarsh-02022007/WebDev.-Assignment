# Assignment 3 — Inventory and Data Management System

**Course:** Web Dev III · **Unit:** 3 · **CO:** CO3 · **Marks:** 2.5

## Requirements
Node.js 18+, MongoDB Community Server or MongoDB Atlas.

## Setup
```bash
npm install
cp .env.example .env
# Keep MongoDB running; edit MONGODB_URI in .env if required
npm start
```
Server: `http://localhost:5000`

## API routes
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/products` | Create product |
| GET | `/api/products` | List, filter, sort and paginate |
| GET | `/api/products/:id` | Get one product |
| PUT | `/api/products/:id` | Update product details |
| PATCH | `/api/products/:id/stock` | Increase/decrease stock |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/low-stock` | Low-stock report |
| GET | `/api/products/summary` | Category aggregation |

## Postman examples
Create (`POST /api/products`):
```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 48,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```
Filter/sort/page: `GET /api/products?category=Stationery&search=pen&sort=price&order=asc&page=1&limit=5`

Update (`PUT /api/products/PRODUCT_ID`):
```json
{"price": 140, "quantity": 60}
```
Stock adjustment (`PATCH /api/products/PRODUCT_ID/stock`):
```json
{"change": -3}
```
Use a positive change to restock and a negative change to record a sale. The API rejects a change that would make stock negative.

## Validation and implementation
Mongoose validates required fields, lengths, numeric ranges, integer quantities and unique SKU. The API uses a centralized async wrapper and error middleware. The summary endpoint uses a MongoDB aggregation pipeline. The stock endpoint checks the resulting quantity before saving.

## Submission note
Run every endpoint in Postman and insert your own screenshots in the report. Do not submit invented screenshots or claim a test passed unless you ran it.
