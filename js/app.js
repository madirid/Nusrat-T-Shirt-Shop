document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const productsGrid = document.getElementById('products-grid');
    const searchInput = document.querySelector('input[type="search"]');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const cartCount = document.querySelector('.cart-count');

    // Additional DOM Elements for Cart
    const cartModal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartBtn = document.querySelector('.cart-btn');

    // Add these after your existing DOM elements
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const backToCartBtn = document.getElementById('back-to-cart-btn');
    const closeCheckoutBtn = document.getElementById('close-checkout-btn');
    const paymentInstructions = document.getElementById('payment-instructions');
    const transactionIdInput = document.getElementById('transaction-id');

    // Add these after your existing DOM elements
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.querySelector('.login-btn');
    const showRegisterBtn = document.getElementById('show-register-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const closeLoginBtn = document.getElementById('close-login-btn');
    const closeRegisterBtn = document.getElementById('close-register-btn');

    // Add these DOM elements after your existing ones
    const profileBtn = document.getElementById('profile-btn');
    const profileModal = document.getElementById('profile-modal');
    const closeProfileBtn = document.getElementById('close-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Add these after your existing DOM elements
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const closeForgotPasswordBtn = document.getElementById('close-forgot-password-btn');
    const sendCodeBtn = document.getElementById('send-code-btn');
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');

    // Payment method numbers
    const PAYMENT_NUMBERS = {
        bkash: '01700000000',
        nagad: '01700000001',
        upay: '01700000002'
    };

    // Store verification code and email
    let verificationCode = null;
    let resetEmail = null;

    // Add this after your existing DOM elements
    let currentCategory = 'all';

    // Render all products
    const renderProducts = (products = DataService.getAllProducts()) => {
        productsGrid.innerHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <!-- Image Container with fixed aspect ratio -->
                <div class="relative h-0 pb-[100%]">
                    <img src="${product.images[0]}" 
                         alt="${product.name}" 
                         class="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                         onerror="this.src='assets/placeholder.jpg'">
                    ${product.stock <= 0 ? `
                        <div class="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 m-2 rounded-md text-sm">
                            Out of Stock
                        </div>
                    ` : ''}
                </div>
                
                <!-- Product Info -->
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">${product.name}</h3>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description}</p>
                    
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-bold text-blue-600">${product.price} BDT</span>
                        <button onclick="addToCart(${product.id})" 
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 ${
                                    product.stock > 0 ? '' : 'opacity-50 cursor-not-allowed'
                                }"
                                ${product.stock > 0 ? '' : 'disabled'}>
                            <svg class="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    // Filter products by category
    const filterByCategory = (category) => {
        currentCategory = category;
        const products = DataService.getAllProducts();
        const filtered = category === 'all' 
            ? products 
            : products.filter(product => product.category === category);
        
        // Update active category button
        categoryButtons.forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('ring-2', 'ring-blue-500');
            } else {
                btn.classList.remove('ring-2', 'ring-blue-500');
            }
        });

        // Scroll to products section
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        
        // Update products section title
        const productsTitle = document.querySelector('#products h2');
        productsTitle.textContent = category === 'all' 
            ? 'All Products' 
            : `${category} Collection`;

        renderProducts(filtered);
    };

    // Search products
    const searchProducts = (query) => {
        const products = DataService.getAllProducts();
        let filtered = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
        );

        // Apply category filter if one is selected
        if (currentCategory !== 'all') {
            filtered = filtered.filter(product => product.category === currentCategory);
        }

        renderProducts(filtered);
    };

    // Add to cart functionality
    window.addToCart = (productId) => {
        try {
            const product = DataService.getAllProducts().find(p => p.id === productId);
            if (product && product.stock > 0) {
                const cart = DataService.getCart();
                const existingItem = cart.find(item => item.productId === productId);
                
                if (existingItem) {
                    if (existingItem.quantity >= product.stock) {
                        alert(`Sorry, only ${product.stock} items available in stock`);
                        return;
                    }
                }
                
                DataService.addToCart(product);
                updateCartCount();
                alert('Product added to cart!');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // Update cart count
    const updateCartCount = () => {
        const cart = DataService.getCart();
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    };

    // Show/hide cart modal
    const toggleCartModal = (show = true) => {
        if (show) {
            document.body.classList.add('modal-open');
            cartModal.classList.remove('hidden');
            renderCart();
        } else {
            document.body.classList.remove('modal-open');
            cartModal.classList.add('hidden');
        }
    };

    // Render cart items
    const renderCart = () => {
        const cart = DataService.getCart();
        const products = DataService.getAllProducts();
        
        cartItems.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            const isMaxStock = item.quantity >= product.stock;
            return `
                <div class="flex items-center justify-between border-b pb-4">
                    <div class="flex items-center space-x-4">
                        <img src="${product.images[0]}" alt="${product.name}" class="w-16 h-16 object-cover rounded">
                        <div>
                            <h4 class="font-semibold">${product.name}</h4>
                            <p class="text-gray-600">${product.price} BDT x ${item.quantity}</p>
                            <p class="text-sm text-gray-500">Stock: ${product.stock}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <button onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})"
                                    class="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})"
                                    class="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 ${isMaxStock ? 'opacity-50 cursor-not-allowed' : ''}"
                                    ${isMaxStock ? 'disabled' : ''}>+</button>
                        </div>
                        <button onclick="removeFromCart(${item.productId})" 
                                class="text-red-500 hover:text-red-700">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('') || '<p class="text-center text-gray-500">Your cart is empty</p>';

        // Calculate totals
        const subtotal = cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + (product.price * item.quantity);
        }, 0);

        cartSubtotal.textContent = `${subtotal} BDT`;
        cartTotal.textContent = `${subtotal + 120} BDT`; // Adding delivery charge
        checkoutBtn.disabled = cart.length === 0;
    };

    // Update cart quantity
    window.updateCartQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }

        const product = DataService.getAllProducts().find(p => p.id === productId);
        if (!product) {
            alert('Product not found');
            return;
        }

        if (newQuantity > product.stock) {
            alert(`Sorry, only ${product.stock} items available in stock`);
            return;
        }

        try {
            DataService.updateCartItemQuantity(productId, newQuantity);
            renderCart();
            updateCartCount();
        } catch (error) {
            alert(error.message);
        }
    };

    // Remove from cart
    window.removeFromCart = (productId) => {
        DataService.removeFromCart(productId);
        renderCart();
        updateCartCount();
    };

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        searchProducts(e.target.value);
    });

    // Add event listeners for category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            filterByCategory(category);
        });
    });

    // Event Listeners for Cart
    document.querySelector('.cart-btn').addEventListener('click', (e) => {
        e.preventDefault();
        toggleCartModal(true);
    });

    document.getElementById('close-cart-btn').addEventListener('click', () => {
        toggleCartModal(false);
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            toggleCartModal(false);
        }
    });

    checkoutBtn.addEventListener('click', () => {
        toggleCartModal(false);
        toggleCheckoutModal(true);
    });

    // Show/hide checkout modal
    const toggleCheckoutModal = (show = true) => {
        if (show) {
            document.body.classList.add('modal-open');
            checkoutModal.classList.remove('hidden');
            updateCheckoutSummary();
        } else {
            document.body.classList.remove('modal-open');
            checkoutModal.classList.add('hidden');
        }
    };

    // Update checkout summary
    const updateCheckoutSummary = () => {
        const cart = DataService.getCart();
        const products = DataService.getAllProducts();
        
        const subtotal = cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + (product.price * item.quantity);
        }, 0);

        document.getElementById('checkout-subtotal').textContent = `${subtotal} BDT`;
        document.getElementById('checkout-total').textContent = `${subtotal + 120} BDT`;
    };

    // Handle payment method selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const paymentMethod = e.target.value;
            document.getElementById('payment-number').textContent = PAYMENT_NUMBERS[paymentMethod];
            paymentInstructions.classList.remove('hidden');
            transactionIdInput.disabled = false;
        });
    });

    // Handle checkout form submission
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(checkoutForm);
        const orderData = {
            customerName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            paymentMethod: formData.get('paymentMethod'),
            transactionId: formData.get('transactionId'),
            date: new Date().toISOString()
        };

        try {
            const order = DataService.createOrder(orderData);
            alert('Order placed successfully! Order ID: ' + order.id);
            toggleCheckoutModal(false);
            toggleCartModal(false);
            updateCartCount();
        } catch (error) {
            alert(error.message);
        }
    });

    // Back to cart button
    backToCartBtn.addEventListener('click', () => {
        toggleCheckoutModal(false);
        toggleCartModal(true);
    });

    // Close checkout modal
    closeCheckoutBtn.addEventListener('click', () => {
        toggleCheckoutModal(false);
    });

    // Close checkout when clicking outside
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            toggleCheckoutModal(false);
        }
    });

    // Show/hide login modal
    const toggleLoginModal = (show = true) => {
        if (show) {
            document.body.classList.add('modal-open');
            loginModal.classList.remove('hidden');
            registerModal.classList.add('hidden');
        } else {
            document.body.classList.remove('modal-open');
            loginModal.classList.add('hidden');
        }
    };

    // Show/hide register modal
    const toggleRegisterModal = (show = true) => {
        if (show) {
            document.body.classList.add('modal-open');
            registerModal.classList.remove('hidden');
            loginModal.classList.add('hidden');
        } else {
            document.body.classList.remove('modal-open');
            registerModal.classList.add('hidden');
        }
    };

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const user = DataService.loginUser(email, password);
            if (user) {
                alert('Login successful!');
                toggleLoginModal(false);
                updateLoginStatus();
            } else {
                alert('Invalid email or password');
            }
        } catch (error) {
            alert(error.message);
        }
    });

    // Handle register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        
        if (formData.get('password') !== formData.get('confirmPassword')) {
            alert('Passwords do not match');
            return;
        }

        // Validate phone number
        const phoneNumber = formData.get('phone');
        if (!/^[0-9]{11}$/.test(phoneNumber)) {
            alert('Please enter a valid 11-digit phone number');
            return;
        }

        const userData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            password: formData.get('password'),
            createdAt: new Date().toISOString()
        };

        try {
            // Check if email already exists
            const existingUsers = DataService.getAllUsers();
            if (existingUsers.some(user => user.email === userData.email)) {
                alert('An account with this email already exists');
                return;
            }

            DataService.registerUser(userData);
            alert('Registration successful! Please login.');
            toggleRegisterModal(false);
            toggleLoginModal(true);
            registerForm.reset();
        } catch (error) {
            alert('Error during registration: ' + error.message);
        }
    });

    // Update login status
    const updateLoginStatus = () => {
        const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
        const loginBtn = document.querySelector('.login-btn');
        
        if (currentUser) {
            loginBtn.textContent = 'Logout';
            loginBtn.classList.remove('bg-green-500');
            loginBtn.classList.add('bg-red-500');
            profileBtn.classList.remove('hidden');
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.classList.remove('bg-red-500');
            loginBtn.classList.add('bg-green-500');
            profileBtn.classList.add('hidden');
        }
    };

    // Event Listeners for Login/Register
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
        
        if (currentUser) {
            // Handle logout
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            updateLoginStatus();
            alert('Logged out successfully');
        } else {
            toggleLoginModal(true);
        }
    });

    showRegisterBtn.addEventListener('click', () => {
        toggleRegisterModal(true);
    });

    showLoginBtn.addEventListener('click', () => {
        toggleLoginModal(true);
    });

    closeLoginBtn.addEventListener('click', () => {
        toggleLoginModal(false);
    });

    closeRegisterBtn.addEventListener('click', () => {
        toggleRegisterModal(false);
    });

    // Close modals when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            toggleLoginModal(false);
        }
    });

    registerModal.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            toggleRegisterModal(false);
        }
    });

    // Show/hide profile modal
    const toggleProfileModal = (show = true) => {
        if (show) {
            document.body.classList.add('modal-open');
            profileModal.classList.remove('hidden');
            renderProfile();
        } else {
            document.body.classList.remove('modal-open');
            profileModal.classList.add('hidden');
        }
    };

    // Render profile information
    const renderProfile = () => {
        const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
        if (!currentUser) return;

        // Update user info
        document.getElementById('profile-name').textContent = currentUser.fullName || 'N/A';
        document.getElementById('profile-email').textContent = currentUser.email || 'N/A';
        document.getElementById('profile-date').textContent = 
            currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A';

        // Get and sort user's orders
        const allOrders = DataService.getAllOrders();
        const userOrders = allOrders.filter(order => order.email === currentUser.email)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render order history
        const orderHistory = document.getElementById('order-history');
        
        if (userOrders.length === 0) {
            orderHistory.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p class="mt-4 text-gray-500">No orders yet</p>
                </div>`;
            return;
        }

        orderHistory.innerHTML = userOrders.map(order => `
            <div class="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div class="p-4">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h5 class="font-semibold">Order #${order.id}</h5>
                            <p class="text-sm text-gray-600">${new Date(order.date).toLocaleString()}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)} bg-opacity-10">
                            ${order.status.toUpperCase()}
                        </span>
                    </div>
                    
                    <div class="space-y-3">
                        ${order.items.map(item => `
                            <div class="flex justify-between items-center text-sm">
                                <div class="flex items-center space-x-2">
                                    <span class="font-medium">${item.name}</span>
                                    <span class="text-gray-500">x${item.quantity}</span>
                                </div>
                                <span>${item.price * item.quantity} BDT</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="mt-4 pt-4 border-t">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Total Amount:</span>
                            <span class="font-semibold">${order.totalAmount} BDT</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    };

    // Get order status color
    const getOrderStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-500 text-yellow-800';
            case 'processing': return 'bg-blue-500 text-blue-800';
            case 'shipped': return 'bg-purple-500 text-purple-800';
            case 'delivered': return 'bg-green-500 text-green-800';
            case 'cancelled': return 'bg-red-500 text-red-800';
            default: return 'bg-gray-500 text-gray-800';
        }
    };

    // Event Listeners for Profile
    profileBtn.addEventListener('click', () => {
        toggleProfileModal(true);
    });

    closeProfileBtn.addEventListener('click', () => {
        toggleProfileModal(false);
    });

    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            toggleProfileModal(false);
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        updateLoginStatus();
        toggleProfileModal(false);
        alert('Logged out successfully');
    });

    // Show/hide forgot password modal
    const toggleForgotPasswordModal = (show = true) => {
        if (show) {
            document.body.classList.add('modal-open');
            forgotPasswordModal.classList.remove('hidden');
            loginModal.classList.add('hidden');
            showForgotPasswordStep(1);
        } else {
            document.body.classList.remove('modal-open');
            forgotPasswordModal.classList.add('hidden');
            resetEmail = null;
            verificationCode = null;
        }
    };

    // Show specific step in forgot password process
    const showForgotPasswordStep = (step) => {
        document.getElementById('forgot-password-step-1').classList.add('hidden');
        document.getElementById('forgot-password-step-2').classList.add('hidden');
        document.getElementById('forgot-password-step-3').classList.add('hidden');
        
        document.getElementById(`forgot-password-step-${step}`).classList.remove('hidden');
    };

    // Generate random verification code
    const generateVerificationCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Simulate sending email (in real app, this would be a server call)
    const sendVerificationEmail = (email, code) => {
        // In a real application, this would send an actual email
        console.log(`Sending verification code ${code} to ${email}`);
        alert(`Verification code has been sent to ${email}\n(For demo purposes, the code is: ${code})`);
    };

    // Event Listeners for Forgot Password
    forgotPasswordBtn.addEventListener('click', () => {
        toggleForgotPasswordModal(true);
    });

    closeForgotPasswordBtn.addEventListener('click', () => {
        toggleForgotPasswordModal(false);
    });

    sendCodeBtn.addEventListener('click', () => {
        const email = document.getElementById('reset-email').value;
        const users = DataService.getAllUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            alert('No account found with this email address');
            return;
        }

        resetEmail = email;
        verificationCode = generateVerificationCode();
        sendVerificationEmail(email, verificationCode);
        showForgotPasswordStep(2);
    });

    verifyCodeBtn.addEventListener('click', () => {
        const enteredCode = document.getElementById('verification-code').value;
        
        if (enteredCode === verificationCode) {
            showForgotPasswordStep(3);
        } else {
            alert('Invalid verification code');
        }
    });

    resetPasswordBtn.addEventListener('click', () => {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const users = DataService.getAllUsers();
        const userIndex = users.findIndex(u => u.email === resetEmail);

        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            alert('Password has been reset successfully');
            toggleForgotPasswordModal(false);
            toggleLoginModal(true);
        }
    });

    forgotPasswordModal.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            toggleForgotPasswordModal(false);
        }
    });

    // Initial render
    renderProducts();
    updateCartCount();
    updateLoginStatus();
}); 