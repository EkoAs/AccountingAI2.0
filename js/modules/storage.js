/**
 * Storage Module - Manages localStorage operations for the Accounting System
 * Handles user data persistence, backup, and data validation
 */

class StorageManager {
  constructor() {
    this.storagePrefix = 'accounting_';
    this.version = '1.0';
    this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit
  }

  /**
   * Generate user-specific storage key
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data (transactions, profile, etc.)
   * @returns {string} Storage key
   */
  generateKey(userId, dataType) {
    return `${this.storagePrefix}user_${userId}_${dataType}`;
  }

  /**
   * Save data to localStorage
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data
   * @param {object} data - Data to save
   * @returns {boolean} Success status
   */
  saveData(userId, dataType, data) {
    try {
      const key = this.generateKey(userId, dataType);
      const dataWithMetadata = {
        data: data,
        timestamp: new Date().toISOString(),
        version: this.version
      };
      
      const jsonString = JSON.stringify(dataWithMetadata);
      
      // Check storage size
      if (this.getStorageSize() + jsonString.length > this.maxStorageSize) {
        console.warn('Storage quota approaching limit');
        return false;
      }
      
      localStorage.setItem(key, jsonString);
      return true;
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      return false;
    }
  }

  /**
   * Load data from localStorage
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data
   * @returns {object|null} Loaded data or null if not found
   */
  loadData(userId, dataType) {
    try {
      const key = this.generateKey(userId, dataType);
      const jsonString = localStorage.getItem(key);
      
      if (!jsonString) {
        return null;
      }
      
      const dataWithMetadata = JSON.parse(jsonString);
      return dataWithMetadata.data;
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      return null;
    }
  }

  /**
   * Delete data from localStorage
   * @param {string} userId - User ID
   * @param {string} dataType - Type of data
   * @returns {boolean} Success status
   */
  deleteData(userId, dataType) {
    try {
      const key = this.generateKey(userId, dataType);
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting data from localStorage:', error);
      return false;
    }
  }

  /**
   * Clear all user data from localStorage
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  clearUserData(userId) {
    try {
      const keys = Object.keys(localStorage);
      const userPrefix = `${this.storagePrefix}user_${userId}_`;
      
      keys.forEach(key => {
        if (key.startsWith(userPrefix)) {
          localStorage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  /**
   * Get current storage size in bytes
   * @returns {number} Storage size
   */
  getStorageSize() {
    let size = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  }

  /**
   * Export user data to JSON
   * @param {string} userId - User ID
   * @returns {object} Exported data
   */
  exportUserData(userId) {
    try {
      const profile = this.loadData(userId, 'profile');
      const transactions = this.loadData(userId, 'transactions');
      const chartOfAccounts = this.loadData(userId, 'chartOfAccounts');
      
      return {
        profile: profile,
        transactions: transactions,
        chartOfAccounts: chartOfAccounts,
        exportDate: new Date().toISOString(),
        version: this.version
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  }

  /**
   * Import user data from JSON
   * @param {string} userId - User ID
   * @param {object} importedData - Data to import
   * @returns {boolean} Success status
   */
  importUserData(userId, importedData) {
    try {
      if (!importedData.profile || !importedData.transactions) {
        console.error('Invalid import data structure');
        return false;
      }
      
      this.saveData(userId, 'profile', importedData.profile);
      this.saveData(userId, 'transactions', importedData.transactions);
      
      if (importedData.chartOfAccounts) {
        this.saveData(userId, 'chartOfAccounts', importedData.chartOfAccounts);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }

  /**
   * Create backup of user data
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  createBackup(userId) {
    try {
      const backupData = this.exportUserData(userId);
      const backupKey = `${this.storagePrefix}backup_${userId}_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }

  /**
   * Restore from backup
   * @param {string} userId - User ID
   * @param {string} backupKey - Backup key
   * @returns {boolean} Success status
   */
  restoreFromBackup(userId, backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        console.error('Backup not found');
        return false;
      }
      
      const parsedData = JSON.parse(backupData);
      return this.importUserData(userId, parsedData);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }

  /**
   * Get all backups for a user
   * @param {string} userId - User ID
   * @returns {array} Array of backup keys
   */
  getBackups(userId) {
    try {
      const backupPrefix = `${this.storagePrefix}backup_${userId}_`;
      const backups = [];
      
      for (let key in localStorage) {
        if (key.startsWith(backupPrefix)) {
          backups.push(key);
        }
      }
      
      return backups.sort().reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting backups:', error);
      return [];
    }
  }
}

// Export for use in other modules
const storageManager = new StorageManager();
