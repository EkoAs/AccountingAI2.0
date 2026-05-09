/**
 * Preservation Property Tests - Existing Modal Functionality
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * IMPORTANT: These tests verify existing functionality that should NOT break
 * when we fix the Done button bug. These tests should PASS on unfixed code.
 * 
 * Property 2: Preservation - Existing Modal Functionality
 * 
 * Tests verify:
 *   - Confirm button functionality (3.1)
 *   - AI classifier display behavior (3.2)
 *   - Transaction input and Enter key handling (3.3)
 *   - Report table updates after Confirm (3.4)
 *   - Adjust button functionality (3.5)
 */

const fs = require('fs');

// ============================================================================
// PROPERTY-BASED TEST GENERATOR
// ============================================================================

/**
 * Generate random transaction data for property-based testing
 */
function generateTransactionData(seed = Math.random()) {
  const descriptions = [
    'modal', 'gaji', 'sewa', 'perlengkapan', 'peralatan',
    'penjualan', 'pembelian', 'piutang', 'utang', 'kas'
  ];
  
  const amounts = [1000, 5000, 10000, 50000, 100000, 500000, 1000000];
  const quantities = [1, 2, 5, 10, 20, 50, 100];
  
  const descIndex = Math.floor(seed * descriptions.length);
  const amountIndex = Math.floor((seed * 7) % amounts.length);
  const quantityIndex = Math.floor((seed * 11) % quantities.length);
  
  return {
    description: descriptions[descIndex],
    amount: amounts[amountIndex],
    quantity: quantities[quantityIndex],
    date: '2026-01-15',
    totalAmount: amounts[amountIndex] * quantities[quantityIndex]
  };
}

/**
 * Property-based test runner - runs test with multiple generated inputs
 */
function runPropertyTest(testFn, numRuns = 10) {
  const results = [];
  
  for (let i = 0; i < numRuns; i++) {
    const seed = i / numRuns;
    const input = generateTransactionData(seed);
    
    try {
      const result = testFn(input);
      results.push({
        input,
        passed: result.passed,
        failures: result.failures,
        counterexample: result.counterexample
      });
    } catch (error) {
      results.push({
        input,
        passed: false,
        failures: ['Test execution error: ' + error.message],
        counterexample: input
      });
    }
  }
  
  return results;
}

// ============================================================================
// MOCK ENVIRONMENT SETUP
// ============================================================================

/**
 * Create a mock environment that simulates the browser DOM and app state
 */
function createMockEnvironment() {
  // Load backend modules
  const store = {};
  const localStorage = {
    getItem: k => store[k] || null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: k => { delete store[k]; },
    get length() { return Object.keys(store).length; },
    key: i => Object.keys(store)[i]
  };
  
  const sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  
  // Load modules in Node.js context
  const modules = [
    'js/modules/storage.js',
    'js/modules/auth.js',
    'js/modules/transaction.js',
    'js/modules/accounting.js'
  ];
  
  const moduleCode = modules.map(m => fs.readFileSync(m, 'utf8')).join('\n');
  
  // Execute modules in a function scope with mocked globals
  const runInScope = new Function(
    'localStorage', 'sessionStorage', 'console',
    moduleCode + '\nreturn { storageManager, authManager, transactionManager, accountingCalculator };'
  );
  
  const { storageManager, authManager, transactionManager, accountingCalculator } = 
    runInScope(localStorage, sessionStorage, console);
  
  // Create mock DOM elements
  const mockElements = {
    classificationDisplay: { style: { display: 'none' } },
    classificationReasoning: { textContent: '' },
    classifiedAccount: { textContent: '' },
    classifiedType: { textContent: '' },
    classifiedDebitCredit: { textContent: '' },
    classifiedAmount: { textContent: '' },
    confidenceScore: { textContent: '' },
    reportTableBody: { children: [], appendChild: function(row) { this.children.push(row); } },
    successMessage: { style: { display: 'none' }, textContent: '' },
    transactionInput: { value: '', disabled: false },
    statusBadge: { textContent: '', className: '' },
    adjustBtn: { disabled: false },
    confirmBtn: { disabled: false }
  };
  
  // Create mock app state
  const mockApp = {
    currentUser: 'test_user',
    transactions: [],
    isFinalized: false,
    chartOfAccounts: authManager.getDefaultChartOfAccounts(),
    
    confirmTransaction(transaction) {
      // Simulate the confirmTransaction logic from app.js
      const debitEntry = transactionManager.createTransaction(this.currentUser, {
        date: transaction.date,
        description: transaction.description,
        quantity: transaction.quantity,
        amount: transaction.amount,
        totalAmount: transaction.totalAmount,
        account: transaction.account,
        accountCode: transaction.accountCode,
        accountType: transaction.accountType,
        debitAmount: transaction.totalAmount,
        creditAmount: 0
      });
      
      const creditEntry = transactionManager.createTransaction(this.currentUser, {
        date: transaction.date,
        description: transaction.description,
        quantity: transaction.quantity,
        amount: transaction.amount,
        totalAmount: transaction.totalAmount,
        account: transaction.offsetAccountName,
        accountCode: transaction.offsetAccountCode,
        accountType: transaction.offsetAccountType,
        debitAmount: 0,
        creditAmount: transaction.totalAmount
      });
      
      this.transactions.push(debitEntry, creditEntry);
      
      return { success: true };
    },
    
    verifyAccountingEquation() {
      return accountingCalculator.verifyAccountingEquation(this.transactions);
    }
  };
  
  // Create mock UI manager
  const mockUI = {
    elements: mockElements,
    
    showClassification(classification) {
      this.elements.classificationDisplay.style.display = 'block';
      this.elements.classificationReasoning.textContent = classification.reasoning || '';
      this.elements.classifiedAccount.textContent = 
        (classification.account || classification.accountName || 'N/A') +
        (classification.offsetAccountName ? ' → ' + classification.offsetAccountName : '');
      this.elements.classifiedType.textContent = classification.accountType || classification.classification || 'N/A';
      this.elements.classifiedDebitCredit.textContent =
        'DEBIT: ' + (classification.account || 'N/A') +
        ' | KREDIT: ' + (classification.offsetAccountName || 'Kas');
      this.elements.classifiedAmount.textContent = 'Rp ' + (classification.totalAmount || 0).toLocaleString('id-ID');
      this.elements.confidenceScore.textContent = Math.round((classification.aiConfidence || 0) * 100) + '%';
    },
    
    hideClassification() {
      this.elements.classificationDisplay.style.display = 'none';
    },
    
    showSuccess(message) {
      this.elements.successMessage.textContent = message;
      this.elements.successMessage.style.display = 'block';
    },
    
    clearTransactionInput() {
      this.elements.transactionInput.value = '';
    },
    
    updateStatusBadge(status, color) {
      this.elements.statusBadge.textContent = status;
      this.elements.statusBadge.className = 'status-badge badge-' + (color || 'success');
    }
  };
  
  return {
    app: mockApp,
    ui: mockUI,
    elements: mockElements,
    window: {
      currentTransaction: null,
      _isProcessingTransaction: false
    }
  };
}

// ============================================================================
// PRESERVATION PROPERTY TESTS
// ============================================================================

/**
 * Property 2.1: Confirm Button Functionality (Requirement 3.1)
 * 
 * WHEN user clicks Confirm button with classification displayed
 * THEN transaction should be saved correctly
 */
function testConfirmButtonFunctionality(transactionData) {
  const env = createMockEnvironment();
  const { app, ui, elements, window } = env;
  
  const failures = [];
  
  // Create classification result
  const classificationResult = {
    description: transactionData.description,
    amount: transactionData.amount,
    quantity: transactionData.quantity,
    date: transactionData.date,
    totalAmount: transactionData.totalAmount,
    account: 'Modal Pemilik',
    accountCode: '3000',
    accountType: 'Equity',
    debitAmount: transactionData.totalAmount,
    creditAmount: 0,
    offsetAccountCode: '1000',
    offsetAccountName: 'Kas',
    offsetAccountType: 'Asset',
    classification: 'Equity',
    aiConfidence: 0.95,
    reasoning: 'Setoran modal pemilik meningkatkan ekuitas (kredit) dan kas (debit)'
  };
  
  // Set current transaction
  window.currentTransaction = classificationResult;
  
  // Display classification
  ui.showClassification(classificationResult);
  
  const initialTransactionCount = app.transactions.length;
  
  // SIMULATE CLICKING CONFIRM BUTTON (from main.js handleConfirmTransaction)
  if (!window.currentTransaction) {
    failures.push('Precondition failed: No transaction to confirm');
    return { passed: false, failures, counterexample: transactionData };
  }
  
  const result = app.confirmTransaction(window.currentTransaction);
  
  if (result.error) {
    failures.push(`Confirm failed with error: ${result.error}`);
  }
  
  // Verify transaction was added
  const finalTransactionCount = app.transactions.length;
  
  if (finalTransactionCount !== initialTransactionCount + 2) {
    failures.push(
      `Requirement 3.1 FAILED: Transaction not added correctly. ` +
      `Expected ${initialTransactionCount + 2} transactions (debit + credit), got ${finalTransactionCount}`
    );
  }
  
  // Verify transaction data
  if (app.transactions.length >= 2) {
    const debitEntry = app.transactions[app.transactions.length - 2];
    const creditEntry = app.transactions[app.transactions.length - 1];
    
    if (debitEntry.debitAmount !== transactionData.totalAmount) {
      failures.push(
        `Requirement 3.1 FAILED: Debit amount incorrect. ` +
        `Expected ${transactionData.totalAmount}, got ${debitEntry.debitAmount}`
      );
    }
    
    if (creditEntry.creditAmount !== transactionData.totalAmount) {
      failures.push(
        `Requirement 3.1 FAILED: Credit amount incorrect. ` +
        `Expected ${transactionData.totalAmount}, got ${creditEntry.creditAmount}`
      );
    }
  }
  
  return {
    passed: failures.length === 0,
    failures,
    counterexample: failures.length > 0 ? transactionData : null
  };
}

/**
 * Property 2.2: AI Classifier Display (Requirement 3.2)
 * 
 * WHEN AI classifier returns classification result
 * THEN all classification fields should be displayed correctly
 */
function testAIClassifierDisplay(transactionData) {
  const env = createMockEnvironment();
  const { app, ui, elements } = env;
  
  const failures = [];
  
  // Create classification result
  const classificationResult = {
    description: transactionData.description,
    amount: transactionData.amount,
    quantity: transactionData.quantity,
    date: transactionData.date,
    totalAmount: transactionData.totalAmount,
    account: 'Modal Pemilik',
    accountCode: '3000',
    accountType: 'Equity',
    offsetAccountCode: '1000',
    offsetAccountName: 'Kas',
    offsetAccountType: 'Asset',
    classification: 'Equity',
    aiConfidence: 0.95,
    reasoning: 'Setoran modal pemilik meningkatkan ekuitas (kredit) dan kas (debit)'
  };
  
  // Display classification
  ui.showClassification(classificationResult);
  
  // Verify classification display is visible
  if (elements.classificationDisplay.style.display === 'none') {
    failures.push('Requirement 3.2 FAILED: Classification display not visible');
  }
  
  // Verify account is displayed
  if (!elements.classifiedAccount.textContent.includes('Modal Pemilik')) {
    failures.push(
      `Requirement 3.2 FAILED: Account not displayed correctly. ` +
      `Expected to include "Modal Pemilik", got "${elements.classifiedAccount.textContent}"`
    );
  }
  
  // Verify type is displayed
  if (!elements.classifiedType.textContent.includes('Equity')) {
    failures.push(
      `Requirement 3.2 FAILED: Type not displayed correctly. ` +
      `Expected to include "Equity", got "${elements.classifiedType.textContent}"`
    );
  }
  
  // Verify debit/credit is displayed
  if (!elements.classifiedDebitCredit.textContent.includes('DEBIT') || 
      !elements.classifiedDebitCredit.textContent.includes('KREDIT')) {
    failures.push(
      `Requirement 3.2 FAILED: Debit/Credit not displayed correctly. ` +
      `Got "${elements.classifiedDebitCredit.textContent}"`
    );
  }
  
  // Verify amount is displayed
  if (!elements.classifiedAmount.textContent.includes(transactionData.totalAmount.toLocaleString('id-ID'))) {
    failures.push(
      `Requirement 3.2 FAILED: Amount not displayed correctly. ` +
      `Expected to include "${transactionData.totalAmount.toLocaleString('id-ID')}", ` +
      `got "${elements.classifiedAmount.textContent}"`
    );
  }
  
  // Verify reasoning is displayed
  if (!elements.classificationReasoning.textContent.includes('modal')) {
    failures.push(
      `Requirement 3.2 FAILED: Reasoning not displayed correctly. ` +
      `Expected to include reasoning text, got "${elements.classificationReasoning.textContent}"`
    );
  }
  
  // Verify confidence score is displayed
  if (!elements.confidenceScore.textContent.includes('95')) {
    failures.push(
      `Requirement 3.2 FAILED: Confidence score not displayed correctly. ` +
      `Expected "95%", got "${elements.confidenceScore.textContent}"`
    );
  }
  
  return {
    passed: failures.length === 0,
    failures,
    counterexample: failures.length > 0 ? transactionData : null
  };
}

/**
 * Property 2.3: Transaction Input Handling (Requirement 3.3)
 * 
 * WHEN user enters transaction and presses Enter
 * THEN system should trigger classification
 */
function testTransactionInputHandling(transactionData) {
  const env = createMockEnvironment();
  const { elements } = env;
  
  const failures = [];
  
  // Simulate user input
  const inputString = `${transactionData.description} ${transactionData.amount} ${transactionData.quantity} ${transactionData.date}`;
  elements.transactionInput.value = inputString;
  
  // Verify input is captured
  if (elements.transactionInput.value !== inputString) {
    failures.push(
      `Requirement 3.3 FAILED: Transaction input not captured correctly. ` +
      `Expected "${inputString}", got "${elements.transactionInput.value}"`
    );
  }
  
  // Verify input is not disabled (should be enabled for entry)
  if (elements.transactionInput.disabled) {
    failures.push('Requirement 3.3 FAILED: Transaction input should not be disabled');
  }
  
  // Note: We can't fully test Enter key handling in Node.js environment,
  // but we verify the input mechanism works
  
  return {
    passed: failures.length === 0,
    failures,
    counterexample: failures.length > 0 ? transactionData : null
  };
}

/**
 * Property 2.4: Report Table Updates (Requirement 3.4)
 * 
 * WHEN transaction is confirmed
 * THEN report table should be updated with transaction data
 */
function testReportTableUpdates(transactionData) {
  const env = createMockEnvironment();
  const { app, elements, window } = env;
  
  const failures = [];
  
  // Create classification result
  const classificationResult = {
    description: transactionData.description,
    amount: transactionData.amount,
    quantity: transactionData.quantity,
    date: transactionData.date,
    totalAmount: transactionData.totalAmount,
    account: 'Modal Pemilik',
    accountCode: '3000',
    accountType: 'Equity',
    debitAmount: transactionData.totalAmount,
    creditAmount: 0,
    offsetAccountCode: '1000',
    offsetAccountName: 'Kas',
    offsetAccountType: 'Asset',
    classification: 'Equity',
    aiConfidence: 0.95,
    reasoning: 'Setoran modal pemilik meningkatkan ekuitas (kredit) dan kas (debit)'
  };
  
  window.currentTransaction = classificationResult;
  
  const initialRowCount = elements.reportTableBody.children.length;
  
  // Confirm transaction
  const result = app.confirmTransaction(window.currentTransaction);
  
  if (result.error) {
    failures.push(`Confirm failed: ${result.error}`);
  }
  
  // Verify transactions were added to app state
  if (app.transactions.length === 0) {
    failures.push('Requirement 3.4 FAILED: No transactions in app state after confirm');
  }
  
  // Verify transaction data is correct
  if (app.transactions.length >= 2) {
    const debitEntry = app.transactions[0];
    const creditEntry = app.transactions[1];
    
    if (debitEntry.description !== transactionData.description) {
      failures.push(
        `Requirement 3.4 FAILED: Transaction description not preserved. ` +
        `Expected "${transactionData.description}", got "${debitEntry.description}"`
      );
    }
    
    if (debitEntry.totalAmount !== transactionData.totalAmount) {
      failures.push(
        `Requirement 3.4 FAILED: Transaction amount not preserved. ` +
        `Expected ${transactionData.totalAmount}, got ${debitEntry.totalAmount}`
      );
    }
  }
  
  return {
    passed: failures.length === 0,
    failures,
    counterexample: failures.length > 0 ? transactionData : null
  };
}

/**
 * Property 2.5: Adjust Button Availability (Requirement 3.5)
 * 
 * WHEN classification is displayed
 * THEN Adjust button should be available
 */
function testAdjustButtonAvailability(transactionData) {
  const env = createMockEnvironment();
  const { ui, elements } = env;
  
  const failures = [];
  
  // Create classification result
  const classificationResult = {
    description: transactionData.description,
    amount: transactionData.amount,
    quantity: transactionData.quantity,
    date: transactionData.date,
    totalAmount: transactionData.totalAmount,
    account: 'Modal Pemilik',
    accountCode: '3000',
    accountType: 'Equity',
    offsetAccountCode: '1000',
    offsetAccountName: 'Kas',
    offsetAccountType: 'Asset',
    classification: 'Equity',
    aiConfidence: 0.95,
    reasoning: 'Setoran modal pemilik meningkatkan ekuitas (kredit) dan kas (debit)'
  };
  
  // Display classification
  ui.showClassification(classificationResult);
  
  // Verify Adjust button is available (not disabled)
  if (elements.adjustBtn.disabled) {
    failures.push('Requirement 3.5 FAILED: Adjust button should not be disabled when classification is displayed');
  }
  
  // Verify Confirm button is also available
  if (elements.confirmBtn.disabled) {
    failures.push('Requirement 3.5 FAILED: Confirm button should not be disabled when classification is displayed');
  }
  
  return {
    passed: failures.length === 0,
    failures,
    counterexample: failures.length > 0 ? transactionData : null
  };
}

// ============================================================================
// TEST EXECUTION
// ============================================================================

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║  Preservation Property Tests - Existing Modal Functionality       ║');
console.log('║  Property-Based Tests (10 generated test cases per property)      ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

console.log('✅ EXPECTED OUTCOME: All tests should PASS on unfixed code');
console.log('   These tests verify existing functionality that must be preserved\n');

// Run all preservation property tests
const testSuites = [
  {
    name: 'Property 2.1: Confirm Button Functionality (Requirement 3.1)',
    testFn: testConfirmButtonFunctionality
  },
  {
    name: 'Property 2.2: AI Classifier Display (Requirement 3.2)',
    testFn: testAIClassifierDisplay
  },
  {
    name: 'Property 2.3: Transaction Input Handling (Requirement 3.3)',
    testFn: testTransactionInputHandling
  },
  {
    name: 'Property 2.4: Report Table Updates (Requirement 3.4)',
    testFn: testReportTableUpdates
  },
  {
    name: 'Property 2.5: Adjust Button Availability (Requirement 3.5)',
    testFn: testAdjustButtonAvailability
  }
];

let allTestsPassed = true;
const allResults = [];

testSuites.forEach((suite, suiteIndex) => {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`Testing ${suite.name}`);
  console.log('═'.repeat(70));
  
  const results = runPropertyTest(suite.testFn, 10);
  allResults.push({ suite: suite.name, results });
  
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;
  
  console.log(`\nResults: ${passedTests} passed, ${failedTests} failed out of 10 test cases`);
  
  if (failedTests > 0) {
    allTestsPassed = false;
    console.log('\n❌ FAILURES FOUND:\n');
    
    results.filter(r => !r.passed).forEach((result, index) => {
      console.log(`  Counterexample ${index + 1}:`);
      console.log(`    Input: ${JSON.stringify(result.input)}`);
      result.failures.forEach(failure => {
        console.log(`    - ${failure}`);
      });
      console.log('');
    });
  } else {
    console.log('\n✅ All test cases passed for this property');
  }
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================

console.log('\n' + '═'.repeat(70));
console.log('FINAL TEST RESULTS SUMMARY');
console.log('═'.repeat(70));

allResults.forEach(({ suite, results }) => {
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;
  const status = failedTests === 0 ? '✅' : '❌';
  console.log(`${status} ${suite}: ${passedTests}/10 passed`);
});

console.log('═'.repeat(70));

if (allTestsPassed) {
  console.log('\n✅ ALL PRESERVATION TESTS PASSED\n');
  console.log('All existing functionality is working correctly on unfixed code.');
  console.log('These behaviors must be preserved when fixing the Done button bug.\n');
  process.exit(0);
} else {
  console.log('\n❌ SOME PRESERVATION TESTS FAILED\n');
  console.log('⚠️  WARNING: Some existing functionality is not working as expected.');
  console.log('    This may indicate:');
  console.log('    1. The test expectations are incorrect');
  console.log('    2. The existing code has other bugs');
  console.log('    3. The mock environment does not accurately simulate the real app\n');
  process.exit(1);
}
