document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const adminContent = document.getElementById('admin-content');
    const adminLoginForm = document.getElementById('admin-login-form');

    // Check if admin is logged in
    const checkAuth = () => {
        const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
        if (currentUser && currentUser.role === 'admin') {
            loginSection.classList.add('hidden');
            adminContent.classList.remove('hidden');
            return true;
        }
        loginSection.classList.remove('hidden');
        adminContent.classList.add('hidden');
        return false;
    };

    // Handle admin login
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        // Set admin users first
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

        // Then check credentials against admin users
        const adminUser = adminUsers.find(user => 
            user.email === email && 
            user.password === password && 
            user.role === 'admin'
        );

        if (adminUser) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminUser));
            checkAuth();
        } else {
            alert('Invalid admin credentials');
        }
    });

    // DOM Elements
    const productsList = document.getElementById('products-table-body');
    const addProductBtn = document.getElementById('add-product-btn');
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const orderSearch = document.getElementById('order-search');
    const clearOrderSearch = document.getElementById('clear-order-search');
    const resetOrderFilter = document.getElementById('reset-order-filter');

    // Update dashboard stats
    const updateDashboardStats = () => {
        document.getElementById('total-products').textContent = DataService.getAllProducts().length;
        document.getElementById('pending-orders').textContent = 
            DataService.getAllOrders().filter(order => order.status === 'pending').length;
        document.getElementById('total-users').textContent = DataService.getAllUsers().length;
    };

    // Render products list
    const renderProducts = () => {
        const products = DataService.getAllProducts();
        productsList.innerHTML = products.map(product => `
            <tr class="border-t">
                <td class="px-6 py-4">${product.name}</td>
                <td class="px-6 py-4">${product.category}</td>
                <td class="px-6 py-4">${product.price} BDT</td>
                <td class="px-6 py-4">${product.stock}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="editProduct(${product.id})" class="text-blue-500 mr-2">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-500">Delete</button>
                </td>
            </tr>
        `).join('');
    };

    // Show/hide modal
    const toggleModal = (show = true) => {
        if (show) {
            productModal.classList.remove('hidden');
            productModal.classList.add('flex');
        } else {
            productModal.classList.add('hidden');
            productModal.classList.remove('flex');
        }
    };

    // Handle form submission
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: Number(document.getElementById('product-price').value),
            stock: Number(document.getElementById('product-stock').value),
            description: document.getElementById('product-description').value,
            images: [document.getElementById('product-image').value]
        };

        try {
            if (productForm.dataset.editId) {
                productData.id = Number(productForm.dataset.editId);
                DataService.updateProduct(productData);
            } else {
                DataService.addProduct(productData);
            }

            toggleModal(false);
            renderProducts();
            updateDashboardStats();
            productForm.reset();
            delete productForm.dataset.editId;
        } catch (error) {
            alert('Error saving product: ' + error.message);
        }
    });

    // Edit product
    window.editProduct = (productId) => {
        const product = DataService.getAllProducts().find(p => p.id === productId);
        if (product) {
            modalTitle.textContent = 'Edit Product';
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-image').value = product.images[0];
            productForm.dataset.editId = productId;
            toggleModal(true);
        }
    };

    // Delete product
    window.deleteProduct = (productId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            DataService.deleteProduct(productId);
            renderProducts();
            updateDashboardStats();
        }
    };

    // Event Listeners for Add Product Modal
    addProductBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Add New Product';
        productForm.reset();
        delete productForm.dataset.editId;
        toggleModal(true);
    });

    closeModalBtn.addEventListener('click', () => {
        toggleModal(false);
    });

    // Close modal when clicking outside
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            toggleModal(false);
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        window.location.href = 'index.html';
    });

    // Tab Management
    const tabs = {
        products: document.getElementById('products-section'),
        orders: document.getElementById('orders-section'),
        users: document.getElementById('users-section')
    };

    const tabButtons = {
        products: document.getElementById('products-tab'),
        orders: document.getElementById('orders-tab'),
        users: document.getElementById('users-tab')
    };

    // Function to switch tabs
    const switchTab = (tabName) => {
        // Hide all tabs
        Object.values(tabs).forEach(tab => tab.classList.add('hidden'));
        Object.values(tabButtons).forEach(btn => btn.classList.remove('bg-gray-700'));
        
        // Show selected tab
        tabs[tabName].classList.remove('hidden');
        tabButtons[tabName].classList.add('bg-gray-700');
        
        // Render content for the selected tab
        switch(tabName) {
            case 'products':
                renderProducts();
                break;
            case 'orders':
                renderOrders();
                break;
            case 'users':
                renderUsers();
                break;
        }
    };

    // Add click event listeners to tab buttons
    Object.keys(tabButtons).forEach(tabName => {
        tabButtons[tabName].addEventListener('click', () => switchTab(tabName));
    });

    // Render Orders
    const renderOrders = (filteredOrders = null) => {
        const orders = filteredOrders || DataService.getAllOrders();
        const ordersTableBody = document.getElementById('orders-table-body');
        
        if (orders.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        No orders found
                    </td>
                </tr>
            `;
            return;
        }
        
        ordersTableBody.innerHTML = orders.map(order => `
            <tr class="border-t hover:bg-gray-50">
                <td class="px-6 py-4">#${order.id}</td>
                <td class="px-6 py-4">${order.customerEmail || 'N/A'}</td>
                <td class="px-6 py-4">${order.totalAmount} BDT</td>
                <td class="px-6 py-4">
                    <select onchange="updateOrderStatus(${order.id}, this.value)" 
                            class="border rounded px-2 py-1 ${getStatusColor(order.status)}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td class="px-6 py-4">${new Date(order.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">
                    <button onclick="viewOrderDetails(${order.id})" class="text-blue-500 hover:text-blue-700">
                        View Details
                    </button>
                </td>
            </tr>
        `).join('');
    };

    // Add order search functionality
    orderSearch.addEventListener('input', (e) => {
        const searchValue = e.target.value.trim();
        clearOrderSearch.classList.toggle('hidden', !searchValue);
        resetOrderFilter.classList.toggle('hidden', !searchValue);
        
        if (!searchValue) {
            renderOrders();
            return;
        }

        const orders = DataService.getAllOrders();
        const filteredOrders = orders.filter(order => 
            order.id.toString().includes(searchValue)
        );
        renderOrders(filteredOrders);
    });

    // Clear search
    clearOrderSearch.addEventListener('click', () => {
        orderSearch.value = '';
        clearOrderSearch.classList.add('hidden');
        resetOrderFilter.classList.add('hidden');
        renderOrders();
    });

    // Reset filter
    resetOrderFilter.addEventListener('click', () => {
        orderSearch.value = '';
        clearOrderSearch.classList.add('hidden');
        resetOrderFilter.classList.add('hidden');
        renderOrders();
    });

    // Render Users
    const renderUsers = () => {
        const users = DataService.getAllUsers();
        const usersTableBody = document.getElementById('users-table-body');
        
        usersTableBody.innerHTML = users.map(user => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">#${user.id}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${user.fullName || 'N/A'}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${user.email}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${user.phone || 'N/A'}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 max-w-xs truncate">${user.address || 'N/A'}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">
                        ${new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button onclick="editUser(${user.id})" class="text-blue-500 hover:text-blue-700 mr-3">
                        Edit
                    </button>
                    <button onclick="deleteUser(${user.id})" class="text-red-500 hover:text-red-700">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    };

    // Order status update function
    window.updateOrderStatus = (orderId, newStatus) => {
        const confirmChange = confirm(`Are you sure you want to mark this order as ${newStatus}?`);
        if (!confirmChange) return;

        try {
            if (newStatus === 'cancelled') {
                // If order is being cancelled, you might want to return items to stock
                const order = DataService.getAllOrders().find(o => o.id === orderId);
                if (order && order.items) {
                    const products = DataService.getAllProducts();
                    order.items.forEach(item => {
                        const product = products.find(p => p.id === item.productId);
                        if (product) {
                            product.stock += item.quantity;
                            DataService.updateProduct(product);
                        }
                    });
                }
            }

            DataService.updateOrderStatus(orderId, newStatus);
            renderOrders();
            updateDashboardStats();
            alert(`Order status updated to ${newStatus}`);
        } catch (error) {
            alert('Error updating order status: ' + error.message);
        }
    };

    // User deletion function
    window.deleteUser = (userId) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            if (DataService.deleteUser(userId)) {
                alert('User deleted successfully');
                renderUsers();
            } else {
                alert('Failed to delete user');
            }
        }
    };

    // View order details function
    window.viewOrderDetails = (orderId) => {
        const order = DataService.getAllOrders().find(o => o.id === orderId);
        if (order) {
            const orderDetails = `
                Order Details:
                ------------------------------
                Order ID: #${order.id}
                Customer Name: ${order.customerName}
                Email: ${order.email}
                Phone: ${order.phone}
                Address: ${order.address}
                Payment Method: ${order.paymentMethod}
                Transaction ID: ${order.transactionId}
                Status: ${order.status.toUpperCase()}
                Date: ${new Date(order.date).toLocaleString()}
                
                Items:
                ------------------------------
                ${order.items.map(item => 
                    `${item.name}
                     Quantity: ${item.quantity}
                     Price: ${item.price} BDT
                     Subtotal: ${item.quantity * item.price} BDT`
                ).join('\n\n')}
                
                ------------------------------
                Total Amount: ${order.totalAmount} BDT
            `;
            alert(orderDetails);
        }
    };

    // Add a function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-800';
            case 'processing':
                return 'bg-blue-50 text-blue-800';
            case 'shipped':
                return 'bg-purple-50 text-purple-800';
            case 'delivered':
                return 'bg-green-50 text-green-800';
            case 'cancelled':
                return 'bg-red-50 text-red-800';
            default:
                return '';
        }
    };

    // Add edit user function
    window.editUser = (userId) => {
        const users = DataService.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) return;

        const newData = {
            fullName: prompt('Enter new name:', user.fullName || ''),
            phone: prompt('Enter new phone:', user.phone || ''),
            address: prompt('Enter new address:', user.address || ''),
            email: prompt('Enter new email:', user.email)
        };

        if (!newData.email || !newData.fullName) {
            alert('Name and email are required!');
            return;
        }

        // Update user data
        const updatedUser = {
            ...user,
            ...newData,
            updatedAt: new Date().toISOString()
        };

        if (DataService.updateUser(updatedUser)) {
            alert('User updated successfully');
            renderUsers();
        } else {
            alert('Failed to update user');
        }
    };

    // Initial render
    renderProducts();
    updateDashboardStats();

    // Check authentication on page load
    checkAuth();

    // Start with products tab active
    switchTab('products');
}); 
