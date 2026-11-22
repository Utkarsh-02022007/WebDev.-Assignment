require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../src/models/User");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const passwordHash = await bcrypt.hash("Capstone@123", 12);
  const accounts = [
    { name: "System Admin", email: "admin@demo.com", role: "admin" },
    { name: "Demo Seller", email: "seller@demo.com", role: "seller" },
    { name: "Demo Customer", email: "customer@demo.com", role: "customer" }
  ];
  const users = {};
  for (const a of accounts) users[a.role] = await User.findOneAndUpdate(
    { email: a.email }, { $set: { ...a, passwordHash, status: "active" } }, { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const categoryData = [
    { name: "Electronics", slug: "electronics", description: "Electronic devices and accessories" },
    { name: "Books", slug: "books", description: "Academic and general books" },
    { name: "Accessories", slug: "accessories", description: "Everyday accessories" }
  ];
  const categories = {};
  for (const c of categoryData) categories[c.slug] = await Category.findOneAndUpdate({ slug: c.slug }, { $set: c }, { upsert: true, new: true });
  const productData = [
    { name: "Wireless Mouse", description: "Ergonomic wireless mouse with USB receiver.", sku: "ELEC-MOUSE-001", price: 599, category: categories.electronics._id, seller: users.seller._id, stock: 25, lowStockThreshold: 5 },
    { name: "USB-C Hub", description: "Multiport USB-C hub for laptops.", sku: "ELEC-HUB-002", price: 1499, category: categories.electronics._id, seller: users.seller._id, stock: 12, lowStockThreshold: 4 },
    { name: "Data Structures Handbook", description: "Introductory handbook for data structures.", sku: "BOOK-DS-003", price: 450, category: categories.books._id, seller: users.seller._id, stock: 3, lowStockThreshold: 5 },
    { name: "Laptop Sleeve", description: "Protective 14-inch laptop sleeve.", sku: "ACC-SLEEVE-004", price: 799, category: categories.accessories._id, seller: users.seller._id, stock: 18, lowStockThreshold: 4 }
  ];
  for (const p of productData) await Product.findOneAndUpdate({ sku: p.sku }, { $set: p }, { upsert: true, new: true });
  console.log("Seed completed.");
  console.log("Demo logins (all passwords: Capstone@123)");
  console.log("Admin: admin@demo.com | Seller: seller@demo.com | Customer: customer@demo.com");
  await mongoose.disconnect();
}
seed().catch(async err => { console.error(err); await mongoose.disconnect(); process.exit(1); });
