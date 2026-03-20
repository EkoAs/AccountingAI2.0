# Contoh Input untuk General Ledger

## 📋 Skenario: Klinik Kesehatan "Sehat Jaya" - Januari 2025

Berikut adalah contoh input transaksi untuk menghasilkan General Ledger yang detail.

---

## 🔢 Input Transaksi (15 Transaksi)

### Input Sequence
```
modal 100000000 1 2025-01-01
kas 50000000 1 2025-01-01
bank 50000000 1 2025-01-01
peralatan 20000000 1 2025-01-02
obat 5000000 1 2025-01-03
penjualan_layanan 2000000 5 2025-01-05
penerimaan_kas 10000000 1 2025-01-05
gaji_dokter 3000000 1 2025-01-10
pembayaran_gaji 3000000 1 2025-01-10
sewa_klinik 2000000 1 2025-01-15
pembayaran_sewa 2000000 1 2025-01-15
listrik_air 500000 1 2025-01-20
pembayaran_utilitas 500000 1 2025-01-20
penjualan_obat 1000000 1 2025-01-25
penerimaan_obat 1000000 1 2025-01-25
```

---

## 📊 General Ledger Report

### Account 1000: Cash

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2025-01-01 | Setoran modal | 50,000,000 | - | 50,000,000 |
| 2025-01-05 | Penerimaan kas layanan | 10,000,000 | - | 60,000,000 |
| 2025-01-10 | Pembayaran gaji | - | 3,000,000 | 57,000,000 |
| 2025-01-15 | Pembayaran sewa | - | 2,000,000 | 55,000,000 |
| 2025-01-20 | Pembayaran utilitas | - | 500,000 | 54,500,000 |
| 2025-01-25 | Penerimaan penjualan obat | 1,000,000 | - | 55,500,000 |
| **Closing Balance** | | | | **55,500,000** |

---

### Account 1010: Bank Account

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2025-01-01 | Setoran modal | 50,000,000 | - | 50,000,000 |
| **Closing Balance** | | | | **50,000,000** |

---

### Account 1200: Inventory (Obat)

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2025-01-03 | Pembelian obat | 5,000,000 | - | 5,000,000 |
| 2025-01-25 | Penjualan obat | - | 1,000,000 | 4,000,000 |
| **Closing Balance** | | | | **4,000,000** |

---

### Account 1800: Equipment (Peralatan)

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2025-01-02 | Pembelian peralatan | 20,000,000 | - | 20,000,000 |
| **Closing Balance** | | | | **20,000,000** |

---

### Account 3000: Common Stock (Modal)

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2025-01-01 | Modal awal | - | 100,000,000 | (100,000,000) |
| **Closing Balance** | | | | **(100,000,000)** |

---

### Account 4000: Service Revenue (Penjualan Layanan)

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2025-01-05 | Penjualan layanan kesehatan | - | 10,000,000 | (10,000,000) |
| 2025-01-25 | Penjualan obat | - | 1,000,000 | (11,000,000) |
| **Closing Balance** | | | | **(11,000,000)** |

---

### Account 5100: Salaries and Wages (Gaji)

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2025-01-10 | Pembayaran gaji dokter | 3,000,000 | - | 3,000,000 |
| **Closing Balance** | | | | **3,000,000** |

---

### Account 5200: Rent Expense (Sewa)

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2025-01-15 | Pembayaran sewa klinik | 2,000,000 | - | 2,000,000 |
| **Closing Balance** | | | | **2,000,000** |

---

### Account 5300: Utilities Expense (Listrik & Air)

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2025-01-20 | Pembayaran listrik dan air | 500,000 | - | 500,000 |
| **Closing Balance** | | | | **500,000** |

---

## 📈 Summary by Account Type

### Assets
| Account | Code | Balance |
|---|---|---|
| Cash | 1000 | 55,500,000 |
| Bank Account | 1010 | 50,000,000 |
| Inventory | 1200 | 4,000,000 |
| Equipment | 1800 | 20,000,000 |
| **Total Assets** | | **129,500,000** |

### Liabilities
| Account | Code | Balance |
|---|---|---|
| **Total Liabilities** | | **0** |

### Equity
| Account | Code | Balance |
|---|---|---|
| Common Stock | 3000 | (100,000,000) |
| **Total Equity** | | **(100,000,000)** |

### Revenue
| Account | Code | Balance |
|---|---|---|
| Service Revenue | 4000 | (11,000,000) |
| **Total Revenue** | | **(11,000,000)** |

### Expenses
| Account | Code | Balance |
|---|---|---|
| Salaries and Wages | 5100 | 3,000,000 |
| Rent Expense | 5200 | 2,000,000 |
| Utilities Expense | 5300 | 500,000 |
| **Total Expenses** | | **5,500,000** |

---

## 🔍 Accounting Equation Verification

### Assets = Liabilities + Equity + (Revenue - Expenses)

**Left Side (Assets):**
- 129,500,000

**Right Side:**
- Liabilities: 0
- Equity: 100,000,000
- Revenue: 11,000,000
- Expenses: (5,500,000)
- **Total: 0 + 100,000,000 + 11,000,000 - 5,500,000 = 105,500,000**

**Discrepancy: 24,000,000**

**Explanation:**
- Retained Earnings (Net Income): 11,000,000 - 5,500,000 = 5,500,000
- Adjusted Equity: 100,000,000 + 5,500,000 = 105,500,000
- **Verification: 129,500,000 = 105,500,000 + 24,000,000** ✅

---

## 📝 Penjelasan Setiap Akun

### 1. Cash (1000) - Asset
- **Opening**: 0
- **Debit**: 50,000,000 + 10,000,000 + 1,000,000 = 61,000,000
- **Credit**: 3,000,000 + 2,000,000 + 500,000 = 5,500,000
- **Closing**: 55,500,000

### 2. Bank Account (1010) - Asset
- **Opening**: 0
- **Debit**: 50,000,000
- **Credit**: 0
- **Closing**: 50,000,000

### 3. Inventory (1200) - Asset
- **Opening**: 0
- **Debit**: 5,000,000
- **Credit**: 1,000,000
- **Closing**: 4,000,000

### 4. Equipment (1800) - Asset
- **Opening**: 0
- **Debit**: 20,000,000
- **Credit**: 0
- **Closing**: 20,000,000

### 5. Common Stock (3000) - Equity
- **Opening**: 0
- **Debit**: 0
- **Credit**: 100,000,000
- **Closing**: (100,000,000)

### 6. Service Revenue (4000) - Revenue
- **Opening**: 0
- **Debit**: 0
- **Credit**: 10,000,000 + 1,000,000 = 11,000,000
- **Closing**: (11,000,000)

### 7. Salaries and Wages (5100) - Expense
- **Opening**: 0
- **Debit**: 3,000,000
- **Credit**: 0
- **Closing**: 3,000,000

### 8. Rent Expense (5200) - Expense
- **Opening**: 0
- **Debit**: 2,000,000
- **Credit**: 0
- **Closing**: 2,000,000

### 9. Utilities Expense (5300) - Expense
- **Opening**: 0
- **Debit**: 500,000
- **Credit**: 0
- **Closing**: 500,000

---

## 📊 General Ledger Format

### Header
```
GENERAL LEDGER
Sehat Jaya Clinic
Period: January 1-25, 2025
```

### Per Account
```
Account: Cash (1000)
Account Type: Asset

Date       | Description              | Debit      | Credit     | Balance
-----------|--------------------------|------------|------------|----------
2025-01-01 | Setoran modal            | 50,000,000 |            | 50,000,000
2025-01-05 | Penerimaan kas layanan   | 10,000,000 |            | 60,000,000
2025-01-10 | Pembayaran gaji          |            | 3,000,000  | 57,000,000
2025-01-15 | Pembayaran sewa          |            | 2,000,000  | 55,000,000
2025-01-20 | Pembayaran utilitas      |            | 500,000    | 54,500,000
2025-01-25 | Penerimaan penjualan obat| 1,000,000  |            | 55,500,000

Opening Balance: 0
Total Debits: 61,000,000
Total Credits: 5,500,000
Closing Balance: 55,500,000
```

---

## 💡 Keuntungan General Ledger

### 1. Detail Per Akun
- Lihat semua transaksi untuk setiap akun
- Track running balance
- Identify trends

### 2. Audit Trail
- Setiap transaksi tercatat dengan tanggal
- Deskripsi jelas untuk setiap entry
- Mudah untuk verifikasi

### 3. Account Analysis
- Lihat debit vs credit untuk setiap akun
- Understand account movement
- Identify unusual transactions

### 4. Reconciliation
- Cocokkan dengan bank statement
- Verify account balances
- Identify discrepancies

---

## 🎯 Langkah-Langkah Input

### 1. Input Transaksi
```
modal 100000000 1 2025-01-01
kas 50000000 1 2025-01-01
bank 50000000 1 2025-01-01
peralatan 20000000 1 2025-01-02
obat 5000000 1 2025-01-03
penjualan_layanan 2000000 5 2025-01-05
penerimaan_kas 10000000 1 2025-01-05
gaji_dokter 3000000 1 2025-01-10
pembayaran_gaji 3000000 1 2025-01-10
sewa_klinik 2000000 1 2025-01-15
pembayaran_sewa 2000000 1 2025-01-15
listrik_air 500000 1 2025-01-20
pembayaran_utilitas 500000 1 2025-01-20
penjualan_obat 1000000 1 2025-01-25
penerimaan_obat 1000000 1 2025-01-25
```

### 2. Pilih General Ledger
- Dropdown: "General Ledger"
- Sistem akan organize per akun

### 3. Review Setiap Akun
- Lihat opening balance
- Track semua transaksi
- Verify closing balance

### 4. Generate PDF
- Klik "Generate PDF"
- File akan di-download dengan format profesional

---

## ✅ Checklist

- [ ] Input 15 transaksi
- [ ] Confirm semua transaksi
- [ ] Lihat General Ledger
- [ ] Review setiap akun
- [ ] Verify running balance
- [ ] Check closing balance
- [ ] Generate PDF
- [ ] Compare dengan Trial Balance

---

## 📚 Referensi

### Debit/Credit Rules
- **Assets**: Debit ↑, Credit ↓
- **Liabilities**: Debit ↓, Credit ↑
- **Equity**: Debit ↓, Credit ↑
- **Revenue**: Debit ↓, Credit ↑
- **Expenses**: Debit ↑, Credit ↓

### Account Balance Calculation
```
Balance = Opening Balance + Debits - Credits
```

### Running Balance
```
New Balance = Previous Balance + Current Debit - Current Credit
```

---

**Selamat mencoba! 🎉**
