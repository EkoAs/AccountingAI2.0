# 📚 Contoh Input & Output - Ringkasan Lengkap

Dokumentasi ini berisi contoh lengkap untuk semua jenis laporan akuntansi yang didukung oleh sistem.

---

## 📋 Daftar Contoh

### 1. **Trial Balance** - EXAMPLE_TRIAL_BALANCE.md
- **Skenario**: PT Maju Jaya - Januari 2025
- **Transaksi**: 10 transaksi
- **Fokus**: Verifikasi persamaan akuntansi
- **Output**: Tabel dengan debit/credit balance per akun

### 2. **General Journal** - EXAMPLE_GENERAL_JOURNAL.md
- **Skenario**: Toko Elektronik "ElektroPro" - Januari 2025
- **Transaksi**: 15 transaksi
- **Fokus**: Catatan kronologis semua transaksi
- **Output**: Tabel dengan urutan tanggal

### 3. **General Ledger** - EXAMPLE_GENERAL_LEDGER.md
- **Skenario**: Klinik Kesehatan "Sehat Jaya" - Januari 2025
- **Transaksi**: 15 transaksi
- **Fokus**: Detail per akun dengan running balance
- **Output**: Tabel per akun dengan balance progression

---

## 🔢 Format Input Transaksi

### Syntax
```
item_name amount quantity [date]
```

### Contoh
```
pulpen 3000 45 2025-01-15
```

### Penjelasan
- **item_name**: Deskripsi transaksi (pulpen, gaji, sewa, dll)
- **amount**: Harga per unit (3000)
- **quantity**: Jumlah unit (45)
- **date**: Tanggal transaksi (opsional, default: hari ini)

### Format Tanggal
- YYYY-MM-DD: `2025-01-15`
- DD/MM/YYYY: `15/01/2025`
- DD-MM-YYYY: `15-01-2025`

---

## 📊 Perbandingan Laporan

| Aspek | Trial Balance | General Journal | General Ledger |
|---|---|---|---|
| **Tujuan** | Verifikasi persamaan | Catatan kronologis | Detail per akun |
| **Organisasi** | Per akun | Urutan tanggal | Per akun |
| **Kolom** | Account, Debit, Credit | Date, Account, Debit, Credit | Date, Description, Debit, Credit, Balance |
| **Running Balance** | ❌ | ❌ | ✅ |
| **Verifikasi** | ✅ Debit = Credit | ✅ Debit = Credit | ✅ Debit = Credit |
| **Audit Trail** | ❌ | ✅ | ✅ |

---

## 🎯 Kapan Menggunakan Laporan Apa

### Trial Balance
**Gunakan ketika:**
- Ingin verifikasi persamaan akuntansi
- Perlu quick overview semua akun
- Checking balanced atau tidak
- Preparing financial statements

**Contoh kasus:**
- End of month verification
- Audit preparation
- Financial statement preparation

### General Journal
**Gunakan ketika:**
- Ingin lihat semua transaksi dalam urutan kronologis
- Perlu audit trail lengkap
- Checking transaksi berdasarkan tanggal
- Analyzing transaction flow

**Contoh kasus:**
- Daily transaction review
- Audit investigation
- Transaction verification
- Fraud detection

### General Ledger
**Gunakan ketika:**
- Ingin detail per akun
- Perlu lihat running balance
- Checking account movement
- Reconciliation dengan bank/supplier

**Contoh kasus:**
- Bank reconciliation
- Account analysis
- Supplier reconciliation
- Account balance verification

---

## 💡 Tips Input Transaksi

### 1. Gunakan Deskripsi yang Jelas
```
✅ BAIK:
pulpen 3000 45 2025-01-15
gaji_karyawan 5000000 1 2025-01-10
pembayaran_sewa 2000000 1 2025-01-15

❌ KURANG BAIK:
item 3000 45 2025-01-15
bayar 5000000 1 2025-01-10
transfer 2000000 1 2025-01-15
```

### 2. Konsisten dengan Format
```
✅ KONSISTEN:
modal 50000000 1 2025-01-01
kas 30000000 1 2025-01-01
bank 20000000 1 2025-01-01

❌ TIDAK KONSISTEN:
modal awal 50000000 1 2025-01-01
Kas masuk 30000000 1 2025-01-01
BANK TRANSFER 20000000 1 2025-01-01
```

### 3. Gunakan Tanggal yang Logis
```
✅ LOGIS:
modal 50000000 1 2025-01-01
pembelian 10000000 1 2025-01-02
penjualan 5000000 1 2025-01-03

❌ TIDAK LOGIS:
modal 50000000 1 2025-01-31
pembelian 10000000 1 2025-01-01
penjualan 5000000 1 2025-01-15
```

### 4. Pisahkan Debit dan Credit
```
✅ BENAR (Double-Entry):
penjualan 5000000 1 2025-01-05
penerimaan_kas 5000000 1 2025-01-05

❌ SALAH (Single-Entry):
penjualan 5000000 1 2025-01-05
```

---

## 🔍 Validasi Transaksi

### Sistem akan otomatis:
1. ✅ Parse input
2. ✅ Classify ke akun yang tepat
3. ✅ Calculate debit/credit
4. ✅ Validate format
5. ✅ Check accounting equation

### Jika ada error:
- ❌ Empty fields → "Please fill in all fields"
- ❌ Invalid amount → "Amount must be a positive number"
- ❌ Invalid date → "Invalid date format"
- ❌ Unbalanced → "Accounting equation not balanced"

---

## 📈 Contoh Workflow Lengkap

### Step 1: Register
```
Email: user@example.com
Password: password123
```

### Step 2: Input Transaksi (Trial Balance Example)
```
cash 10000000 1 2025-01-01
pulpen 3000 45 2025-01-02
kertas 5000 100 2025-01-03
penjualan 50000 10 2025-01-05
gaji 2000000 1 2025-01-10
sewa 1500000 1 2025-01-15
listrik 500000 1 2025-01-20
komputer 5000000 1 2025-01-22
hutang 2000000 1 2025-01-25
modal 5000000 1 2025-01-01
```

### Step 3: Review Setiap Transaksi
- Sistem classify otomatis
- Review confidence score
- Klik "Confirm"

### Step 4: Lihat Trial Balance
- Dropdown: "Trial Balance"
- Lihat tabel dengan semua akun
- Verify status: "✓ Balanced"

### Step 5: Generate PDF
- Klik "Generate PDF"
- File download: `trial-balance_2025-01-25.pdf`

### Step 6: Export Data
- Klik "Export Data"
- File download: `accounting_export_2025-01-25.json`

---

## 🎓 Pembelajaran dari Contoh

### Trial Balance Example
**Pelajaran:**
- Bagaimana input transaksi
- Verifikasi persamaan akuntansi
- Membaca Trial Balance
- Identify balanced vs unbalanced

### General Journal Example
**Pelajaran:**
- Double-entry bookkeeping
- Transaksi kompleks (penjualan, pembayaran)
- Urutan kronologis
- Audit trail

### General Ledger Example
**Pelajaran:**
- Detail per akun
- Running balance calculation
- Account movement tracking
- Reconciliation process

---

## 📊 Accounting Concepts

### Double-Entry Bookkeeping
Setiap transaksi memiliki 2 sisi:
- **Debit**: Sisi kiri
- **Credit**: Sisi kanan
- **Total Debit = Total Credit**

### Accounting Equation
```
Assets = Liabilities + Equity
```

### Debit/Credit Rules
| Account Type | Debit | Credit |
|---|---|---|
| Assets | ↑ | ↓ |
| Liabilities | ↓ | ↑ |
| Equity | ↓ | ↑ |
| Revenue | ↓ | ↑ |
| Expenses | ↑ | ↓ |

### Account Classification
- **Assets (1000-1999)**: Cash, Bank, Receivable, Inventory, Equipment
- **Liabilities (2000-2999)**: Payable, Debt, Accrued Expenses
- **Equity (3000-3999)**: Stock, Retained Earnings, Dividends
- **Revenue (4000-4999)**: Sales, Service, Interest Income
- **Expenses (5000-5999)**: COGS, Salaries, Rent, Utilities, Depreciation

---

## 🚀 Next Steps

### Setelah Memahami Contoh:
1. ✅ Buat akun sendiri
2. ✅ Input transaksi dari bisnis Anda
3. ✅ Generate laporan
4. ✅ Analyze hasil
5. ✅ Export untuk backup

### Untuk Pembelajaran Lebih Lanjut:
- Baca README.md untuk user guide
- Baca BACKEND_STRUCTURE.md untuk technical details
- Baca IMPLEMENTATION_COMPLETE.md untuk project overview

---

## 📞 Support

Jika ada pertanyaan:
1. Buka GitHub Issues
2. Jelaskan masalah dengan detail
3. Sertakan screenshot jika perlu

---

## 📚 File Referensi

| File | Deskripsi |
|---|---|
| EXAMPLE_TRIAL_BALANCE.md | Contoh Trial Balance |
| EXAMPLE_GENERAL_JOURNAL.md | Contoh General Journal |
| EXAMPLE_GENERAL_LEDGER.md | Contoh General Ledger |
| README.md | User guide lengkap |
| BACKEND_STRUCTURE.md | Technical documentation |
| IMPLEMENTATION_COMPLETE.md | Project overview |

---

**Selamat belajar dan menggunakan sistem! 🎉**

**Accounting Ledger System v1.0.0**
**By Eko Asif**
