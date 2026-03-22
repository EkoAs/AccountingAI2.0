/**
 * UI Manager - Handles all UI interactions and updates
 */

class UIManager {
  constructor() {
    this.elements = {};
    this.initializeElements();
  }

  initializeElements() {
    this.elements.welcomeSection = document.getElementById('welcomeSection');
    this.elements.companyName = document.getElementById('companyName');
    this.elements.welcomeReportTitle = document.getElementById('welcomeReportTitle');
    this.elements.preparerName = document.getElementById('preparerName');
    this.elements.startBtn = document.getElementById('startBtn');
    this.elements.appSection = document.getElementById('appSection');
    this.elements.userEmail = document.getElementById('userEmail');
    this.elements.logoutBtn = document.getElementById('logoutBtn');
    this.elements.reportModeBtn = document.getElementById('reportModeBtn');
    this.elements.hamburgerBtn = document.getElementById('hamburgerBtn');
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
    this.elements.resetBtn = document.getElementById('resetBtn');
    this.elements.doneBtn = document.getElementById('doneBtn');
    this.elements.reportTypeSelect = document.getElementById('reportTypeSelect');
    this.elements.totalDebits = document.getElementById('totalDebits');
    this.elements.totalCredits = document.getElementById('totalCredits');
    this.elements.balanceStatus = document.getElementById('balanceStatus');
    this.elements.tableHeader = document.getElementById('tableHeader');
    this.elements.tableBody = document.getElementById('tableBody');
    this.elements.emptyState = document.getElementById('emptyState');
    this.elements.generatePdfBtn = document.getElementById('generatePdfBtn');
    this.elements.exportDataBtn = document.getElementById('exportDataBtn');
    this.elements.settingsBtn = document.getElementById('settingsBtn');
    this.elements.settingsModal = document.getElementById('settingsModal');
    this.elements.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.elements.orgName = document.getElementById('orgName');
    this.elements.settingsReportTitle = document.getElementById('settingsReportTitle');
    this.elements.preparer = document.getElementById('preparer');
    this.elements.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    this.elements.cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    this.elements.confirmModal = document.getElementById('confirmModal');
    this.elements.confirmTitle = document.getElementById('confirmTitle');
    this.elements.confirmMessage = document.getElementById('confirmMessage');
    this.elements.confirmOk = document.getElementById('confirmOk');
    this.elements.confirmCancel = document.getElementById('confirmCancel');
  }

  showWelcomeSection() {
    this.elements.welcomeSection.style.display = 'flex';
    this.elements.appSection.style.display = 'none';
  }

  showAppSection() {
    this.elements.welcomeSection.style.display = 'none';
    this.elements.appSection.style.display = 'block';
  }

  getWelcomeData() {
    return {
      companyName: this.elements.companyName.value || 'Perusahaan',
      reportTitle: this.elements.welcomeReportTitle ? this.elements.welcomeReportTitle.value || 'Laporan Keuangan' : 'Laporan Keuangan',
      preparerName: this.elements.preparerName.value || 'Admin'
    };
  }

  clearWelcomeForm() {
    this.elements.companyName.value = '';
    if (this.elements.welcomeReportTitle) this.elements.welcomeReportTitle.value = 'Laporan Keuangan';
    this.elements.preparerName.value = '';
  }

  updateUserEmail(email) {
    if (this.elements.userEmail) this.elements.userEmail.textContent = email;
  }

  showClassification(classification) {
    this.elements.classifiedAccount.textContent = classification.account || classification.accountName || 'N/A';
    this.elements.classifiedType.textContent = classification.accountType || classification.classification || 'N/A';

    let debitCreditText = 'N/A';
    const type = classification.accountType || classification.classification;
    if (type === 'Asset' || type === 'Expense') {
      debitCreditText = 'DEBIT';
    } else if (type === 'Liability' || type === 'Equity' || type === 'Revenue') {
      debitCreditText = 'CREDIT';
    }
    this.elements.classifiedDebitCredit.textContent = debitCreditText;
    this.elements.classifiedAmount.textContent = this.formatCurrency(classification.totalAmount || 0);
    this.elements.classificationReasoning.textContent = classification.reasoning || 'No reasoning provided';
    this.elements.confidenceScore.textContent = Math.round((classification.aiConfidence || 0) * 100) + '%';
    this.elements.classificationDisplay.style.display = 'block';
  }

  hideClassification() {
    this.elements.classificationDisplay.style.display = 'none';
  }

  showLoading() {
    this.elements.loadingIndicator.style.display = 'flex';
    this.elements.transactionInput.disabled = true;
  }

  hideLoading() {
    this.elements.loadingIndicator.style.display = 'none';
    this.elements.transactionInput.disabled = false;
  }

  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.style.display = 'flex';
    setTimeout(() => { this.elements.errorMessage.style.display = 'none'; }, 5000);
  }

  showSuccess(message) {
    this.elements.successMessage.textContent = message;
    this.elements.successMessage.style.display = 'flex';
    setTimeout(() => { this.elements.successMessage.style.display = 'none'; }, 3000);
  }

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

  renderReportTable(report) {
    if (!report || report.error) {
      this.elements.tableHeader.innerHTML = '';
      this.elements.tableBody.innerHTML = '';
      this.elements.emptyState.style.display = 'flex';
      return;
    }

    this.elements.emptyState.style.display = 'none';

    let headers = [];
    switch (report.type) {
      case 'General Journal':
        headers = ['Date', 'Account Code', 'Account Name', 'Description', 'Debit', 'Credit'];
        break;
      case 'General Ledger':
        headers = ['Account Code', 'Account Name', 'Date', 'Description', 'Debit', 'Credit', 'Balance'];
        break;
      case 'Trial Balance':
        headers = ['Account Code', 'Account Name', 'Debit', 'Credit'];
        break;
      case 'Reversing Journal':
        headers = ['Date', 'Account Code', 'Account Name', 'Description', 'Debit', 'Credit'];
        break;
    }
    this.elements.tableHeader.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');

    let rows = [];
    switch (report.type) {
      case 'General Journal':
        rows = report.entries.map(e =>
          '<tr><td>' + e.date + '</td><td>' + (e.accountCode || 'N/A') + '</td><td>' + (e.account || 'N/A') + '</td><td>' + e.description + '</td>' +
          '<td class="amount-debit">' + this.formatCurrency(e.debit) + '</td>' +
          '<td class="amount-credit">' + this.formatCurrency(e.credit) + '</td></tr>'
        );
        break;
      case 'General Ledger':
        report.accounts.forEach(account => {
          account.transactions.forEach(txn => {
            rows.push(
              '<tr><td>' + account.accountCode + '</td><td>' + account.accountName + '</td><td>' + txn.date + '</td><td>' + txn.description + '</td>' +
              '<td class="amount-debit">' + this.formatCurrency(txn.debit) + '</td>' +
              '<td class="amount-credit">' + this.formatCurrency(txn.credit) + '</td>' +
              '<td class="amount-balance">' + this.formatCurrency(txn.balance) + '</td></tr>'
            );
          });
        });
        break;
      case 'Trial Balance':
        rows = report.entries.map(e =>
          '<tr><td>' + e.code + '</td><td>' + e.name + '</td>' +
          '<td class="amount-debit">' + this.formatCurrency(e.debitBalance) + '</td>' +
          '<td class="amount-credit">' + this.formatCurrency(e.creditBalance) + '</td></tr>'
        );
        break;
      case 'Reversing Journal':
        rows = report.entries.map(e =>
          '<tr><td>' + e.date + '</td><td>' + e.accountCode + '</td><td>' + (e.account || 'N/A') + '</td><td>' + e.description + '</td>' +
          '<td class="amount-debit">' + this.formatCurrency(e.debit) + '</td>' +
          '<td class="amount-credit">' + this.formatCurrency(e.credit) + '</td></tr>'
        );
        break;
    }
    this.elements.tableBody.innerHTML = rows.join('');
  }

  updateUndoRedoButtons(canUndo, canRedo) {
    this.elements.undoBtn.disabled = !canUndo;
    this.elements.redoBtn.disabled = !canRedo;
  }

  updateStatusBadge(status, color) {
    color = color || 'success';
    this.elements.statusBadge.textContent = status;
    this.elements.statusBadge.className = 'status-badge badge-' + color;
  }

  showSettingsModal() {
    this.elements.settingsModal.style.display = 'flex';
  }

  hideSettingsModal() {
    this.elements.settingsModal.style.display = 'none';
  }

  getSettingsData() {
    return {
      organizationName: this.elements.orgName.value,
      reportTitle: this.elements.settingsReportTitle ? this.elements.settingsReportTitle.value : '',
      preparer: this.elements.preparer.value
    };
  }

  setSettingsData(data) {
    this.elements.orgName.value = data.organizationName || '';
    if (this.elements.settingsReportTitle) this.elements.settingsReportTitle.value = data.reportTitle || 'Accounting Report';
    this.elements.preparer.value = data.preparer || '';
  }

  showConfirmation(title, message, onConfirm) {
    this.elements.confirmTitle.textContent = title;
    this.elements.confirmMessage.textContent = message;
    this.elements.confirmModal.style.display = 'flex';
    this.elements.confirmOk.onclick = () => {
      this.hideConfirmation();
      onConfirm();
    };
  }

  hideConfirmation() {
    this.elements.confirmModal.style.display = 'none';
  }

  clearTransactionInput() {
    this.elements.transactionInput.value = '';
    this.elements.transactionInput.focus();
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  disableTransactionInput() {
    this.elements.transactionInput.disabled = true;
    this.elements.doneBtn.textContent = 'Edit';
  }

  enableTransactionInput() {
    this.elements.transactionInput.disabled = false;
    this.elements.doneBtn.textContent = 'Done';
  }

  getTransactionInput() {
    return this.elements.transactionInput.value;
  }

  getSelectedReportType() {
    return this.elements.reportTypeSelect.value;
  }
}

// Initialize global UI manager
const ui = new UIManager();
