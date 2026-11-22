# API Test Plan — Project 4

Base URL: `http://localhost:5000`

| ID | Scenario | Request | Expected |
|---|---|---|---|
| T01 | Health check | GET `/api/health` | 200 |
| T02 | Register customer | POST `/api/auth/register` valid body | 201 |
| T03 | Missing registration fields | POST `/api/auth/register` `{}` | 400 |
| T04 | Duplicate email | Register existing email | 409 |
| T05 | Login | POST `/api/auth/login` valid credentials | 200 + tokens |
| T06 | Invalid login | Wrong password | 401 |
| T07 | Refresh rotation | POST `/api/auth/refresh` valid refresh token | 200 new token pair |
| T08 | Reuse old refresh token | Refresh again with old token | 401 |
| T09 | Protected endpoint without token | GET `/api/users/me` | 401 |
| T10 | Customer access admin route | GET `/api/admin/users` | 403 |
| T11 | Browse products | GET `/api/products?page=1&limit=10` | 200 |
| T12 | Invalid product create | Seller POST with missing fields | 400 |
| T13 | Customer attempts product create | POST `/api/products` | 403 |
| T14 | Product not found | GET `/api/products/<invalid-id>` | 404 or 400 for malformed ID |
| T15 | Add cart item | Customer POST `/api/cart/items` | 201 |
| T16 | Empty cart checkout | POST `/api/orders/checkout` | 400 |
| T17 | Successful checkout | Customer POST checkout valid address | 201, order(s) |
| T18 | Oversell attempt | Checkout quantity beyond stock | 409 |
| T19 | Seller updates own order | PATCH order status valid transition | 200 |
| T20 | Invalid order transition | Delivered → shipped | 409 |
| T21 | Unauthorized order read | Other customer reads order | 404 |
| T22 | Sales report | Seller/Admin GET `/api/reports/sales` | 200 |
| T23 | Inventory report | Seller/Admin GET `/api/reports/inventory` | 200 |
| T24 | Socket auth missing | Connect without token | Connection rejected |
| T25 | Low stock event | Checkout causes stock ≤ threshold | Seller/admin receives event |

Record actual response status, response body and screenshot for the cases demonstrated in the viva. The Postman collection automates several basic assertions; execute the remaining business-rule cases manually.
