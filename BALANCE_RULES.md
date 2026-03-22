# Aturan Balance & Auto-Arrange Transaksi

## 1. Prinsip Double-Entry Bookkeeping

**Setiap transaksi HARUS memiliki:**
- 1 akun yang di-DEBIT
- 1 akun yang di-CREDIT
- Jumlah DEBIT = Jumlah CREDIT

**Rumus Akuntansi:**
```
Assets = Liabilities + Equity
```

**Persamaan Dasar:**
```
Total Debits = Total Credits
```

---

## 2. Aturan Debit/Credit Berdasarkan Tipe Akun

### Asset (1xxx) - Aset
- **Debit**: Meningkat
- **Credit**: Menurun
- Contoh: Cash, Bank, Equipment, Inventory

### Liability (2xxx) - Hutang
- **Debit**: Menurun
- **Credit**: Meningkat
- Contoh: Accounts Payable, Debt, Accrued Expenses

### Equity (3xxx) - Modal
- **Debit**: Menurun
- **Credit**: Meningkat
- Contoh: Capital, Retained Earnings

### Revenue (4xxx) - Pendapatan
- **Debit**: Menurun
- **Credit**: Meningkat
- Contoh: Sales, Service Income

### Expense (5xxx) - Beban
- **Debit**: Meningkat
- **Credit**: Menurun
- Contoh: Salary, Rent, Utilities

---

## 3. Contoh Transaksi yang BALANCE

### Contoh 1: Beli Perlengkapan Tunai
```
Transaksi: Beli pulpen Rp 64.000 (tunai)

Jurnal Umum:
Date       | Account Code | Account Name        | Description | Debit      | Credit
2025-01-12 | 5400         | Office Supplies     | pulpen      | Rp 64.000  | -
2025-01-12 | 1000         | Cash                | pulpen      | -          | Rp 64.000

Total Debits:  Rp 64.000
Total Credits: Rp 64.000
Status: ✅ BALANCED
```

### Contoh 2: Terima Hutang (Pinjaman)
```
Transaksi: Terima pinjaman bank Rp 200.000.000

Jurnal Umum:
Date       | Account Code | Account Name        | Description | Debit          | Credit
2026-03-20 | 1000         | Cash                | pinjaman    | Rp 200.000.000 | -
2026-03-20 | 2100         | Debt                | pinjaman    | -              | Rp 200.000.000

Total Debits:  Rp 200.000.000
Total Credits: Rp 200.000.000
Status: ✅ BALANCED
```

### Contoh 3: Bayar Gaji Karyawan
```
Transaksi: Bayar gaji Rp 1.200.000 (tunai)

Jurnal Umum:
Date       | Account Code | Account Name        | Description | Debit        | Credit
2026-03-20 | 5100         | Salaries and Wages  | gaji        | Rp 1.200.000 | -
2026-03-20 | 1000         | Cash                | gaji        | -            | Rp 1.200.000

Total Debits:  Rp 1.200.000
Total Credits: Rp 1.200.000
Status: ✅ BALANCED
```

### Contoh 4: Beli Peralatan Hutang
```
Transaksi: Beli komputer Rp 5.000.000 (hutang)

Jurnal Umum:
Date       | Account Code | Account Name        | Description | Debit        | Credit
2026-03-20 | 1800         | Equipment           | komputer    | Rp 5.000.000 | -
2026-03-20 | 2000         | Accounts Payable    | komputer    | -            | Rp 5.000.000

Total Debits:  Rp 5.000.000
Total Credits: Rp 5.000.000
Status: ✅ BALANCED
```

---

## 4. Offset Transaksi Otomatis

Sistem akan menyarankan offset transaksi berdasarkan tipe akun:

### Expense → Cash (Default)
```
Gaji (5100)      → Cash (1000)
Sewa (5200)      → Cash (1000)
Listrik (5300)   → Cash (1000)
Supplies (5400)  → Cash (1000)
Asuransi (5600)  → Cash (1000)
Marketing (5700) → Cash (1000)
```

### Asset → Cash
```
Inventory (1200) → Cash (1000)
Equipment (1800) → Cash (1000)
```

### Liability → Cash (Payment)
```
Payable (2000)   → Cash (1000)
Debt (2100)      → Cash (1000)
```

### Special Cases
```
Depreciation (5500) → Equipment (1800)
Interest (5800)     → Debt (2100)
```

---

## 5. Auto-Arrange Tabel

Sistem secara otomatis mengatur urutan transaksi berdasarkan:

### Priority Order:
1. **Date** (Tanggal) - Kronologis
2. **Account Type** - Assets → Liabilities → Equity → Revenue → Expense
3. **Account Code** - Numerik ascending

### Contoh Hasil Arrange:
```
Date       | Code | Account Name        | Description | Debit        | Credit
2025-01-12 | 1000 | Cash                | pulpen      | -            | Rp 64.000
2025-01-12 | 5400 | Office Supplies     | pulpen      | Rp 64.000    | -
2025-31-12 | 1000 | Cash                | buku        | -            | Rp 4.000.000
2025-31-12 | 5400 | Office Supplies     | buku        | Rp 4.000.000 | -
2026-03-20 | 1000 | Cash                | pinjaman    | Rp 200.000.000 | -
2026-03-20 | 2100 | Debt                | pinjaman    | -            | Rp 200.000.000
```

---

## 6. Validasi Balance

Sistem akan menampilkan status:

### ✅ BALANCED
```
Total Debits:  Rp 476.664.000
Total Credits: Rp 476.664.000
Status: ✅ Balanced
```

### ❌ UNBALANCED
```
Total Debits:  Rp 476.664.000
Total Credits: Rp 200.200.000
Discrepancy:   Rp 276.464.000
Status: ❌ Unbalanced
```

---

## 7. Tips Input Transaksi

### Format Input:
```
[item_name] [amount] [quantity] [date]
```

### Contoh Input yang BENAR:
```
pulpen 3000 45 2025-01-12
buku 4000000 1 2025-31-12
hutang 200000000 1 2026-03-20
gaji 1200000 1 2026-03-20
listrik 3000000 1 2026-03-20
```

### Sistem akan otomatis:
1. ✅ Klasifikasi akun (pulpen → 5400, hutang → 2000, gaji → 5100)
2. ✅ Tentukan debit/credit (Expense → Debit, Liability → Credit)
3. ✅ Sarankan offset transaksi (Expense → Cash)
4. ✅ Arrange urutan tabel (by date, account type, code)
5. ✅ Validasi balance (Total Debit = Total Credit)

---

## 8. Fitur AI

### Analisis Transaksi
- Identifikasi transaksi yang unbalanced
- Sarankan offset transaksi
- Rekomendasi perbaikan

### Auto-Arrange
- Urutkan berdasarkan date
- Kelompokkan berdasarkan account type
- Tampilkan dalam format standar akuntansi

### Validasi
- Cek total debit = total credit
- Identifikasi missing offset
- Sarankan perbaikan

---

## 9. Troubleshooting

### Masalah: Transaksi tidak balance
**Solusi:**
1. Pastikan setiap transaksi memiliki offset (debit-credit pair)
2. Verifikasi jumlah debit = jumlah credit
3. Gunakan fitur "Suggest Offset" untuk auto-generate offset

### Masalah: Akun salah klasifikasi
**Solusi:**
1. Gunakan keyword yang lebih spesifik (hutang_usaha, bebangaji, bunga_bank)
2. Atau setup Gemini API untuk AI classification yang lebih akurat

### Masalah: Tabel tidak terurut
**Solusi:**
1. Sistem otomatis arrange berdasarkan date dan account type
2. Refresh halaman untuk melihat urutan terbaru

---

## 10. Standar Akuntansi yang Diterapkan

✅ **Double-Entry Bookkeeping** - Setiap transaksi memiliki debit-credit pair
✅ **Accounting Equation** - Assets = Liabilities + Equity
✅ **Debit/Credit Rules** - Sesuai dengan tipe akun
✅ **Balance Verification** - Total Debit = Total Credit
✅ **Chronological Order** - Transaksi diurutkan berdasarkan tanggal
✅ **Account Classification** - 60+ akun dengan tipe yang benar
✅ **Currency Formatting** - Format IDR dengan pemisah ribuan
✅ **Report Generation** - General Journal, Ledger, Trial Balance, Reversing Journal
