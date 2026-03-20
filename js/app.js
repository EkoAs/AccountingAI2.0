/**
 * Main Application Controller
 * Orchestrates all modules and manages application state
 */

class AccountingApp {
  constructor() {
    this.currentUser = null;
    this.currentReport = 'general-journal';
    this.transactions = [];
    this.chartOfAccounts = [];
    this.metadata = {
      organizationName: '',
      reportTitle: 'Accounting Report',
      preparer: '',
      dateRange: ''
    };
    this.isFinalized = false;
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Initialize application
   * @param {string} apiKey - Gemini API key
   */
  initialize(apiKey) {
    try {
      // Initialize AI classifier
      if (apiKey) {
        aiClassifier.initializeApiKey(apiKey);
      }

      // Check for existing session
      const savedUser = sessionStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUser = savedUser;
        this.loadUserData();
      }

      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Error initializing application:', error);
    }
  }

  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} Registration result
   */
  registerUser(email, password) {
    const result = authManager.register(email, password);
    if (result.success) {
      this.currentUser = result.userId;
      sessionStorage.setItem('currentUser', result.userId);
      this.loadUserData();
    }
    return result;
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} Login result
   */
  loginUser(email, password) {
    const result = authManager.login(email, password);
    if (result.success) {
      this.currentUser = result.userId;
      sessionStorage.setItem('currentUser', result.userId);
      this.loadUserData();
    }
    return result;
  }

  /**
   * Logout current user
   * @returns {boolean} Success status
   */
  logoutUser() {
    const result = authManager.logout();
    if (result) {
      this.currentUser = null;
      sessionStorage.removeItem('currentUser');
      this.resetAppState();
    }
    return result;
  }

  /**
   * Load user data from storage
   */
  loadUserData() {
    if (!this.currentUser) return;

    this.transactions = transactionManager.getTransactions(this.currentUser) || [];
    this.chartOfAccounts = storageManager.loadData(this.currentUser, 'chartOfAccounts') || [];

    const profile = authManager.getUserProfile(this.currentUser);
    if (profile) {
      this.metadata = {
        organizationName: profile.organizationName || '',
        reportTitle: profile.reportTitle || 'Accounting Report',
        preparer: profile.preparer || '',
        dateRange: ''
      };
    }
  }

  /**
   * Process transaction input
   * @param {string} input - Transaction input string
   * @returns {Promise<object>} Parsed and classified transaction
   */
  async processTransactionInput(input) {
    try {
      // Parse input
      const parsed = transactionManager.parseTransactionInput(input);
      if (parsed.error) {
        return { error: parsed.error };
      }

      // Classify using AI
      const classification = await aiClassifier.classifyTransaction(parsed, this.chartOfAccounts);

      if (!classification || !classification.classification) {
        return { error: 'Failed to classify transaction' };
      }

      const classified = classification.classification;

      // Calculate debit/credit
      const { debitAmount, creditAmount } = accountingCalculator.calculateDebitCredit(
        parsed.totalAmount,
        classified.accountType
      );

      return {
        description: parsed.description,
        amount: parsed.amount,
        quantity: parsed.quantity,
        date: parsed.date,
        totalAmount: parsed.totalAmount,
        account: classified.accountName,
        accountCode: classified.accountCode,
        accountType: classified.accountType,
        debitAmount: debitAmount,
        creditAmount: creditAmount,
        classification: classified.accountType,
        aiConfidence: classified.confidence,
        reasoning: classified.reasoning,
        fallback: classification.fallback || false
      };
    } catch (error) {
      console.error('Error processing transaction:', error);
      return { error: 'Failed to process transaction' };
    }
  }

  /**
   * Confirm and save transaction
   * @param {object} transactionData - Transaction data
   * @returns {object} Saved transaction
   */
  confirmTransaction(transactionData) {
    try {
      // Save to undo stack
      this.undoStack.push(JSON.parse(JSON.stringify(this.transactions)));
      this.redoStack = [];

      // Create transaction
      const transaction = transactionManager.createTransaction(this.currentUser, transactionData);

      if (transaction.error) {
        return { error: transaction.error };
      }

      // Update local state
      this.transactions.push(transaction);

      return { success: true, transaction: transaction };
    } catch (error) {
      console.error('Error confirming transaction:', error);
      return { error: 'Failed to confirm transaction' };
    }
  }

  /**
   * Update transaction
   * @param {string} transactionId - Transaction ID
   * @param {object} updates - Updates to apply
   * @returns {object} Updated transaction
   */
  updateTransaction(transactionId, updates) {
    try {
      this.undoStack.push(JSON.parse(JSON.stringify(this.transactions)));
      this.redoStack = [];

      const updated = transactionManager.updateTransaction(this.currentUser, transactionId, updates);

      if (!updated) {
        return { error: 'Transaction not found' };
      }

      // Update local state
      const index = this.transactions.findIndex(t => t.id === transactionId);
      if (index !== -1) {
        this.transactions[index] = updated;
      }

      return { success: true, transaction: updated };
    } catch (error) {
      console.error('Error updating transaction:', error);
      return { error: 'Failed to update transaction' };
    }
  }

  /**
   * Delete transaction
   * @param {string} transactionId - Transaction ID
   * @returns {object} Result
   */
  deleteTransaction(transactionId) {
    try {
      this.undoStack.push(JSON.parse(JSON.stringify(this.transactions)));
      this.redoStack = [];

      const success = transactionManager.deleteTransaction(this.currentUser, transactionId);

      if (!success) {
        return { error: 'Transaction not found' };
      }

      // Update local state
      this.transactions = this.transactions.filter(t => t.id !== transactionId);

      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return { error: 'Failed to delete transaction' };
    }
  }

  /**
   * Undo last action
   * @returns {boolean} Success status
   */
  undo() {
    if (this.undoStack.length === 0) return false;

    this.redoStack.push(JSON.parse(JSON.stringify(this.transactions)));
    this.transactions = this.undoStack.pop();
    storageManager.saveData(this.currentUser, 'transactions', this.transactions);

    return true;
  }

  /**
   * Redo last undone action
   * @returns {boolean} Success status
   */
  redo() {
    if (this.redoStack.length === 0) return false;

    this.undoStack.push(JSON.parse(JSON.stringify(this.transactions)));
    this.transactions = this.redoStack.pop();
    storageManager.saveData(this.currentUser, 'transactions', this.transactions);

    return true;
  }

  /**
   * Generate report
   * @param {string} reportType - Report type
   * @returns {object} Report data
   */
  generateReport(reportType) {
    try {
      this.currentReport = reportType;

      const report = reportGenerator.generateReport(
        reportType,
        this.transactions,
        this.chartOfAccounts,
        this.metadata
      );

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      return { error: 'Failed to generate report' };
    }
  }

  /**
   * Verify accounting equation
   * @returns {object} Verification result
   */
  verifyAccountingEquation() {
    return accountingCalculator.verifyAccountingEquation(this.transactions);
  }

  /**
   * Finalize transaction entry
   * @returns {object} Finalization result
   */
  finalizeTransactions() {
    try {
      const verification = this.verifyAccountingEquation();

      if (!verification.balanced) {
        return {
          success: false,
          error: `Accounting equation not balanced. Discrepancy: ${verification.discrepancy}`
        };
      }

      this.isFinalized = true;

      return {
        success: true,
        message: 'Transactions finalized successfully',
        summary: {
          totalTransactions: this.transactions.length,
          totalDebits: verification.totalDebits,
          totalCredits: verification.totalCredits
        }
      };
    } catch (error) {
      console.error('Error finalizing transactions:', error);
      return { success: false, error: 'Failed to finalize transactions' };
    }
  }

  /**
   * Return to edit mode
   * @returns {boolean} Success status
   */
  returnToEditMode() {
    this.isFinalized = false;
    return true;
  }

  /**
   * Generate and download PDF
   * @param {string} reportType - Report type
   * @returns {Promise<boolean>} Success status
   */
  async generateAndDownloadPDF(reportType) {
    try {
      const report = this.generateReport(reportType);

      if (report.error) {
        return false;
      }

      const pdfBlob = await pdfGenerator.generatePDF(report, this.metadata);

      if (!pdfBlob) {
        return false;
      }

      const filename = `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdfGenerator.downloadPDF(pdfBlob, filename);

      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  }

  /**
   * Update user profile
   * @param {object} updates - Profile updates
   * @returns {boolean} Success status
   */
  updateUserProfile(updates) {
    if (!this.currentUser) return false;

    const success = authManager.updateUserProfile(this.currentUser, updates);

    if (success) {
      this.metadata = {
        ...this.metadata,
        organizationName: updates.organizationName || this.metadata.organizationName,
        reportTitle: updates.reportTitle || this.metadata.reportTitle,
        preparer: updates.preparer || this.metadata.preparer
      };
    }

    return success;
  }

  /**
   * Export user data
   * @returns {object} Exported data
   */
  exportUserData() {
    if (!this.currentUser) return null;
    return storageManager.exportUserData(this.currentUser);
  }

  /**
   * Import user data
   * @param {object} importedData - Data to import
   * @returns {boolean} Success status
   */
  importUserData(importedData) {
    if (!this.currentUser) return false;

    const success = storageManager.importUserData(this.currentUser, importedData);

    if (success) {
      this.loadUserData();
    }

    return success;
  }

  /**
   * Reset application state
   */
  resetAppState() {
    this.transactions = [];
    this.chartOfAccounts = [];
    this.metadata = {
      organizationName: '',
      reportTitle: 'Accounting Report',
      preparer: '',
      dateRange: ''
    };
    this.isFinalized = false;
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Get application state
   * @returns {object} Current state
   */
  getState() {
    return {
      currentUser: this.currentUser,
      currentReport: this.currentReport,
      transactionCount: this.transactions.length,
      isFinalized: this.isFinalized,
      accountingEquation: this.verifyAccountingEquation()
    };
  }
}

// Initialize global app instance
const app = new AccountingApp();
