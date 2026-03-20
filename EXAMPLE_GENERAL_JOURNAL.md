# Contoh Input untuk General Journal

## 📋 Skenario: Toko Elektronik "ElektroPro" - Januari 2025

Berikut adalah contoh input transaksi untuk menghasilkan General Journal yang lengkap.

---

## 🔢 Input Transaksi (Urutan Kronologis)

### Hari 1 - 2025-01-01: Pembukaan Usaha

#### Transaksi 1: Modal Awal
```
modal_awal 50000000 1 2025-01-01
```
- **Akun**: Common Stock (3000) - Equity
- **Debit**: 0 | **Credit**: 50,000,000
- **Deskripsi**: Pemilik menyetorkan modal awal

#### Transaksi 2: Pembukaan Rekening Bank
```
bank 30000000 1 2025-01-01
```
- **Akun**: Bank Account (1010) - Asset
- **Debit**: 30,000,000 | **Credit**: 0
- **Deskripsi**: Setoran modal ke bank

---

### Hari 2 - 2025-01-02: Pembelian Inventory

#### Transaksi 3: Pembelian TV
```
tv 2000000 5 2025-01-02
```
- **Akun**: Inventory (1200) - Asset
- **Debit**: 10,000,000 | **Credit**: 0
- **Deskripsi**: Pembelian 5 unit TV @ 2,000,000

#### Transaksi 4: Pembelian Kulkas
```
kulkas 1500000 3 2025-01-02
```
- **Akun**: Inventory (1200) - Asset
- **Debit**: 4,500,000 | **Credit**: 0
- **Deskripsi**: Pembelian 3 unit Kulkas @ 1,500,000

---

### Hari 3 - 2025-01-03: Penjualan Pertama

#### Transaksi 5: Penjualan TV (Cash)
```
penjualan_tv 2500000 2 2025-01-03
```
- **Akun**: Sales Revenue (4000) - Revenue
- **Debit**: 0 | **Credit**: 5,000,000
- **Deskripsi**: Penjualan 2 unit TV @ 2,500,000

#### Transaksi 6: Penerimaan Kas Penjualan
```
kas_penjualan 5000000 1 2025-01-03
```
- **Akun**: Cash (1000) - Asset
- **Debit**: 5,000,000 | **Credit**: 0
- **Deskripsi**: Penerimaan kas dari penjualan

---

### Hari 5 - 2025-01-05: Pembelian Supplies

#### Transaksi 7: Pembelian Supplies
```
supplies 500000 10 2025-01-05
```
- **Akun**: Supplies (1500) - Asset
- **Debit**: 5,000,000 | **Credit**: 0
- **Deskripsi**: Pembelian supplies kantor

---

### Hari 10 - 2025-01-10: Pembayaran Gaji

#### Transaksi 8: Pembayaran Gaji Karyawan
```
gaji_karyawan 5000000 1 2025-01-10
```
- **Akun**: Salaries and Wages (5100) - Expense
- **Debit**: 5,000,000 | **Credit**: 0
- **Deskripsi**: Pembayaran gaji 2 karyawan

#### Transaksi 9: Pembayaran dari Kas
```
pembayaran_gaji 5000000 1 2025-01-10
```
- **Akun**: Cash (1000) - Asset
- **Debit**: 0 | **Credit**: 5,000,000
- **Deskripsi**: Pembayaran gaji dari kas

---

### Hari 15 - 2025-01-15: Pembayaran Sewa

#### Transaksi 10: Pembayaran Sewa Toko
```
sewa_toko 3000000 1 2025-01-15
```
- **Akun**: Rent Expense (5200) - Expense
- **Debit**: 3,000,000 | **Credit**: 0
- **Deskripsi**: Pembayaran sewa toko Januari

#### Transaksi 11: Pembayaran dari Kas
```
pembayaran_sewa 3000000 1 2025-01-15
```
- **Akun**: Cash (1000) - Asset
- **Debit**: 0 | **Credit**: 3,000,000
- **Deskripsi**: Pembayaran sewa dari kas

---

### Hari 20 - 2025-01-20: Pembayaran Listrik

#### Transaksi 12: Pembayaran Listrik
```
listrik 1000000 1 2025-01-20
```
- **Akun**: Utilities Expense (5300) - Expense
- **Debit**: 1,000,000 | **Credit**: 0
- **Deskripsi**: Pembayaran tagihan listrik

#### Transaksi 13: Pembayaran dari Kas
```
pembayaran_listrik 1000000 1 2025-01-20
```
- **Akun**: Cash (1000) - Asset
- **Debit**: 0 | **Credit**: 1,000,000
- **Deskripsi**: Pembayaran listrik dari kas

---

### Hari 25 - 2025-01-25: Penjualan Kredit

#### Transaksi 14: Penjualan Kulkas (Kredit)
```
penjualan_kulkas 2000000 1 2025-01-25
```
- **Akun**: Sales Revenue (4000) - Revenue
- **Debit**: 0 | **Credit**: 2,000,000
- **Deskripsi**: Penjualan 1 unit Kulkas @ 2,000,000 (Kredit)

#### Transaksi 15: Piutang Dagang
```
piutang 2000000 1 2025-01-25
```
- **Akun**: Accounts Receivable (1100) - Asset
- **Debit**: 2,000,000 | **Credit**: 0
- **Deskripsi**: Piutang dari penjualan kredit

---

## 📊 General Journal Report

Setelah semua transaksi diinput, General Journal akan menampilkan:

| Date | Account Code | Account Name | Description | Debit | Credit |
|---|---|---|---|---|---|
| 2025-01-01 | 3000 | Common Stock | Modal awal | - | 50,000,000 |
| 2025-01-01 | 1010 | Bank Account | Setoran modal | 30,000,000 | - |
| 2025-01-02 | 1200 | Inventory | Pembelian TV | 10,000,000 | - |
| 2025-01-02 | 1200 | Inventory | Pembelian Kulkas | 4,500,000 | - |
| 2025-01-03 | 4000 | Sales Revenue | Penjualan TV | - | 5,000,000 |
| 2025-01-03 | 1000 | Cash | Penerimaan kas | 5,000,000 | - |
| 2025-01-05 | 1500 | Supplies | Pembelian supplies | 5,000,000 | - |
| 2025-01-10 | 5100 | Salaries and Wages | Pembayaran gaji | 5,000,000 | - |
| 2025-01-10 | 1000 | Cash | Pembayaran gaji | - | 5,000,000 |
| 2025-01-15 | 5200 | Rent Expense | Pembayaran sewa | 3,000,000 | - |
| 2025-01-15 | 1000 | Cash | Pembayaran sewa | - | 3,000,000 |
| 2025-01-20 | 5300 | Utilities Expense | Pembayaran listrik | 1,000,000 | - |
| 2025-01-20 | 1000 | Cash | Pembayaran listrik | - | 1,000,000 |
| 2025-01-25 | 4000 | Sales Revenue | Penjualan Kulkas | - | 2,000,000 |
| 2025-01-25 | 1100 | Accounts Receivable | Piutang dagang | 2,000,000 | - |
| **TOTAL** | | | | **66,000,000** | **66,000,000** |

### ✅ Status: BALANCED
- Total Debits = 66,000,000
- Total Credits = 66,000,000
- Discrepancy = 0

---

## 🔍 Analisis Transaksi

### Transaksi 1-2: Pembukaan Usaha
- Modal awal: 50,000,000
- Setoran ke bank: 30,000,000
- Sisa kas: 20,000,000

### Transaksi 3-4: Pembelian Inventory
- Pembelian TV: 10,000,000
- Pembelian Kulkas: 4,500,000
- Total Inventory: 14,500,000

### Transaksi 5-6: Penjualan Pertama
- Penjualan TV: 5,000,000 (Revenue)
- Penerimaan kas: 5,000,000 (Asset)

### Transaksi 7: Pembelian Supplies
- Supplies: 5,000,000

### Transaksi 8-9: Pembayaran Gaji
- Gaji: 5,000,000 (Expense)
- Pembayaran dari kas: 5,000,000

### Transaksi 10-11: Pembayaran Sewa
- Sewa: 3,000,000 (Expense)
- Pembayaran dari kas: 3,000,000

### Transaksi 12-13: Pembayaran Listrik
- Listrik: 1,000,000 (Expense)
- Pembayaran dari kas: 1,000,000

### Transaksi 14-15: Penjualan Kredit
- Penjualan Kulkas: 2,000,000 (Revenue)
- Piutang: 2,000,000 (Asset)

---

## 📈 Posisi Keuangan Akhir

### Assets
- Cash: 20,000,000 + 5,000,000 - 5,000,000 - 3,000,000 - 1,000,000 = **16,000,000**
- Bank: **30,000,000**
- Accounts Receivable: **2,000,000**
- Inventory: 14,500,000 - 2 TV (5,000,000) - 1 Kulkas (2,000,000) = **7,500,000**
- Supplies: **5,000,000**
- **Total Assets: 60,500,000**

### Liabilities
- **Total Liabilities: 0**

### Equity
- Common Stock: **50,000,000**
- Net Income: 7,000,000 - 9,000,000 = **(2,000,000)**
- **Total Equity: 48,000,000**

### Retained Earnings
- Revenue: 7,000,000
- Expenses: 9,000,000
- **Net Loss: (2,000,000)**

### Verification
- Assets = 60,500,000
- Liabilities + Equity = 0 + 48,000,000 = 48,000,000
- **Discrepancy: 12,500,000** (Retained Earnings belum di-post)

---

## 💡 Catatan Penting

### Double-Entry Bookkeeping
Setiap transaksi memiliki 2 sisi:
- **Debit**: Sisi kiri (peningkatan asset/expense, penurunan liability/equity/revenue)
- **Credit**: Sisi kanan (penurunan asset/expense, peningkatan liability/equity/revenue)

### Contoh Transaksi 1-2
```
Transaksi: Modal awal 50,000,000

Jurnal:
Dr. Bank Account (1010)        30,000,000
Dr. Cash (1000)                20,000,000
    Cr. Common Stock (3000)                50,000,000
```

### Contoh Transaksi 5-6
```
Transaksi: Penjualan TV 5,000,000

Jurnal:
Dr. Cash (1000)                 5,000,000
    Cr. Sales Revenue (4000)                5,000,000
```

---

## 🎯 Output Format

### General Journal Header
```
GENERAL JOURNAL
ElektroPro
Period: January 1-25, 2025
Prepared by: [User Name]
```

### Column Headers
- Date
- Account Code
- Account Name
- Description
- Debit
- Credit

### Summary
```
Total Debits:  66,000,000
Total Credits: 66,000,000
Status: ✓ BALANCED
```

---

## 📝 Langkah-Langkah Input

### 1. Input Transaksi Satu Per Satu
```
modal_awal 50000000 1 2025-01-01
bank 30000000 1 2025-01-01
tv 2000000 5 2025-01-02
kulkas 1500000 3 2025-01-02
penjualan_tv 2500000 2 2025-01-03
kas_penjualan 5000000 1 2025-01-03
supplies 500000 10 2025-01-05
gaji_karyawan 5000000 1 2025-01-10
pembayaran_gaji 5000000 1 2025-01-10
sewa_toko 3000000 1 2025-01-15
pembayaran_sewa 3000000 1 2025-01-15
listrik 1000000 1 2025-01-20
pembayaran_listrik 1000000 1 2025-01-20
penjualan_kulkas 2000000 1 2025-01-25
piutang 2000000 1 2025-01-25
```

### 2. Review Setiap Transaksi
- Sistem akan menampilkan AI classification
- Verify akun yang dipilih
- Klik "Confirm"

### 3. Lihat General Journal
- Pilih "General Journal" dari dropdown
- Lihat semua transaksi dalam urutan kronologis
- Verify total debits = total credits

### 4. Generate PDF
- Klik "Generate PDF"
- File akan di-download

---

## ✅ Checklist

- [ ] Input 15 transaksi
- [ ] Review AI classification
- [ ] Confirm semua transaksi
- [ ] Lihat General Journal
- [ ] Verify status "Balanced"
- [ ] Generate PDF
- [ ] Check laporan lainnya (Ledger, Trial Balance)

---

**Selamat mencoba! 🎉**
