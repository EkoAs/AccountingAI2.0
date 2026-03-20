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
  app.initialize(GEMINI_API_KEY);
  
  // Check if user is already logged in
  const currentUser = sessionStorage.getItem('currentUser');
  if (currentUser) {
    app.currentUser = currentUser;
    app.loadUserData();
    showAppInterface();
  } else {
    showAuthInterface();
  }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Auth Events
  ui.elements.toggleRegister.addEventListener('click', (e) => {
    e.preventDefault();
    ui.toggleAuthForm();
  });

  ui.elements.toggleLogin.addEventListener('click', (e) => {
    e.preventDefault();
    ui.toggleAuthForm();
  });

  ui.elements.loginBtn.addEventListener('click', handleLogin);
  ui.elements.registerBtn.addEventListener('click', handleRegister);

  // Header Events
  ui.elements.logoutBtn.addEventListener('click', handleLogout);
  ui.elements.settingsBtn.addEventListener('click', () => {
    ui.showSettingsModal();
    const profile = authManager.getUserProfile(app.currentUser);
    ui.setSettingsData({
      organizationName: profile.organizationName,
      reportTitle: profile.reportTitle,
      preparer: profile.preparer
    });
  });

  ui.elements.closeSettingsBtn.addEventListener('click', ui.hideSettingsModal.bind(ui));
  ui.elements.cancelSettingsBtn.addEventListener('click', ui.hideSettingsModal.bind(ui));
  ui.elements.saveSettingsBtn.addEventListener('click', handleSaveSettings);

  // Transaction Input Events
  ui.elements.transactionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleTransactionSubmit();
    }
  });

  ui.elements.confirmBtn.addEventListener('click', handleConfirmTransaction);
  ui.elements.adjustBtn.addEventListener('click', handleAdjustTransaction);

  // Action Button Events
  ui.elements.undoBtn.addEventListener('click', handleUndo);
  ui.elements.redoBtn.addEventListener('click', handleRedo);
  ui.elements.doneBtn.addEventListener('click', handleDone);

  // Report Events
  ui.elements.reportTypeSelect.addEventListener('change', handleReportTypeChange);
  ui.elements.generatePdfBtn.addEventListener('click', handleGeneratePDF);
  ui.elements.exportDataBtn.addEventListener('click', handleExportData);

  // Modal Events
  ui.elements.confirmCancel.addEventListener('click', ui.hideConfirmation.bind(ui));
}

/**
 * Handle login
 */
async function handleLogin() {
  const credentials = ui.getLoginCredentials();

  if (!credentials.email || !credentials.password) {
    ui.showError('Please fill in all fields');
    return;
  }

  const result = app.loginUser(credentials.email, credentials.password);

  if (result.success) {
    ui.showSuccess('Login successful');
    ui.updateUserEmail(credentials.email);
    showAppInterface();
  } else {
    ui.showError(result.message);
  }
}

/**
 * Handle registration
 */
async function handleRegister() {
  const credentials = ui.getRegisterCredentials();

  if (!credentials.email || !credentials.password || !credentials.confirm) {
    ui.showError('Please fill in all fields');
    return;
  }

  if (credentials.password !== credentials.confirm) {
    ui.showError('Passwords do not match');
    return;
  }

  const result = app.registerUser(credentials.email, credentials.password);

  if (result.success) {
    ui.showSuccess('Registration successful');
    ui.updateUserEmail(credentials.email);
    showAppInterface();
  } else {
    ui.showError(result.message);
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  ui.showConfirmation(
    'Logout',
    'Are you sure you want to logout?',
    () => {
      app.logoutUser();
      ui.clearAuthForms();
      showAuthInterface();
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

  // Success feedback
  ui.showSuccess('✓ Transaction added to report');
  
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
 * Handle done button
 */
function handleDone() {
  if (app.isFinalized) {
    // Return to edit mode
    app.returnToEditMode();
    ui.enableTransactionInput();
    ui.updateStatusBadge('Ready', 'success');
    ui.showSuccess('Returned to edit mode');
  } else {
    // Finalize transactions
    const result = app.finalizeTransactions();

    if (!result.success) {
      ui.showError(result.error);
      return;
    }

    ui.disableTransactionInput();
    ui.updateStatusBadge('Finalized', 'success');
    ui.showSuccess('Transactions finalized successfully');
  }
}

/**
 * Handle report type change
 */
function handleReportTypeChange() {
  updateReport();
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

  const success = app.updateUserProfile(settings);

  if (success) {
    ui.hideSettingsModal();
    ui.showSuccess('Settings saved successfully');
  } else {
    ui.showError('Failed to save settings');
  }
}

/**
 * Update report display
 */
function updateReport() {
  const reportType = ui.getSelectedReportType();
  const report = app.generateReport(reportType);

  if (report && !report.error) {
    ui.renderReportTable(report);
    ui.updateReportSummary(report.summary);
  }
}

/**
 * Update undo/redo button states
 */
function updateUndoRedoButtons() {
  const canUndo = app.undoStack.length > 0;
  const canRedo = app.redoStack.length > 0;
  ui.updateUndoRedoButtons(canUndo, canRedo);
}

/**
 * Show auth interface
 */
function showAuthInterface() {
  ui.showAuthSection();
  ui.elements.loginForm.classList.add('active');
  ui.elements.registerForm.classList.remove('active');
}

/**
 * Show app interface
 */
function showAppInterface() {
  ui.showAppSection();
  updateReport();
  updateUndoRedoButtons();
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
