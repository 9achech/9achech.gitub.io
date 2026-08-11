// Seed catalog data & default app settings for 9achech E-Commerce SPA

const DEFAULT_ADMIN = {
  username: "ghassen",
  password: "Azeqsdwxcgg99",
  role: "admin",
  name: "Ghassen Admin"
};

const DEFAULT_SETTINGS = {
  storeName: "9achech",
  whatsappNumber: "+21620123456",
  currency: "DT",
  shippingFee: 7.00
};

const DEFAULT_PRODUCTS = [
  // --- CATEGORY 1: Clothes (Clowth) ---
  {
    id: "p1",
    title: "Streetwear Cyber Oversized Hoodie",
    category: "Clowth",
    description: "Ultra-comfortable premium heavy cotton oversized hoodie with embroidered cybernetic typography. High durability & modern streetwear aesthetic.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    originalPrice: 120.00,
    price: 89.00,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    isFeatured: true,
    wishlistCount: 42,
    cartCount: 28
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
    isFeatured: true,
    wishlistCount: 65,
    cartCount: 19
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
    isFeatured: false,
    wishlistCount: 31,
    cartCount: 15
  },
  {
    id: "p4",
    title: "Minimalist Oversized Graphic Tee",
    category: "Clowth",
    description: "100% Organic breathable cotton oversized t-shirt with subtle chest print. Pre-shrunk premium fit.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    originalPrice: 45.00,
    price: 35.00,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    isFeatured: false,
    wishlistCount: 18,
    cartCount: 34
  },

  // --- CATEGORY 2: Accessories ---
  {
    id: "p5",
    title: "Matte Black Cyberpunk Sunglasses",
    category: "Accessoires",
    description: "Futuristic geometric frame sunglasses with UV400 polarized mirrored lenses and anti-glare coating.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    originalPrice: 65.00,
    price: 49.00,
    sizes: [],
    inStock: true,
    isFeatured: true,
    wishlistCount: 88,
    cartCount: 45
  },
  {
    id: "p6",
    title: "Stainless Steel Cuban Link Chain",
    category: "Accessoires",
    description: "Hypoallergenic heavy 8mm silver steel chain necklace. Tarnish-free waterproof daily accessory.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    originalPrice: 50.00,
    price: 39.00,
    sizes: [],
    inStock: true,
    isFeatured: false,
    wishlistCount: 29,
    cartCount: 22
  },
  {
    id: "p7",
    title: "Minimalist Smart Chronograph Watch",
    category: "Accessoires",
    description: "Sleek dark zinc alloy watch face with genuine leather strap, sapphire crystal glass, and 50m water resistance.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    originalPrice: 190.00,
    price: 139.00,
    sizes: [],
    inStock: true,
    isFeatured: true,
    wishlistCount: 74,
    cartCount: 31
  },
  {
    id: "p8",
    title: "Slim RFID Leather Wallet",
    category: "Accessoires",
    description: "Full-grain leather wallet with automatic pop-up card mechanism and built-in RFID blocking protection.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    originalPrice: 40.00,
    price: 29.00,
    sizes: [],
    inStock: true,
    isFeatured: false,
    wishlistCount: 15,
    cartCount: 12
  },

  // --- CATEGORY 3: Decoration ---
  {
    id: "p9",
    title: "Ambient RGB Corner Floor Lamp",
    category: "Décoration",
    description: "Smart WiFi-enabled ambient LED corner lamp with 16 million colors, music sync mode, and sleek aluminum body.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    originalPrice: 140.00,
    price: 99.00,
    sizes: [],
    inStock: true,
    isFeatured: true,
    wishlistCount: 95,
    cartCount: 52
  },
  {
    id: "p10",
    title: "Minimalist Sculptural Ceramic Vase",
    category: "Décoration",
    description: "Handcrafted matte Nordic donut ceramic vase. Perfect modern accent piece for living rooms & office desks.",
    image: "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=800&q=80",
    originalPrice: 55.00,
    price: 39.00,
    sizes: [],
    inStock: true,
    isFeatured: false,
    wishlistCount: 22,
    cartCount: 11
  },
  {
    id: "p11",
    title: "Custom Neon Wall Sign 'Good Vibes'",
    category: "Décoration",
    description: "Vibrant energy-saving acrylic LED neon wall light sign. Includes dimmer controller and wall mounting kit.",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    originalPrice: 110.00,
    price: 79.00,
    sizes: [],
    inStock: true,
    isFeatured: true,
    wishlistCount: 61,
    cartCount: 27
  },

  // --- CATEGORY 4: Subscription ---
  {
    id: "p12",
    title: "Recharge Orange 25 DT Code Express",
    category: "Subscription",
    description: "Orange Tunisia 25 DT recharge code delivered instantly via WhatsApp + bonus 25% internet volume.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    originalPrice: 25.00,
    price: 25.00,
    sizes: [],
    inStock: true,
    isFeatured: true,
    wishlistCount: 110,
    cartCount: 88
  },
  {
    id: "p13",
    title: "Pass Internet Orange 25 GB (30 Jours)",
    category: "Subscription",
    description: "High speed 4G/5G internet bundle 25 GB valid for 30 days on Orange SIM card. Immediate direct activation.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    originalPrice: 30.00,
    price: 25.00,
    sizes: [],
    inStock: true,
    isFeatured: true,
    wishlistCount: 140,
    cartCount: 105
  },
  {
    id: "p14",
    title: "Recharge Ooredoo 10 DT Code Express",
    category: "Subscription",
    description: "Ooredoo Tunisia 10 DT recharge code sent to your phone with double bonus credit.",
    image: "https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80",
    originalPrice: 10.00,
    price: 10.00,
    sizes: [],
    inStock: true,
    isFeatured: false,
    wishlistCount: 78,
    cartCount: 62
  },
  {
    id: "p15",
    title: "Pass Internet Flex Ooredoo 50 GB (30 Jours)",
    category: "Subscription",
    description: "Unlimited night + 50 GB data monthly pack for gamer & streaming lovers on Ooredoo network.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    originalPrice: 55.00,
    price: 48.00,
    sizes: [],
    inStock: true,
    isFeatured: true,
    wishlistCount: 165,
    cartCount: 130
  }
];

const DEFAULT_USERS = [
  {
    id: "u1",
    username: "karim_ben",
    email: "karim@example.tn",
    name: "Karim Ben Ali",
    password: "user123",
    role: "customer",
    status: "active", // "active" or "blocked"
    createdAt: "2026-07-15",
    wishlist: ["p1", "p5", "p13"]
  },
  {
    id: "u2",
    username: "sarah_m",
    email: "sarah@example.tn",
    name: "Sarah Mansour",
    password: "user123",
    role: "customer",
    status: "active",
    createdAt: "2026-08-01",
    wishlist: ["p2", "p9", "p15"]
  }
];
