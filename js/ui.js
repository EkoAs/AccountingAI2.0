/**
 * UI Manager - Handles all UI interactions and updates
 * Manages DOM elements, events, and visual feedback
 */

class UIManager {
  constructor() {
    this.elements = {};
    this.initializeElements();
  }

  /**
   * Initialize all DOM elements
   */
  initializeElements() {
    // Auth Elements
    this.elements.authSection = document.getElementById('authSection');
    this.elements.appSection = document.getElementById('appSection');
    this.elements.loginForm = document.getElementById('loginForm');
    this.elements.registerForm = document.getElementById('registerForm');
    this.elements.loginEmail = document.getElementById('loginEmail');
    this.elements.loginPassword = document.getElementById('loginPassword');
    this.elements.registerEmail = document.getElementById('registerEmail');
    this.elements.registerPassword = document.getElementById('registerPassword');
    this.elements.registerConfirm = document.getElementById('registerConfirm');
    this.elements.loginBtn = document.getElementById('loginBtn');
    this.elements.registerBtn = document.getElementById('registerBtn');
    this.elements.toggleRegister = document.getElementById('toggleRegister');
    this.elements.toggleLogin = document.getElementById('toggleLogin');

    // Header Elements
    this.elements.userEmail = document.getElementById('userEmail');
    this.elements.logoutBtn = document.getElementById('logoutBtn');
    this.elements.hamburgerBtn = document.getElementById('hamburgerBtn');

    // Input Panel Elements
    this.elements.transactionInput = document.getElementById('transactionInput');
    this.elements.statusBadge = document.getElementById('statusBadge');
    this.elements.classificationDisplay = document.getElementById('classificationDisplay');
    this.elements.confidenceScore = document.getElementById('confidenceScore');
    this.elements.classifiedAccount = document.getElementById('classifiedAccount');
    this.elements.classifiedType = document.getElementById('classifiedType');
    this.elements.classifiedDebitCredit = document.getElementById('classifiedDebitCredit');
    this.elements.classifiedAmount = document.getElementById('classifiedAmount');
    this.elements.classificationReasoning = document.getElementById('classificationReasoning');
    this.elements.adjustBtn = document.getElementById('adjustBtn');
    this.elements.confirmBtn = document.getElementById('confirmBtn');
    this.elements.loadingIndicator = document.getElementById('loadingIndicator');
    this.elements.errorMessage = document.getElementById('errorMessage');
    this.elements.successMessage = document.getElementById('successMessage');
    this.elements.undoBtn = document.getElementById('undoBtn');
    this.elements.redoBtn = document.getElementById('redoBtn');
    this.elements.doneBtn = document.getElementById('doneBtn');

    // Display Panel Elements
    this.elements.reportTypeSelect = document.getElementById('reportTypeSelect');
    this.elements.totalDebits = document.getElementById('totalDebits');
    this.elements.totalCredits = document.getElementById('totalCredits');
    this.elements.balanceStatus = document.getElementById('balanceStatus');
    this.elements.reportTable = document.getElementById('reportTable');
    this.elements.tableHeader = document.getElementById('tableHeader');
    this.elements.tableBody = document.getElementById('tableBody');
    this.elements.emptyState = document.getElementById('emptyState');
    this.elements.generatePdfBtn = document.getElementById('generatePdfBtn');
    this.elements.exportDataBtn = document.getElementById('exportDataBtn');

    // Modal Elements
    this.elements.settingsBtn = document.getElementById('settingsBtn');
    this.elements.settingsModal = document.getElementById('settingsModal');
    this.elements.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.elements.orgName = document.getElementById('orgName');
    this.elements.reportTitle = document.getElementById('reportTitle');
    this.elements.preparer = document.getElementById('preparer');
    this.elements.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    this.elements.cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    this.elements.confirmModal = document.getElementById('confirmModal');
    this.elements.confirmTitle = document.getElementById('confirmTitle');
    this.elements.confirmMessage = document.getElementById('confirmMessage');
    this.elements.confirmOk = document.getElementById('confirmOk');
    this.elements.confirmCancel = document.getElementById('confirmCancel');
  }

  /**
   * Show auth section
   */
  showAuthSection() {
    this.elements.authSection.style.display = 'flex';
    this.elements.appSection.style.display = 'none';
  }

  /**
   * Show app section
   */
  showAppSection() {
    this.elements.authSection.style.display = 'none';
    this.elements.appSection.style.display = 'block';
  }

  /**
   * Toggle between login and register forms
   */
  toggleAuthForm() {
    this.elements.loginForm.classList.toggle('active');
    this.elements.registerForm.classList.toggle('active');
    this.clearAuthForms();
  }

  /**
   * Clear auth forms
   */
  clearAuthForms() {
    this.elements.loginEmail.value = '';
    this.elements.loginPassword.value = '';
    this.elements.registerEmail.value = '';
    this.elements.registerPassword.value = '';
    this.elements.registerConfirm.value = '';
  }

  /**
   * Update user email display
   * @param {string} email - User email
   */
  updateUserEmail(email) {
    this.elements.userEmail.textContent = email;
  }

  /**
   * Show classification display
   * @param {object} classification - Classification data
   */
  showClassification(classification) {
    this.elements.classificationDisplay.style.display = 'block';
    this.elements.classifiedAccount.textContent = classification.accountName;
    this.elements.classifiedType.textContent = classification.accountType;
    this.elements.classifiedDebitCredit.textContent = classification.debitCredit.toUpperCase();
    this.elements.classifiedAmount.textContent = this.formatCurrency(classification.totalAmount);
    this.elements.classificationReasoning.textContent = classification.reasoning;
    this.elements.confidenceScore.textContent = `${Math.round(classification.aiConfidence * 100)}%`;
  }

  /**
   * Hide classification display
   */
  hideClassification() {
    this.elements.classificationDisplay.style.display = 'none';
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    this.elements.loadingIndicator.style.display = 'flex';
    this.elements.transactionInput.disabled = true;
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    this.elements.loadingIndicator.style.display = 'none';
    this.elements.transactionInput.disabled = false;
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.style.display = 'flex';
    setTimeout(() => {
      this.elements.errorMessage.style.display = 'none';
    }, 5000);
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    this.elements.successMessage.textContent = message;
    this.elements.successMessage.style.display = 'flex';
    setTimeout(() => {
      this.elements.successMessage.style.display = 'none';
    }, 3000);
  }

  /**
   * Update report summary
   * @param {object} summary - Summary data
   */
  updateReportSummary(summary) {
    this.elements.totalDebits.textContent = this.formatCurrency(summary.totalDebits);
    this.elements.totalCredits.textContent = this.formatCurrency(summary.totalCredits);

    if (summary.balanced) {
      this.elements.balanceStatus.textContent = '✓ Balanced';
      this.elements.balanceStatus.className = 'status-indicator balanced';
      this.elements.generatePdfBtn.disabled = false;
    } else {
      this.elements.balanceStatus.textContent = '✗ Unbalanced';
      this.elements.balanceStatus.className = 'status-indicator unbalanced';
      this.elements.generatePdfBtn.disabled = true;
    }
  }

  /**
   * Render report table
   * @param {object} report - Report data
   */
  renderReportTable(report) {
    if (!report || report.error) {
      this.elements.tableHeader.innerHTML = '';
      this.elements.tableBody.innerHTML = '';
      this.elements.emptyState.style.display = 'flex';
      return;
    }

    this.elements.emptyState.style.display = 'none';

    // Render header based on report type
    let headers = [];
    switch (report.type) {
      case 'General Journal':
        headers = ['Date', 'Account', 'Description', 'Debit', 'Credit'];
        break;
      case 'General Ledger':
        headers = ['Account', 'Date', 'Description', 'Debit', 'Credit', 'Balance'];
        break;
      case 'Trial Balance':
        headers = ['Account Code', 'Account Name', 'Debit', 'Credit'];
        break;
      case 'Reversing Journal':
        headers = ['Date', 'Account', 'Description', 'Debit', 'Credit'];
        break;
    }

    this.elements.tableHeader.innerHTML = headers
      .map(h => `<th>${h}</th>`)
      .join('');

    // Render body based on report type
    let rows = [];
    switch (report.type) {
      case 'General Journal':
        rows = report.entries.map(e => `
          <tr>
            <td>${e.date}</td>
            <td>${e.accountCode}</td>
            <td>${e.description}</td>
            <td>${this.formatCurrency(e.debit)}</td>
            <td>${this.formatCurrency(e.credit)}</td>
          </tr>
        `);
        break;
      case 'General Ledger':
        report.accounts.forEach(account => {
          account.transactions.forEach(txn => {
            rows.push(`
              <tr>
                <td>${account.accountCode}</td>
                <td>${txn.date}</td>
                <td>${txn.description}</td>
                <td>${this.formatCurrency(txn.debit)}</td>
                <td>${this.formatCurrency(txn.credit)}</td>
                <td>${this.formatCurrency(txn.balance)}</td>
              </tr>
            `);
          });
        });
        break;
      case 'Trial Balance':
        rows = report.entries.map(e => `
          <tr>
            <td>${e.code}</td>
            <td>${e.name}</td>
            <td>${this.formatCurrency(e.debitBalance)}</td>
            <td>${this.formatCurrency(e.creditBalance)}</td>
          </tr>
        `);
        break;
      case 'Reversing Journal':
        rows = report.entries.map(e => `
          <tr>
            <td>${e.date}</td>
            <td>${e.accountCode}</td>
            <td>${e.description}</td>
            <td>${this.formatCurrency(e.debit)}</td>
            <td>${this.formatCurrency(e.credit)}</td>
          </tr>
        `);
        break;
    }

    this.elements.tableBody.innerHTML = rows.join('');
  }

  /**
   * Update undo/redo button states
   * @param {boolean} canUndo - Can undo
   * @param {boolean} canRedo - Can redo
   */
  updateUndoRedoButtons(canUndo, canRedo) {
    this.elements.undoBtn.disabled = !canUndo;
    this.elements.redoBtn.disabled = !canRedo;
  }

  /**
   * Update status badge
   * @param {string} status - Status text
   * @param {string} color - Status color (success, warning, error)
   */
  updateStatusBadge(status, color = 'success') {
    this.elements.statusBadge.textContent = status;
    this.elements.statusBadge.className = `status-badge badge-${color}`;
  }

  /**
   * Show settings modal
   */
  showSettingsModal() {
    this.elements.settingsModal.style.display = 'flex';
  }

  /**
   * Hide settings modal
   */
  hideSettingsModal() {
    this.elements.settingsModal.style.display = 'none';
  }

  /**
   * Get settings form data
   * @returns {object} Settings data
   */
  getSettingsData() {
    return {
      organizationName: this.elements.orgName.value,
      reportTitle: this.elements.reportTitle.value,
      preparer: this.elements.preparer.value
    };
  }

  /**
   * Set settings form data
   * @param {object} data - Settings data
   */
  setSettingsData(data) {
    this.elements.orgName.value = data.organizationName || '';
    this.elements.reportTitle.value = data.reportTitle || 'Accounting Report';
    this.elements.preparer.value = data.preparer || '';
  }

  /**
   * Show confirmation modal
   * @param {string} title - Modal title
   * @param {string} message - Confirmation message
   * @param {function} onConfirm - Callback on confirm
   */
  showConfirmation(title, message, onConfirm) {
    this.elements.confirmTitle.textContent = title;
    this.elements.confirmMessage.textContent = message;
    this.elements.confirmModal.style.display = 'flex';

    this.elements.confirmOk.onclick = () => {
      this.hideConfirmation();
      onConfirm();
    };
  }

  /**
   * Hide confirmation modal
   */
  hideConfirmation() {
    this.elements.confirmModal.style.display = 'none';
  }

  /**
   * Clear transaction input
   */
  clearTransactionInput() {
    this.elements.transactionInput.value = '';
    this.elements.transactionInput.focus();
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Disable transaction input
   */
  disableTransactionInput() {
    this.elements.transactionInput.disabled = true;
    this.elements.doneBtn.textContent = 'Edit';
  }

  /**
   * Enable transaction input
   */
  enableTransactionInput() {
    this.elements.transactionInput.disabled = false;
    this.elements.doneBtn.textContent = 'Done';
  }

  /**
   * Get login credentials
   * @returns {object} Login data
   */
  getLoginCredentials() {
    return {
      email: this.elements.loginEmail.value,
      password: this.elements.loginPassword.value
    };
  }

  /**
   * Get register credentials
   * @returns {object} Register data
   */
  getRegisterCredentials() {
    return {
      email: this.elements.registerEmail.value,
      password: this.elements.registerPassword.value,
      confirm: this.elements.registerConfirm.value
    };
  }

  /**
   * Get transaction input
   * @returns {string} Transaction input
   */
  getTransactionInput() {
    return this.elements.transactionInput.value;
  }

  /**
   * Get selected report type
   * @returns {string} Report type
   */
  getSelectedReportType() {
    return this.elements.reportTypeSelect.value;
  }
}

// Initialize global UI manager
const ui = new UIManager();
