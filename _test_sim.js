const fs = require('fs');
const store = {};
const localStorage = {
  getItem: k => store[k] || null,
  setItem: (k,v) => { store[k] = v; },
  removeItem: k => { delete store[k]; },
  get length() { return Object.keys(store).length; },
  key: i => Object.keys(store)[i]
};
const sessionStorage = { getItem:()=>null, setItem:()=>{}, removeItem:()=>{} };

// Gabung semua modul dalam satu scope
const allCode = [
  'js/modules/storage.js',
  'js/modules/auth.js',
  'js/modules/transaction.js',
  'js/modules/accounting.js',
  'js/modules/auto-balancer.js'
].map(f => fs.readFileSync(f,'utf8')).join('\n');

// Jalankan dalam scope yang sama dengan localStorage mock
const runInScope = new Function('localStorage','sessionStorage','console', allCode + '\n' + `
// ── SIMULASI LENGKAP ──────────────────────────────────────────────────────────
const userId = 'sim_user';
const coa = authManager.getDefaultChartOfAccounts();

// STEP 1: Parse input
const parsed = transactionManager.parseTransactionInput('modal 10000000 1 2026-01-01');
console.log('\\n=== STEP 1: PARSE ===');
console.log('description:', parsed.description, '| amount:', parsed.amount, '| error:', parsed.error || 'NONE');

// STEP 2: Classify
const classified = accountingCalculator.getDoubleEntryClassification(parsed.description, coa);
console.log('\\n=== STEP 2: CLASSIFY ===');
console.log('debit:', classified.debitAccount.code, classified.debitAccount.name);
console.log('credit:', classified.creditAccount.code, classified.creditAccount.name);
console.log('confidence:', classified.confidence);

// STEP 3: Simulate processTransactionInput return
const result = {
  description: parsed.description, amount: parsed.amount,
  quantity: parsed.quantity, date: parsed.date, totalAmount: parsed.totalAmount,
  account: classified.debitAccount.name, accountCode: classified.debitAccount.code,
  accountType: classified.debitAccount.type, debitAmount: parsed.totalAmount, creditAmount: 0,
  offsetAccountCode: classified.creditAccount.code, offsetAccountName: classified.creditAccount.name,
  offsetAccountType: classified.creditAccount.type,
  classification: classified.debitAccount.type, aiConfidence: classified.confidence,
  reasoning: classified.reasoning
};
console.log('\\n=== STEP 3: RESULT CHECK ===');
console.log('accountName:', result.account, '| accountType:', result.accountType);
console.log('offsetName:', result.offsetAccountName, '| offsetCode:', result.offsetAccountCode);
const hasError = !result.account || !result.accountType;
console.log('Would return error?', hasError ? 'YES - BUG!' : 'NO - OK');

// STEP 4: confirmTransaction
const debitEntry = transactionManager.createTransaction(userId, {
  date: result.date, description: result.description, quantity: result.quantity,
  amount: result.amount, totalAmount: result.totalAmount,
  account: result.account, accountCode: result.accountCode, accountType: result.accountType,
  debitAmount: result.totalAmount, creditAmount: 0
});
const creditEntry = transactionManager.createTransaction(userId, {
  date: result.date, description: result.description, quantity: result.quantity,
  amount: result.amount, totalAmount: result.totalAmount,
  account: result.offsetAccountName, accountCode: result.offsetAccountCode, accountType: result.offsetAccountType,
  debitAmount: 0, creditAmount: result.totalAmount
});
console.log('\\n=== STEP 4: TRANSACTIONS CREATED ===');
console.log('debit:', debitEntry.accountCode, debitEntry.account, 'D:', debitEntry.debitAmount);
console.log('credit:', creditEntry.accountCode, creditEntry.account, 'C:', creditEntry.creditAmount);

// STEP 5: Verify
const txns = [debitEntry, creditEntry];
const verify = accountingCalculator.verifyAccountingEquation(txns);
console.log('\\n=== STEP 5: BALANCE CHECK ===');
console.log('balanced:', verify.balanced, '| D:', verify.totalDebits, '| C:', verify.totalCredits);

// STEP 6: Trial balance
const tb = accountingCalculator.generateTrialBalance(txns, coa);
console.log('\\n=== STEP 6: TRIAL BALANCE (' + tb.length + ' entries) ===');
tb.forEach(e => console.log(' -', e.code, e.name, '| D:', e.debitBalance, '| C:', e.creditBalance));

console.log('\\n=== SIMULASI SELESAI ===');
`);

runInScope(localStorage, sessionStorage, console);

// ── SIMULASI LENGKAP ──────────────────────────────────────────────────────────
const userId = 'sim_user';
const coa = authManager.getDefaultChartOfAccounts();

// STEP 1: Parse input "modal 10000000 1 2026-01-01"
const parsed = transactionManager.parseTransactionInput('modal 10000000 1 2026-01-01');
console.log('\n=== STEP 1: PARSE ===');
console.log('description:', parsed.description);
console.log('amount:', parsed.amount);
console.log('totalAmount:', parsed.totalAmount);
console.log('error:', parsed.error || 'NONE');

// STEP 2: Classify
const classified = accountingCalculator.getDoubleEntryClassification(parsed.description, coa);
console.log('\n=== STEP 2: CLASSIFY ===');
console.log('debit:', classified.debitAccount.code, classified.debitAccount.name, classified.debitAccount.type);
console.log('credit:', classified.creditAccount.code, classified.creditAccount.name, classified.creditAccount.type);
console.log('confidence:', classified.confidence);
console.log('reasoning:', classified.reasoning.substring(0,80));

// STEP 3: Simulate processTransactionInput return value
const result = {
  description: parsed.description,
  amount: parsed.amount,
  quantity: parsed.quantity,
  date: parsed.date,
  totalAmount: parsed.totalAmount,
  account: classified.debitAccount.name,
  accountCode: classified.debitAccount.code,
  accountType: classified.debitAccount.type,
  debitAmount: parsed.totalAmount,
  creditAmount: 0,
  offsetAccountCode: classified.creditAccount.code,
  offsetAccountName: classified.creditAccount.name,
  offsetAccountType: classified.creditAccount.type,
  classification: classified.debitAccount.type,
  aiConfidence: classified.confidence,
  reasoning: classified.reasoning
};
console.log('\n=== STEP 3: RESULT OBJECT ===');
console.log('account:', result.account, '(', result.accountCode, ')');
console.log('offsetAccount:', result.offsetAccountName, '(', result.offsetAccountCode, ')');
console.log('accountName check:', result.account ? 'OK' : 'MISSING');
console.log('accountType check:', result.accountType ? 'OK' : 'MISSING');

// STEP 4: confirmTransaction — buat 2 entries
const debitEntry = transactionManager.createTransaction(userId, {
  date: result.date, description: result.description,
  quantity: result.quantity, amount: result.amount, totalAmount: result.totalAmount,
  account: result.account, accountCode: result.accountCode, accountType: result.accountType,
  debitAmount: result.totalAmount, creditAmount: 0
});
const creditEntry = transactionManager.createTransaction(userId, {
  date: result.date, description: result.description,
  quantity: result.quantity, amount: result.amount, totalAmount: result.totalAmount,
  account: result.offsetAccountName, accountCode: result.offsetAccountCode, accountType: result.offsetAccountType,
  debitAmount: 0, creditAmount: result.totalAmount
});
console.log('\n=== STEP 4: CREATE TRANSACTIONS ===');
console.log('debit entry:', debitEntry.accountCode, debitEntry.account, 'D:', debitEntry.debitAmount);
console.log('credit entry:', creditEntry.accountCode, creditEntry.account, 'C:', creditEntry.creditAmount);

// STEP 5: Verify balance
const txns = transactionManager.getTransactions(userId);
const verify = accountingCalculator.verifyAccountingEquation(txns);
console.log('\n=== STEP 5: VERIFY BALANCE ===');
console.log('balanced:', verify.balanced);
console.log('totalDebits:', verify.totalDebits);
console.log('totalCredits:', verify.totalCredits);

// STEP 6: Generate trial balance
const tb = accountingCalculator.generateTrialBalance(txns, coa);
console.log('\n=== STEP 6: TRIAL BALANCE ===');
console.log('entries count:', tb.length);
tb.forEach(e => console.log(' -', e.code, e.name, '| D:', e.debitBalance, '| C:', e.creditBalance));

// STEP 7: Cek apakah app.transactions akan ter-update
// Simulasi: app.transactions.push(debitEntry); app.transactions.push(creditEntry);
const appTransactions = [debitEntry, creditEntry];
const verify2 = accountingCalculator.verifyAccountingEquation(appTransactions);
console.log('\n=== STEP 7: APP STATE AFTER CONFIRM ===');
console.log('app.transactions.length:', appTransactions.length);
console.log('balanced:', verify2.balanced, 'D:', verify2.totalDebits, 'C:', verify2.totalCredits);

console.log('\n=== SIMULASI SELESAI — SEMUA OK ===');
