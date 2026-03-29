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
    if (this.elements.welcomeSection) this.elements.welcomeSection.style.display = 'flex';
    if (this.elements.appSection) this.elements.appSection.style.display = 'none';
  }

  showAppSection() {
    if (this.elements.welcomeSection) this.elements.welcomeSection.style.display = 'none';
    if (this.elements.appSection) this.elements.appSection.style.display = 'block';
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
    this.elements.classifiedAccount.textContent =
      (classification.account || classification.accountName || 'N/A') +
      (classification.offsetAccountName ? ' → ' + classification.offsetAccountName : '');
    this.elements.classifiedType.textContent = classification.accountType || classification.classification || 'N/A';

    // Always show DEBIT for primary account (double-entry: primary is always debit side)
    this.elements.classifiedDebitCredit.textContent =
      'DEBIT: ' + (classification.account || 'N/A') +
      ' | KREDIT: ' + (classification.offsetAccountName || 'Kas');

    this.elements.classifiedAmount.textContent = this.formatCurrency(classification.totalAmount || 0);
    this.elements.classificationReasoning.textContent = classification.reasoning || 'No reasoning provided';
    this.elements.confidenceScore.textContent = Math.round((classification.aiConfidence || 0) * 100) + '%';
    this.elements.classificationDisplay.style.display = 'block';
  }

  hideClassification() {
    if (this.elements.classificationDisplay) this.elements.classificationDisplay.style.display = 'none';
  }

  showLoading() {
    if (this.elements.loadingIndicator) this.elements.loadingIndicator.style.display = 'flex';
    if (this.elements.transactionInput) this.elements.transactionInput.disabled = true;
  }

  hideLoading() {
    if (this.elements.loadingIndicator) this.elements.loadingIndicator.style.display = 'none';
    if (this.elements.transactionInput) this.elements.transactionInput.disabled = false;
  }

  showError(message) {
    if (!this.elements.errorMessage) return;
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.style.display = 'flex';
    setTimeout(() => { if (this.elements.errorMessage) this.elements.errorMessage.style.display = 'none'; }, 5000);
  }

  showSuccess(message) {
    if (!this.elements.successMessage) return;
    this.elements.successMessage.textContent = message;
    this.elements.successMessage.style.display = 'flex';
    setTimeout(() => { if (this.elements.successMessage) this.elements.successMessage.style.display = 'none'; }, 3000);
  }

  updateReportSummary(summary) {
    if (!summary) return;
    if (this.elements.totalDebits) this.elements.totalDebits.textContent = this.formatCurrency(summary.totalDebits || 0);
    if (this.elements.totalCredits) this.elements.totalCredits.textContent = this.formatCurrency(summary.totalCredits || 0);
    if (this.elements.balanceStatus) {
      if (summary.balanced) {
        this.elements.balanceStatus.textContent = '✓ Balanced';
        this.elements.balanceStatus.className = 'status-indicator balanced';
        if (this.elements.generatePdfBtn) this.elements.generatePdfBtn.disabled = false;
      } else {
        this.elements.balanceStatus.textContent = '✗ Unbalanced';
        this.elements.balanceStatus.className = 'status-indicator unbalanced';
        if (this.elements.generatePdfBtn) this.elements.generatePdfBtn.disabled = true;
      }
    }
  }

  renderReportTable(report) {
    if (!this.elements.tableHeader || !this.elements.tableBody) return;
    if (!report || report.error) {
      this.elements.tableHeader.innerHTML = '';
      this.elements.tableBody.innerHTML = '';
      if (this.elements.emptyState) this.elements.emptyState.style.display = 'flex';
      return;
    }

    if (this.elements.emptyState) this.elements.emptyState.style.display = 'none';

    switch (report.type) {
      case 'General Journal':
        this._renderGeneralJournal(report);
        break;
      case 'General Ledger':
        this._renderGeneralLedger(report);
        break;
      case 'Trial Balance':
        this._renderTrialBalance(report);
        break;
      case 'Reversing Journal':
        this._renderReversingJournal(report);
        break;
    }
  }

  _renderGeneralJournal(report) {
    this.elements.tableHeader.innerHTML =
      '<th>Tanggal</th><th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th>Debet</th><th>Kredit</th>';
    const rows = report.entries.map(e =>
      '<tr><td>' + e.date + '</td><td>' + (e.accountCode || '-') + '</td><td>' + (e.account || '-') + '</td><td>' + e.description + '</td>' +
      '<td class="amount-debit">' + (e.debit > 0 ? this.formatCurrency(e.debit) : '-') + '</td>' +
      '<td class="amount-credit">' + (e.credit > 0 ? this.formatCurrency(e.credit) : '-') + '</td></tr>'
    );
    // Total row
    rows.push(
      '<tr class="total-row"><td colspan="4"><strong>Total</strong></td>' +
      '<td class="amount-debit"><strong>' + this.formatCurrency(report.summary.totalDebits) + '</strong></td>' +
      '<td class="amount-credit"><strong>' + this.formatCurrency(report.summary.totalCredits) + '</strong></td></tr>'
    );
    this.elements.tableBody.innerHTML = rows.join('');
  }

  _renderGeneralLedger(report) {
    // General Ledger uses a special per-account card layout — hide the shared table header
    this.elements.tableHeader.innerHTML = '';
    this.elements.tableBody.innerHTML = '';

    if (!report.accounts || report.accounts.length === 0) {
      if (this.elements.emptyState) this.elements.emptyState.style.display = 'flex';
      return;
    }

    const html = report.accounts.map(account => {
      const monthNames = ['Januari','Februari','Maret','April','Mei','Juni',
                          'Juli','Agustus','September','Oktober','November','Desember'];
      const bulan = monthNames[(account.month || 1) - 1] || account.month;
      const tahun = account.year || '-';

      // Transaction rows
      const txnRows = account.transactions.map(t =>
        '<tr>' +
        '<td>' + t.date + '</td>' +
        '<td>' + t.description + '</td>' +
        '<td class="ref-col">' + t.ref + '</td>' +
        '<td class="amount-debit">' + (t.debit > 0 ? this.formatCurrency(t.debit) : '-') + '</td>' +
        '<td class="amount-credit">' + (t.credit > 0 ? this.formatCurrency(t.credit) : '-') + '</td>' +
        '<td class="amount-debit">' + (t.balanceDebit > 0 ? this.formatCurrency(t.balanceDebit) : '-') + '</td>' +
        '<td class="amount-credit">' + (t.balanceCredit > 0 ? this.formatCurrency(t.balanceCredit) : '-') + '</td>' +
        '</tr>'
      ).join('');

      return `
        <tr class="ledger-account-header">
          <td colspan="7">
            <div class="ledger-account-meta">
              <div class="ledger-meta-left">
                <span><strong>Kode</strong> : ${account.accountCode}</span>
                <span><strong>Nama Akun</strong> : ${account.accountName}</span>
              </div>
              <div class="ledger-meta-right">
                <span><strong>Bulan</strong> : ${bulan}</span>
                <span><strong>Tahun</strong> : ${tahun}</span>
              </div>
            </div>
            <div class="ledger-balance-summary">
              <div class="ledger-balance-group">
                <span>Saldo Awal Debet: <strong>${this.formatCurrency(account.openingBalanceDebit)}</strong></span>
                <span>Saldo Awal Kredit: <strong>${this.formatCurrency(account.openingBalanceCredit)}</strong></span>
              </div>
              <div class="ledger-balance-group">
                <span>Mutasi Debet: <strong>${this.formatCurrency(account.totalDebits)}</strong></span>
                <span>Mutasi Kredit: <strong>${this.formatCurrency(account.totalCredits)}</strong></span>
              </div>
              <div class="ledger-balance-group">
                <span>Saldo Akhir Debet: <strong>${this.formatCurrency(account.closingBalanceDebit)}</strong></span>
                <span>Saldo Akhir Kredit: <strong>${this.formatCurrency(account.closingBalanceCredit)}</strong></span>
              </div>
            </div>
          </td>
        </tr>
        <tr class="ledger-col-header">
          <th>Tanggal</th><th>Keterangan</th><th>No Ref</th>
          <th>Debet</th><th>Kredit</th>
          <th colspan="2" class="saldo-header">Saldo</th>
        </tr>
        <tr class="ledger-col-subheader">
          <th colspan="5"></th><th>Debet</th><th>Kredit</th>
        </tr>
        ${txnRows}
        <tr class="ledger-total-row">
          <td colspan="3"><strong>Total</strong></td>
          <td class="amount-debit"><strong>${this.formatCurrency(account.totalDebits)}</strong></td>
          <td class="amount-credit"><strong>${this.formatCurrency(account.totalCredits)}</strong></td>
          <td colspan="2"></td>
        </tr>
        <tr class="ledger-spacer"><td colspan="7"></td></tr>
      `;
    }).join('');

    this.elements.tableBody.innerHTML = html;
  }

  _renderTrialBalance(report) {
    this.elements.tableHeader.innerHTML =
      '<th>Kode Akun</th><th>Nama Akun</th><th>Debet</th><th>Kredit</th>';
    const rows = report.entries.map(e =>
      '<tr><td>' + e.code + '</td><td>' + e.name + '</td>' +
      '<td class="amount-debit">' + (e.debitBalance > 0 ? this.formatCurrency(e.debitBalance) : '-') + '</td>' +
      '<td class="amount-credit">' + (e.creditBalance > 0 ? this.formatCurrency(e.creditBalance) : '-') + '</td></tr>'
    );
    rows.push(
      '<tr class="total-row"><td colspan="2"><strong>Total</strong></td>' +
      '<td class="amount-debit"><strong>' + this.formatCurrency(report.summary.totalDebits) + '</strong></td>' +
      '<td class="amount-credit"><strong>' + this.formatCurrency(report.summary.totalCredits) + '</strong></td></tr>'
    );
    this.elements.tableBody.innerHTML = rows.join('');
  }

  _renderReversingJournal(report) {
    this.elements.tableHeader.innerHTML =
      '<th>Tanggal</th><th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th>Debet</th><th>Kredit</th>';
    const rows = report.entries.map(e =>
      '<tr><td>' + e.date + '</td><td>' + e.accountCode + '</td><td>' + (e.account || '-') + '</td><td>' + e.description + '</td>' +
      '<td class="amount-debit">' + (e.debit > 0 ? this.formatCurrency(e.debit) : '-') + '</td>' +
      '<td class="amount-credit">' + (e.credit > 0 ? this.formatCurrency(e.credit) : '-') + '</td></tr>'
    );
    this.elements.tableBody.innerHTML = rows.join('');
  }

  updateUndoRedoButtons(canUndo, canRedo) {
    if (this.elements.undoBtn) this.elements.undoBtn.disabled = !canUndo;
    if (this.elements.redoBtn) this.elements.redoBtn.disabled = !canRedo;
  }

  updateStatusBadge(status, color) {
    if (!this.elements.statusBadge) return;
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
    if (this.elements.transactionInput) {
      this.elements.transactionInput.value = '';
      this.elements.transactionInput.focus();
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  disableTransactionInput() {
    if (this.elements.transactionInput) this.elements.transactionInput.disabled = true;
    if (this.elements.doneBtn) this.elements.doneBtn.textContent = 'Edit';
  }

  enableTransactionInput() {
    if (this.elements.transactionInput) this.elements.transactionInput.disabled = false;
    if (this.elements.doneBtn) this.elements.doneBtn.textContent = 'Done';
  }

  getTransactionInput() {
    return this.elements.transactionInput ? this.elements.transactionInput.value : '';
  }

  getSelectedReportType() {
    return this.elements.reportTypeSelect ? this.elements.reportTypeSelect.value : 'general-journal';
  }
}

// Initialize global UI manager
const ui = new UIManager();
