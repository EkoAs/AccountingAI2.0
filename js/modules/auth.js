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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email format' };
      }
      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }
      const existingUsers = this.getAllUsers();
      if (existingUsers.some(user => user.email === email)) {
        return { success: false, message: 'Email already registered' };
      }
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
      storageManager.saveData(userId, 'profile', userProfile);
      storageManager.saveData(userId, 'transactions', []);
      storageManager.saveData(userId, 'chartOfAccounts', this.getDefaultChartOfAccounts());
      return { success: true, message: 'Registration successful', userId: userId };
    } catch (error) {
      console.error('Error during registration:', error);
      return { success: false, message: 'Registration failed: ' + error.message };
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
      user.lastLogin = new Date().toISOString();
      storageManager.saveData(user.userId, 'profile', user);
      this.currentUser = user.userId;
      this.startSessionTimer();
      return { success: true, message: 'Login successful', userId: user.userId };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, message: 'Login failed: ' + error.message };
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
      const userPrefix = `${storageManager.storagePrefix}user_`;
      keys.forEach(key => {
        if (key.startsWith(userPrefix) && key.includes('_profile')) {
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
      // ASET (1000-1999)
      { code: '1000', name: 'Kas', type: 'Asset', category: 'Aset Lancar', balance: 0 },
      { code: '1010', name: 'Bank', type: 'Asset', category: 'Aset Lancar', balance: 0 },
      { code: '1100', name: 'Piutang Dagang', type: 'Asset', category: 'Aset Lancar', balance: 0 },
      { code: '1200', name: 'Persediaan Barang Dagangan', type: 'Asset', category: 'Aset Lancar', balance: 0 },
      { code: '1500', name: 'Perlengkapan', type: 'Asset', category: 'Aset Lancar', balance: 0 },
      { code: '1600', name: 'Beban Dibayar Dimuka', type: 'Asset', category: 'Aset Lancar', balance: 0 },
      { code: '1800', name: 'Peralatan', type: 'Asset', category: 'Aset Tetap', balance: 0 },
      { code: '1810', name: 'Akumulasi Penyusutan Peralatan', type: 'Asset', category: 'Aset Tetap', balance: 0 },
      // LIABILITAS (2000-2999)
      { code: '2000', name: 'Utang Dagang', type: 'Liability', category: 'Liabilitas Lancar', balance: 0 },
      { code: '2100', name: 'Utang Bank', type: 'Liability', category: 'Liabilitas Lancar', balance: 0 },
      { code: '2200', name: 'Beban Yang Masih Harus Dibayar', type: 'Liability', category: 'Liabilitas Lancar', balance: 0 },
      { code: '2300', name: 'Pendapatan Diterima Dimuka', type: 'Liability', category: 'Liabilitas Lancar', balance: 0 },
      // EKUITAS (3000-3999)
      { code: '3000', name: 'Modal Pemilik', type: 'Equity', category: 'Ekuitas', balance: 0 },
      { code: '3100', name: 'Prive', type: 'Equity', category: 'Ekuitas', balance: 0 },
      // PENDAPATAN (4000-4999)
      { code: '4000', name: 'Penjualan', type: 'Revenue', category: 'Pendapatan Usaha', balance: 0 },
      { code: '4100', name: 'Retur Penjualan dan Potongan Harga', type: 'Revenue', category: 'Pendapatan Usaha', balance: 0 },
      { code: '4200', name: 'Potongan Penjualan', type: 'Revenue', category: 'Pendapatan Usaha', balance: 0 },
      { code: '4900', name: 'Pendapatan Lain-lain', type: 'Revenue', category: 'Pendapatan Lain', balance: 0 },
      // BEBAN (5000-5999)
      { code: '5010', name: 'Pembelian', type: 'Expense', category: 'Harga Pokok', balance: 0 },
      { code: '5020', name: 'Retur Pembelian dan Potongan Harga', type: 'Expense', category: 'Harga Pokok', balance: 0 },
      { code: '5030', name: 'Potongan Pembelian', type: 'Expense', category: 'Harga Pokok', balance: 0 },
      { code: '5040', name: 'Beban Angkut Pembelian', type: 'Expense', category: 'Harga Pokok', balance: 0 },
      { code: '5100', name: 'Beban Gaji', type: 'Expense', category: 'Beban Usaha', balance: 0 },
      { code: '5200', name: 'Beban Sewa', type: 'Expense', category: 'Beban Usaha', balance: 0 },
      { code: '5300', name: 'Beban Listrik dan Air', type: 'Expense', category: 'Beban Usaha', balance: 0 },
      { code: '5400', name: 'Beban Perlengkapan', type: 'Expense', category: 'Beban Usaha', balance: 0 },
      { code: '5500', name: 'Beban Penyusutan', type: 'Expense', category: 'Beban Usaha', balance: 0 },
      { code: '5600', name: 'Beban Asuransi', type: 'Expense', category: 'Beban Usaha', balance: 0 },
      { code: '5700', name: 'Beban Pemasaran', type: 'Expense', category: 'Beban Usaha', balance: 0 },
      { code: '5710', name: 'Beban Iklan', type: 'Expense', category: 'Beban Usaha', balance: 0 },
      { code: '5750', name: 'Beban Angkut Penjualan', type: 'Expense', category: 'Beban Usaha', balance: 0 },
      { code: '5800', name: 'Beban Bunga', type: 'Expense', category: 'Beban Lain', balance: 0 },
      { code: '5900', name: 'Beban Lain-lain', type: 'Expense', category: 'Beban Lain', balance: 0 }
    ];
  }
}

// Export for use in other modules
const authManager = new AuthManager();
