/**
 * Transaction Module - Manages transaction operations
 * Handles transaction creation, validation, and management
 */

class TransactionManager {
  constructor() {
    this.transactionIdCounter = 0;
  }

  /**
   * Generate unique transaction ID
   * @returns {string} Transaction ID
   */
  generateTransactionId() {
    return 'txn_' + Date.now() + '_' + (++this.transactionIdCounter);
  }

  /**
   * Parse transaction input string
   * Format: "item_name amount quantity date" or "item_name amount quantity"
   * @param {string} input - Transaction input string
   * @returns {object} Parsed transaction {description, amount, quantity, date, error}
   */
  parseTransactionInput(input) {
    try {
      const trimmed = input.trim();
      if (!trimmed) {
        return { error: 'Input cannot be empty' };
      }

      // Split by spaces
      const parts = trimmed.split(/\s+/);
      
      if (parts.length < 3) {
        return { error: 'Format: item_name amount quantity [date]' };
      }

      // Extract components
      const description = parts[0];
      const amount = parseFloat(parts[1]);
      const quantity = parseFloat(parts[2]);
      let date = parts[3] || new Date().toISOString().split('T')[0];

      // Validate amount and quantity
      if (isNaN(amount) || amount <= 0) {
        return { error: 'Amount must be a positive number' };
      }

      if (isNaN(quantity) || quantity <= 0) {
        return { error: 'Quantity must be a positive number' };
      }

      // Validate and parse date
      const parsedDate = this.parseDate(date);
      if (!parsedDate) {
        return { error: 'Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY' };
      }

      return {
        description: description,
        amount: amount,
        quantity: quantity,
        date: parsedDate,
        totalAmount: amount * quantity
      };
    } catch (error) {
      console.error('Error parsing transaction input:', error);
      return { error: 'Failed to parse transaction' };
    }
  }

  /**
   * Parse date in multiple formats
   * @param {string} dateString - Date string
   * @returns {string|null} Date in YYYY-MM-DD format or null
   */
  parseDate(dateString) {
    try {
      // Try YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }

      // Try DD/MM/YYYY format
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
      }

      // Try DD-MM-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create new transaction
   * @param {string} userId - User ID
   * @param {object} transactionData - Transaction data
   * @returns {object} Created transaction or error
   */
  createTransaction(userId, transactionData) {
    try {
      const transaction = {
        id: this.generateTransactionId(),
        date: transactionData.date,
        description: transactionData.description,
        quantity: transactionData.quantity,
        unitAmount: transactionData.amount,
        totalAmount: transactionData.totalAmount,
        account: transactionData.account || null,
        accountCode: transactionData.accountCode || null,
        debitAmount: transactionData.debitAmount || 0,
        creditAmount: transactionData.creditAmount || 0,
        classification: transactionData.classification || null,
        aiConfidence: transactionData.aiConfidence || 0,
        status: 'pending', // pending, confirmed
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      };

      // Save transaction
      const transactions = this.getTransactions(userId);
      transactions.push(transaction);
      storageManager.saveData(userId, 'transactions', transactions);

      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { error: 'Failed to create transaction' };
    }
  }

  /**
   * Get all transactions for user
   * @param {string} userId - User ID
   * @returns {array} Array of transactions
   */
  getTransactions(userId) {
    try {
      const transactions = storageManager.loadData(userId, 'transactions');
      return transactions || [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  /**
   * Get transaction by ID
   * @param {string} userId - User ID
   * @param {string} transactionId - Transaction ID
   * @returns {object|null} Transaction or null
   */
  getTransactionById(userId, transactionId) {
    try {
      const transactions = this.getTransactions(userId);
      return transactions.find(t => t.id === transactionId) || null;
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  }

  /**
   * Update transaction
   * @param {string} userId - User ID
   * @param {string} transactionId - Transaction ID
   * @param {object} updates - Updates to apply
   * @returns {object|null} Updated transaction or null
   */
  updateTransaction(userId, transactionId, updates) {
    try {
      const transactions = this.getTransactions(userId);
      const transaction = transactions.find(t => t.id === transactionId);

      if (!transaction) {
        return null;
      }

      // Update transaction
      Object.assign(transaction, updates, {
        modifiedAt: new Date().toISOString()
      });

      storageManager.saveData(userId, 'transactions', transactions);
      return transaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  }

  /**
   * Delete transaction
   * @param {string} userId - User ID
   * @param {string} transactionId - Transaction ID
   * @returns {boolean} Success status
   */
  deleteTransaction(userId, transactionId) {
    try {
      const transactions = this.getTransactions(userId);
      const index = transactions.findIndex(t => t.id === transactionId);

      if (index === -1) {
        return false;
      }

      transactions.splice(index, 1);
      storageManager.saveData(userId, 'transactions', transactions);
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }

  /**
   * Confirm transaction (mark as confirmed)
   * @param {string} userId - User ID
   * @param {string} transactionId - Transaction ID
   * @returns {object|null} Updated transaction or null
   */
  confirmTransaction(userId, transactionId) {
    return this.updateTransaction(userId, transactionId, { status: 'confirmed' });
  }

  /**
   * Get transactions by date range
   * @param {string} userId - User ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {array} Filtered transactions
   */
  getTransactionsByDateRange(userId, startDate, endDate) {
    try {
      const transactions = this.getTransactions(userId);
      return transactions.filter(t => t.date >= startDate && t.date <= endDate);
    } catch (error) {
      console.error('Error filtering transactions:', error);
      return [];
    }
  }

  /**
   * Get transactions by account
   * @param {string} userId - User ID
   * @param {string} accountCode - Account code
   * @returns {array} Filtered transactions
   */
  getTransactionsByAccount(userId, accountCode) {
    try {
      const transactions = this.getTransactions(userId);
      return transactions.filter(t => t.accountCode === accountCode);
    } catch (error) {
      console.error('Error filtering transactions by account:', error);
      return [];
    }
  }

  /**
   * Get transactions sorted by date
   * @param {string} userId - User ID
   * @param {string} order - 'asc' or 'desc'
   * @returns {array} Sorted transactions
   */
  getTransactionsSorted(userId, order = 'asc') {
    try {
      const transactions = this.getTransactions(userId);
      return transactions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } catch (error) {
      console.error('Error sorting transactions:', error);
      return [];
    }
  }

  /**
   * Validate transaction data
   * @param {object} transaction - Transaction to validate
   * @returns {object} Validation result {valid, errors}
   */
  validateTransaction(transaction) {
    const errors = [];

    if (!transaction.description || transaction.description.trim() === '') {
      errors.push('Description is required');
    }

    if (!transaction.date) {
      errors.push('Date is required');
    }

    if (transaction.quantity <= 0) {
      errors.push('Quantity must be positive');
    }

    if (transaction.unitAmount <= 0) {
      errors.push('Amount must be positive');
    }

    if (!transaction.account) {
      errors.push('Account is required');
    }

    if (transaction.debitAmount < 0 || transaction.creditAmount < 0) {
      errors.push('Debit and credit amounts must be non-negative');
    }

    if (transaction.debitAmount === 0 && transaction.creditAmount === 0) {
      errors.push('Either debit or credit amount must be specified');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

// Export for use in other modules
const transactionManager = new TransactionManager();
