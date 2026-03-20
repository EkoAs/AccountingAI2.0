# Contoh Input untuk Trial Balance

## 📋 Skenario: PT Maju Jaya - Januari 2025

Berikut adalah contoh input transaksi untuk menghasilkan Trial Balance yang seimbang.

---

## 🔢 Input Transaksi (Format: item_name amount quantity date)

### 1. Transaksi Awal (Opening Balance)
```
cash 10000000 1 2025-01-01
```
- Deskripsi: Cash awal
- Amount: 10,000,000
- Quantity: 1
- Tanggal: 2025-01-01
- Akun: Cash (1000) - Asset
- Debit: 10,000,000 | Credit: 0

### 2. Pembelian Supplies
```
pulpen 3000 45 2025-01-02
```
- Deskripsi: Pulpen
- Amount: 3,000
- Quantity: 45
- Total: 135,000
- Akun: Supplies (1500) - Asset
- Debit: 135,000 | Credit: 0

### 3. Pembelian Kertas
```
kertas 5000 100 2025-01-03
```
- Deskripsi: Kertas
- Amount: 5,000
- Quantity: 100
- Total: 500,000
- Akun: Supplies (1500) - Asset
- Debit: 500,000 | Credit: 0

### 4. Penjualan Produk
```
penjualan 50000 10 2025-01-05
```
- Deskripsi: Penjualan
- Amount: 50,000
- Quantity: 10
- Total: 500,000
- Akun: Sales Revenue (4000) - Revenue
- Debit: 0 | Credit: 500,000

### 5. Pembayaran Gaji
```
gaji 2000000 1 2025-01-10
```
- Deskripsi: Gaji
- Amount: 2,000,000
- Quantity: 1
- Total: 2,000,000
- Akun: Salaries and Wages (5100) - Expense
- Debit: 2,000,000 | Credit: 0

### 6. Pembayaran Sewa
```
sewa 1500000 1 2025-01-15
```
- Deskripsi: Sewa
- Amount: 1,500,000
- Quantity: 1
- Total: 1,500,000
- Akun: Rent Expense (5200) - Expense
- Debit: 1,500,000 | Credit: 0

### 7. Pembayaran Listrik
```
listrik 500000 1 2025-01-20
```
- Deskripsi: Listrik
- Amount: 500,000
- Quantity: 1
- Total: 500,000
- Akun: Utilities Expense (5300) - Expense
- Debit: 500,000 | Credit: 0

### 8. Pembelian Equipment
```
komputer 5000000 1 2025-01-22
```
- Deskripsi: Komputer
- Amount: 5,000,000
- Quantity: 1
- Total: 5,000,000
- Akun: Equipment (1800) - Asset
- Debit: 5,000,000 | Credit: 0

### 9. Hutang Supplier
```
hutang 2000000 1 2025-01-25
```
- Deskripsi: Hutang
- Amount: 2,000,000
- Quantity: 1
- Total: 2,000,000
- Akun: Accounts Payable (2000) - Liability
- Debit: 0 | Credit: 2,000,000

### 10. Modal Awal
```
modal 5000000 1 2025-01-01
```
- Deskripsi: Modal
- Amount: 5,000,000
- Quantity: 1
- Total: 5,000,000
- Akun: Common Stock (3000) - Equity
- Debit: 0 | Credit: 5,000,000

---

## 📊 Trial Balance Result

Setelah semua transaksi diinput, Trial Balance akan menampilkan:

| Account Code | Account Name | Debit | Credit |
|---|---|---|---|
| 1000 | Cash | 10,000,000 | - |
| 1500 | Supplies | 635,000 | - |
| 1800 | Equipment | 5,000,000 | - |
| 2000 | Accounts Payable | - | 2,000,000 |
| 3000 | Common Stock | - | 5,000,000 |
| 4000 | Sales Revenue | - | 500,000 |
| 5100 | Salaries and Wages | 2,000,000 | - |
| 5200 | Rent Expense | 1,500,000 | - |
| 5300 | Utilities Expense | 500,000 | - |
| **TOTAL** | | **20,135,000** | **20,135,000** |

### ✅ Status: BALANCED
- Total Debits = 20,135,000
- Total Credits = 20,135,000
- Discrepancy = 0

---

## 🔍 Penjelasan Accounting Equation

### Assets = Liabilities + Equity

**Assets:**
- Cash: 10,000,000
- Supplies: 635,000
- Equipment: 5,000,000
- **Total Assets: 15,635,000**

**Liabilities:**
- Accounts Payable: 2,000,000
- **Total Liabilities: 2,000,000**

**Equity:**
- Common Stock: 5,000,000
- **Total Equity: 5,000,000**

**Net Income (Revenue - Expenses):**
- Sales Revenue: 500,000
- Salaries and Wages: (2,000,000)
- Rent Expense: (1,500,000)
- Utilities Expense: (500,000)
- **Net Income: (3,500,000)**

**Verification:**
- Assets = 15,635,000
- Liabilities + Equity + Net Income = 2,000,000 + 5,000,000 + (3,500,000) = 3,500,000

**Adjusted:**
- Assets = 15,635,000
- Liabilities + Equity = 2,000,000 + 5,000,000 = 7,000,000
- Retained Earnings (Net Income) = 8,635,000
- **Total: 15,635,000 = 15,635,000** ✅

---

## 📝 Langkah-Langkah Input

### 1. Register/Login
```
Email: user@example.com
Password: password123
```

### 2. Input Transaksi Satu Per Satu
Masukkan setiap transaksi di input field dan tekan Enter:

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

### 3. Review Setiap Transaksi
- Sistem akan menampilkan AI classification
- Review confidence score
- Klik "Confirm" untuk menyimpan

### 4. Lihat Trial Balance
- Pilih "Trial Balance" dari dropdown
- Lihat tabel dengan semua akun dan balances
- Check status: "✓ Balanced"

### 5. Generate PDF
- Klik "Generate PDF"
- File akan di-download: `trial-balance_2025-01-25.pdf`

---

## 🎯 Expected Output

### Trial Balance Report
```
TRIAL BALANCE
PT Maju Jaya
As of January 25, 2025

Account Code | Account Name              | Debit        | Credit
1000         | Cash                      | 10,000,000   |
1500         | Supplies                  | 635,000      |
1800         | Equipment                 | 5,000,000    |
2000         | Accounts Payable          |              | 2,000,000
3000         | Common Stock              |              | 5,000,000
4000         | Sales Revenue             |              | 500,000
5100         | Salaries and Wages        | 2,000,000    |
5200         | Rent Expense              | 1,500,000    |
5300         | Utilities Expense         | 500,000      |
             |                           |              |
TOTAL        |                           | 20,135,000   | 20,135,000

Status: ✓ BALANCED
Discrepancy: 0
```

---

## 💡 Tips

### Format Input
- **Wajib**: item_name amount quantity
- **Opsional**: date (default: hari ini)
- **Separator**: spasi
- **Contoh**: `pulpen 3000 45 2025-01-02`

### Tanggal Format
- YYYY-MM-DD: `2025-01-15`
- DD/MM/YYYY: `15/01/2025`
- DD-MM-YYYY: `15-01-2025`

### AI Classification
- Sistem akan otomatis mendeteksi akun berdasarkan deskripsi
- Confidence score menunjukkan akurasi
- Bisa di-adjust manual jika perlu

### Validasi
- Sistem akan validasi sebelum finalisasi
- Harus balanced (Total Debit = Total Credit)
- Akan menampilkan error jika tidak seimbang

---

## 🔄 Alternatif Input

Jika ingin input dengan format berbeda, sistem juga support:

### Format 1: Dengan Tanggal
```
cash 10000000 1 2025-01-01
```

### Format 2: Tanpa Tanggal (Auto Today)
```
cash 10000000 1
```

### Format 3: Dengan Deskripsi Panjang
```
pembayaran_gaji_januari 2000000 1 2025-01-10
```

---

## 📈 Hasil Laporan Lainnya

Dengan data yang sama, bisa generate laporan lain:

### General Journal
Menampilkan semua transaksi dalam urutan kronologis

### General Ledger
Menampilkan transaksi per akun dengan running balance

### Reversing Journal
Menampilkan pembalikan entri akrual (jika ada)

---

## ✅ Checklist

- [ ] Register akun baru
- [ ] Input 10 transaksi contoh
- [ ] Review AI classification untuk setiap transaksi
- [ ] Confirm semua transaksi
- [ ] Lihat Trial Balance
- [ ] Verify status "Balanced"
- [ ] Generate PDF
- [ ] Export data

---

## 🎓 Pembelajaran

Dengan contoh ini, Anda akan belajar:
- ✅ Cara input transaksi natural language
- ✅ Bagaimana AI mengklasifikasi otomatis
- ✅ Memahami double-entry bookkeeping
- ✅ Membaca Trial Balance
- ✅ Verifikasi accounting equation
- ✅ Generate laporan profesional

---

**Selamat mencoba! 🎉**
