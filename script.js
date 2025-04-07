// Global variables
let currentUser = null;
let products = [];
let settings = {
    projectName: '',
    targetCategory: 'راقية',
    monthlyProducts: 100,
    defaultProfitRate: 50,
    fixedCosts: []
};
let currentProductId = null;
let productsPerPage = 6;
let currentPage = 1;
let categoriesChart = null;

// Initialize the application when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    initAuth();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize charts
    initCharts();
});

// Initialize authentication
function initAuth() {
    // Auth tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding form
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(`${tabId}Form`).classList.add('active');
        });
    });
    
    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
    
    // Login button
    document.getElementById('loginBtn').addEventListener('click', function() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showNotification('تنبيه', 'يرجى إدخال البريد الإلكتروني وكلمة المرور', 'warning');
            return;
        }
        
        // In a real application, you would validate credentials against a server
        // For this demo, we'll simulate a successful login
        login({
            name: 'مستخدم الحاسبة',
            email: email
        });
    });
    
    // Register button
    document.getElementById('registerBtn').addEventListener('click', function() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        if (!name || !email || !password || !passwordConfirm) {
            showNotification('تنبيه', 'يرجى إدخال جميع البيانات المطلوبة', 'warning');
            return;
        }
        
        if (password !== passwordConfirm) {
            showNotification('تنبيه', 'كلمة المرور وتأكيدها غير متطابقين', 'warning');
            return;
        }
        
        // In a real application, you would register the user on a server
        // For this demo, we'll simulate a successful registration
        login({
            name: name,
            email: email
        });
    });
    
    // Guest login button
    document.getElementById('guestLoginBtn').addEventListener('click', function() {
        login({
            name: 'زائر',
            email: 'guest@example.com',
            isGuest: true
        });
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });
    
    // Check for saved user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
        loadUserData();
    }
}

// Login function
function login(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    showMainApp();
    loadUserData();
    
    showNotification('تم تسجيل الدخول', `مرحباً بك ${user.name}!`, 'success');
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem(`settings_${currentUser?.email}`);
    localStorage.removeItem(`products_${currentUser?.email}`);
    
    showAuthModal();
    
    showNotification('تم تسجيل الخروج', 'نتمنى رؤيتك مرة أخرى قريباً', 'info');
}

// Show main app
function showMainApp() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    
    // Update user info
    document.getElementById('userDisplayName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
}

// Show auth modal
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

// Load user data
function loadUserData() {
    // Load settings
    const savedSettings = localStorage.getItem(`settings_${currentUser.email}`);
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        updateSettingsUI();
    }
    
    // Load products
    const savedProducts = localStorage.getItem(`products_${currentUser.email}`);
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        updateProductsUI();
        updateDashboardStats();
    }
}

// Initialize event listeners
function initEventListeners() {
    // Fixed costs calculation
    initFixedCostsCalculation();
    
    // Add fixed cost button
    document.getElementById('addFixedCostBtn').addEventListener('click', addFixedCostRow);
    
    // Save settings button
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Reset settings button
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
    
    // Product form toggles
    document.getElementById('hasSecondaryFabric').addEventListener('change', function() {
        document.getElementById('secondaryFabricGroup').style.display = this.checked ? 'block' : 'none';
        updateProductCalculations();
    });
    
    document.getElementById('hasScarf').addEventListener('change', function() {
        document.getElementById('scarfGroup').style.display = this.checked ? 'block' : 'none';
        document.getElementById('hasSecondaryScarfSwitch').style.display = this.checked ? 'block' : 'none';
        updateProductCalculations();
    });
    
    document.getElementById('hasSecondaryScarf').addEventListener('change', function() {
        document.getElementById('secondaryScarfGroup').style.display = this.checked ? 'block' : 'none';
        updateProductCalculations();
    });
    
    // Product form inputs
    const productInputs = document.querySelectorAll('#productForm input, #productForm select');
    productInputs.forEach(input => {
        input.addEventListener('input', updateProductCalculations);
    });
    
    // Save product button
    document.getElementById('saveProductBtn').addEventListener('click', function() {
        saveProduct(false);
    });
    
    // Save and new button
    document.getElementById('saveAndNewBtn').addEventListener('click', function() {
        saveProduct(true);
    });
    
    // Product filter, sort, and search
    document.getElementById('filterCategory').addEventListener('change', updateProductsUI);
    document.getElementById('sortProducts').addEventListener('change', updateProductsUI);
    document.getElementById('searchProducts').addEventListener('input', updateProductsUI);
    
    // Export buttons
    document.getElementById('exportSettingsBtn').addEventListener('click', exportSettings);
    document.getElementById('exportProductsBtn').addEventListener('click', exportProducts);
    document.getElementById('exportAllBtn').addEventListener('click', exportAll);
    
    // Product detail modal
    document.getElementById('editProductBtn').addEventListener('click', editCurrentProduct);
    document.getElementById('deleteProductBtn').addEventListener('click', deleteCurrentProduct);
}

// Initialize fixed costs calculation
function initFixedCostsCalculation() {
    const monthlyProductsInput = document.getElementById('monthlyProducts');
    
    // Update calculations when monthly products change
    monthlyProductsInput.addEventListener('input', function() {
        updateFixedCostsCalculation();
    });
    
    // Initial calculation
    updateFixedCostsCalculation();
}

// Update fixed costs calculation
function updateFixedCostsCalculation() {
    const monthlyProducts = parseFloat(document.getElementById('monthlyProducts').value) || 0;
    const fixedCostInputs = document.querySelectorAll('.fixed-cost');
    const fixedCostNames = document.querySelectorAll('.fixed-cost-name');
    const monthlyProductsCells = document.querySelectorAll('.monthly-products');
    let totalMonthlyCost = 0;
    
    // Update monthly products in all rows
    monthlyProductsCells.forEach(cell => {
        cell.textContent = monthlyProducts;
    });
    
    // Calculate cost per product for each row and total
    fixedCostInputs.forEach((input, index) => {
        if (input.closest('tr').id === 'addFixedCostRow') return;
        
        const cost = parseFloat(input.value) || 0;
        totalMonthlyCost += cost;
        
        const costPerProduct = monthlyProducts > 0 ? cost / monthlyProducts : 0;
        const costPerProductCell = input.closest('tr').querySelector('.cost-per-product');
        if (costPerProductCell) {
            costPerProductCell.textContent = costPerProduct.toFixed(2);
        }
    });
    
    // Update totals
    document.getElementById('totalMonthlyCost').textContent = totalMonthlyCost.toFixed(2);
    const totalCostPerProduct = monthlyProducts > 0 ? totalMonthlyCost / monthlyProducts : 0;
    document.getElementById('totalCostPerProduct').textContent = totalCostPerProduct.toFixed(2);
    
    // Update settings object
    settings.monthlyProducts = monthlyProducts;
    settings.fixedCosts = [];
    
    fixedCostInputs.forEach((input, index) => {
        if (input.closest('tr').id === 'addFixedCostRow') return;
        
        const row = input.getAttribute('data-row');
        const nameInput = document.querySelector(`.fixed-cost-name[data-row="${row}"]`);
        
        if (nameInput) {
            settings.fixedCosts.push({
                name: nameInput.value,
                cost: parseFloat(input.value) || 0
            });
        }
    });
}

// Add fixed cost row
function addFixedCostRow() {
    const fixedCostsTable = document.getElementById('fixedCostsTable');
    const addRow = document.getElementById('addFixedCostRow');
    const totalRow = document.querySelector('.total-row');
    const newRow = document.createElement('tr');
    const rowIndex = document.querySelectorAll('.fixed-cost').length;
    
    newRow.innerHTML = `
        <td>
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-plus-circle"></i></span>
                <input type="text" class="form-control fixed-cost-name" value="بند جديد" data-row="${rowIndex}">
            </div>
        </td>
        <td>
            <div class="input-group">
                <input type="number" class="form-control fixed-cost" data-row="${rowIndex}" value="0">
                <span class="input-group-text">ريال</span>
            </div>
        </td>
        <td class="monthly-products">${document.getElementById('monthlyProducts').value}</td>
        <td class="cost-per-product">0</td>
        <td>
            <button class="btn btn-sm btn-outline-danger delete-fixed-cost" data-row="${rowIndex}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    // Insert before the add row
    fixedCostsTable.querySelector('tbody').insertBefore(newRow, addRow);
    
    // Add event listeners
    const newInput = newRow.querySelector('.fixed-cost');
    newInput.addEventListener('input', updateFixedCostsCalculation);
    
    const newNameInput = newRow.querySelector('.fixed-cost-name');
    newNameInput.addEventListener('input', updateFixedCostsCalculation);
    
    const deleteButton = newRow.querySelector('.delete-fixed-cost');
    deleteButton.addEventListener('click', function() {
        newRow.remove();
        updateFixedCostsCalculation();
    });
    
    // Update calculations
    updateFixedCostsCalculation();
}

// Save settings
function saveSettings() {
    settings.projectName = document.getElementById('projectName').value;
    settings.targetCategory = document.getElementById('targetCategory').value;
    settings.monthlyProducts = parseFloat(document.getElementById('monthlyProducts').value) || 0;
    settings.defaultProfitRate = parseFloat(document.getElementById('defaultProfitRate').value) || 50;
    
    // Update fixed costs
    updateFixedCostsCalculation();
    
    // Save to localStorage
    localStorage.setItem(`settings_${currentUser.email}`, JSON.stringify(settings));
    
    // Update product target category
    document.getElementById('productTargetCategory').value = settings.targetCategory;
    
    // Update product calculations
    updateProductCalculations();
    
    showNotification('تم الحفظ', 'تم حفظ إعدادات المشروع بنجاح', 'success');
}

// Reset settings
function resetSettings() {
    settings = {
        projectName: '',
        targetCategory: 'راقية',
        monthlyProducts: 100,
        defaultProfitRate: 50,
        fixedCosts: []
    };
    
    updateSettingsUI();
    
    showNotification('تم إعادة التعيين', 'تم إعادة تعيين إعدادات المشروع', 'info');
}

// Update settings UI
function updateSettingsUI() {
    document.getElementById('projectName').value = settings.projectName;
    document.getElementById('targetCategory').value = settings.targetCategory;
    document.getElementById('monthlyProducts').value = settings.monthlyProducts;
    document.getElementById('defaultProfitRate').value = settings.defaultProfitRate;
    
    // Update product target category
    document.getElementById('productTargetCategory').value = settings.targetCategory;
    
    // Clear existing fixed cost rows
    const fixedCostsTable = document.getElementById('fixedCostsTable');
    const rows = fixedCostsTable.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (!row.classList.contains('total-row') && row.id !== 'addFixedCostRow') {
            row.remove();
        }
    });
    
    // Add fixed cost rows
    const addRow = document.getElementById('addFixedCostRow');
    settings.fixedCosts.forEach((cost, index) => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-plus-circle"></i></span>
                    <input type="text" class="form-control fixed-cost-name" value="${cost.name}" data-row="${index}">
                </div>
            </td>
            <td>
                <div class="input-group">
                    <input type="number" class="form-control fixed-cost" data-row="${index}" value="${cost.cost}">
                    <span class="input-group-text">ريال</span>
                </div>
            </td>
            <td class="monthly-products">${settings.monthlyProducts}</td>
            <td class="cost-per-product">0</td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-fixed-cost" data-row="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Insert before the add row
        fixedCostsTable.querySelector('tbody').insertBefore(newRow, addRow);
        
        // Add event listeners
        const newInput = newRow.querySelector('.fixed-cost');
        newInput.addEventListener('input', updateFixedCostsCalculation);
        
        const newNameInput = newRow.querySelector('.fixed-cost-name');
        newNameInput.addEventListener('input', updateFixedCostsCalculation);
        
        const deleteButton = newRow.querySelector('.delete-fixed-cost');
        deleteButton.addEventListener('click', function() {
            newRow.remove();
            updateFixedCostsCalculation();
        });
    });
    
    // Update calculations
    updateFixedCostsCalculation();
}

// Update product calculations
function updateProductCalculations() {
    // Get values
    const mainFabricCost = parseFloat(document.getElementById('mainFabricCost').value) || 0;
    const hasSecondaryFabric = document.getElementById('hasSecondaryFabric').checked;
    const secondaryFabricCost = hasSecondaryFabric ? (parseFloat(document.getElementById('secondaryFabricCost').value) || 0) : 0;
    
    const hasScarf = document.getElementById('hasScarf').checked;
    const mainScarfCost = hasScarf ? (parseFloat(document.getElementById('mainScarfCost').value) || 0) : 0;
    const hasSecondaryScarf = hasScarf && document.getElementById('hasSecondaryScarf').checked;
    const secondaryScarfCost = hasSecondaryScarf ? (parseFloat(document.getElementById('secondaryScarfCost').value) || 0) : 0;
    
    const sewingCost = parseFloat(document.getElementById('sewingCost').value) || 0;
    const packagingCost = parseFloat(document.getElementById('packagingCost').value) || 0;
    const shippingCost = parseFloat(document.getElementById('shippingCost').value) || 0;
    
    const additionalExpensesRate = parseFloat(document.getElementById('additionalExpensesRate').value) / 100 || 0;
    const profitRate = parseFloat(document.getElementById('profitRate').value) / 100 || 0;
    
    // Calculate fixed cost per product
    const fixedCostPerProduct = parseFloat(document.getElementById('totalCostPerProduct').textContent) || 0;
    
    // Calculate total cost
    const totalCost = mainFabricCost + secondaryFabricCost + mainScarfCost + secondaryScarfCost + 
                      sewingCost + packagingCost + shippingCost + fixedCostPerProduct;
    
    // Calculate final price
    const finalPrice = Math.round(totalCost * (1 + additionalExpensesRate) * (1 + profitRate));
    
    // Determine product category
    let category;
    if (finalPrice < 200) {
        category = 'اقتصادية';
    } else if (finalPrice < 300) {
        category = 'يومية';
    } else if (finalPrice < 450) {
        category = 'راقية';
    } else {
        category = 'عبايات فاخرة جداً';
    }
    
    // Update UI
    document.getElementById('totalCost').textContent = `${totalCost.toFixed(2)} ريال`;
    document.getElementById('finalPrice').textContent = `${finalPrice} ريال`;
    document.getElementById('calculatedCategory').textContent = category;
    
    // Update alert
    const targetCategory = settings.targetCategory;
    const alertElement = document.getElementById('categoryAlert');
    
    if (category === targetCategory) {
        alertElement.className = 'alert alert-success mt-3';
        alertElement.innerHTML = '<i class="fas fa-check-circle"></i> السعر مناسب للفئة المستهدفة';
    } else {
        alertElement.className = 'alert alert-warning mt-3';
        alertElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> السعر لا يعكس الفئة المستهدفة (${targetCategory})`;
    }
}

// Save product
function saveProduct(createNew) {
    // Validate form
    const productName = document.getElementById('productName').value;
    if (!productName) {
        showNotification('تنبيه', 'يرجى إدخال اسم المنتج', 'warning');
        return;
    }
    
    // Get values
    const productCode = document.getElementById('productCode').value;
    const mainFabricCost = parseFloat(document.getElementById('mainFabricCost').value) || 0;
    const hasSecondaryFabric = document.getElementById('hasSecondaryFabric').checked;
    const secondaryFabricCost = hasSecondaryFabric ? (parseFloat(document.getElementById('secondaryFabricCost').value) || 0) : 0;
    
    const hasScarf = document.getElementById('hasScarf').checked;
    const mainScarfCost = hasScarf ? (parseFloat(document.getElementById('mainScarfCost').value) || 0) : 0;
    const hasSecondaryScarf = hasScarf && document.getElementById('hasSecondaryScarf').checked;
    const secondaryScarfCost = hasSecondaryScarf ? (parseFloat(document.getElementById('secondaryScarfCost').value) || 0) : 0;
    
    const sewingCost = parseFloat(document.getElementById('sewingCost').value) || 0;
    const packagingCost = parseFloat(document.getElementById('packagingCost').value) || 0;
    const shippingCost = parseFloat(document.getElementById('shippingCost').value) || 0;
    
    const additionalExpensesRate = parseFloat(document.getElementById('additionalExpensesRate').value) / 100 || 0;
    const profitRate = parseFloat(document.getElementById('profitRate').value) / 100 || 0;
    
    // Calculate fixed cost per product
    const fixedCostPerProduct = parseFloat(document.getElementById('totalCostPerProduct').textContent) || 0;
    
    // Calculate total cost
    const totalCost = mainFabricCost + secondaryFabricCost + mainScarfCost + secondaryScarfCost + 
                      sewingCost + packagingCost + shippingCost + fixedCostPerProduct;
    
    // Calculate final price
    const finalPrice = Math.round(totalCost * (1 + additionalExpensesRate) * (1 + profitRate));
    
    // Determine product category
    let category;
    if (finalPrice < 200) {
        category = 'اقتصادية';
    } else if (finalPrice < 300) {
        category = 'يومية';
    } else if (finalPrice < 450) {
        category = 'راقية';
    } else {
        category = 'عبايات فاخرة جداً';
    }
    
    // Create product object
    const product = {
        id: currentProductId || Date.now(),
        name: productName,
        code: productCode,
        mainFabricCost: mainFabricCost,
        hasSecondaryFabric: hasSecondaryFabric,
        secondaryFabricCost: secondaryFabricCost,
        hasScarf: hasScarf,
        mainScarfCost: mainScarfCost,
        hasSecondaryScarf: hasSecondaryScarf,
        secondaryScarfCost: secondaryScarfCost,
        sewingCost: sewingCost,
        packagingCost: packagingCost,
        shippingCost: shippingCost,
        fixedCostPerProduct: fixedCostPerProduct,
        additionalExpensesRate: additionalExpensesRate,
        profitRate: profitRate,
        totalCost: totalCost,
        finalPrice: finalPrice,
        category: category,
        targetCategory: settings.targetCategory,
        date: new Date().toISOString()
    };
    
    // Add or update product
    if (currentProductId) {
        // Update existing product
        const index = products.findIndex(p => p.id === currentProductId);
        if (index !== -1) {
            products[index] = product;
        }
    } else {
        // Add new product
        products.push(product);
    }
    
    // Save to localStorage
    localStorage.setItem(`products_${currentUser.email}`, JSON.stringify(products));
    
    // Update UI
    updateProductsUI();
    updateDashboardStats();
    
    // Reset form if creating new
    if (createNew) {
        resetProductForm();
        showNotification('تم الحفظ', 'تم حفظ المنتج بنجاح وإنشاء منتج جديد', 'success');
    } else {
        showNotification('تم الحفظ', 'تم حفظ المنتج بنجاح', 'success');
        
        // Navigate to products tab
        document.querySelector('a[href="#products"]').click();
    }
}

// Reset product form
function resetProductForm() {
    document.getElementById('productForm').reset();
    currentProductId = null;
    
    // Reset toggles
    document.getElementById('secondaryFabricGroup').style.display = 'none';
    document.getElementById('scarfGroup').style.display = 'none';
    document.getElementById('hasSecondaryScarfSwitch').style.display = 'none';
    document.getElementById('secondaryScarfGroup').style.display = 'none';
    
    // Reset calculations
    updateProductCalculations();
}

// Update products UI
function updateProductsUI() {
    const productsList = document.getElementById('productsList');
    const filterCategory = document.getElementById('filterCategory').value;
    const sortBy = document.getElementById('sortProducts').value;
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    
    // Filter products
    let filteredProducts = [...products];
    
    if (filterCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === filterCategory);
    }
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.code.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort products
    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price':
                return a.finalPrice - b.finalPrice;
            case 'price-desc':
                return b.finalPrice - a.finalPrice;
            case 'profit':
                return a.profitRate - b.profitRate;
            case 'date':
                return new Date(b.date) - new Date(a.date);
            default:
                return 0;
        }
    });
    
    // Paginate products
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    } else if (currentPage < 1) {
        currentPage = 1;
    }
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
    
    // Clear products list
    productsList.innerHTML = '';
    
    // Show no products message if empty
    if (paginatedProducts.length === 0) {
        productsList.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-box-open"></i>
                <p>لا توجد منتجات تطابق معايير البحث</p>
                <button class="btn btn-primary" onclick="document.querySelector('a[href=\\'#pricing\\']').click()">
                    <i class="fas fa-plus"></i> إضافة منتج جديد
                </button>
            </div>
        `;
        
        // Hide pagination
        document.querySelector('.products-pagination').style.display = 'none';
        
        return;
    }
    
    // Show pagination
    document.querySelector('.products-pagination').style.display = 'flex';
    
    // Create product cards
    paginatedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-product-id', product.id);
        
        // Determine category class
        let categoryClass = '';
        switch (product.category) {
            case 'عبايات فاخرة جداً':
                categoryClass = 'category-luxury';
                break;
            case 'راقية':
                categoryClass = 'category-premium';
                break;
            case 'يومية':
                categoryClass = 'category-daily';
                break;
            case 'اقتصادية':
                categoryClass = 'category-economy';
                break;
        }
        
        productCard.innerHTML = `
            <div class="product-header">
                <div>
                    <h5 class="product-title">${product.name}</h5>
                    <div class="product-code">${product.code}</div>
                </div>
                <span class="product-category ${categoryClass}">${product.category}</span>
            </div>
            <div class="product-body">
                <div class="product-info">
                    <div class="info-item">
                        <div class="info-label">تكلفة القماش الأساسي</div>
                        <div class="info-value">${product.mainFabricCost} ريال</div>
                    </div>
                    ${product.hasSecondaryFabric ? `
                    <div class="info-item">
                        <div class="info-label">تكلفة القماش الثانوي</div>
                        <div class="info-value">${product.secondaryFabricCost} ريال</div>
                    </div>
                    ` : ''}
                    ${product.hasScarf ? `
                    <div class="info-item">
                        <div class="info-label">تكلفة قماش الطرحة</div>
                        <div class="info-value">${product.mainScarfCost} ريال</div>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <div class="info-label">تكلفة الخياطة</div>
                        <div class="info-value">${product.sewingCost} ريال</div>
                    </div>
                </div>
            </div>
            <div class="product-footer">
                <div class="product-price">${product.finalPrice} ريال</div>
                <div class="product-actions">
                    <button class="btn btn-sm btn-outline-primary view-product" data-product-id="${product.id}">
                        <i class="fas fa-eye"></i> عرض
                    </button>
                    <button class="btn btn-sm btn-outline-success edit-product" data-product-id="${product.id}">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-product" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `;
        
        productsList.appendChild(productCard);
    });
    
    // Add event listeners to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.product-actions')) {
                const productId = parseInt(this.getAttribute('data-product-id'));
                showProductDetail(productId);
            }
        });
    });
    
    // Add event listeners to product actions
    document.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            showProductDetail(productId);
        });
    });
    
    document.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            deleteProduct(productId);
        });
    });
    
    // Update pagination
    updatePagination(totalPages);
}

// Update pagination
function updatePagination(totalPages) {
    const pagination = document.getElementById('productsPagination');
    pagination.innerHTML = '';
    
    // Previous button
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><i class="fas fa-chevron-right"></i></a>`;
    pagination.appendChild(prevItem);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pagination.appendChild(pageItem);
    }
    
    // Next button
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next"><i class="fas fa-chevron-left"></i></a>`;
    pagination.appendChild(nextItem);
    
    // Add event listeners
    pagination.querySelectorAll('.page-link').forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (index === 0) {
                // Previous button
                if (currentPage > 1) {
                    currentPage--;
                    updateProductsUI();
                }
            } else if (index === pagination.querySelectorAll('.page-link').length - 1) {
                // Next button
                if (currentPage < totalPages) {
                    currentPage++;
                    updateProductsUI();
                }
            } else {
                // Page number
                currentPage = index;
                updateProductsUI();
            }
        });
    });
}

// Show product detail
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProductId = productId;
    
    const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
    
    // Update modal title
    document.getElementById('productDetailTitle').textContent = product.name;
    
    // Update modal body
    const modalBody = document.getElementById('productDetailBody');
    
    // Determine category class
    let categoryClass = '';
    switch (product.category) {
        case 'عبايات فاخرة جداً':
            categoryClass = 'category-luxury';
            break;
        case 'راقية':
            categoryClass = 'category-premium';
            break;
        case 'يومية':
            categoryClass = 'category-daily';
            break;
        case 'اقتصادية':
            categoryClass = 'category-economy';
            break;
    }
    
    modalBody.innerHTML = `
        <div class="product-detail-header">
            <div class="row">
                <div class="col-md-6">
                    <h6>رمز المنتج</h6>
                    <p>${product.code || 'غير محدد'}</p>
                </div>
                <div class="col-md-6">
                    <h6>الفئة</h6>
                    <span class="product-category ${categoryClass}">${product.category}</span>
                </div>
            </div>
        </div>
        
        <div class="product-detail-section">
            <h5><i class="fas fa-tshirt"></i> تكاليف العباية</h5>
            <div class="row">
                <div class="col-md-6">
                    <h6>تكلفة القماش الأساسي</h6>
                    <p>${product.mainFabricCost} ريال</p>
                </div>
                ${product.hasSecondaryFabric ? `
                <div class="col-md-6">
                    <h6>تكلفة القماش الثانوي</h6>
                    <p>${product.secondaryFabricCost} ريال</p>
                </div>
                ` : ''}
            </div>
        </div>
        
        ${product.hasScarf ? `
        <div class="product-detail-section">
            <h5><i class="fas fa-scarf"></i> تكاليف الطرحة</h5>
            <div class="row">
                <div class="col-md-6">
                    <h6>تكلفة قماش الطرحة الأساسي</h6>
                    <p>${product.mainScarfCost} ريال</p>
                </div>
                ${product.hasSecondaryScarf ? `
                <div class="col-md-6">
                    <h6>تكلفة قماش الطرحة الثانوي</h6>
                    <p>${product.secondaryScarfCost} ريال</p>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <div class="product-detail-section">
            <h5><i class="fas fa-hands-helping"></i> تكاليف الإنتاج</h5>
            <div class="row">
                <div class="col-md-4">
                    <h6>تكلفة الخياطة</h6>
                    <p>${product.sewingCost} ريال</p>
                </div>
                <div class="col-md-4">
                    <h6>تكلفة التغليف</h6>
                    <p>${product.packagingCost} ريال</p>
                </div>
                <div class="col-md-4">
                    <h6>تكلفة التوصيل الداخلي</h6>
                    <p>${product.shippingCost} ريال</p>
                </div>
            </div>
        </div>
        
        <div class="product-detail-section">
            <h5><i class="fas fa-chart-line"></i> الربحية</h5>
            <div class="row">
                <div class="col-md-4">
                    <h6>نسبة المصاريف الإضافية</h6>
                    <p>${(product.additionalExpensesRate * 100).toFixed(0)}%</p>
                </div>
                <div class="col-md-4">
                    <h6>نسبة الربح</h6>
                    <p>${(product.profitRate * 100).toFixed(0)}%</p>
                </div>
                <div class="col-md-4">
                    <h6>التكلفة الثابتة</h6>
                    <p>${product.fixedCostPerProduct.toFixed(2)} ريال</p>
                </div>
            </div>
        </div>
        
        <div class="product-detail-results">
            <div class="row">
                <div class="col-md-4">
                    <div class="result-card">
                        <div class="result-title">إجمالي التكلفة</div>
                        <div class="result-value">${product.totalCost.toFixed(2)} ريال</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="result-card">
                        <div class="result-title">السعر النهائي</div>
                        <div class="result-value">${product.finalPrice} ريال</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="result-card">
                        <div class="result-title">الفئة المحسوبة</div>
                        <div class="result-value">${product.category}</div>
                    </div>
                </div>
            </div>
            <div class="alert mt-3 ${product.category === product.targetCategory ? 'alert-success' : 'alert-warning'}">
                <i class="fas fa-${product.category === product.targetCategory ? 'check-circle' : 'exclamation-triangle'}"></i>
                ${product.category === product.targetCategory ? 
                    'السعر مناسب للفئة المستهدفة' : 
                    `السعر لا يعكس الفئة المستهدفة (${product.targetCategory})`}
            </div>
        </div>
    `;
    
    modal.show();
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Set current product ID
    currentProductId = productId;
    
    // Navigate to pricing tab
    document.querySelector('a[href="#pricing"]').click();
    
    // Fill form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productCode').value = product.code;
    document.getElementById('mainFabricCost').value = product.mainFabricCost;
    
    document.getElementById('hasSecondaryFabric').checked = product.hasSecondaryFabric;
    document.getElementById('secondaryFabricGroup').style.display = product.hasSecondaryFabric ? 'block' : 'none';
    document.getElementById('secondaryFabricCost').value = product.secondaryFabricCost;
    
    document.getElementById('hasScarf').checked = product.hasScarf;
    document.getElementById('scarfGroup').style.display = product.hasScarf ? 'block' : 'none';
    document.getElementById('mainScarfCost').value = product.mainScarfCost;
    
    document.getElementById('hasSecondaryScarfSwitch').style.display = product.hasScarf ? 'block' : 'none';
    document.getElementById('hasSecondaryScarf').checked = product.hasSecondaryScarf;
    document.getElementById('secondaryScarfGroup').style.display = product.hasSecondaryScarf ? 'block' : 'none';
    document.getElementById('secondaryScarfCost').value = product.secondaryScarfCost;
    
    document.getElementById('sewingCost').value = product.sewingCost;
    document.getElementById('packagingCost').value = product.packagingCost;
    document.getElementById('shippingCost').value = product.shippingCost;
    
    document.getElementById('additionalExpensesRate').value = (product.additionalExpensesRate * 100).toFixed(0);
    document.getElementById('profitRate').value = (product.profitRate * 100).toFixed(0);
    
    // Update calculations
    updateProductCalculations();
    
    showNotification('تعديل المنتج', `جاري تعديل المنتج: ${product.name}`, 'info');
}

// Edit current product
function editCurrentProduct() {
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('productDetailModal')).hide();
    
    // Edit product
    editProduct(currentProductId);
}

// Delete product
function deleteProduct(productId) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            const productName = products[index].name;
            products.splice(index, 1);
            
            // Save to localStorage
            localStorage.setItem(`products_${currentUser.email}`, JSON.stringify(products));
            
            // Update UI
            updateProductsUI();
            updateDashboardStats();
            
            showNotification('تم الحذف', `تم حذف المنتج: ${productName}`, 'success');
        }
    }
}

// Delete current product
function deleteCurrentProduct() {
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('productDetailModal')).hide();
    
    // Delete product
    deleteProduct(currentProductId);
}

// Update dashboard stats
function updateDashboardStats() {
    // Update total products
    document.getElementById('totalProducts').textContent = products.length;
    
    // Update average price
    let totalPrice = 0;
    products.forEach(product => {
        totalPrice += product.finalPrice;
    });
    const avgPrice = products.length > 0 ? totalPrice / products.length : 0;
    document.getElementById('avgPrice').textContent = `${Math.round(avgPrice)} ريال`;
    
    // Update average profit
    let totalProfit = 0;
    products.forEach(product => {
        totalProfit += product.profitRate;
    });
    const avgProfit = products.length > 0 ? totalProfit / products.length * 100 : 0;
    document.getElementById('avgProfit').textContent = `${Math.round(avgProfit)}%`;
    
    // Update categories chart
    updateCategoriesChart();
}

// Initialize charts
function initCharts() {
    const ctx = document.getElementById('categoriesChart').getContext('2d');
    
    categoriesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['عبايات فاخرة جداً', 'راقية', 'يومية', 'اقتصادية'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(107, 114, 128, 0.8)'
                ],
                borderColor: [
                    'rgba(79, 70, 229, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(107, 114, 128, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                }
            }
        }
    });
}

// Update categories chart
function updateCategoriesChart() {
    if (!categoriesChart) return;
    
    // Count products by category
    const categoryCounts = {
        'عبايات فاخرة جداً': 0,
        'راقية': 0,
        'يومية': 0,
        'اقتصادية': 0
    };
    
    products.forEach(product => {
        if (categoryCounts.hasOwnProperty(product.category)) {
            categoryCounts[product.category]++;
        }
    });
    
    // Update chart data
    categoriesChart.data.datasets[0].data = [
        categoryCounts['عبايات فاخرة جداً'],
        categoryCounts['راقية'],
        categoryCounts['يومية'],
        categoryCounts['اقتصادية']
    ];
    
    categoriesChart.update();
}

// Export settings
function exportSettings() {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('تم التصدير', 'تم تصدير إعدادات المشروع بنجاح', 'success');
}

// Export products
function exportProducts() {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'products.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('تم التصدير', 'تم تصدير المنتجات بنجاح', 'success');
}

// Export all
function exportAll() {
    const data = {
        settings: settings,
        products: products
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'abaya_pricing_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('تم التصدير', 'تم تصدير جميع البيانات بنجاح', 'success');
}

// Show notification
function showNotification(title, message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    const toastTitle = document.getElementById('notificationTitle');
    const toastBody = document.getElementById('notificationBody');
    const toastTime = document.getElementById('notificationTime');
    
    // Set content
    toastTitle.textContent = title;
    toastBody.textContent = message;
    toastTime.textContent = new Date().toLocaleTimeString();
    
    // Set type
    toast.className = 'toast';
    switch (type) {
        case 'success':
            toast.classList.add('border-success');
            toastTitle.classList.add('text-success');
            break;
        case 'warning':
            toast.classList.add('border-warning');
            toastTitle.classList.add('text-warning');
            break;
        case 'danger':
            toast.classList.add('border-danger');
            toastTitle.classList.add('text-danger');
            break;
        default:
            toast.classList.add('border-info');
            toastTitle.classList.add('text-info');
    }
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}
