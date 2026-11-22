# Database Design

## Collections
- `users`: name, email, passwordHash, role, status, refreshTokenHash and refreshTokenExpiresAt.
- `categories`: name, slug, description and isActive.
- `products`: name, description, SKU, price, category reference, seller reference, stock, lowStockThreshold, isActive and imageUrl.
- `carts`: one cart per customer; items contain product references and quantities.
- `orders`: one seller-specific order per seller group in a customer's checkout; stores product name/SKU/price snapshots, quantities, address, simulated payment, status and status history.
- `inventorylogs`: records sale, restock and cancellation_restore stock movements.

## Relationships
- User (customer) 1—1 Cart.
- Cart 1—many CartItems; each CartItem references one Product.
- User (seller) 1—many Products.
- Category 1—many Products.
- User (customer) 1—many Orders.
- User (seller) 1—many Orders.
- Order 1—many OrderItems; each item references Product and stores immutable purchase snapshots.
- Product 1—many InventoryLogs.

## Data integrity
- Email and SKU are unique.
- Cart quantity and stock are non-negative/positive integers as appropriate.
- Checkout uses a MongoDB transaction and conditional stock decrement `{ stock: { $gte: quantity } }` to prevent overselling.
- Order cancellation restores stock in a transaction.
- The server computes all line totals and order subtotals; client totals are ignored.
