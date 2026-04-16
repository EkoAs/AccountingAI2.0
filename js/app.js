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
    this.periodLocked = false;
  }

  /**
   * Execute closing journal (Mode 8) — otomatis 4 tahap
   * Setelah dieksekusi, periode dikunci
   */
  executeClosingJournal() {
    if (this.periodLocked) {
      return { success: false, error: 'Periode sudah dikunci. Jurnal penutup sudah pernah dieksekusi.' };
    }
    try {
      const report = generateClosingJournal(this.transactions, this.chartOfAccounts, this.metadata);
      if (!report || !report.entries || report.entries.length === 0) {
        return { success: false, error: 'Tidak ada akun nominal (pendapatan/beban) untuk ditutup.' };
      }
      this.undoStack.push(JSON.parse(JSON.stringify(this.transactions)));
      this.redoStack = [];
      const closingTxns = _buildClosingTransactions(report.entries);
      closingTxns.forEach(t => this.transactions.push(t));
      storageManager.saveData(this.currentUser, 'transactions', this.transactions);
      this.periodLocked = true;
      storageManager.saveData(this.currentUser, 'periodLocked', true);
      return {
        success: true,
        message: 'Jurnal penutup berhasil dieksekusi. Periode dikunci.',
        netIncome: report.netIncome,
        isProfit: report.isProfit,
        isBalanced: report.isBalanced
      };
    } catch (error) {
      console.error('Error executing closing journal:', error);
      return { success: false, error: 'Gagal mengeksekusi jurnal penutup: ' + error.message };
    }
  }

  /**
   * Initialize application
   * @param {string} apiKey - Gemini API key
   */
  initialize(apiKey) {
    try {
      if (apiKey) {
        aiClassifier.initializeApiKey(apiKey);
      }
      const savedUser = sessionStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUser = savedUser;
        this.loadUserData();
      }
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
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }
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
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }
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

    // If chartOfAccounts is empty OR outdated (< 34 accounts = pre-trading-company update), refresh
    const defaultCoa = authManager.getDefaultChartOfAccounts();
    if (!this.chartOfAccounts || this.chartOfAccounts.length < defaultCoa.length) {
      this.chartOfAccounts = defaultCoa;
      storageManager.saveData(this.currentUser, 'chartOfAccounts', this.chartOfAccounts);
    }

    // Load period lock status
    this.periodLocked = storageManager.loadData(this.currentUser, 'periodLocked') || false;
    // isFinalized tidak dipersist — selalu mulai dari false setiap sesi
    this.isFinalized = false;
    // Pastikan input tidak terkunci dari sesi sebelumnya (kecuali period locked)
    // UI restore dilakukan di showAppInterface setelah loadUserData selesai

    // Load metadata — try dedicated 'metadata' key first, fallback to profile
    const savedMeta = storageManager.loadData(this.currentUser, 'metadata');
    if (savedMeta && savedMeta.organizationName) {
      this.metadata = {
        organizationName: savedMeta.organizationName || '',
        reportTitle: savedMeta.reportTitle || 'Laporan Keuangan',
        preparer: savedMeta.preparer || '',
        dateRange: ''
      };
    } else {
      const profile = authManager.getUserProfile(this.currentUser);
      if (profile) {
        this.metadata = {
          organizationName: profile.organizationName || '',
          reportTitle: profile.reportTitle || 'Laporan Keuangan',
          preparer: profile.preparer || '',
          dateRange: ''
        };
      }
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

      // Ensure chartOfAccounts is loaded
      if (!this.chartOfAccounts || this.chartOfAccounts.length === 0) {
        this.chartOfAccounts = authManager.getDefaultChartOfAccounts();
      }

      // Classify using AI (returns debit + credit accounts)
      const classification = await aiClassifier.classifyTransaction(parsed, this.chartOfAccounts);

      if (!classification || !classification.classification) {
        return { error: 'Failed to classify transaction' };
      }

      const classified = classification.classification;

      if (!classified.accountName || !classified.accountType) {
        return { error: 'Invalid classification result' };
      }

      return {
        description: parsed.description,
        amount: parsed.amount,
        quantity: parsed.quantity,
        date: parsed.date,
        totalAmount: parsed.totalAmount,
        // Debit entry (primary account)
        account: classified.accountName,
        accountCode: classified.accountCode,
        accountType: classified.accountType,
        debitAmount: parsed.totalAmount,
        creditAmount: 0,
        // Credit entry (offset account)
        offsetAccountCode: classified.offsetAccountCode || '1000',
        offsetAccountName: classified.offsetAccountName || 'Kas',
        offsetAccountType: classified.offsetAccountType || 'Asset',
        // Display info
        classification: classified.accountType,
        aiConfidence: classified.confidence || 0,
        reasoning: classified.reasoning || 'Klasifikasi selesai',
        fallback: classification.fallback || false,
        // Adjusting type — deteksi dari deskripsi untuk Mode 5
        adjustingType: (typeof detectAdjustingType === 'function')
          ? detectAdjustingType(parsed.description)
          : null
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
      if (this.periodLocked) {
        return { error: 'Periode sudah dikunci setelah jurnal penutup. Tidak dapat menambah transaksi baru.' };
      }
      this.undoStack.push(JSON.parse(JSON.stringify(this.transactions)));
      this.redoStack = [];

      // Create DEBIT entry (primary account)
      const debitEntry = transactionManager.createTransaction(this.currentUser, {
        date: transactionData.date,
        description: transactionData.description,
        quantity: transactionData.quantity,
        amount: transactionData.amount,
        totalAmount: transactionData.totalAmount,
        account: transactionData.account,
        accountCode: transactionData.accountCode,
        accountType: transactionData.accountType,
        debitAmount: transactionData.totalAmount,
        creditAmount: 0,
        classification: transactionData.classification,
        aiConfidence: transactionData.aiConfidence,
        adjustingType: transactionData.adjustingType || null
      });

      if (debitEntry.error) return { error: debitEntry.error };

      // Create CREDIT entry (offset account)
      const creditEntry = transactionManager.createTransaction(this.currentUser, {
        date: transactionData.date,
        description: transactionData.description,
        quantity: transactionData.quantity,
        amount: transactionData.amount,
        totalAmount: transactionData.totalAmount,
        account: transactionData.offsetAccountName || 'Kas',
        accountCode: transactionData.offsetAccountCode || '1000',
        accountType: transactionData.offsetAccountType || 'Asset',
        debitAmount: 0,
        creditAmount: transactionData.totalAmount,
        classification: transactionData.offsetAccountType || 'Asset',
        aiConfidence: transactionData.aiConfidence,
        adjustingType: transactionData.adjustingType || null
      });

      if (creditEntry.error) return { error: creditEntry.error };

      this.transactions.push(debitEntry);
      this.transactions.push(creditEntry);

      return { success: true, transaction: debitEntry };
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
    this.periodLocked = false;
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Reset all data for current user
   * @returns {boolean} Success status
   */
  resetAllData() {
    try {
      this.transactions = [];
      this.chartOfAccounts = authManager.getDefaultChartOfAccounts();
      storageManager.saveData(this.currentUser, 'transactions', []);
      storageManager.saveData(this.currentUser, 'chartOfAccounts', this.chartOfAccounts);
      storageManager.saveData(this.currentUser, 'periodLocked', false);
      this.undoStack = [];
      this.redoStack = [];
      this.isFinalized = false;
      this.periodLocked = false;
      return true;
    } catch (error) {
      console.error('Error resetting data:', error);
      return false;
    }
  }
}

// Initialize global app instance
const app = new AccountingApp();
