const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb, saveDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '..')));

// --- REST API ENDPOINTS ---

// GET full store data
app.get('/api/store', (req, res) => {
  const db = getDb();
  res.json(db);
});

// POST full store sync
app.post('/api/store/sync', (req, res) => {
  const { products, users, orders, settings } = req.body;
  const db = getDb();

  if (Array.isArray(products) && products.length > 0) db.products = products;
  if (Array.isArray(users)) db.users = users;
  if (Array.isArray(orders)) db.orders = orders;
  if (settings) db.settings = settings;

  saveDb(db);
  res.json({ success: true, db });
});

// GET / POST products
app.get('/api/products', (req, res) => {
  const db = getDb();
  res.json(db.products || []);
});

app.post('/api/products', (req, res) => {
  const db = getDb();
  const product = req.body;
  
  const existingIdx = db.products.findIndex(p => p.id === product.id);
  if (existingIdx > -1) {
    db.products[existingIdx] = product;
  } else {
    db.products.unshift(product);
  }

  saveDb(db);
  res.json({ success: true, products: db.products });
});

app.delete('/api/products/:id', (req, res) => {
  const db = getDb();
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, products: db.products });
});

// GET / POST users
app.get('/api/users', (req, res) => {
  const db = getDb();
  res.json(db.users || []);
});

app.post('/api/users', (req, res) => {
  const db = getDb();
  const newUser = req.body;

  const idx = db.users.findIndex(u => u.username === newUser.username || u.email === newUser.email);
  if (idx > -1) {
    db.users[idx] = { ...db.users[idx], ...newUser };
  } else {
    db.users.push(newUser);
  }

  saveDb(db);
  res.json({ success: true, users: db.users });
});

app.delete('/api/users/:id', (req, res) => {
  const db = getDb();
  db.users = db.users.filter(u => u.id !== req.params.id && u.username !== req.params.id);
  saveDb(db);
  res.json({ success: true, users: db.users });
});

// GET / POST orders
app.get('/api/orders', (req, res) => {
  const db = getDb();
  res.json(db.orders || []);
});

app.post('/api/orders', (req, res) => {
  const db = getDb();
  const newOrder = req.body;

  const idx = db.orders.findIndex(o => o.id === newOrder.id);
  if (idx > -1) {
    db.orders[idx] = newOrder;
  } else {
    db.orders.unshift(newOrder);
  }

  saveDb(db);
  res.json({ success: true, orders: db.orders });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 9achech Server & Database running on http://0.0.0.0:${PORT}`);
});
