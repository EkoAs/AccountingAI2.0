# AI Classifier Upgrade - Enhanced Accounting Intelligence

## Perubahan yang Dilakukan

### 1. **Prompt Gemini API yang Lebih Spesifik**
Prompt sekarang mencakup:
- Aturan debit/kredit yang jelas untuk setiap tipe akun
- Klasifikasi beban usaha vs non-usaha
- Pembedaan perlengkapan (supplies) vs peralatan (equipment)
- Keyword matching untuk berbagai jenis transaksi
- Format output JSON yang ketat

### 2. **Enhanced Fallback Classification Logic**
Ketika Gemini API tidak tersedia, sistem menggunakan logika lokal yang lebih canggih:

#### Supplies/Perlengkapan (5400) - Habis dalam 1 tahun
Keywords: pulpen, kertas, tinta, sticky, penghapus, penggaris, stapler, klip, map, amplop, buku tulis, pensil, spidol, alat tulis

#### Equipment/Peralatan (1800) - Tahan lama >1 tahun
Keywords: komputer, laptop, printer, meja, kursi, lemari, rak, mobil, motor, kendaraan, furniture, mesin, ac, kulkas, dispenser

#### Salary/Gaji (5100)
Keywords: gaji, upah, honor, salary, wage, bayar karyawan, tunjangan

#### Rent/Sewa (5200)
Keywords: sewa, rental, rent, kos, tempat, ruang

#### Utilities/Listrik (5300)
Keywords: listrik, air, internet, telepon, wifi, pulsa, token, pln, pam

#### Depreciation/Penyusutan (5500)
Keywords: penyusutan, depreciation, depresiasi

#### Insurance/Asuransi (5600)
Keywords: asuransi, insurance, premi

#### Marketing/Pemasaran (5700)
Keywords: marketing, pemasaran, iklan, promosi, advertise, ads

#### Interest/Bunga (5800)
Keywords: bunga, interest, riba

#### Payable/Hutang (2000)
Keywords: hutang, utang, payable, payables, hutang usaha

#### Debt/Pinjaman (2100)
Keywords: pinjaman, loan, kredit, cicilan

#### Inventory (1200)
Keywords: barang, stok, inventory, persediaan, dagangan

#### Bank (1010)
Keywords: bank, rekening, transfer, deposit

#### Cash (1000)
Keywords: tunai, cash, uang, kas

### 3. **Debit/Credit Rules**
```
Asset (1xxx)      → DEBIT when increasing
Liability (2xxx)  → CREDIT when increasing
Equity (3xxx)     → CREDIT when increasing
Revenue (4xxx)    → CREDIT when increasing
Expense (5xxx)    → DEBIT when increasing
```

### 4. **Improved API Response Handling**
- Better error handling untuk malformed responses
- Validation untuk required fields
- Normalization dari debitCredit field
- Fallback ke local classification jika API gagal

## Contoh Klasifikasi

### Input: "pulpen 3000 45"
- Recognized as: Supplies/Perlengkapan
- Account: 5400 (Miscellaneous Expense)
- Debit/Credit: DEBIT (Expense account)
- Amount: Rp 135.000
- Result: Debit Rp 135.000, Credit Rp 0

### Input: "hutang 1000000 1"
- Recognized as: Payable/Hutang
- Account: 2000 (Hutang Usaha)
- Debit/Credit: CREDIT (Liability account)
- Amount: Rp 1.000.000
- Result: Debit Rp 0, Credit Rp 1.000.000

### Input: "komputer 5000000 1"
- Recognized as: Equipment/Peralatan
- Account: 1800 (Peralatan)
- Debit/Credit: DEBIT (Asset account)
- Amount: Rp 5.000.000
- Result: Debit Rp 5.000.000, Credit Rp 0

### Input: "gaji 60000000 1"
- Recognized as: Salary/Gaji
- Account: 5100 (Gaji Karyawan)
- Debit/Credit: DEBIT (Expense account)
- Amount: Rp 60.000.000
- Result: Debit Rp 60.000.000, Credit Rp 0

## Confidence Scores

- Exact keyword match: 0.95 (very high confidence)
- Partial keyword match: 0.85-0.90 (high confidence)
- No match (default): 0.30 (low confidence)

## Testing Recommendations

1. Test dengan berbagai jenis barang:
   - Perlengkapan: pulpen, kertas, tinta, sticky notes
   - Peralatan: komputer, printer, meja, kursi, mobil
   - Beban: gaji, sewa, listrik, asuransi
   - Hutang: hutang usaha, pinjaman bank

2. Verifikasi debit/credit placement di General Journal

3. Pastikan Trial Balance tetap balanced

4. Test dengan Gemini API dan fallback mode

## Files Modified

- `js/modules/ai-classifier.js` - Enhanced prompt dan API handling
- `js/modules/accounting.js` - Improved fallback classification logic
- `js/app.js` - Added debug logging untuk classification

## Next Steps

1. Setup Gemini API key di Settings
2. Test dengan berbagai transaksi
3. Monitor confidence scores
4. Adjust keywords jika diperlukan
