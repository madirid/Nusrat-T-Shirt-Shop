// Local storage keys
const STORAGE_KEYS = {
    PRODUCTS: 'ecommerce_products',
    USERS: 'ecommerce_users',
    ORDERS: 'ecommerce_orders',
    CURRENT_USER: 'ecommerce_current_user',
    CART: 'ecommerce_cart',
    ADMIN_USERS: 'ecommerce_admin_users'
};

// Initial product data
// const initialProducts = [ ... ]; // Remove this

// Initial admin user
// const initialAdminUser = { ... }; // Remove this

// Initialize local storage with data if empty
const initializeData = () => {
    // Only initialize products if they don't exist
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    }

    // Initialize other storage items if they don't exist
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }

    // Initialize admin users if they don't exist
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)) {
        const adminUsers = [
            {
                email: 'mdmahdiouzzamanridoy@gmail.com',
                password: '17106014',
                role: 'admin',
                name: 'Mahdi'
            },
            {
                email: 'nusrat122436@gmail.com',
                password: '122436',
                role: 'admin',
                name: 'Nusrat'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(adminUsers));
    }
};

// Data management service
const DataService = {
    // Product functions
    getAllProducts: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)),
    
    getProductsByCategory: (category) => {
        const products = DataService.getAllProducts();
        return products.filter(p => p.category === category);
    },
    
    addProduct: (product) => {
        const products = DataService.getAllProducts();
        const newProduct = {
            ...product,
            id: Date.now(),
            stock: product.stock || 0,
            status: product.stock > 0 ? 'In Stock' : 'Out of Stock',
            createdAt: new Date().toISOString()
        };
        products.push(newProduct);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return newProduct;
    },
    
    updateProduct: (updatedProduct) => {
        const products = DataService.getAllProducts();
        const index = products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            // Update stock status automatically
            products[index] = {
                ...updatedProduct,
                status: updatedProduct.stock > 0 ? 'In Stock' : 'Out of Stock',
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            return true;
        }
        return false;
    },
    
    deleteProduct: (productId) => {
        const products = DataService.getAllProducts();
        const filteredProducts = products.filter(p => p.id !== productId);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filteredProducts));
    },

    // User functions
    getAllUsers: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [],
    
    registerUser: (user) => {
        const users = DataService.getAllUsers();
        const newUser = {
            ...user,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            phone: user.phone || '',
            address: user.address || ''
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return newUser;
    },
    
    loginUser: (email, password) => {
        const users = DataService.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            return user;
        }
        return null;
    },

    // Cart functions
    getCart: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [],
    
    addToCart: (product, quantity = 1) => {
        if (!DataService.checkStockAvailability(product.id, quantity)) {
            throw new Error('Insufficient stock');
        }

        const cart = DataService.getCart();
        const existingItem = cart.find(item => item.productId === product.id);
        
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (!DataService.checkStockAvailability(product.id, newQuantity)) {
                throw new Error(`Cannot add more items - only ${product.stock} available in stock`);
            }
            existingItem.quantity = newQuantity;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity
            });
        }
        
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    },
    
    updateCartItemQuantity: (productId, quantity) => {
        const cart = DataService.getCart();
        const item = cart.find(item => item.productId === productId);
        if (item) {
            item.quantity = quantity;
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        }
    },
    
    removeFromCart: (productId) => {
        const cart = DataService.getCart();
        const updatedCart = cart.filter(item => item.productId !== productId);
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updatedCart));
    },

    // Order functions
    getAllOrders: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)),
    
    createOrder: (orderData) => {
        const orders = DataService.getAllOrders();
        const cart = DataService.getCart();
        const products = DataService.getAllProducts();
        
        // Verify stock availability for all items
        for (const item of cart) {
            if (!DataService.checkStockAvailability(item.productId, item.quantity)) {
                throw new Error(`Insufficient stock for product: ${item.name}`);
            }
        }

        // Create order with full item details
        const orderItems = cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            };
        });

        const newOrder = {
            ...orderData,
            id: Date.now(),
            items: orderItems,
            status: 'pending',
            date: new Date().toISOString(),
            totalAmount: cart.reduce((total, item) => total + (item.price * item.quantity), 0) + 120 // Adding delivery charge
        };

        // Update stock levels
        DataService.updateStockAfterOrder(cart);
        
        orders.push(newOrder);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        return newOrder;
    },
    
    updateOrderStatus: (orderId, status) => {
        const orders = DataService.getAllOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            order.lastUpdated = new Date().toISOString();
            
            if (status === 'cancelled') {
                order.cancelledAt = new Date().toISOString();
            }
            
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
            return true;
        }
        return false;
    },

    // New function to check stock availability
    checkStockAvailability: (productId, requestedQuantity) => {
        const products = DataService.getAllProducts();
        const product = products.find(p => p.id === productId);
        if (!product) return false;
        return product.stock >= requestedQuantity;
    },

    // New function to update stock after order
    updateStockAfterOrder: (orderItems) => {
        const products = DataService.getAllProducts();
        
        orderItems.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                product.stock -= item.quantity;
                product.status = product.stock > 0 ? 'In Stock' : 'Out of Stock';
            }
        });

        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    },

    updateUser: (updatedUser) => {
        const users = DataService.getAllUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            return true;
        }
        return false;
    },

    deleteUser: (userId) => {
        const users = DataService.getAllUsers();
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
        return true;
    }
};

// Initialize data when the file loads
initializeData(); 
