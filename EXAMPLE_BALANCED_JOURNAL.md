# Contoh Jurnal Umum yang BALANCE

## Skenario: Transaksi Bisnis Sederhana

Berikut adalah contoh input dan hasil jurnal umum yang balance sesuai standar akuntansi.

---

## Input Transaksi (Dalam Urutan)

### 1. Pemilik menyetor modal tunai
```
Input: modal 10000000 1 2026-03-20
```

### 2. Beli perlengkapan kantor tunai
```
Input: pulpen 3000 45 2026-03-20
```

### 3. Beli peralatan komputer (hutang)
```
Input: komputer 5000000 1 2026-03-20
```

### 4. Terima pendapatan jasa tunai
```
Input: jasa 2000000 1 2026-03-20
```

### 5. Bayar gaji karyawan tunai
```
Input: gaji 1200000 1 2026-03-20
```

### 6. Bayar sewa kantor tunai
```
Input: sewa 500000 1 2026-03-20
```

### 7. Bayar hutang komputer
```
Input: bayar_hutang 5000000 1 2026-03-20
```

---

## Hasil Jurnal Umum (BALANCED)

### Tabel Jurnal Umum

| Date       | Code | Account Name           | Description      | Debit        | Credit       |
|------------|------|------------------------|------------------|--------------|--------------|
| 2026-03-20 | 1000 | Cash                   | modal            | 10.000.000   | -            |
| 2026-03-20 | 3000 | Capital                | modal            | -            | 10.000.000   |
| 2026-03-20 | 5400 | Office Supplies        | pulpen           | 135.000      | -            |
| 2026-03-20 | 1000 | Cash                   | pulpen           | -            | 135.000      |
| 2026-03-20 | 1800 | Equipment              | komputer         | 5.000.000    | -            |
| 2026-03-20 | 2000 | Accounts Payable       | komputer         | -            | 5.000.000    |
| 2026-03-20 | 1000 | Cash                   | jasa             | 2.000.000    | -            |
| 2026-03-20 | 4000 | Service Revenue        | jasa             | -            | 2.000.000    |
| 2026-03-20 | 5100 | Salaries and Wages     | gaji             | 1.200.000    | -            |
| 2026-03-20 | 1000 | Cash                   | gaji             | -            | 1.200.000    |
| 2026-03-20 | 5200 | Rent Expense           | sewa             | 500.000      | -            |
| 2026-03-20 | 1000 | Cash                   | sewa             | -            | 500.000      |
| 2026-03-20 | 2000 | Accounts Payable       | bayar_hutang     | 5.000.000    | -            |
| 2026-03-20 | 1000 | Cash                   | bayar_hutang     | -            | 5.000.000    |

### Summary

```
Total Debits:  Rp 23.835.000
Total Credits: Rp 23.835.000
Status: ✅ BALANCED
```

---

## Penjelasan Setiap Transaksi

### Transaksi 1: Modal Pemilik
```
Pemilik menyetor modal tunai Rp 10.000.000

Jurnal:
  Debit:  1000 (Cash)      Rp 10.000.000
  Credit: 3000 (Capital)   Rp 10.000.000

Penjelasan:
- Cash meningkat (Asset) → DEBIT
- Capital meningkat (Equity) → CREDIT
```

### Transaksi 2: Beli Perlengkapan
```
Beli pulpen Rp 3.000 × 45 = Rp 135.000 (tunai)

Jurnal:
  Debit:  5400 (Supplies)  Rp 135.000
  Credit: 1000 (Cash)      Rp 135.000

Penjelasan:
- Supplies meningkat (Expense) → DEBIT
- Cash menurun (Asset) → CREDIT
```

### Transaksi 3: Beli Peralatan (Hutang)
```
Beli komputer Rp 5.000.000 (hutang)

Jurnal:
  Debit:  1800 (Equipment)     Rp 5.000.000
  Credit: 2000 (Payable)       Rp 5.000.000

Penjelasan:
- Equipment meningkat (Asset) → DEBIT
- Payable meningkat (Liability) → CREDIT
```

### Transaksi 4: Terima Pendapatan
```
Terima pendapatan jasa Rp 2.000.000 (tunai)

Jurnal:
  Debit:  1000 (Cash)          Rp 2.000.000
  Credit: 4000 (Revenue)       Rp 2.000.000

Penjelasan:
- Cash meningkat (Asset) → DEBIT
- Revenue meningkat (Revenue) → CREDIT
```

### Transaksi 5: Bayar Gaji
```
Bayar gaji karyawan Rp 1.200.000 (tunai)

Jurnal:
  Debit:  5100 (Salary)        Rp 1.200.000
  Credit: 1000 (Cash)          Rp 1.200.000

Penjelasan:
- Salary meningkat (Expense) → DEBIT
- Cash menurun (Asset) → CREDIT
```

### Transaksi 6: Bayar Sewa
```
Bayar sewa kantor Rp 500.000 (tunai)

Jurnal:
  Debit:  5200 (Rent)          Rp 500.000
  Credit: 1000 (Cash)          Rp 500.000

Penjelasan:
- Rent meningkat (Expense) → DEBIT
- Cash menurun (Asset) → CREDIT
```

### Transaksi 7: Bayar Hutang
```
Bayar hutang komputer Rp 5.000.000 (tunai)

Jurnal:
  Debit:  2000 (Payable)       Rp 5.000.000
  Credit: 1000 (Cash)          Rp 5.000.000

Penjelasan:
- Payable menurun (Liability) → DEBIT
- Cash menurun (Asset) → CREDIT
```

---

## Verifikasi Balance

### Persamaan Akuntansi: Assets = Liabilities + Equity

**Assets:**
- Cash: 10.000.000 - 135.000 - 1.200.000 - 500.000 - 5.000.000 + 2.000.000 = **5.165.000**
- Equipment: 5.000.000 = **5.000.000**
- **Total Assets: Rp 10.165.000**

**Liabilities:**
- Accounts Payable: 5.000.000 - 5.000.000 = **0**
- **Total Liabilities: Rp 0**

**Equity:**
- Capital: 10.000.000 = **10.000.000**
- **Total Equity: Rp 10.000.000**

**Verification:**
```
Assets (10.165.000) = Liabilities (0) + Equity (10.000.000) + Net Income (165.000)
10.165.000 = 10.165.000 ✅ BALANCED
```

**Net Income:**
- Revenue: 2.000.000
- Expenses: 135.000 + 1.200.000 + 500.000 = 1.835.000
- Net Income: 2.000.000 - 1.835.000 = **165.000**

---

## Kesimpulan

✅ **Total Debits = Total Credits** (Rp 23.835.000)
✅ **Assets = Liabilities + Equity** (Rp 10.165.000)
✅ **Semua transaksi memiliki debit-credit pair**
✅ **Sesuai standar akuntansi double-entry bookkeeping**

Jurnal umum ini **BALANCE** dan siap untuk dibuat laporan keuangan (Trial Balance, Income Statement, Balance Sheet).
