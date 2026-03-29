# 🔄 Cara Kerja Sistem - Workflow Lengkap

Dokumentasi ini menjelaskan step-by-step bagaimana sistem bekerja dari input hingga laporan.

---

## 📊 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                               │
│                                                                 │
│  LEFT PANEL (Input)          │  RIGHT PANEL (Report)           │
│  ┌──────────────────────┐    │  ┌──────────────────────┐       │
│  │ 1. Input Field       │    │  │ 4. Report Display    │       │
│  │ 2. AI Classification │    │  │ 5. Real-time Update  │       │
│  │ 3. Confirm/Adjust    │    │  │ 6. Summary Stats     │       │
│  └──────────────────────┘    │  └──────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
         ↓                              ↑
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND LOGIC                                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Transaction  │  │  Accounting  │  │   Report     │          │
│  │  Manager     │  │  Calculator  │  │  Generator   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA STORAGE                                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  localStorage│  │  Session     │  │  Cache       │          │
│  │  (Persistent)│  │  Storage     │  │  (Temp)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔢 Step-by-Step Workflow

### STEP 1: Welcome Screen
```
User mengisi:
- Nama Perusahaan (wajib)
- Judul Laporan
- Nama Penyusun
Klik "Mulai Sekarang"
```

**Apa yang terjadi:**
- Data profil disimpan ke localStorage
- Chart of accounts default dimuat
- Tampilan beralih ke app interface

---

### STEP 2: User Input Transaksi
```
User mengetik: "pulpen 3000 45 2025-01-02"
Tekan Enter atau klik Submit
```

### STEP 2: User Input Transaksi
```
User mengetik: "pembelian_kredit 10000000 1 2025-01-05"
Tekan Enter atau klik Submit
```

**Apa yang terjadi:**
- Input field menerima text
- Sistem trigger `handleTransactionSubmit()`
- Loading indicator muncul
- Status badge berubah ke "Processing..."

---

### STEP 3: Parse Input
```
Input: "pembelian_kredit 10000000 1 2025-01-05"
↓
Parse:
- description: "pembelian_kredit"
- amount: 10000000
- quantity: 1
- date: "2025-01-05"
- totalAmount: 10000000
```

**Apa yang terjadi:**
- `transactionManager.parseTransactionInput()` dipanggil
- Validasi format input
- Extract components
- Jika error → tampilkan error message

---

### STEP 3: Kirim ke Gemini AI
```
Request ke Gemini API:
{
  description: "pulpen",
  amount: 3000,
  quantity: 45,
  date: "2025-01-02"
}
```

**Apa yang terjadi:**
- `aiClassifier.classifyTransaction()` dipanggil
- Gemini API menerima request
- AI analyze dan classify
- Return classification result

---

### STEP 4: AI Classification Response
```
Response dari Gemini:
{
  accountCode: "1500",
  accountName: "Supplies",
  accountType: "Asset",
  debitCredit: "debit",
  confidence: 0.95,
  reasoning: "Pulpen adalah stationery item..."
}
```

**Apa yang terjadi:**
- Response di-parse
- Hitung debit/credit amounts
- Combine dengan parsed data
- Store di `window.currentTransaction`

---

### STEP 5: Tampilkan AI Classification
```
Di bawah input field muncul:
┌─────────────────────────────┐
│ AI Classification           │
├─────────────────────────────┤
│ Account: Supplies           │
│ Type: Asset                 │
│ Debit/Credit: Debit         │
│ Total Amount: Rp 135,000    │
│ Confidence: 95%             │
│ Reasoning: Pulpen adalah... │
├─────────────────────────────┤
│ [Adjust] [Confirm]          │
└─────────────────────────────┘
```

**Apa yang terjadi:**
- `ui.showClassification()` dipanggil
- Classification display muncul
- Loading indicator hilang
- User bisa review sebelum confirm

---

### STEP 6: User Confirm Transaksi
```
User klik "Confirm" button
```

**Apa yang terjadi:**
- `handleConfirmTransaction()` dipanggil
- `app.confirmTransaction()` save ke backend
- Transaction disimpan ke localStorage
- Undo stack di-update

---

### STEP 7: Update Report di Kanan
```
Setelah confirm:
1. Report di-generate ulang
2. Tabel di kanan update
3. Summary stats update
4. Balance status check
```

**Apa yang terjadi:**
- `updateReport()` dipanggil
- `app.generateReport()` generate laporan
- `ui.renderReportTable()` render tabel
- `ui.updateReportSummary()` update summary

---

### STEP 8: Clear Input & Ready untuk Transaksi Berikutnya
```
Setelah update report:
1. Input field di-clear
2. Classification display di-hide
3. Status badge reset ke "Ready"
4. Focus kembali ke input field
5. Undo/Redo buttons di-update
```

**Apa yang terjadi:**
- `ui.clearTransactionInput()` clear input
- `ui.hideClassification()` hide classification
- `ui.updateStatusBadge()` update status
- `updateUndoRedoButtons()` update buttons
- Input field auto-focus

---

## 📋 Contoh Workflow Lengkap

### Transaksi 1: Input Pulpen
```
1. User input: "pulpen 3000 45 2025-01-02"
2. Tekan Enter
3. Loading muncul
4. Gemini classify → Supplies (Asset)
5. Classification display muncul
6. User klik "Confirm"
7. Transaksi disimpan
8. Tabel di kanan update (1 row)
9. Input field clear
10. Ready untuk transaksi berikutnya
```

### Transaksi 2: Input Kertas
```
1. User input: "kertas 5000 100 2025-01-03"
2. Tekan Enter
3. Loading muncul
4. Gemini classify → Supplies (Asset)
5. Classification display muncul
6. User klik "Confirm"
7. Transaksi disimpan
8. Tabel di kanan update (2 rows)
9. Input field clear
10. Ready untuk transaksi berikutnya
```

### Transaksi 3: Input Penjualan
```
1. User input: "penjualan 50000 10 2025-01-05"
2. Tekan Enter
3. Loading muncul
4. Gemini classify → Sales Revenue (Revenue)
5. Classification display muncul
6. User klik "Confirm"
7. Transaksi disimpan
8. Tabel di kanan update (3 rows)
9. Summary stats update
10. Balance status check
```

---

## 🎯 Fitur-Fitur Penting

### 1. Real-Time Update
- Setiap transaksi yang di-confirm langsung update tabel
- Summary stats update otomatis
- Balance status check real-time

### 2. AI Classification
- Otomatis classify ke akun yang tepat
- Confidence score menunjukkan akurasi
- Fallback ke local classification jika AI error

### 3. Undo/Redo
- Setiap transaksi bisa di-undo
- Undo/Redo buttons enable/disable otomatis
- Undo stack dan Redo stack di-manage

### 4. Data Persistence
- Semua transaksi disimpan ke localStorage
- Auto-save setelah setiap confirm
- Data persist meski browser ditutup

### 5. Validation
- Input validation (format, type)
- Accounting equation validation
- Balance check sebelum finalize

---

## 🔍 Detail Setiap Component

### Input Panel (Kiri)
```
┌─────────────────────────────┐
│ Transaction Entry           │
├─────────────────────────────┤
│ [Input Field]               │ ← User input di sini
│ "Format: item amount qty"   │
├─────────────────────────────┤
│ [Loading Indicator]         │ ← Muncul saat processing
├─────────────────────────────┤
│ [AI Classification]         │ ← Muncul setelah AI response
│ Account: ...                │
│ Type: ...                   │
│ [Adjust] [Confirm]          │
├─────────────────────────────┤
│ [Error/Success Message]     │ ← Feedback messages
├─────────────────────────────┤
│ [Undo] [Redo] [Done]        │ ← Action buttons
└─────────────────────────────┘
```

### Display Panel (Kanan)
```
┌─────────────────────────────┐
│ Accounting Reports          │
├─────────────────────────────┤
│ [Report Type Dropdown]      │ ← Select laporan
│ General Journal             │
│ General Ledger              │
│ Trial Balance               │
│ Reversing Journal           │
├─────────────────────────────┤
│ Summary Stats               │
│ Total Debits: Rp ...        │
│ Total Credits: Rp ...       │
│ Status: ✓ Balanced          │
├─────────────────────────────┤
│ [Report Table]              │
│ Account | Debit | Credit    │
│ ...                         │
│ ...                         │
├─────────────────────────────┤
│ [Generate PDF] [Export]     │ ← Export buttons
└─────────────────────────────┘
```

---

## 💾 Data Flow

### Input → Processing → Storage → Display

```
User Input
    ↓
Parse Input
    ↓
Validate Format
    ↓
Send to Gemini AI
    ↓
Get Classification
    ↓
Display to User
    ↓
User Confirm
    ↓
Save to localStorage
    ↓
Update Report
    ↓
Display in Table
    ↓
Clear Input
    ↓
Ready for Next
```

---

## 🔐 Data Storage

### localStorage Structure
```
accounting_user_{userId}_transactions: [
  {
    id: "txn_001",
    date: "2025-01-02",
    description: "pulpen",
    amount: 3000,
    quantity: 45,
    totalAmount: 135000,
    account: "Supplies",
    accountCode: "1500",
    debitAmount: 135000,
    creditAmount: 0,
    status: "confirmed",
    ...
  },
  ...
]
```

---

## ⚙️ State Management

### App State
```javascript
app.currentUser = "user_123"
app.currentReport = "trial-balance"
app.transactions = [...]
app.chartOfAccounts = [...]
app.isFinalized = false
app.undoStack = [...]
app.redoStack = [...]
```

### UI State
```javascript
window.currentTransaction = {
  description: "pulpen",
  amount: 3000,
  quantity: 45,
  date: "2025-01-02",
  totalAmount: 135000,
  account: "Supplies",
  accountCode: "1500",
  debitAmount: 135000,
  creditAmount: 0,
  aiConfidence: 0.95,
  ...
}
```

---

## 🎯 Key Points

### ✅ Otomatis Clear Input
- Setelah confirm, input field di-clear
- Classification display di-hide
- Status badge reset
- Focus kembali ke input

### ✅ Real-Time Update
- Tabel di kanan update langsung
- Summary stats update otomatis
- Balance status check real-time

### ✅ Data Persistence
- Semua transaksi disimpan
- Auto-save ke localStorage
- Data persist meski browser ditutup

### ✅ Validation
- Input validation
- Accounting equation validation
- Balance check

### ✅ Undo/Redo
- Setiap transaksi bisa di-undo
- Undo/Redo buttons manage otomatis

---

## 🚀 Workflow Summary

| Step | Action | Status |
|---|---|---|
| 1 | User input transaksi | Input field active |
| 2 | Tekan Enter | Loading muncul |
| 3 | Parse & validate | Processing... |
| 4 | Kirim ke Gemini | Waiting for AI |
| 5 | AI classify | Classification display |
| 6 | User confirm | Saving... |
| 7 | Save ke localStorage | Saved ✓ |
| 8 | Update report | Table update |
| 9 | Clear input | Ready for next |
| 10 | Ready | Input field active |

---

**Sistem bekerja dengan smooth dan otomatis! 🎉**
