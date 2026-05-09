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
    this.elements.closingJournalBtn = document.getElementById('closingJournalBtn');
    this.elements.settingsBtn = document.getElementById('settingsBtn');
    this.elements.settingsModal = document.getElementById('settingsModal');
    this.elements.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.elements.orgName = document.getElementById('orgName');
    this.elements.settingsReportTitle = document.getElementById('settingsReportTitle');
    this.elements.preparer = document.getElementById('preparer');
    this.elements.inventoryBeginning = document.getElementById('inventoryBeginning');
    this.elements.inventoryEnding = document.getElementById('inventoryEnding');
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
    if (!this.elements.classifiedAccount) return;
    this.elements.classifiedAccount.textContent =
      (classification.account || classification.accountName || 'N/A') +
      (classification.offsetAccountName ? ' → ' + classification.offsetAccountName : '');
    if (this.elements.classifiedType)
      this.elements.classifiedType.textContent = classification.accountType || classification.classification || 'N/A';
    if (this.elements.classifiedDebitCredit)
      this.elements.classifiedDebitCredit.textContent =
        'DEBIT: ' + (classification.account || 'N/A') +
        ' | KREDIT: ' + (classification.offsetAccountName || 'Kas');
    if (this.elements.classifiedAmount)
      this.elements.classifiedAmount.textContent = this.formatCurrency(classification.totalAmount || 0);
    if (this.elements.classificationReasoning)
      this.elements.classificationReasoning.textContent = classification.reasoning || 'No reasoning provided';
    if (this.elements.confidenceScore)
      this.elements.confidenceScore.textContent = Math.round((classification.aiConfidence || 0) * 100) + '%';
    if (this.elements.classificationDisplay) {
      this.elements.classificationDisplay.style.display = 'block';
      // Scroll input panel ke atas agar classification terlihat
      const inputPanel = this.elements.classificationDisplay.closest('.input-panel');
      if (inputPanel) {
        inputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
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

    // Gunakan label custom jika ada (misal Financial Statements pakai "Total Aset" / "Total L+E")
    const labelD = summary.labelDebits  || 'Total Debits:';
    const labelC = summary.labelCredits || 'Total Credits:';

    // Update label teks jika elemen label tersedia
    const labelDebitsEl  = document.getElementById('labelTotalDebits');
    const labelCreditsEl = document.getElementById('labelTotalCredits');
    if (labelDebitsEl)  labelDebitsEl.textContent  = labelD;
    if (labelCreditsEl) labelCreditsEl.textContent = labelC;

    if (this.elements.totalDebits)  this.elements.totalDebits.textContent  = this.formatCurrency(summary.totalDebits  || 0);
    if (this.elements.totalCredits) this.elements.totalCredits.textContent = this.formatCurrency(summary.totalCredits || 0);
    if (this.elements.balanceStatus) {
      // Gunakan field 'balanced' jika ada, fallback ke perbandingan debit vs kredit
      const isBalanced = (summary.balanced !== undefined)
        ? summary.balanced
        : Math.abs((summary.totalDebits || 0) - (summary.totalCredits || 0)) < 0.01;

      if (isBalanced) {
        this.elements.balanceStatus.textContent = '✓ Balanced';
        this.elements.balanceStatus.className = 'status-indicator balanced';
        if (this.elements.generatePdfBtn) this.elements.generatePdfBtn.disabled = false;
      } else {
        this.elements.balanceStatus.textContent = '✗ Unbalanced';
        this.elements.balanceStatus.className = 'status-indicator unbalanced';
        // Hanya disable PDF untuk mode yang memerlukan balance (jurnal umum & neraca saldo)
        // Mode laporan view-only (pembalik, keuangan, penutup, dll) tetap bisa cetak PDF
        const viewOnlyModes = ['reversing-journal', 'adjusting-entries', 'adjusted-trial-balance', 'financial-statements', 'closing-journal'];
        const currentMode = this.elements.reportTypeSelect ? this.elements.reportTypeSelect.value : '';
        if (this.elements.generatePdfBtn) {
          this.elements.generatePdfBtn.disabled = !viewOnlyModes.includes(currentMode);
        }
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

    const fmt = this.formatCurrency.bind(this);
    const el  = this.elements;

    switch (report.type) {
      case 'General Journal':          renderGeneralJournal(report, el, fmt);          break;
      case 'General Ledger':           renderGeneralLedger(report, el, fmt);           break;
      case 'Trial Balance':            renderTrialBalance(report, el, fmt);            break;
      case 'Reversing Journal':        renderReversingJournal(report, el, fmt);        break;
      case 'Adjusting Entries':        renderAdjustingEntries(report, el, fmt);        break;
      case 'Adjusted Trial Balance':   renderAdjustedTrialBalance(report, el, fmt);   break;
      case 'Financial Statements':     renderFinancialStatements(report, el, fmt);     break;
      case 'Closing Journal':          renderClosingJournal(report, el, fmt);          break;
    }
  }

  // Kept for backward compatibility — delegates to per-mode files
  _renderGeneralJournal(report)   { renderGeneralJournal(report, this.elements, this.formatCurrency.bind(this)); }
  _renderGeneralLedger(report)    { renderGeneralLedger(report, this.elements, this.formatCurrency.bind(this)); }
  _renderTrialBalance(report)     { renderTrialBalance(report, this.elements, this.formatCurrency.bind(this)); }
  _renderReversingJournal(report) { renderReversingJournal(report, this.elements, this.formatCurrency.bind(this)); }

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
      preparer: this.elements.preparer.value,
      inventoryBeginning: parseFloat(this.elements.inventoryBeginning.value) || 0,
      inventoryEnding: parseFloat(this.elements.inventoryEnding.value) || 0
    };
  }

  setSettingsData(data) {
    this.elements.orgName.value = data.organizationName || '';
    if (this.elements.settingsReportTitle) this.elements.settingsReportTitle.value = data.reportTitle || 'Accounting Report';
    this.elements.preparer.value = data.preparer || '';
    this.elements.inventoryBeginning.value = data.inventoryBeginning || 0;
    this.elements.inventoryEnding.value = data.inventoryEnding || 0;
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
