// 9achech E-Commerce Application Core JavaScript Logic (Alpine.js State Engine)

document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    // Catalog & Filter state
    products: [],
    categories: ['All', 'Clowth', 'Accessoires', 'Décoration', 'Subscription'],
    activeCategory: 'All',
    searchQuery: '',
    priceFilter: 'all',
    sortBy: 'default',

    // Cart & Wishlist state
    cart: [],
    wishlist: [],
    
    // Orders state (Real Customer Submissions)
    orders: [],

    // Auth & Users state
    users: [],
    currentUser: null,
    isAdminMode: false,
    authTab: 'login',
    loginForm: { username: '', password: '' },
    signupForm: { name: '', username: '', email: '', password: '' },

    // Modals & UI State
    isCartOpen: false,
    isWishlistOpen: false,
    isAuthOpen: false,
    isProductModalOpen: false,
    selectedProduct: null,
    selectedSize: 'M',
    quantity: 1,

    // Checkout Form
    isCheckoutModalOpen: false,
    checkoutForm: {
      name: '',
      phone: '',
      address: '',
      city: 'Tunis',
      notes: ''
    },

    // Admin Dashboard State
    adminTab: 'overview',
    isProductEditModalOpen: false,
    isEditingExisting: false,
    productForm: {
      id: '',
      title: '',
      category: 'Clowth',
      description: '',
      image: '',
      originalPrice: 0,
      price: 0,
      sizesInput: 'S, M, L, XL',
      stockQuantity: 10,
      inStock: true,
      isFeatured: false
    },

    // Settings
    settings: DEFAULT_SETTINGS,
    isSyncingFromCloud: false,

    // Toast Alert
    toast: {
      show: false,
      message: '',
      type: 'success'
    },

    chartInstance1: null,
    chartInstance2: null,
    chartInstance3: null,

    // --- INITIALIZATION ---
    init() {
      this.loadStorage();

      // Start Real-Time Server REST API Data Sync
      this.syncWithCloud();
      setInterval(() => this.syncWithCloud(), 4000);

      // Sync active cart & wishlist size selections
      this.$watch('cart', () => this.saveStorage());
      this.$watch('wishlist', () => this.saveStorage());
      this.$watch('orders', () => {
        if (!this.isSyncingFromCloud) this.saveStorage();
      });
      this.$watch('products', () => {
        if (!this.isSyncingFromCloud) this.saveStorage();
        if (this.isAdminMode) {
          this.$nextTick(() => this.renderAdminCharts());
        }
      });
      this.$watch('users', () => {
        if (!this.isSyncingFromCloud) this.saveStorage();
      });
      this.$watch('currentUser', () => this.saveStorage());
      this.$watch('settings', () => {
        if (!this.isSyncingFromCloud) this.saveStorage();
      });
      this.$watch('isAdminMode', (val) => {
        if (val) {
          this.$nextTick(() => this.renderAdminCharts());
        }
      });
    },

    loadStorage() {
      // Auto-purge legacy fake cached data from browser LocalStorage
      if (!localStorage.getItem('9achech_v4_orders_stock')) {
        localStorage.removeItem('9achech_products');
        localStorage.removeItem('9achech_users');
        localStorage.setItem('9achech_v4_orders_stock', 'true');
      }

      // Products
      const storedProducts = localStorage.getItem('9achech_products');
      if (storedProducts) {
        try {
          this.products = JSON.parse(storedProducts);
        } catch (e) {
          this.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
        }
      } else {
        this.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
      }

      if (!Array.isArray(this.products) || this.products.length === 0) {
        this.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
      }

      // Ensure all products have stockQuantity field
      this.products.forEach(p => {
        if (p.stockQuantity === undefined) {
          p.stockQuantity = 10;
        }
        if (p.stockQuantity <= 0) {
          p.inStock = false;
        }
      });

      // Cart
      const storedCart = localStorage.getItem('9achech_cart');
      this.cart = storedCart ? JSON.parse(storedCart) : [];

      // Wishlist
      const storedWishlist = localStorage.getItem('9achech_wishlist');
      this.wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];

      // Orders
      const storedOrders = localStorage.getItem('9achech_orders');
      this.orders = storedOrders ? JSON.parse(storedOrders) : [];

      // Users
      const storedUsers = localStorage.getItem('9achech_users');
      if (storedUsers) {
        try {
          this.users = JSON.parse(storedUsers);
        } catch (e) {
          this.users = [];
        }
      } else {
        this.users = [];
      }

      // Current User & Admin Session
      const storedUser = localStorage.getItem('9achech_currentUser');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
          if (this.currentUser && this.currentUser.role === 'admin') {
            this.isAdminMode = true;
          }
        } catch (e) {
          this.currentUser = null;
        }
      }

      // Settings
      const storedSettings = localStorage.getItem('9achech_settings');
      if (storedSettings) {
        try {
          this.settings = JSON.parse(storedSettings);
        } catch (e) {
          this.settings = DEFAULT_SETTINGS;
        }
      }
    },

    saveStorage(triggerCloudPush = true) {
      localStorage.setItem('9achech_products', JSON.stringify(this.products));
      localStorage.setItem('9achech_cart', JSON.stringify(this.cart));
      localStorage.setItem('9achech_wishlist', JSON.stringify(this.wishlist));
      localStorage.setItem('9achech_orders', JSON.stringify(this.orders));
      localStorage.setItem('9achech_users', JSON.stringify(this.users));
      localStorage.setItem('9achech_currentUser', JSON.stringify(this.currentUser));
      localStorage.setItem('9achech_settings', JSON.stringify(this.settings));

      if (triggerCloudPush) {
        this.pushToCloud();
      }
    },

    // --- MULTI-DEVICE REAL-TIME CLOUD SYNC (SERVER REST API & DATABASE) ---
    applyCloudData(cloudData) {
      if (!cloudData || typeof cloudData !== 'object') return;

      this.isSyncingFromCloud = true;
      let needsPushBackToCloud = false;

      // Sync Products
      if (Array.isArray(cloudData.products) && cloudData.products.length > 0) {
        this.products = JSON.parse(JSON.stringify(cloudData.products));
      } else if (!this.products || this.products.length === 0) {
        this.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
      }

      // Sync Users
      if (Array.isArray(cloudData.users)) {
        const cloudUserIds = new Set(cloudData.users.map(u => u.id || u.username));
        cloudData.users.forEach(u => {
          const idx = this.users.findIndex(localU => (localU.id && u.id && localU.id === u.id) || localU.username === u.username);
          if (idx === -1) {
            this.users.push(u);
          } else {
            this.users[idx] = { ...this.users[idx], ...u };
          }
        });

        this.users.forEach(u => {
          if (!cloudUserIds.has(u.id || u.username)) {
            needsPushBackToCloud = true;
          }
        });
      } else if (this.users.length > 0) {
        needsPushBackToCloud = true;
      }

      // Sync Orders
      if (Array.isArray(cloudData.orders)) {
        const cloudOrderIds = new Set(cloudData.orders.map(o => o.id));
        cloudData.orders.forEach(o => {
          const existingOrd = this.orders.find(localO => localO.id === o.id);
          if (!existingOrd) {
            this.orders.unshift(o);
          } else if (existingOrd.status !== o.status) {
            existingOrd.status = o.status;
          }
        });

        this.orders.forEach(o => {
          if (!cloudOrderIds.has(o.id)) {
            needsPushBackToCloud = true;
          }
        });
      } else if (this.orders.length > 0) {
        needsPushBackToCloud = true;
      }

      // Sync Settings
      if (cloudData.settings) {
        this.settings = { ...this.settings, ...cloudData.settings };
      }

      // Force Alpine.js reactivity re-assignment
      this.products = [...this.products];
      this.users = [...this.users];
      this.orders = [...this.orders];

      this.saveStorage(false);

      this.$nextTick(() => {
        this.isSyncingFromCloud = false;
      });

      if (needsPushBackToCloud) {
        this.pushToCloud();
      }
    },

    async syncWithCloud(showToastNotice = false) {
      try {
        const response = await fetch('/api/store');
        if (response.ok) {
          const cloudData = await response.json();
          this.applyCloudData(cloudData);
          if (showToastNotice) {
            this.showToast("Synchronisation Base de Données Serveur réussie ! 🗄️", "success");
          }
        }
      } catch (err) {
        console.warn("Backend API sync fallback", err);
      }
    },

    async pushToCloud(forcePushProducts = false) {
      if (this.isSyncingFromCloud) return;

      const payload = {
        users: this.users,
        orders: this.orders,
        settings: this.settings,
        lastSync: new Date().toISOString()
      };

      // Push products if Admin mode, explicit force flag, or initial sync
      if (this.isAdminMode || forcePushProducts || !window.hasSyncedProductsOnce) {
        payload.products = this.products;
        window.hasSyncedProductsOnce = true;
      }

      try {
        await fetch('/api/store/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        console.log("🗄️ Pushed to Server Database successfully.");
      } catch (err) {
        console.warn("Server Database push error:", err);
      }
    },

    exportDataJSON() {
      const data = {
        products: this.products,
        users: this.users,
        orders: this.orders,
        settings: this.settings,
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `9achech_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast("Sauvegarde JSON téléchargée !", "success");
    },

    importDataJSON(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (imported.products) this.products = imported.products;
          if (imported.users) this.users = imported.users;
          if (imported.orders) this.orders = imported.orders;
          if (imported.settings) this.settings = imported.settings;
          this.saveStorage();
          this.showToast("Données importées avec succès !", "success");
          if (this.isAdminMode) {
            this.$nextTick(() => this.renderAdminCharts());
          }
        } catch (err) {
          this.showToast("Fichier JSON invalide", "error");
        }
      };
      reader.readAsText(file);
    },

    resetToDefaultData() {
      if (confirm("Voulez-vous vraiment réinitialiser toutes les données aux valeurs par défaut ?")) {
        this.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
        this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
        this.cart = [];
        this.wishlist = [];
        this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        this.saveStorage();
        this.showToast("Données réinitialisées avec succès !", "success");
        if (this.isAdminMode) {
          this.$nextTick(() => this.renderAdminCharts());
        }
      }
    },

    // --- CATALOG COMPUTED & FILTERS ---
    filteredProducts() {
      let list = [...this.products];

      // Category filter
      if (this.activeCategory !== 'All') {
        list = list.filter(p => p.category === this.activeCategory);
      }

      // Search Query
      if (this.searchQuery.trim() !== '') {
        const q = this.searchQuery.toLowerCase();
        list = list.filter(p => 
          p.title.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }

      // Price filter
      if (this.priceFilter === 'under50') {
        list = list.filter(p => p.price < 50);
      } else if (this.priceFilter === '50to100') {
        list = list.filter(p => p.price >= 50 && p.price <= 100);
      } else if (this.priceFilter === 'over100') {
        list = list.filter(p => p.price > 100);
      }

      // Sorting
      if (this.sortBy === 'price-asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (this.sortBy === 'price-desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (this.sortBy === 'popular') {
        list.sort((a, b) => (b.wishlistCount || 0) - (a.wishlistCount || 0));
      }

      return list;
    },

    // --- PRODUCT MODAL ---
    openProductModal(prod) {
      this.selectedProduct = prod;
      this.selectedSize = (prod.sizes && prod.sizes.length > 0) ? prod.sizes[0] : '';
      this.quantity = 1;
      this.isProductModalOpen = true;
    },

    // --- CART ACTIONS ---
    addToCart(product, size = '', qty = 1) {
      // Check if item needs size
      let itemSize = size;
      if (product.category === 'Clowth' && (!itemSize || itemSize === '')) {
        itemSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'M';
      }

      // Find existing item in cart
      const existingIndex = this.cart.findIndex(
        item => item.product.id === product.id && item.size === itemSize
      );

      if (existingIndex > -1) {
        this.cart[existingIndex].quantity += qty;
      } else {
        this.cart.push({
          product: { ...product },
          size: itemSize,
          quantity: qty
        });
      }

      // Increment stats
      const targetProd = this.products.find(p => p.id === product.id);
      if (targetProd) {
        targetProd.cartCount = (targetProd.cartCount || 0) + qty;
      }

      this.showToast(`"${product.title}" ajouté au panier !`, 'success');
      this.isProductModalOpen = false;
    },

    removeFromCart(index) {
      const removed = this.cart.splice(index, 1);
      if (removed.length > 0) {
        this.showToast(`Article retiré du panier`, 'info');
      }
    },

    updateCartQty(index, delta) {
      const item = this.cart[index];
      if (!item) return;

      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        this.removeFromCart(index);
      } else {
        item.quantity = newQty;
      }
    },

    cartCount() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    cartSubtotal() {
      return this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    },

    cartFinalTotal() {
      if (this.cart.length === 0) return 0;
      return this.cartSubtotal() + this.settings.shippingFee;
    },

    // --- WISHLIST ACTIONS ---
    toggleWishlist(productId) {
      const idx = this.wishlist.indexOf(productId);
      const targetProd = this.products.find(p => p.id === productId);

      if (idx > -1) {
        this.wishlist.splice(idx, 1);
        if (targetProd && targetProd.wishlistCount > 0) {
          targetProd.wishlistCount--;
        }
        this.showToast("Retiré des favoris", "info");
      } else {
        this.wishlist.push(productId);
        if (targetProd) {
          targetProd.wishlistCount = (targetProd.wishlistCount || 0) + 1;
        }
        this.showToast("Ajouté aux favoris ❤️", "success");
      }
    },

    isInWishlist(productId) {
      return this.wishlist.includes(productId);
    },

    getWishlistProducts() {
      return this.products.filter(p => this.wishlist.includes(p.id));
    },

    totalWishlistLikes() {
      let total = this.wishlist.length;
      this.users.forEach(u => {
        if (u.wishlist && Array.isArray(u.wishlist)) {
          total += u.wishlist.length;
        }
      });
      return total;
    },

    // --- AUTHENTICATION ---
    handleLogin() {
      const { username, password } = this.loginForm;

      if (!username || !password) {
        this.showToast("Veuillez remplir tous les champs", "error");
        return;
      }

      // Check Admin credentials (STRICT PASSWORD: Azeqsdwxcgg99)
      if (username === DEFAULT_ADMIN.username && password === "Azeqsdwxcgg99") {
        this.currentUser = { ...DEFAULT_ADMIN };
        this.isAdminMode = true;
        this.isAuthOpen = false;
        this.loginForm = { username: '', password: '' };
        this.showToast("Bienvenue Admin Ghassen !", "success");
        return;
      }

      // Check Normal User
      const foundUser = this.users.find(u => u.username === username || u.email === username);

      if (!foundUser) {
        this.showToast("Utilisateur introuvable", "error");
        return;
      }

      if (foundUser.password !== password) {
        this.showToast("Mot de passe incorrect", "error");
        return;
      }

      if (foundUser.status === 'blocked') {
        this.showToast("Compte bloqué par l'administrateur", "error");
        return;
      }

      this.currentUser = foundUser;
      this.isAdminMode = false;
      this.isAuthOpen = false;
      this.loginForm = { username: '', password: '' };
      this.showToast(`Ravi de vous revoir, ${foundUser.name} !`, "success");
    },

    handleSignup() {
      const { name, username, email, password } = this.signupForm;

      if (!name || !username || !email || !password) {
        this.showToast("Veuillez remplir tous les champs", "error");
        return;
      }

      // Check if username/email exists
      const exists = this.users.some(u => u.username === username || u.email === email);
      if (exists) {
        this.showToast("Nom d'utilisateur ou e-mail déjà utilisé", "error");
        return;
      }

      const newUser = {
        id: "u_" + Date.now(),
        name,
        username,
        email,
        password,
        role: "customer",
        status: "active",
        createdAt: new Date().toISOString().split('T')[0],
        wishlist: []
      };

      this.users.push(newUser);
      this.currentUser = newUser;
      this.saveStorage();
      this.isAdminMode = false;
      this.isAuthOpen = false;
      this.signupForm = { name: '', username: '', email: '', password: '' };
      this.showToast("Compte créé avec succès ! Welcome to 9achech 🎉", "success");
    },

    logout() {
      this.currentUser = null;
      this.isAdminMode = false;
      this.showToast("Déconnexion réussie", "info");
    },

    toggleBlockUser(user) {
      if (user.username === DEFAULT_ADMIN.username) return;

      user.status = (user.status === 'blocked') ? 'active' : 'blocked';
      this.showToast(`Statut de ${user.username} : ${user.status.toUpperCase()}`, "info");
    },

    deleteUser(userId) {
      const user = this.users.find(u => u.id === userId);
      if (user && user.username === DEFAULT_ADMIN.username) {
        this.showToast("Impossible de supprimer le compte administrateur principal", "error");
        return;
      }
      this.users = this.users.filter(u => u.id !== userId);
      this.saveStorage();
      this.showToast("Utilisateur supprimé avec succès", "info");
      if (this.isAdminMode) {
        this.$nextTick(() => this.renderAdminCharts());
      }
    },

    // --- WHATSAPP CHECKOUT ENGINE ---
    openCheckoutModal() {
      if (this.cart.length === 0) {
        this.showToast("Votre panier est vide", "error");
        return;
      }

      // Pre-fill user data if logged in
      if (this.currentUser) {
        this.checkoutForm.name = this.currentUser.name || '';
      }

      this.isCartOpen = false;
      this.isCheckoutModalOpen = true;
    },

    submitWhatsAppOrder() {
      const { name, phone, address, city, notes } = this.checkoutForm;

      if (!name || !phone || !address || !city) {
        this.showToast("Veuillez remplir les informations de livraison", "error");
        return;
      }

      // Construct clean formatted text for WhatsApp
      let msg = `🛒 *NOUVELLE COMMANDE - 9ACHECH*\n`;
      msg += `===============================\n\n`;
      msg += `👤 *Client:* ${name}\n`;
      msg += `📞 *Téléphone:* ${phone}\n`;
      msg += `📍 *Adresse:* ${address}, ${city}\n`;
      if (notes) msg += `📝 *Notes:* ${notes}\n`;
      msg += `\n📦 *ARTICLES COMMANDÉS:*\n`;

      this.cart.forEach((item, index) => {
        const sizeInfo = item.size ? ` (Taille: ${item.size})` : '';
        const itemTotal = (item.product.price * item.quantity).toFixed(2);
        msg += `${index + 1}. *${item.product.title}*${sizeInfo}\n`;
        msg += `   └ Qté: ${item.quantity} x ${item.product.price.toFixed(2)} DT = *${itemTotal} DT*\n`;
      });

      msg += `\n===============================\n`;
      msg += `💵 *Sous-total:* ${this.cartSubtotal().toFixed(2)} DT\n`;
      msg += `🚚 *Livraison:* ${this.settings.shippingFee.toFixed(2)} DT\n`;
      const encodedMsg = encodeURIComponent(msg);
      const cleanPhone = this.settings.whatsappNumber.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

      // Save order to store history
      const newOrder = {
        id: "CMD-" + Math.floor(100000 + Math.random() * 900000),
        customerName: name,
        customerPhone: phone,
        address: `${address}, ${city}`,
        notes: notes || '',
        items: JSON.parse(JSON.stringify(this.cart)),
        subtotal: this.cartSubtotal(),
        shippingFee: this.settings.shippingFee,
        total: this.cartFinalTotal(),
        status: 'pending', // 'pending' | 'delivered' | 'cancelled'
        createdAt: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      this.orders.unshift(newOrder);

      // Clear cart & close modal
      this.cart = [];
      this.isCheckoutModalOpen = false;
      this.showToast("Commande enregistrée ! Redirection vers WhatsApp...", "success");

      // Redirect
      window.open(waUrl, '_blank');
    },

    // --- ORDER STATUS & STOCK INVENTORY ENGINE ---
    updateOrderStatus(orderId, newStatus) {
      const order = this.orders.find(o => o.id === orderId);
      if (!order) return;

      const prevStatus = order.status;
      if (prevStatus === newStatus) return;

      // DELIVERED STATUS: Deduct stock quantity
      if (newStatus === 'delivered') {
        order.items.forEach(item => {
          const p = this.products.find(prod => prod.id === item.product.id);
          if (p) {
            const currentStock = (p.stockQuantity !== undefined) ? p.stockQuantity : 10;
            p.stockQuantity = Math.max(0, currentStock - item.quantity);
            if (p.stockQuantity <= 0) {
              p.stockQuantity = 0;
              p.inStock = false; // Mark as SOLDOUT
            }
          }
        });
        order.status = 'delivered';
        this.showToast(`Commande ${order.id} LIVRÉE ! Le stock a été déduit.`, 'success');
      } 
      // CANCELLED STATUS: Restore stock if previously delivered
      else if (newStatus === 'cancelled') {
        if (prevStatus === 'delivered') {
          order.items.forEach(item => {
            const p = this.products.find(prod => prod.id === item.product.id);
            if (p) {
              p.stockQuantity = (p.stockQuantity || 0) + item.quantity;
              if (p.stockQuantity > 0) {
                p.inStock = true; // Restore stock availability
              }
            }
          });
        }
        order.status = 'cancelled';
        this.showToast(`Commande ${order.id} ANNULÉE. Stock réintégré.`, 'info');
      } 
      // PENDING STATUS: Reset stock if previously delivered
      else if (newStatus === 'pending') {
        if (prevStatus === 'delivered') {
          order.items.forEach(item => {
            const p = this.products.find(prod => prod.id === item.product.id);
            if (p) {
              p.stockQuantity = (p.stockQuantity || 0) + item.quantity;
              if (p.stockQuantity > 0) {
                p.inStock = true;
              }
            }
          });
        }
        order.status = 'pending';
        this.showToast(`Commande ${order.id} remise En Attente.`, 'info');
      }

      this.saveStorage();
      if (this.isAdminMode) {
        this.$nextTick(() => this.renderAdminCharts());
      }
    },

    getPendingOrdersCount() {
      return this.orders.filter(o => o.status === 'pending').length;
    },

    getDeliveredOrdersCount() {
      return this.orders.filter(o => o.status === 'delivered').length;
    },

    getCancelledOrdersCount() {
      return this.orders.filter(o => o.status === 'cancelled').length;
    },

    getTotalDeliveredRevenue() {
      return this.orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total || 0), 0);
    },

    getSoldOutProductsCount() {
      return this.products.filter(p => !p.inStock || p.stockQuantity <= 0).length;
    },

    // --- ADMIN PRODUCT CRUD ---
    openAddProductModal() {
      this.isEditingExisting = false;
      this.productForm = {
        id: "p_" + Date.now(),
        title: '',
        category: 'Clowth',
        description: '',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        originalPrice: 100,
        price: 79,
        sizesInput: 'S, M, L, XL',
        stockQuantity: 10,
        inStock: true,
        isFeatured: false
      };
      this.isProductEditModalOpen = true;
    },

    openEditProductModal(product) {
      this.isEditingExisting = true;
      this.productForm = {
        id: product.id,
        title: product.title,
        category: product.category,
        description: product.description,
        image: product.image,
        originalPrice: product.originalPrice || product.price,
        price: product.price,
        sizesInput: product.sizes ? product.sizes.join(', ') : '',
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 10,
        inStock: product.inStock !== undefined ? product.inStock : true,
        isFeatured: product.isFeatured || false
      };
      this.isProductEditModalOpen = true;
    },

    handleProductImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.productForm.image = e.target.result;
        this.showToast("Image chargée avec succès !", "info");
      };
      reader.readAsDataURL(file);
    },

    saveProductForm() {
      const form = this.productForm;
      if (!form.title || !form.price || !form.category) {
        this.showToast("Titre, Catégorie et Prix sont obligatoires", "error");
        return;
      }

      const sizes = form.sizesInput.split(',').map(s => s.trim()).filter(s => s !== '');
      const qty = parseInt(form.stockQuantity) || 0;
      const isAvailable = qty > 0 && form.inStock;

      if (this.isEditingExisting) {
        const idx = this.products.findIndex(p => p.id === form.id);
        if (idx > -1) {
          const updatedProduct = {
            ...this.products[idx],
            title: form.title,
            category: form.category,
            description: form.description,
            image: form.image,
            originalPrice: parseFloat(form.originalPrice),
            price: parseFloat(form.price),
            sizes: sizes,
            stockQuantity: qty,
            inStock: isAvailable,
            isFeatured: form.isFeatured
          };
          this.products.splice(idx, 1, updatedProduct);
          this.products = [...this.products];
          this.showToast("Produit mis à jour avec succès !", "success");
        }
      } else {
        const newProduct = {
          id: form.id || ("p_" + Date.now()),
          title: form.title,
          category: form.category,
          description: form.description,
          image: form.image,
          originalPrice: parseFloat(form.originalPrice),
          price: parseFloat(form.price),
          sizes: sizes,
          stockQuantity: qty,
          inStock: isAvailable,
          isFeatured: form.isFeatured,
          wishlistCount: 0,
          cartCount: 0
        };
        this.products.unshift(newProduct);
        this.products = [...this.products];
        this.showToast("Nouveau produit ajouté à la boutique !", "success");
      }

      this.saveStorage();
      this.pushToCloud(true);
      this.isProductEditModalOpen = false;
    },

    deleteProduct(productId) {
      this.products = this.products.filter(p => p.id !== productId);
      this.saveStorage();
      this.pushToCloud(true);
      this.showToast("Produit supprimé du catalogue", "info");
      if (this.isAdminMode) {
        this.$nextTick(() => this.renderAdminCharts());
      }
    },

    deleteOrder(orderId) {
      this.orders = this.orders.filter(o => o.id !== orderId);
      this.saveStorage();
      this.showToast("Commande supprimée de la liste", "info");
      if (this.isAdminMode) {
        this.$nextTick(() => this.renderAdminCharts());
      }
    },

    getMostLikedProducts() {
      const counts = {};
      // Calculate real likes from user wishlists
      this.users.forEach(u => {
        if (u.wishlist && Array.isArray(u.wishlist)) {
          u.wishlist.forEach(id => {
            counts[id] = (counts[id] || 0) + 1;
          });
        }
      });
      // Calculate real likes from active session wishlist
      this.wishlist.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });

      return this.products
        .map(p => ({
          ...p,
          realLikes: counts[p.id] || p.wishlistCount || 0
        }))
        .sort((a, b) => b.realLikes - a.realLikes);
    },

    // --- CHART.JS ADMIN DASHBOARD RENDERER ---
    renderAdminCharts() {
      if (typeof Chart === 'undefined') return;

      // Top Real Wishlist Items Chart
      const topWishlist = this.getMostLikedProducts().slice(0, 5);

      const ctx1 = document.getElementById('chartWishlist');
      if (ctx1) {
        if (this.chartInstance1) this.chartInstance1.destroy();
        this.chartInstance1 = new Chart(ctx1, {
          type: 'bar',
          data: {
            labels: topWishlist.map(p => p.title.substring(0, 15) + '...'),
            datasets: [{
              label: 'Nombre de Likes ❤️',
              data: topWishlist.map(p => p.realLikes),
              backgroundColor: 'rgba(236, 72, 153, 0.75)',
              borderColor: '#ec4899',
              borderWidth: 1,
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#f8fafc' } }
            },
            scales: {
              x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
          }
        });
      }

      // Top Cart Popularity Chart
      const topCart = [...this.products]
        .sort((a, b) => (b.cartCount || 0) - (a.cartCount || 0))
        .slice(0, 5);

      const ctx2 = document.getElementById('chartCartPopularity');
      if (ctx2) {
        if (this.chartInstance2) this.chartInstance2.destroy();
        this.chartInstance2 = new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: topCart.map(p => p.title.substring(0, 15) + '...'),
            datasets: [{
              label: 'Ajouts au Panier',
              data: topCart.map(p => p.cartCount || 0),
              backgroundColor: 'rgba(139, 92, 246, 0.75)',
              borderColor: '#8b5cf6',
              borderWidth: 1,
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#f8fafc' } }
            },
            scales: {
              x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
          }
        });
      }

      // Category Distribution Chart
      const catCounts = {};
      this.products.forEach(p => {
        catCounts[p.category] = (catCounts[p.category] || 0) + 1;
      });

      const ctx3 = document.getElementById('chartCategories');
      if (ctx3) {
        if (this.chartInstance3) this.chartInstance3.destroy();
        this.chartInstance3 = new Chart(ctx3, {
          type: 'doughnut',
          data: {
            labels: Object.keys(catCounts),
            datasets: [{
              data: Object.values(catCounts),
              backgroundColor: [
                '#8b5cf6',
                '#06b6d4',
                '#10b981',
                '#f97316',
                '#ec4899'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#f8fafc' } }
            }
          }
        });
      }
    },

    // --- UI UTILS & TOAST ---
    showToast(msg, type = 'success') {
      this.toast.message = msg;
      this.toast.type = type;
      this.toast.show = true;

      setTimeout(() => {
        this.toast.show = false;
      }, 3500);
    },

    getBadgeClass(category) {
      if (category === 'Clowth') return 'badge-clothes';
      if (category === 'Accessoires') return 'badge-acc';
      if (category === 'Décoration') return 'badge-decor';
      if (category.includes('Connexion')) return 'badge-telecom';
      return 'badge-clothes';
    }
  }));
});
