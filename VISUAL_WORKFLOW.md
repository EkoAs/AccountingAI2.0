# 📊 Visual Workflow - Diagram & Penjelasan

Dokumentasi ini berisi visual diagram untuk memahami cara kerja sistem.

---

## 🎬 Workflow Transaksi Lengkap

### Fase 1: Input & Processing

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT                               │
│                                                             │
│  Input Field:                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ pulpen 3000 45 2025-01-02                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Status: Ready                                              │
│  [Undo] [Redo] [Done]                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓ (Press Enter)
┌─────────────────────────────────────────────────────────────┐
│                    PARSING                                  │
│                                                             │
│  Input: "pulpen 3000 45 2025-01-02"                        │
│  ↓                                                          │
│  description: "pulpen"                                      │
│  amount: 3000                                               │
│  quantity: 45                                               │
│  date: "2025-01-02"                                         │
│  totalAmount: 135000                                        │
│                                                             │
│  Status: Processing...                                      │
│  [Loading Spinner]                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    GEMINI AI                                │
│                                                             │
│  Request:                                                   │
│  {                                                          │
│    description: "pulpen",                                   │
│    amount: 3000,                                            │
│    quantity: 45,                                            │
│    date: "2025-01-02"                                       │
│  }                                                          │
│                                                             │
│  ↓ (AI Processing)                                          │
│                                                             │
│  Response:                                                  │
│  {                                                          │
│    accountCode: "1500",                                     │
│    accountName: "Supplies",                                 │
│    accountType: "Asset",                                    │
│    debitCredit: "debit",                                    │
│    confidence: 0.95,                                        │
│    reasoning: "Pulpen adalah stationery..."                 │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

### Fase 2: Classification Display

```
┌─────────────────────────────────────────────────────────────┐
│                    AI CLASSIFICATION                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AI Classification                    [95% Confidence]   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Account:        Supplies                            │   │
│  │ Type:           Asset                               │   │
│  │ Debit/Credit:   Debit                               │   │
│  │ Total Amount:   Rp 135,000                          │   │
│  │ Reasoning:      Pulpen adalah stationery item...    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [Adjust]                    [Confirm]               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Status: Ready for confirmation                             │
└─────────────────────────────────────────────────────────────┘
                          ↓ (Click Confirm)
```

---

### Fase 3: Save & Update

```
┌─────────────────────────────────────────────────────────────┐
│                    SAVE TRANSACTION                         │
│                                                             │
│  Transaction Object:                                        │
│  {                                                          │
│    id: "txn_001",                                           │
│    date: "2025-01-02",                                      │
│    description: "pulpen",                                   │
│    amount: 3000,                                            │
│    quantity: 45,                                            │
│    totalAmount: 135000,                                     │
│    account: "Supplies",                                     │
│    accountCode: "1500",                                     │
│    debitAmount: 135000,                                     │
│    creditAmount: 0,                                         │
│    status: "confirmed"                                      │
│  }                                                          │
│                                                             │
│  ↓ (Save to localStorage)                                   │
│                                                             │
│  ✓ Transaction Saved                                        │
│  ✓ Undo Stack Updated                                       │
│  ✓ Report Generated                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
```

---

### Fase 4: Display Update

```
┌─────────────────────────────────────────────────────────────┐
│                    REPORT UPDATE                            │
│                                                             │
│  LEFT PANEL                    │  RIGHT PANEL              │
│  ┌──────────────────────────┐  │  ┌──────────────────────┐ │
│  │ Input Field (CLEARED)    │  │  │ Trial Balance        │ │
│  │ ┌────────────────────┐   │  │  ├──────────────────────┤ │
│  │ │ [Ready for input]  │   │  │  │ Total Debits: 135k   │ │
│  │ └────────────────────┘   │  │  │ Total Credits: 0     │ │
│  │                          │  │  │ Status: Unbalanced   │ │
│  │ Status: Ready ✓          │  │  ├──────────────────────┤ │
│  │ [Undo] [Redo] [Done]     │  │  │ Account | Debit|Cred │ │
│  │                          │  │  ├──────────────────────┤ │
│  │ Success Message:         │  │  │ 1500    | 135k | 0   │ │
│  │ ✓ Transaction added      │  │  │ Supplies            │ │
│  │                          │  │  └──────────────────────┘ │
│  └──────────────────────────┘  │                           │
│                                │  [Generate PDF]           │
└─────────────────────────────────────────────────────────────┘
                          ↓
```

---

### Fase 5: Ready untuk Transaksi Berikutnya

```
┌─────────────────────────────────────────────────────────────┐
│                    READY FOR NEXT                           │
│                                                             │
│  Input Field: CLEARED & FOCUSED                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ |                                                   │   │
│  │ (Cursor blinking, ready for input)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Status: Ready                                              │
│  [Undo] [Redo] [Done]                                       │
│                                                             │
│  User bisa input transaksi berikutnya...                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Multi-Transaksi Workflow

```
TRANSAKSI 1: Pulpen
┌─────────────────────────────────────────────────────────────┐
│ Input: "pulpen 3000 45 2025-01-02"                          │
│ ↓ Parse → Classify → Confirm → Save → Update → Clear       │
│ Report: 1 row (Supplies: Debit 135k)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
TRANSAKSI 2: Kertas
┌─────────────────────────────────────────────────────────────┐
│ Input: "kertas 5000 100 2025-01-03"                         │
│ ↓ Parse → Classify → Confirm → Save → Update → Clear       │
│ Report: 2 rows (Supplies: Debit 635k)                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
TRANSAKSI 3: Penjualan
┌─────────────────────────────────────────────────────────────┐
│ Input: "penjualan 50000 10 2025-01-05"                      │
│ ↓ Parse → Classify → Confirm → Save → Update → Clear       │
│ Report: 3 rows (Supplies: Debit 635k, Revenue: Credit 500k) │
└─────────────────────────────────────────────────────────────┘
                          ↓
TRANSAKSI 4: Gaji
┌─────────────────────────────────────────────────────────────┐
│ Input: "gaji 2000000 1 2025-01-10"                          │
│ ↓ Parse → Classify → Confirm → Save → Update → Clear       │
│ Report: 4 rows (+ Salaries: Debit 2M)                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
... (Continue dengan transaksi lainnya)
```

---

## 🔄 State Changes

### Input State
```
BEFORE INPUT:
- Input field: empty
- Classification: hidden
- Status: Ready
- Undo/Redo: disabled

AFTER INPUT (Press Enter):
- Input field: disabled
- Loading: visible
- Status: Processing...
- Undo/Redo: disabled

AFTER AI RESPONSE:
- Input field: disabled
- Classification: visible
- Status: Ready for confirmation
- Undo/Redo: disabled

AFTER CONFIRM:
- Input field: cleared & focused
- Classification: hidden
- Status: Ready
- Undo/Redo: enabled (if applicable)
```

---

## 📊 Report Update Flow

```
BEFORE CONFIRM:
┌─────────────────────────────────────────────────────────────┐
│ Trial Balance                                               │
├─────────────────────────────────────────────────────────────┤
│ Account Code | Account Name | Debit | Credit               │
├─────────────────────────────────────────────────────────────┤
│ (empty)                                                     │
│                                                             │
│ Total Debits: 0                                             │
│ Total Credits: 0                                            │
│ Status: Balanced ✓                                          │
└─────────────────────────────────────────────────────────────┘

AFTER CONFIRM TRANSAKSI 1:
┌─────────────────────────────────────────────────────────────┐
│ Trial Balance                                               │
├─────────────────────────────────────────────────────────────┤
│ Account Code | Account Name | Debit | Credit               │
├─────────────────────────────────────────────────────────────┤
│ 1500         | Supplies    | 135k  | -                     │
│                                                             │
│ Total Debits: 135k                                          │
│ Total Credits: 0                                            │
│ Status: Unbalanced ✗                                        │
└─────────────────────────────────────────────────────────────┘

AFTER CONFIRM TRANSAKSI 2:
┌─────────────────────────────────────────────────────────────┐
│ Trial Balance                                               │
├─────────────────────────────────────────────────────────────┤
│ Account Code | Account Name | Debit | Credit               │
├─────────────────────────────────────────────────────────────┤
│ 1500         | Supplies    | 635k  | -                     │
│                                                             │
│ Total Debits: 635k                                          │
│ Total Credits: 0                                            │
│ Status: Unbalanced ✗                                        │
└─────────────────────────────────────────────────────────────┘

AFTER CONFIRM TRANSAKSI 3 (Revenue):
┌─────────────────────────────────────────────────────────────┐
│ Trial Balance                                               │
├─────────────────────────────────────────────────────────────┤
│ Account Code | Account Name | Debit | Credit               │
├─────────────────────────────────────────────────────────────┤
│ 1500         | Supplies    | 635k  | -                     │
│ 4000         | Sales Rev   | -     | 500k                  │
│                                                             │
│ Total Debits: 635k                                          │
│ Total Credits: 500k                                         │
│ Status: Unbalanced ✗                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ⏱️ Timeline

```
T=0s:     User input "pulpen 3000 45 2025-01-02"
T=0.1s:   Press Enter
T=0.2s:   Loading indicator muncul
T=0.3s:   Request sent to Gemini
T=1-2s:   Gemini processing
T=2.5s:   Response received
T=2.6s:   Classification display muncul
T=2.7s:   User review classification
T=3s:     User click "Confirm"
T=3.1s:   Transaction saved
T=3.2s:   Report updated
T=3.3s:   Input cleared
T=3.4s:   Ready for next input
```

---

## 🎯 Key Interactions

### Input → Confirm → Update → Clear

```
┌──────────────┐
│ User Input   │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│ Parse & Validate     │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Send to Gemini AI    │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Display Classification
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ User Confirm         │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Save to localStorage │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Update Report        │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Clear Input          │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Ready for Next       │
└──────────────────────┘
```

---

## 💾 Data Flow

```
User Input
    ↓
┌─────────────────────────────────────────┐
│ Frontend (UI Manager)                   │
│ - Parse input                           │
│ - Display classification                │
│ - Handle user interaction               │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Backend (App Controller)                │
│ - Process transaction                   │
│ - Calculate debit/credit                │
│ - Validate accounting equation          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Storage (localStorage)                  │
│ - Save transaction                      │
│ - Persist data                          │
│ - Maintain history                      │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Report Generator                        │
│ - Generate report                       │
│ - Calculate totals                      │
│ - Format for display                    │
└─────────────────────────────────────────┘
    ↓
Display Update
```

---

## ✅ Checklist Workflow

- [ ] User input transaksi
- [ ] Tekan Enter
- [ ] Loading indicator muncul
- [ ] Gemini AI classify
- [ ] Classification display muncul
- [ ] User review
- [ ] User click "Confirm"
- [ ] Transaction saved
- [ ] Report updated
- [ ] Input cleared
- [ ] Ready untuk transaksi berikutnya

---

**Workflow sistem berjalan smooth dan otomatis! 🎉**
