# ❓ FAQ - Cara Kerja Sistem

Jawaban untuk pertanyaan umum tentang cara kerja sistem.

---

## Q1: "Data di kanan belum di add?"

### A: Benar! Itu normal.

**Penjelasan:**
- Transaksi masih dalam status **"pending"** (belum di-confirm)
- Sistem menampilkan AI classification untuk review user
- Hanya setelah klik **"Confirm"** → data akan ditambah ke tabel kanan

**Workflow:**
```
Input → Parse → Classify → DISPLAY (belum di-add)
                              ↓
                          User Review
                              ↓
                          User Confirm
                              ↓
                          SAVE & ADD (baru di-add ke tabel)
```

**Alasan:**
- User perlu review sebelum save
- Bisa adjust jika classification salah
- Prevent accidental save

---

## Q2: "Input akan otomatis clear kalo data udh di add di kanan?"

### A: **YA! Otomatis clear.**

**Apa yang terjadi setelah Confirm:**

1. ✅ **Input field di-clear**
   ```javascript
   ui.clearTransactionInput()
   ```

2. ✅ **Classification display di-hide**
   ```javascript
   ui.hideClassification()
   ```

3. ✅ **Status badge reset ke "Ready"**
   ```javascript
   ui.updateStatusBadge('Ready', 'success')
   ```

4. ✅ **Focus kembali ke input field**
   ```javascript
   ui.elements.transactionInput.focus()
   ```

5. ✅ **Undo/Redo buttons di-update**
   ```javascript
   updateUndoRedoButtons()
   ```

**Timeline:**
```
T=0s:     User click "Confirm"
T=0.1s:   Transaction saved
T=0.2s:   Report updated
T=0.3s:   Input cleared
T=0.4s:   Classification hidden
T=0.5s:   Status reset
T=0.6s:   Focus to input
T=0.7s:   Ready for next input
```

---

## Q3: "Gimana cara kerja sistemnya?"

### A: Step-by-step workflow:

#### STEP 1: User Input
```
User ketik: "pulpen 3000 45 2025-01-02"
Tekan Enter
```

#### STEP 2: Parse Input
```
Sistem extract:
- description: "pulpen"
- amount: 3000
- quantity: 45
- date: "2025-01-02"
- totalAmount: 135000
```

#### STEP 3: Validate
```
Check:
- Format valid? ✓
- Amount > 0? ✓
- Quantity > 0? ✓
- Date valid? ✓
```

#### STEP 4: Send to Gemini AI
```
Request:
{
  description: "pulpen",
  amount: 3000,
  quantity: 45,
  date: "2025-01-02"
}
```

#### STEP 5: AI Classify
```
Gemini analyze dan return:
{
  accountCode: "1500",
  accountName: "Supplies",
  accountType: "Asset",
  debitCredit: "debit",
  confidence: 0.95,
  reasoning: "Pulpen adalah stationery..."
}
```

#### STEP 6: Display Classification
```
Muncul di bawah input:
┌─────────────────────────────┐
│ AI Classification           │
├─────────────────────────────┤
│ Account: Supplies           │
│ Type: Asset                 │
│ Debit/Credit: Debit         │
│ Total: Rp 135,000           │
│ Confidence: 95%             │
├─────────────────────────────┤
│ [Adjust] [Confirm]          │
└─────────────────────────────┘
```

#### STEP 7: User Confirm
```
User klik "Confirm"
```

#### STEP 8: Save Transaction
```
Transaction object:
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
  status: "confirmed"
}

Disimpan ke localStorage
```

#### STEP 9: Update Report
```
Tabel di kanan update:
┌─────────────────────────────┐
│ Trial Balance               │
├─────────────────────────────┤
│ Account | Debit | Credit    │
├─────────────────────────────┤
│ 1500    | 135k  | -         │
│                             │
│ Total: 135k | 0             │
│ Status: Unbalanced          │
└─────────────────────────────┘
```

#### STEP 10: Clear & Ready
```
- Input field cleared
- Classification hidden
- Status reset to "Ready"
- Focus to input
- Ready untuk transaksi berikutnya
```

---

## Q4: "Kenapa harus confirm dulu?"

### A: Untuk validasi dan review.

**Alasan:**
1. **User Review** - Cek apakah AI classify benar
2. **Prevent Error** - Jangan save transaksi yang salah
3. **Flexibility** - Bisa adjust jika perlu
4. **Audit Trail** - Setiap transaksi ter-review

**Workflow:**
```
Input → Classify → REVIEW → Confirm → Save
                    ↑
                User bisa:
                - Review classification
                - Adjust jika salah
                - Cancel jika perlu
```

---

## Q5: "Bisa adjust classification?"

### A: **Belum implemented**, tapi sudah di-design.

**Rencana:**
- Klik "Adjust" button
- Modal muncul dengan form
- User bisa pilih akun lain
- User bisa ubah debit/credit
- Klik "Save" untuk confirm

**Untuk sekarang:**
- Jika classification salah, klik "Adjust"
- Sistem akan show error (belum implemented)
- Workaround: Undo transaksi, input ulang dengan deskripsi lebih jelas

---

## Q6: "Gimana jika Gemini API error?"

### A: Fallback ke local classification.

**Workflow:**
```
Send to Gemini
    ↓
Gemini Error?
    ↓ YES
Fallback to Local Classification
    ↓
Use keyword-based classification
    ↓
Display dengan confidence lebih rendah
```

**Contoh:**
```
Input: "pulpen 3000 45"
↓
Gemini timeout
↓
Fallback: Supplies (confidence: 0.3)
↓
Display: "Classified using local rules (AI unavailable)"
```

---

## Q7: "Data disimpan di mana?"

### A: localStorage browser.

**Storage:**
```
localStorage[
  "accounting_user_{userId}_transactions"
] = [
  {
    id: "txn_001",
    date: "2025-01-02",
    description: "pulpen",
    ...
  },
  ...
]
```

**Keuntungan:**
- ✅ Offline-first
- ✅ No server needed
- ✅ Data persist
- ✅ Fast access

**Keterbatasan:**
- ⚠️ 5MB limit per domain
- ⚠️ Browser-specific
- ⚠️ Clear cache = data hilang

**Backup:**
- Export data ke JSON
- Import kembali jika perlu

---

## Q8: "Bisa undo transaksi?"

### A: **YA! Undo/Redo tersedia.**

**Cara:**
1. Klik "Undo" button
2. Transaksi terakhir di-revert
3. Report update otomatis
4. Klik "Redo" untuk restore

**Workflow:**
```
Transaksi 1 → Transaksi 2 → Transaksi 3
                                ↓
                            Klik Undo
                                ↓
                            Transaksi 2
                                ↓
                            Klik Undo
                                ↓
                            Transaksi 1
                                ↓
                            Klik Redo
                                ↓
                            Transaksi 2
```

**Undo Stack:**
- Setiap transaksi di-push ke undo stack
- Max 50 undo (configurable)
- Redo stack di-clear saat input baru

---

## Q9: "Laporan apa saja yang bisa di-generate?"

### A: 4 jenis laporan standar.

**1. Trial Balance**
- Verifikasi persamaan akuntansi
- Debit = Credit?
- Per akun dengan balance

**2. General Journal**
- Catatan kronologis
- Urutan tanggal
- Semua transaksi

**3. General Ledger**
- Detail per akun
- Running balance
- Audit trail

**4. Reversing Journal**
- Pembalikan entri akrual
- Untuk accrual accounting

**Cara:**
```
Dropdown: "Report Type"
Select: "Trial Balance" / "General Journal" / "General Ledger" / "Reversing Journal"
↓
Report update otomatis
```

---

## Q10: "Bisa export ke PDF?"

### A: **YA! Generate PDF tersedia.**

**Cara:**
1. Pilih report type
2. Klik "Generate PDF"
3. File download otomatis

**Filename:**
```
{reportType}_{date}.pdf
Contoh: trial-balance_2025-01-25.pdf
```

**Isi PDF:**
- Header (Organization, Date, Preparer)
- Report table
- Summary totals
- Footer (Page numbers)

---

## Q11: "Gimana jika transaksi tidak seimbang?"

### A: Sistem akan warn dan prevent finalize.

**Workflow:**
```
Input transaksi
    ↓
Total Debit ≠ Total Credit?
    ↓ YES
Status: "Unbalanced ✗"
    ↓
"Generate PDF" button disabled
    ↓
"Done" button show error
    ↓
User harus add transaksi lagi
```

**Contoh:**
```
Transaksi 1: Debit 135k (Supplies)
Transaksi 2: Debit 500k (Gaji)

Total Debit: 635k
Total Credit: 0
Status: Unbalanced ✗

Harus add transaksi credit untuk balance
```

---

## Q12: "Bisa multi-user?"

### A: **YA! Multi-user support tersedia.**

**Cara:**
1. Register akun baru
2. Login dengan email/password
3. Data terpisah per user
4. Logout clear session

**Data Isolation:**
```
User 1 data: localStorage["accounting_user_1_transactions"]
User 2 data: localStorage["accounting_user_2_transactions"]

Terpisah & aman
```

---

## 🎯 Summary

| Pertanyaan | Jawaban |
|---|---|
| Data di kanan belum di-add? | Benar, tunggu confirm |
| Input auto-clear? | YA, setelah confirm |
| Cara kerja? | Input → Parse → Classify → Confirm → Save → Update → Clear |
| Kenapa confirm? | Untuk review & validasi |
| Bisa adjust? | Belum, tapi sudah di-design |
| Gemini error? | Fallback ke local classification |
| Data disimpan di mana? | localStorage browser |
| Bisa undo? | YA, undo/redo tersedia |
| Laporan apa saja? | 4 jenis: TB, GJ, GL, RJ |
| Bisa PDF? | YA, generate PDF tersedia |
| Tidak seimbang? | Sistem warn & prevent finalize |
| Multi-user? | YA, data terpisah per user |

---

**Semua pertanyaan sudah terjawab! 🎉**
