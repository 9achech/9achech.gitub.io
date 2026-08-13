const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial data seed
const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    title: "Streetwear Cyber Oversized Hoodie",
    category: "Clowth",
    description: "Ultra-comfortable premium heavy cotton oversized hoodie with embroidered cybernetic typography.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    originalPrice: 120.00,
    price: 89.00,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockQuantity: 12,
    isFeatured: true,
    wishlistCount: 0,
    cartCount: 0
  },
  {
    id: "p2",
    title: "Vintage Leather Biker Jacket",
    category: "Clowth",
    description: "Classic authentic distressed leather biker jacket with custom metallic hardware and zipped cuffs.",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    originalPrice: 280.00,
    price: 219.00,
    sizes: ["M", "L", "XL"],
    inStock: true,
    stockQuantity: 12,
    isFeatured: true,
    wishlistCount: 0,
    cartCount: 0
  },
  {
    id: "p3",
    title: "Tactical Multi-Pocket Cargo Pants",
    category: "Clowth",
    description: "Modern techwear cargo trousers with adjustable ankle straps, water-repellent finish, and 6 utility pockets.",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
    originalPrice: 95.00,
    price: 69.00,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockQuantity: 10,
    isFeatured: false,
    wishlistCount: 0,
    cartCount: 0
  },
  {
    id: "p4",
    title: "Minimalist Oversized Graphic Tee",
    category: "Clowth",
    description: "100% Organic breathable cotton oversized t-shirt with subtle chest print.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    originalPrice: 45.00,
    price: 35.00,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockQuantity: 10,
    isFeatured: false,
    wishlistCount: 0,
    cartCount: 0
  }
];

const DEFAULT_SETTINGS = {
  storeName: "9achech",
  whatsappNumber: "+21620123456",
  currency: "DT",
  shippingFee: 7.00
};

function ensureDbExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: DEFAULT_PRODUCTS,
      users: [],
      orders: [],
      settings: DEFAULT_SETTINGS,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

function getDb() {
  ensureDbExists();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file:", err);
    return { products: DEFAULT_PRODUCTS, users: [], orders: [], settings: DEFAULT_SETTINGS };
  }
}

function saveDb(data) {
  ensureDbExists();
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  getDb,
  saveDb
};
