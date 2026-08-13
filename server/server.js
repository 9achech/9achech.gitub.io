const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb, saveDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Azeqsdwxcgg99";

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '..')));

// --- AUTHENTICATION & SECURITY MIDDLEWARE ---
function isAdmin(req) {
  const authHeader = req.headers['x-admin-auth'] || req.headers['authorization'];
  return authHeader === ADMIN_PASSWORD || authHeader === `Bearer ${ADMIN_PASSWORD}`;
}

function requireAdminAuth(req, res, next) {
  if (isAdmin(req)) {
    return next();
  }
  return res.status(403).json({ error: "Accès refusé. Authentification administrateur requise." });
}

// --- REST API ENDPOINTS ---

// GET public store catalog & settings
app.get('/api/store', (req, res) => {
  const db = getDb();
  // Return public store data
  res.json({
    products: db.products || [],
    settings: db.settings || {},
    // Only return users list if request is from authenticated Admin
    users: isAdmin(req) ? (db.users || []) : [],
    orders: isAdmin(req) ? (db.orders || []) : []
  });
});

// POST full store sync (ADMIN ONLY)
app.post('/api/store/sync', requireAdminAuth, (req, res) => {
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

app.post('/api/products', requireAdminAuth, (req, res) => {
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

app.delete('/api/products/:id', requireAdminAuth, (req, res) => {
  const db = getDb();
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, products: db.products });
});

// CUSTOMER REGISTER ENDPOINT (Public, strictly forced role: customer)
app.post('/api/auth/register', (req, res) => {
  const db = getDb();
  const { name, username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  const existingUser = db.users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "Nom d'utilisateur ou e-mail déjà enregistré." });
  }

  const newUser = {
    id: "u_" + Date.now(),
    name: name || username,
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password: password,
    role: "customer", // SECURITY: Always forced to customer
    status: "active",
    createdAt: new Date().toISOString().split('T')[0],
    wishlist: []
  };

  db.users.push(newUser);
  saveDb(db);
  res.json({ success: true, user: newUser });
});

// GET / DELETE users (ADMIN ONLY)
app.get('/api/users', requireAdminAuth, (req, res) => {
  const db = getDb();
  res.json(db.users || []);
});

app.delete('/api/users/:id', requireAdminAuth, (req, res) => {
  const db = getDb();
  db.users = db.users.filter(u => u.id !== req.params.id && u.username !== req.params.id);
  saveDb(db);
  res.json({ success: true, users: db.users });
});

// CUSTOMER ORDER SUBMISSION (Public)
app.post('/api/orders', (req, res) => {
  const db = getDb();
  const newOrder = req.body;

  const idx = db.orders.findIndex(o => o.id === newOrder.id);
  if (idx > -1) {
    // Only Admin can update existing order status
    if (isAdmin(req)) {
      db.orders[idx] = newOrder;
    }
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
  console.log(`🚀 9achech Secured REST API & Database Server running on http://0.0.0.0:${PORT}`);
});
