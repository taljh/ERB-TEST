// Backend API for user authentication
const API_URL = 'https://api.abayapricing.com';

// User authentication service
class AuthService {
    constructor() {
        this.currentUser = null;
        this.authListeners = [];
        this.initFromLocalStorage();
    }

    // Initialize from localStorage
    initFromLocalStorage() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.notifyListeners();
            } catch (e) {
                console.error('Error parsing saved user:', e);
                localStorage.removeItem('currentUser');
            }
        }
    }

    // Register a new user
    async register(name, email, password) {
        try {
            // In a real app, this would be an API call
            // const response = await fetch(`${API_URL}/auth/register`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ name, email, password })
            // });
            // const data = await response.json();
            
            // For demo purposes, simulate successful registration
            const user = { id: Date.now(), name, email };
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.notifyListeners();
            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.' };
        }
    }

    // Login a user
    async login(email, password) {
        try {
            // In a real app, this would be an API call
            // const response = await fetch(`${API_URL}/auth/login`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email, password })
            // });
            // const data = await response.json();
            
            // For demo purposes, simulate successful login
            const user = { id: Date.now(), name: 'مستخدم الحاسبة', email };
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.notifyListeners();
            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'بريد إلكتروني أو كلمة مرور غير صحيحة.' };
        }
    }

    // Login as guest
    loginAsGuest() {
        const guestUser = { 
            id: 'guest-' + Date.now(), 
            name: 'زائر', 
            email: 'guest@example.com',
            isGuest: true 
        };
        this.currentUser = guestUser;
        localStorage.setItem('currentUser', JSON.stringify(guestUser));
        this.notifyListeners();
        return { success: true, user: guestUser };
    }

    // Logout the current user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        // Clear user data
        localStorage.removeItem(`settings_${this.currentUser?.email}`);
        localStorage.removeItem(`products_${this.currentUser?.email}`);
        this.notifyListeners();
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Add auth state change listener
    addAuthListener(listener) {
        this.authListeners.push(listener);
        // Call immediately with current state
        listener(this.currentUser);
    }

    // Remove auth state change listener
    removeAuthListener(listener) {
        this.authListeners = this.authListeners.filter(l => l !== listener);
    }

    // Notify all listeners of auth state change
    notifyListeners() {
        this.authListeners.forEach(listener => listener(this.currentUser));
    }
}

// Create and export auth service instance
const authService = new AuthService();
