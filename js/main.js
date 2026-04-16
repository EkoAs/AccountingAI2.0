/**
 * Main Application Logic
 * Handles event listeners and application flow
 */

// Get API key from environment or localStorage
const GEMINI_API_KEY = localStorage.getItem('gemini_api_key') || '';

// Initialize application on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
});

/**
 * Initialize application
 */
function initializeApp() {
  try {
    // Reset state global
    window.currentTransaction = null;

    // Create a temporary session user (no login required)
    const tempUserId = sessionStorage.getItem('currentUser') || ('temp_user_' + Date.now());
    app.currentUser = tempUserId;
    sessionStorage.setItem('currentUser', tempUserId);

    app.initialize(GEMINI_API_KEY);

    // Show welcome screen
    showWelcomeScreen();
  } catch (error) {
    console.error('Error initializing application:', error);
    showWelcomeScreen();
  }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Welcome Events
  if (ui.elements.startBtn) {
    ui.elements.startBtn.addEventListener('click', handleStartApp);
  }

  // Header Events
    if (ui.elements.logoutBtn) {
      ui.elements.logoutBtn.addEventListener('click', handleLogout);
    }

    if (ui.elements.reportModeBtn) {
      ui.elements.reportModeBtn.addEventListener('click', () => {
        ui.showSuccess('Report mode feature coming soon');
      });
    }

    if (ui.elements.hamburgerBtn) {
      ui.elements.hamburgerBtn.addEventListener('click', () => {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
          navMenu.classList.toggle('active');
          ui.elements.hamburgerBtn.classList.toggle('active');
        }
      });
    }

    if (ui.elements.settingsBtn) {
      ui.elements.settingsBtn.addEventListener('click', () => {
        ui.showSettingsModal();
        const profile = authManager.getUserProfile(app.currentUser) || {};
        ui.setSettingsData({
          organizationName: app.metadata.organizationName || profile.organizationName || '',
          reportTitle: app.metadata.reportTitle || profile.reportTitle || 'Laporan Keuangan',
          preparer: app.metadata.preparer || profile.preparer || ''
        });
      });
    }

    if (ui.elements.closeSettingsBtn) {
      ui.elements.closeSettingsBtn.addEventListener('click', ui.hideSettingsModal.bind(ui));
    }

    if (ui.elements.cancelSettingsBtn) {
      ui.elements.cancelSettingsBtn.addEventListener('click', ui.hideSettingsModal.bind(ui));
    }

    if (ui.elements.saveSettingsBtn) {
      ui.elements.saveSettingsBtn.addEventListener('click', handleSaveSettings);
    }

    // Transaction Input Events
    if (ui.elements.transactionInput) {
      ui.elements.transactionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleTransactionSubmit();
        }
      });
    }

    if (ui.elements.confirmBtn) {
      ui.elements.confirmBtn.addEventListener('click', handleConfirmTransaction);
    }

    if (ui.elements.adjustBtn) {
      ui.elements.adjustBtn.addEventListener('click', handleAdjustTransaction);
    }

    // Action Button Events
    if (ui.elements.undoBtn) {
      ui.elements.undoBtn.addEventListener('click', handleUndo);
    }

    if (ui.elements.redoBtn) {
      ui.elements.redoBtn.addEventListener('click', handleRedo);
    }

    if (ui.elements.resetBtn) {
      ui.elements.resetBtn.addEventListener('click', handleReset);
    }

    if (ui.elements.doneBtn) {
      ui.elements.doneBtn.addEventListener('click', handleDone);
    }

    // Report Events
    if (ui.elements.reportTypeSelect) {
      ui.elements.reportTypeSelect.addEventListener('change', handleReportTypeChange);
    }

    if (ui.elements.generatePdfBtn) {
      ui.elements.generatePdfBtn.addEventListener('click', handleGeneratePDF);
    }

    if (ui.elements.exportDataBtn) {
      ui.elements.exportDataBtn.addEventListener('click', handleExportData);
    }

    if (ui.elements.closingJournalBtn) {
      ui.elements.closingJournalBtn.addEventListener('click', handleClosingJournal);
    }

    // Modal Events
    if (ui.elements.confirmCancel) {
      ui.elements.confirmCancel.addEventListener('click', ui.hideConfirmation.bind(ui));
    }

    if (ui.elements.confirmOk) {
      ui.elements.confirmOk.addEventListener('click', () => {
        // This will be set dynamically in showConfirmation
      });
    }

}

/**
 * Handle start app from welcome screen
 */
function handleStartApp() {
  try {
    const welcomeData = ui.getWelcomeData();

    if (!welcomeData.companyName.trim()) {
      ui.showError('Nama perusahaan harus diisi');
      return;
    }

    // Ensure metadata object exists
    if (!app.metadata) app.metadata = {};

    app.metadata.organizationName = welcomeData.companyName;
    app.metadata.reportTitle = welcomeData.reportTitle;
    app.metadata.preparer = welcomeData.preparerName;
    app.metadata.dateRange = '';

    storageManager.saveData(app.currentUser, 'metadata', app.metadata);

    ui.showSuccess('Selamat datang, ' + welcomeData.companyName + '!');

    setTimeout(() => {
      try {
        showAppInterface();
      } catch (err) {
        console.error('Error showing app interface:', err);
        ui.showError('Gagal memuat antarmuka: ' + err.message);
      }
    }, 500);
  } catch (error) {
    console.error('Error starting app:', error);
    ui.showError('Gagal memulai aplikasi: ' + error.message);
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  ui.showConfirmation(
    'Kembali ke Welcome',
    'Apakah Anda ingin kembali ke layar welcome?',
    () => {
      // Reset app state
      app.resetAppState();
      ui.clearWelcomeForm();
      showWelcomeScreen();
    }
  );
}

/**
 * Handle transaction submit
 */
async function handleTransactionSubmit() {
  const input = ui.getTransactionInput();

  if (!input.trim()) {
    ui.showError('Please enter a transaction');
    return;
  }

  // Clear transaksi sebelumnya jika ada (prevent stale state)
  window.currentTransaction = null;
  ui.hideClassification();

  ui.showLoading();
  ui.updateStatusBadge('Processing...', 'warning');

  try {
    const result = await app.processTransactionInput(input);

    if (result.error) {
      ui.hideLoading();
      ui.showError(result.error);
      ui.updateStatusBadge('Error', 'error');
      return;
    }

    ui.hideLoading();
    ui.showClassification(result);
    ui.updateStatusBadge('Ready for confirmation', 'info');
    
    // Store current transaction for confirmation
    window.currentTransaction = result;
  } catch (error) {
    ui.hideLoading();
    ui.showError('Failed to process transaction');
    ui.updateStatusBadge('Error', 'error');
  }
}

/**
 * Handle confirm transaction
 */
function handleConfirmTransaction() {
  if (!window.currentTransaction) {
    ui.showError('No transaction to confirm');
    return;
  }

  const result = app.confirmTransaction(window.currentTransaction);

  if (result.error) {
    ui.showError(result.error);
    return;
  }

  // Check if transaction needs offset
  const offsetSuggestion = autoBalancer.suggestOffsetTransaction(
    window.currentTransaction,
    app.chartOfAccounts
  );

  // Success feedback
  ui.showSuccess('✓ Transaction added to report');
  
  // Show offset suggestion if needed
  if (offsetSuggestion && offsetSuggestion.accountCode !== window.currentTransaction.accountCode) {
    const offsetMsg = `💡 Tip: Consider adding offset transaction:\n${offsetSuggestion.account} (${offsetSuggestion.accountCode})\nAmount: Rp ${(offsetSuggestion.totalAmount).toLocaleString('id-ID')}`;
    console.log(offsetMsg);
  }
  
  // Clear UI
  ui.hideClassification();
  ui.clearTransactionInput();
  ui.updateStatusBadge('Ready', 'success');
  window.currentTransaction = null;

  // Update report immediately
  updateReport();
  updateUndoRedoButtons();
  
  // Focus back to input for next transaction
  ui.elements.transactionInput.focus();
}

/**
 * Handle adjust transaction
 */
function handleAdjustTransaction() {
  // TODO: Implement manual adjustment interface
  ui.showError('Manual adjustment not yet implemented');
}

/**
 * Handle undo
 */
function handleUndo() {
  if (app.undo()) {
    ui.showSuccess('Undo successful');
    updateReport();
    updateUndoRedoButtons();
  }
}

/**
 * Handle redo
 */
function handleRedo() {
  if (app.redo()) {
    ui.showSuccess('Redo successful');
    updateReport();
    updateUndoRedoButtons();
  }
}

/**
 * Handle reset all data
 */
function handleReset() {
  ui.showConfirmation(
    'Reset All Data',
    'Are you sure you want to delete ALL transactions? This cannot be undone.',
    () => {
      const success = app.resetAllData();
      
      if (success) {
        ui.showSuccess('✓ All data has been reset');
        ui.clearTransactionInput();
        ui.hideClassification();
        ui.enableTransactionInput();
        ui.updateStatusBadge('Ready', 'success');
        updateReport();
        updateUndoRedoButtons();
        updateClosingJournalBtn();
      } else {
        ui.showError('Failed to reset data');
      }
    }
  );
}

/**
 * Handle done button
 */
function handleDone() {
  if (app.isFinalized) {
    // Return to edit mode
    app.returnToEditMode();
    ui.enableTransactionInput();
    ui.hideClassification();
    ui.clearTransactionInput();
    ui.updateStatusBadge('Ready', 'success');
    ui.showSuccess('Returned to edit mode');
  } else {
    // Finalize transactions
    const result = app.finalizeTransactions();

    if (!result.success) {
      ui.showError(result.error);
      return;
    }

    ui.hideClassification();
    ui.clearTransactionInput();
    ui.disableTransactionInput();
    ui.updateStatusBadge('Finalized ✓', 'success');
    ui.showSuccess('✓ Laporan difinalisasi. Klik "Edit" untuk input transaksi baru.');
  }
}

/**
 * Handle report type change
 */
function handleReportTypeChange() {
  // Reset label summary ke default sebelum update
  const labelD = document.getElementById('labelTotalDebits');
  const labelC = document.getElementById('labelTotalCredits');
  if (labelD) labelD.textContent = 'Total Debits:';
  if (labelC) labelC.textContent = 'Total Credits:';
  updateReport();
  updateClosingJournalBtn();
}

/**
 * Handle generate PDF
 */
async function handleGeneratePDF() {
  const reportType = ui.getSelectedReportType();

  ui.showLoading();
  ui.updateStatusBadge('Generating PDF...', 'warning');

  try {
    const success = await app.generateAndDownloadPDF(reportType);

    if (success) {
      ui.hideLoading();
      ui.showSuccess('PDF generated and downloaded');
      ui.updateStatusBadge('Ready', 'success');
    } else {
      ui.hideLoading();
      ui.showError('Failed to generate PDF');
      ui.updateStatusBadge('Error', 'error');
    }
  } catch (error) {
    ui.hideLoading();
    ui.showError('Error generating PDF');
    ui.updateStatusBadge('Error', 'error');
  }
}

/**
 * Handle closing journal execution (Mode 8)
 */
function handleClosingJournal() {
  if (app.periodLocked) {
    ui.showError('Periode sudah dikunci. Jurnal penutup sudah dieksekusi.');
    return;
  }
  ui.showConfirmation(
    '🔒 Eksekusi Jurnal Penutup',
    'Ini akan menutup semua akun pendapatan & beban, memperbarui Modal, dan MENGUNCI periode. Tidak dapat dibatalkan kecuali Reset All Data. Lanjutkan?',
    () => {
      const result = app.executeClosingJournal();
      if (!result.success) {
        ui.showError(result.error);
        return;
      }
      const label = result.isProfit ? 'Laba' : 'Rugi';
      ui.showSuccess(`✓ Jurnal penutup selesai. ${label}: Rp ${Math.abs(result.netIncome).toLocaleString('id-ID')}. Periode dikunci.`);
      // Pindah ke tampilan closing journal
      if (ui.elements.reportTypeSelect) {
        ui.elements.reportTypeSelect.value = 'closing-journal';
      }
      updateReport();
      updateUndoRedoButtons();
      updateClosingJournalBtn();
      // Kunci input
      ui.disableTransactionInput();
      ui.updateStatusBadge('Periode Dikunci 🔒', 'error');
    }
  );
}

/**
 * Tampilkan/sembunyikan tombol Eksekusi Jurnal Penutup
 */
function updateClosingJournalBtn() {
  if (!ui.elements.closingJournalBtn) return;
  const selectedReport = ui.getSelectedReportType();
  if (selectedReport === 'closing-journal' && !app.periodLocked) {
    ui.elements.closingJournalBtn.style.display = 'inline-flex';
  } else if (app.periodLocked) {
    ui.elements.closingJournalBtn.style.display = 'inline-flex';
    ui.elements.closingJournalBtn.textContent = '🔒 Periode Dikunci';
    ui.elements.closingJournalBtn.disabled = true;
  } else {
    ui.elements.closingJournalBtn.style.display = 'none';
  }
}

/**
 * Handle export data
 */
function handleExportData() {
  const data = app.exportUserData();

  if (!data) {
    ui.showError('Failed to export data');
    return;
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `accounting_export_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  ui.showSuccess('Data exported successfully');
}

/**
 * Handle save settings
 */
function handleSaveSettings() {
  const settings = ui.getSettingsData();

  // Update app metadata directly (no login required)
  if (!app.metadata) app.metadata = {};
  app.metadata.organizationName = settings.organizationName;
  app.metadata.reportTitle = settings.reportTitle;
  app.metadata.preparer = settings.preparer;
  storageManager.saveData(app.currentUser, 'metadata', app.metadata);

  ui.hideSettingsModal();
  ui.showSuccess('Settings saved successfully');
}

/**
 * Update report display
 */
function updateReport() {
  try {
    if (!ui.elements.reportTypeSelect) return;
    const reportType = ui.getSelectedReportType();
    const report = app.generateReport(reportType);

    if (report && !report.error) {
      ui.renderReportTable(report);
      if (report.summary) ui.updateReportSummary(report.summary);
    }
  } catch (error) {
    console.error('Error updating report:', error);
  }
}

/**
 * Update undo/redo button states
 */
function updateUndoRedoButtons() {
  if (!ui.elements.undoBtn || !ui.elements.redoBtn) return;
  const canUndo = app.undoStack.length > 0;
  const canRedo = app.redoStack.length > 0;
  ui.updateUndoRedoButtons(canUndo, canRedo);
}

/**
 * Show welcome screen
 */
function showWelcomeScreen() {
  ui.showWelcomeSection();
  if (ui.elements.companyName) ui.elements.companyName.focus();
}

/**
 * Show app interface
 */
function showAppInterface() {
  try {
    if (!ui.elements.appSection) {
      throw new Error('appSection element not found');
    }
    ui.showAppSection();
    // Selalu enable input saat masuk app, kecuali period locked
    if (app.periodLocked) {
      ui.disableTransactionInput();
      ui.updateStatusBadge('Periode Dikunci 🔒', 'error');
      updateClosingJournalBtn();
    } else {
      ui.enableTransactionInput();
      ui.updateStatusBadge('Ready', 'success');
    }
    updateReport();
    updateUndoRedoButtons();
  } catch (error) {
    console.error('Error showing app interface:', error);
    ui.showError('Error loading application: ' + error.message);
  }
}

/**
 * Handle API key setup
 */
function setupAPIKey() {
  const apiKey = prompt('Enter your Gemini API key:');
  if (apiKey) {
    localStorage.setItem('gemini_api_key', apiKey);
    aiClassifier.initializeApiKey(apiKey);
    ui.showSuccess('API key saved');
  }
}

// Export functions for global access
window.setupAPIKey = setupAPIKey;
window.handleStartApp = handleStartApp;
window.handleLogout = handleLogout;
