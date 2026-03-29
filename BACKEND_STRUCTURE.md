# Backend Structure - Accounting Ledger System

## Overview
Backend modules telah dibuat dengan standar akuntansi penuh dan siap untuk integrasi frontend.

## Module Structure

### 1. **storage.js** - localStorage Management
- `saveData(userId, dataType, data)` - Simpan data ke localStorage
- `loadData(userId, dataType)` - Load data dari localStorage
- `deleteData(userId, dataType)` - Hapus data
- `clearUserData(userId)` - Clear semua data user
- `exportUserData(userId)` - Export ke JSON
- `importUserData(userId, data)` - Import dari JSON
- `createBackup(userId)` - Buat backup otomatis
- `restoreFromBackup(userId, backupKey)` - Restore dari backup

**Key Features:**
- User-specific data isolation
- Automatic metadata tracking (timestamp, version)
- Storage quota management
- Backup/restore functionality

### 2. **auth.js** - User Authentication
- `register(email, password)` - Registrasi user baru
- `login(email, password)` - Login user
- `logout()` - Logout user
- `getCurrentUser()` - Get user ID saat ini
- `getUserProfile(userId)` - Get profil user
- `updateUserProfile(userId, updates)` - Update profil
- `getDefaultChartOfAccounts()` - Get default chart of accounts

**Key Features:**
- Password hashing (client-side)
- Session management (30 min timeout)
- Multi-user support dengan data isolation
- Default chart of accounts (60+ accounts) sesuai standar akuntansi

**Chart of Accounts Includes (PSAK Indonesia):**
- Aset (1000-1999): Kas, Bank, Piutang Dagang, Persediaan Barang Dagangan, Perlengkapan, Peralatan
- Liabilitas (2000-2999): Utang Dagang, Utang Bank, Beban Masih Harus Dibayar, Pendapatan Diterima Dimuka
- Ekuitas (3000-3999): Modal Pemilik, Prive
- Pendapatan (4000-4999): Penjualan, Retur Penjualan, Potongan Penjualan, Pendapatan Lain-lain
- Beban/HPP (5000-5999): Pembelian, Retur Pembelian, Potongan Pembelian, Beban Angkut Pembelian, Beban Gaji, Beban Sewa, Beban Listrik, Beban Perlengkapan, Beban Iklan, Beban Angkut Penjualan, Beban Bunga, dll.

### 3. **transaction.js** - Transaction Management
- `parseTransactionInput(input)` - Parse input string (format: "item amount quantity date")
- `createTransaction(userId, data)` - Buat transaksi baru
- `getTransactions(userId)` - Get semua transaksi
- `getTransactionById(userId, id)` - Get transaksi spesifik
- `updateTransaction(userId, id, updates)` - Update transaksi
- `deleteTransaction(userId, id)` - Hapus transaksi
- `confirmTransaction(userId, id)` - Konfirmasi transaksi
- `getTransactionsByDateRange(userId, start, end)` - Filter by date
- `getTransactionsByAccount(userId, code)` - Filter by account
- `validateTransaction(transaction)` - Validasi transaksi

**Key Features:**
- Flexible date parsing (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
- Automatic date assignment (today if not provided)
- Transaction validation
- Sorting dan filtering capabilities

### 4. **accounting.js** - Accounting Calculations
- `getDefaultDebitCredit(accountType)` - Tentukan debit/credit default
- `calculateDebitCredit(amount, type)` - Hitung debit/credit amounts
- `calculateAccountBalance(transactions)` - Hitung saldo akun
- `calculateRunningBalance(transactions)` - Hitung running balance
- `calculateTotals(transactions)` - Hitung total debit/credit
- `verifyAccountingEquation(transactions)` - Verifikasi debit = credit
- `calculateAccountBalances(transactions, coa)` - Hitung semua saldo akun
- `verifyAccountingEquationByType(balances, coa)` - Verifikasi Assets = Liabilities + Equity
- `generateTrialBalance(transactions, coa)` - Generate trial balance
- `calculateNetIncome(transactions, coa)` - Hitung net income
- `getDoubleEntryClassification(description, coa)` - Klasifikasi double-entry dengan pola PSAK (perusahaan jasa & dagang)
- `suggestAccountClassification(description, coa)` - Legacy single-entry (kompatibilitas)

**Key Features:**
- Double-entry bookkeeping implementation
- Accounting equation validation (Assets = Liabilities + Equity)
- Debit/credit rules per account type
- Running balance calculation
- Trial balance generation
- Net income calculation
- Keyword-based account suggestion

### 5. **ai-classifier.js** - Gemini AI Integration
- `initializeApiKey(apiKey)` - Initialize API key
- `classifyTransaction(data, coa)` - Classify transaksi dengan AI
- `buildClassificationPrompt(data, coa)` - Build prompt untuk Gemini
- `callGeminiAPI(prompt)` - Call Gemini API
- `getFallbackClassification(data, coa)` - Fallback jika AI tidak tersedia
- `isRateLimitExceeded()` - Check rate limit
- `getRemainingRequests()` - Get sisa requests
- `clearCache()` - Clear response cache

**Key Features:**
- Prompt engineering profesional untuk akuntansi PSAK
- Mendukung pola perusahaan jasa dan perusahaan dagang
- Rate limiting (100 requests/hour)
- Response caching
- Fallback ke local classification
- Graceful error handling

### 6. **report-generator.js** - Report Generation
- `generateGeneralJournal(transactions, metadata)` - Generate general journal
- `generateGeneralLedger(transactions, coa, metadata)` - Generate general ledger
- `generateTrialBalance(transactions, coa, metadata)` - Generate trial balance
- `generateReversingJournal(transactions, coa, metadata)` - Generate reversing journal
- `generateReport(type, transactions, coa, metadata)` - Generate report by type
- `formatCurrency(amount)` - Format currency (IDR)
- `formatDate(date)` - Format date

**Key Features:**
- 4 jenis laporan akuntansi standar
- Automatic page break handling
- Currency formatting (IDR)
- Date formatting (Indonesian locale)
- Summary statistics per report

### 7. **pdf-generator.js** - PDF Generation
- `generatePDF(reportData, metadata)` - Generate PDF dari report
- `addHeader(doc, metadata, y)` - Add header section
- `addReportTitle(doc, title, y)` - Add report title
- `addGeneralJournalContent(doc, data, y)` - Add GJ content
- `addGeneralLedgerContent(doc, data, y)` - Add GL content
- `addTrialBalanceContent(doc, data, y)` - Add TB content
- `addReversingJournalContent(doc, data, y)` - Add RJ content
- `downloadPDF(blob, filename)` - Download PDF file

**Key Features:**
- A4 page format
- Automatic page breaks
- Professional formatting
- Header/footer with metadata
- Table formatting dengan borders
- Currency formatting
- Automatic filename generation

### 8. **app.js** - Main Application Controller
- `initialize(apiKey)` - Initialize aplikasi
- `registerUser(email, password)` - Register user
- `loginUser(email, password)` - Login user
- `logoutUser()` - Logout user
- `processTransactionInput(input)` - Process dan classify transaksi
- `confirmTransaction(data)` - Confirm dan save transaksi
- `updateTransaction(id, updates)` - Update transaksi
- `deleteTransaction(id)` - Delete transaksi
- `undo()` - Undo last action
- `redo()` - Redo last undone action
- `generateReport(type)` - Generate report
- `verifyAccountingEquation()` - Verify accounting equation
- `finalizeTransactions()` - Finalize transaction entry
- `generateAndDownloadPDF(type)` - Generate dan download PDF
- `updateUserProfile(updates)` - Update user profile
- `exportUserData()` - Export data
- `importUserData(data)` - Import data

**Key Features:**
- Centralized state management
- Undo/redo functionality
- Session management
- Error handling
- Data persistence

## Data Structure

### Transaction Object
```javascript
{
  id: "txn_1234567890_1",
  date: "2025-01-15",
  description: "pulpen",
  quantity: 45,
  unitAmount: 3000,
  totalAmount: 135000,
  account: "Supplies",
  accountCode: "1500",
  debitAmount: 135000,
  creditAmount: 0,
  classification: "Expense",
  aiConfidence: 0.95,
  status: "confirmed",
  createdAt: "2025-01-15T10:05:00Z",
  modifiedAt: "2025-01-15T10:05:00Z"
}
```

### Chart of Accounts Entry
```javascript
{
  code: "1500",
  name: "Supplies",
  type: "Asset",
  category: "Current Asset",
  balance: 0
}
```

### Report Data Structure
```javascript
{
  type: "General Journal",
  metadata: { organizationName, reportTitle, preparer, dateRange },
  entries: [...],
  summary: { totalEntries, totalDebits, totalCredits, balanced }
}
```

## Accounting Standards Compliance

✅ **Double-Entry Bookkeeping**
- Setiap transaksi memiliki debit dan credit
- Total debit selalu sama dengan total credit

✅ **Account Classification**
- Assets (1000-1999)
- Liabilities (2000-2999)
- Equity (3000-3999)
- Revenue (4000-4999)
- Expenses (5000-5999)

✅ **Accounting Equation**
- Assets = Liabilities + Equity
- Verified sebelum finalization

✅ **Standard Reports**
- General Journal (chronological)
- General Ledger (by account)
- Trial Balance (verification)
- Reversing Journal (accrual reversal)

✅ **Debit/Credit Rules**
- Assets: Debit increases, Credit decreases
- Liabilities: Debit decreases, Credit increases
- Equity: Debit decreases, Credit increases
- Revenue: Debit decreases, Credit increases
- Expenses: Debit increases, Credit decreases

## Integration Points for Frontend

Frontend hanya perlu memanggil methods dari `app` object:

```javascript
// Initialize
app.initialize(apiKey);

// User Management
app.registerUser(email, password);
app.loginUser(email, password);
app.logoutUser();

// Transaction Processing
const result = await app.processTransactionInput("pulpen 3000 45 12/12/25");
app.confirmTransaction(result);
app.updateTransaction(id, updates);
app.deleteTransaction(id);

// Undo/Redo
app.undo();
app.redo();

// Reports
const report = app.generateReport('general-journal');
app.generateAndDownloadPDF('general-journal');

// Verification
const verification = app.verifyAccountingEquation();
app.finalizeTransactions();

// Profile
app.updateUserProfile({ organizationName: "PT Example" });

// Data Management
const exported = app.exportUserData();
app.importUserData(exported);
```

## Environment Variables

Diperlukan untuk production:
- `VITE_GEMINI_API_KEY` - Gemini API key (dari GitHub Secrets)

Optional:
- `VITE_APP_NAME` - Application name
- `VITE_ENABLE_AI_CLASSIFICATION` - Enable/disable AI
- `VITE_API_RATE_LIMIT` - Rate limit per hour

## Next Steps

Frontend development akan menggunakan backend modules ini tanpa perlu modifikasi. Jika ada perubahan variabel atau logic, hanya frontend yang perlu diupdate.

Semua backend modules sudah:
✅ Mengikuti standar akuntansi
✅ Siap untuk GitHub Pages (static hosting)
✅ Memiliki error handling yang baik
✅ Terstruktur dengan baik untuk maintenance
