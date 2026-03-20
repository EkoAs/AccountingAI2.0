/**
 * Authentication Module - Manages user registration, login, and session
 * Handles password hashing and user profile management
 */

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.sessionTimer = null;
  }

  /**
   * Simple hash function for passwords (client-side)
   * Note: For production, use proper bcrypt library
   * @param {string} password - Password to hash
   * @returns {string} Hashed password
   */
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} Registration result {success, message, userId}
   */
  register(email, password) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email format' };
      }

      // Validate password strength
      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      // Check if user already exists
      const existingUsers = this.getAllUsers();
      if (existingUsers.some(user => user.email === email)) {
        return { success: false, message: 'Email already registered' };
      }

      // Create new user
      const userId = this.generateUserId();
      const hashedPassword = this.hashPassword(password);

      const userProfile = {
        userId: userId,
        email: email,
        passwordHash: hashedPassword,
        organizationName: '',
        reportTitle: 'Accounting Report',
        preparer: '',
        createdAt: new Date().toISOString(),
        lastLogin: null
      };

      // Save user profile
      storageManager.saveData(userId, 'profile', userProfile);

      // Initialize empty transactions array
      storageManager.saveData(userId, 'transactions', []);

      // Initialize chart of accounts
      const chartOfAccounts = this.getDefaultChartOfAccounts();
      storageManager.saveData(userId, 'chartOfAccounts', chartOfAccounts);

      return { success: true, message: 'Registration successful', userId: userId };
    } catch (error) {
      console.error('Error during registration:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} Login result {success, message, userId}
   */
  login(email, password) {
    try {
      const users = this.getAllUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const hashedPassword = this.hashPassword(password);
      if (user.passwordHash !== hashedPassword) {
        return { success: false, message: 'Invalid password' };
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      storageManager.saveData(user.userId, 'profile', user);

      // Set current user
      this.currentUser = user.userId;
      this.startSessionTimer();

      return { success: true, message: 'Login successful', userId: user.userId };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  /**
   * Logout current user
   * @returns {boolean} Success status
   */
  logout() {
    try {
      this.currentUser = null;
      this.stopSessionTimer();
      storageManager.clearUserData(this.currentUser);
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  /**
   * Get current logged-in user ID
   * @returns {string|null} User ID or null
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {object|null} User profile or null
   */
  getUserProfile(userId) {
    return storageManager.loadData(userId, 'profile');
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} updates - Profile updates
   * @returns {boolean} Success status
   */
  updateUserProfile(userId, updates) {
    try {
      const profile = this.getUserProfile(userId);
      if (!profile) {
        return false;
      }

      const updatedProfile = { ...profile, ...updates };
      return storageManager.saveData(userId, 'profile', updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  /**
   * Generate unique user ID
   * @returns {string} User ID
   */
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get all registered users
   * @returns {array} Array of user profiles
   */
  getAllUsers() {
    try {
      const users = [];
      const keys = Object.keys(localStorage);

      keys.forEach(key => {
        if (key.includes('_profile')) {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            users.push(parsed.data);
          }
        }
      });

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * Start session timeout timer
   */
  startSessionTimer() {
    this.stopSessionTimer();
    this.sessionTimer = setTimeout(() => {
      this.logout();
      console.warn('Session expired due to inactivity');
    }, this.sessionTimeout);
  }

  /**
   * Stop session timeout timer
   */
  stopSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Get default chart of accounts following accounting standards
   * @returns {array} Default chart of accounts
   */
  getDefaultChartOfAccounts() {
    return [
      // ASSETS (1000-1999)
      { code: '1000', name: 'Cash', type: 'Asset', category: 'Current Asset', balance: 0 },
      { code: '1010', name: 'Bank Account', type: 'Asset', category: 'Current Asset', balance: 0 },
      { code: '1100', name: 'Accounts Receivable', type: 'Asset', category: 'Current Asset', balance: 0 },
      { code: '1200', name: 'Inventory', type: 'Asset', category: 'Current Asset', balance: 0 },
      { code: '1500', name: 'Supplies', type: 'Asset', category: 'Current Asset', balance: 0 },
      { code: '1600', name: 'Prepaid Expenses', type: 'Asset', category: 'Current Asset', balance: 0 },
      { code: '1800', name: 'Equipment', type: 'Asset', category: 'Fixed Asset', balance: 0 },
      { code: '1810', name: 'Accumulated Depreciation', type: 'Asset', category: 'Fixed Asset', balance: 0 },
      { code: '1900', name: 'Intangible Assets', type: 'Asset', category: 'Fixed Asset', balance: 0 },

      // LIABILITIES (2000-2999)
      { code: '2000', name: 'Accounts Payable', type: 'Liability', category: 'Current Liability', balance: 0 },
      { code: '2100', name: 'Short-term Debt', type: 'Liability', category: 'Current Liability', balance: 0 },
      { code: '2200', name: 'Accrued Expenses', type: 'Liability', category: 'Current Liability', balance: 0 },
      { code: '2300', name: 'Unearned Revenue', type: 'Liability', category: 'Current Liability', balance: 0 },
      { code: '2500', name: 'Long-term Debt', type: 'Liability', category: 'Long-term Liability', balance: 0 },
      { code: '2600', name: 'Deferred Tax Liability', type: 'Liability', category: 'Long-term Liability', balance: 0 },

      // EQUITY (3000-3999)
      { code: '3000', name: 'Common Stock', type: 'Equity', category: 'Equity', balance: 0 },
      { code: '3100', name: 'Retained Earnings', type: 'Equity', category: 'Equity', balance: 0 },
      { code: '3200', name: 'Dividends', type: 'Equity', category: 'Equity', balance: 0 },

      // REVENUE (4000-4999)
      { code: '4000', name: 'Sales Revenue', type: 'Revenue', category: 'Operating Revenue', balance: 0 },
      { code: '4100', name: 'Service Revenue', type: 'Revenue', category: 'Operating Revenue', balance: 0 },
      { code: '4200', name: 'Interest Income', type: 'Revenue', category: 'Non-Operating Revenue', balance: 0 },
      { code: '4300', name: 'Other Income', type: 'Revenue', category: 'Non-Operating Revenue', balance: 0 },

      // EXPENSES (5000-5999)
      { code: '5000', name: 'Cost of Goods Sold', type: 'Expense', category: 'Operating Expense', balance: 0 },
      { code: '5100', name: 'Salaries and Wages', type: 'Expense', category: 'Operating Expense', balance: 0 },
      { code: '5200', name: 'Rent Expense', type: 'Expense', category: 'Operating Expense', balance: 0 },
      { code: '5300', name: 'Utilities Expense', type: 'Expense', category: 'Operating Expense', balance: 0 },
      { code: '5400', name: 'Office Supplies Expense', type: 'Expense', category: 'Operating Expense', balance: 0 },
      { code: '5500', name: 'Depreciation Expense', type: 'Expense', category: 'Operating Expense', balance: 0 },
      { code: '5600', name: 'Insurance Expense', type: 'Expense', category: 'Operating Expense', balance: 0 },
      { code: '5700', name: 'Marketing Expense', type: 'Expense', category: 'Operating Expense', balance: 0 },
      { code: '5800', name: 'Interest Expense', type: 'Expense', category: 'Non-Operating Expense', balance: 0 },
      { code: '5900', name: 'Other Expenses', type: 'Expense', category: 'Non-Operating Expense', balance: 0 }
    ];
  }
}

// Export for use in other modules
const authManager = new AuthManager();
