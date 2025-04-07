// Product listing and management service
class ProductService {
    constructor(userEmail) {
        this.userEmail = userEmail;
        this.products = [];
        this.listeners = [];
        this.loadProducts();
    }

    // Load products from localStorage
    loadProducts() {
        const savedProducts = localStorage.getItem(`products_${this.userEmail}`);
        if (savedProducts) {
            try {
                this.products = JSON.parse(savedProducts);
                this.notifyListeners();
            } catch (e) {
                console.error('Error parsing saved products:', e);
                localStorage.removeItem(`products_${this.userEmail}`);
                this.products = [];
            }
        }
    }

    // Save products to localStorage
    saveProducts() {
        localStorage.setItem(`products_${this.userEmail}`, JSON.stringify(this.products));
    }

    // Get all products
    getAllProducts() {
        return [...this.products];
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    // Add new product
    addProduct(product) {
        // Ensure product has an ID
        if (!product.id) {
            product.id = Date.now();
        }
        
        // Add date if not present
        if (!product.date) {
            product.date = new Date().toISOString();
        }
        
        this.products.push(product);
        this.saveProducts();
        this.notifyListeners();
        return product;
    }

    // Update existing product
    updateProduct(updatedProduct) {
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            this.products[index] = updatedProduct;
            this.saveProducts();
            this.notifyListeners();
            return updatedProduct;
        }
        return null;
    }

    // Delete product
    deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            const deletedProduct = this.products[index];
            this.products.splice(index, 1);
            this.saveProducts();
            this.notifyListeners();
            return deletedProduct;
        }
        return null;
    }

    // Filter products by category
    filterByCategory(category) {
        if (category === 'all') {
            return this.getAllProducts();
        }
        return this.products.filter(product => product.category === category);
    }

    // Search products
    searchProducts(term) {
        if (!term) {
            return this.getAllProducts();
        }
        
        const searchTerm = term.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            (product.code && product.code.toLowerCase().includes(searchTerm))
        );
    }

    // Sort products
    sortProducts(products, sortBy) {
        const sortedProducts = [...products];
        
        switch (sortBy) {
            case 'name':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price':
                sortedProducts.sort((a, b) => a.finalPrice - b.finalPrice);
                break;
            case 'price-desc':
                sortedProducts.sort((a, b) => b.finalPrice - a.finalPrice);
                break;
            case 'profit':
                sortedProducts.sort((a, b) => b.profitRate - a.profitRate);
                break;
            case 'date':
                sortedProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            default:
                // Default sort by date (newest first)
                sortedProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        return sortedProducts;
    }

    // Get product statistics
    getProductStats() {
        if (this.products.length === 0) {
            return {
                totalProducts: 0,
                avgPrice: 0,
                avgProfit: 0,
                categoryCounts: {
                    'عبايات فاخرة جداً': 0,
                    'راقية': 0,
                    'يومية': 0,
                    'اقتصادية': 0
                }
            };
        }
        
        let totalPrice = 0;
        let totalProfit = 0;
        const categoryCounts = {
            'عبايات فاخرة جداً': 0,
            'راقية': 0,
            'يومية': 0,
            'اقتصادية': 0
        };
        
        this.products.forEach(product => {
            totalPrice += product.finalPrice;
            totalProfit += product.profitRate;
            
            if (categoryCounts.hasOwnProperty(product.category)) {
                categoryCounts[product.category]++;
            }
        });
        
        return {
            totalProducts: this.products.length,
            avgPrice: Math.round(totalPrice / this.products.length),
            avgProfit: Math.round((totalProfit / this.products.length) * 100),
            categoryCounts
        };
    }

    // Export products to JSON
    exportProductsToJson() {
        return JSON.stringify(this.products, null, 2);
    }

    // Import products from JSON
    importProductsFromJson(json) {
        try {
            const importedProducts = JSON.parse(json);
            if (Array.isArray(importedProducts)) {
                this.products = importedProducts;
                this.saveProducts();
                this.notifyListeners();
                return { success: true, count: importedProducts.length };
            }
            return { success: false, error: 'Invalid JSON format. Expected an array of products.' };
        } catch (e) {
            console.error('Error importing products:', e);
            return { success: false, error: 'Invalid JSON format.' };
        }
    }

    // Add product change listener
    addListener(listener) {
        this.listeners.push(listener);
        // Call immediately with current products
        listener(this.products);
    }

    // Remove product change listener
    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    // Notify all listeners of product changes
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.products));
    }
}

// Create product service factory
function createProductService(userEmail) {
    return new ProductService(userEmail);
}
