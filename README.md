# 📒 Accounting Ledger System — By Eko Asif

> Sistem buku besar akuntansi otomatis berbasis web dengan klasifikasi AI (Gemini).  
> Input transaksi dalam format natural language → AI klasifikasi otomatis → laporan akuntansi real-time.

Mendukung **perusahaan jasa** maupun **perusahaan dagang** sesuai standar **PSAK Indonesia**.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|-------|------------|
| 🤖 AI Double-Entry | Setiap input otomatis menghasilkan 2 baris jurnal (Debit + Kredit) via Gemini AI |
| 📝 Natural Language Input | Format: `nama_item harga_satuan kuantitas tanggal` |
| 📊 8 Mode Laporan | Jurnal Umum, Buku Besar, Neraca Saldo, Jurnal Pembalik, Jurnal Penyesuaian, Neraca Saldo Disesuaikan, Laporan Keuangan, Jurnal Penutup |
| 📄 PDF Export | Laporan A4, font Times New Roman, siap cetak |
| ⚖️ Auto Balance Check | Validasi persamaan akuntansi A = L + E secara real-time |
| ↩️ Undo / Redo | Batalkan atau ulangi transaksi kapan saja |
| 🔒 Period Lock | Jurnal penutup mengunci periode agar tidak ada input baru |
| 📱 Responsive | Optimal di HP, tablet, dan laptop |

---

## 🚀 Quick Start

```bash
# 1. Clone atau download repo
# 2. Buka index.html di browser (atau Live Server)
http://127.0.0.1:5500/index.html
```

**Langkah penggunaan:**
1. Isi nama perusahaan, judul laporan, nama penyusun → klik **Mulai Sekarang**
2. Ketik transaksi di input field → tekan **Enter**
3. Review klasifikasi AI → klik **Confirm**
4. Pilih jenis laporan dari dropdown → klik **Generate PDF**

### Setup Gemini API Key (Opsional)
```javascript
// Di browser console (F12):
localStorage.setItem('gemini_api_key', 'YOUR_API_KEY_HERE');
```
> Tanpa API key, sistem menggunakan klasifikasi lokal berbasis aturan PSAK (fallback mode).

---

## 📋 8 Mode Laporan

```
Mode 1 — Jurnal Umum (General Journal)
         Catatan kronologis semua transaksi double-entry

Mode 2 — Buku Besar (General Ledger)
         Detail per akun dengan running balance

Mode 3 — Neraca Saldo (Trial Balance)
         Verifikasi Total Debit = Total Kredit

Mode 4 — Jurnal Pembalik (Reversing Journal)
         Pembalik otomatis akun akrual (2200, 1650, 1300, 1400)

Mode 5 — Jurnal Penyesuaian (Adjusting Entries)
          Penyusutan, pemakaian perlengkapan, prepaid, accrued, unearned

Mode 6 — Neraca Saldo Disesuaikan (Adjusted Trial Balance)
         Saldo setelah jurnal penyesuaian

Mode 7 — Laporan Keuangan (Financial Statements)
         Laba Rugi + Perubahan Ekuitas + Neraca (A = L + E)

Mode 8 — Jurnal Penutup (Closing Journal)
         Tutup akun nominal (4xxx, 5xxx) → Modal, kunci periode
```

---

## 📁 Struktur Proyek

```
accounting-ledger-system/
├── index.html                        # Entry point aplikasi
├── css/
│   ├── theme.css                     # Variabel warna & tipografi
│   ├── styles.css                    # Layout & komponen UI
│   └── responsive.css                # Breakpoint mobile/tablet/desktop
├── js/
│   ├── modules/
│   │   ├── storage.js                # localStorage management
│   │   ├── auth.js                   # Chart of accounts & profil user
│   │   ├── transaction.js            # Parse & simpan transaksi
│   │   ├── accounting.js             # Kalkulasi double-entry & pola PSAK
│   │   ├── ai-classifier.js          # Gemini AI + fallback lokal
│   │   ├── auto-balancer.js          # Saran offset transaksi
│   │   ├── report-generator.js       # Dispatcher ke per-mode report
│   │   ├── pdf-generator.js          # Export PDF (dispatcher + primitives)
│   │   └── reports/
│   │       ├── general-journal.js    # Mode 1
│   │       ├── general-ledger.js     # Mode 2
│   │       ├── trial-balance.js      # Mode 3
│   │       ├── reversing-journal.js  # Mode 4
│   │       ├── adjusting-entries.js  # Mode 5
│   │       ├── adjusted-trial-balance.js  # Mode 6
│   │       ├── financial-statements.js    # Mode 7
│   │       └── closing-journal.js    # Mode 8
│   ├── app.js                        # Controller utama & state management
│   ├── ui.js                         # UI manager & DOM manipulation
│   └── main.js                       # Event handlers
└── PANDUAN USER/
    └── BUKU_PANDUAN_LENGKAP.md       # Dokumentasi lengkap
```

---

## 📊 Chart of Accounts (PSAK Indonesia)

### Aset (1xxx)
| Kode | Nama | Kategori |
|------|------|----------|
| 1000 | Kas | Aset Lancar |
| 1010 | Bank | Aset Lancar |
| 1100 | Piutang Dagang | Aset Lancar |
| 1200 | Persediaan Barang Dagangan | Aset Lancar |
| 1300 | Sewa Dibayar di Muka | Aset Lancar |
| 1400 | Asuransi Dibayar di Muka | Aset Lancar |
| 1500 | Perlengkapan | Aset Lancar |
| 1600 | Beban Dibayar Dimuka | Aset Lancar |
| 1650 | Piutang Pendapatan | Aset Lancar |
| 1800 | Peralatan | Aset Tetap |
| 1810 | Akumulasi Penyusutan Peralatan | Aset Tetap |

### Liabilitas (2xxx) · Ekuitas (3xxx) · Pendapatan (4xxx) · Beban (5xxx)
| Kode | Nama |
|------|------|
| 2000 | Utang Dagang |
| 2100 | Utang Bank |
| 2200 | Beban Yang Masih Harus Dibayar |
| 2300 | Pendapatan Diterima Dimuka |
| 3000 | Modal Pemilik |
| 3100 | Prive |
| 4000 | Penjualan / Pendapatan Jasa |
| 5100 | Beban Gaji · 5200 Beban Sewa · 5300 Beban Listrik |
| 5500 | Beban Penyusutan · 5710 Beban Iklan · 5750 Beban Angkut Penjualan |

---

## ⌨️ Pola Input & Keyword AI

### Format Input
```
nama_keyword  harga_satuan  kuantitas  YYYY-MM-DD
```

### Perusahaan Dagang
| Keyword | Debit | Kredit |
|---------|-------|--------|
| `pembelian_kredit`, `n/30`, `2/15` | Pembelian (5010) | Utang Dagang (2000) |
| `pembelian_tunai` | Pembelian (5010) | Kas (1000) |
| `penjualan_kredit` | Piutang Dagang (1100) | Penjualan (4000) |
| `penjualan_tunai` | Kas (1000) | Penjualan (4000) |
| `retur_penjualan` | Retur Penjualan (4100) | Piutang Dagang (1100) |
| `penerimaan_piutang` | Kas (1000) | Piutang Dagang (1100) |
| `bayar_utang_dagang` | Utang Dagang (2000) | Kas (1000) |

### Perusahaan Jasa & Umum
| Keyword | Debit | Kredit |
|---------|-------|--------|
| `modal_awal`, `investor` | Kas (1000) | Modal Pemilik (3000) |
| `prive`, `penarikan` | Prive (3100) | Kas (1000) |
| `gaji`, `upah` | Beban Gaji (5100) | Kas (1000) |
| `sewa` | Beban Sewa (5200) | Kas (1000) |
| `perlengkapan_belum_dibayar` | Perlengkapan (1500) | Utang Dagang (2000) |
| `pinjaman`, `loan` | Kas (1000) | Utang Bank (2100) |

### Jurnal Penyesuaian (Mode 5)
| Keyword | Debit | Kredit |
|---------|-------|--------|
| `penyusutan`, `depresiasi` | Beban Penyusutan (5500) | Akum. Penyusutan (1810) |
| `pemakaian_perlengkapan` | Beban Perlengkapan (5400) | Perlengkapan (1500) |
| `utang_gaji`, `gaji_terutang` | Beban Gaji (5100) | Beban Masih Harus Dibayar (2200) |
| `utang_pendapatan`, `pendapatan_belum_diterima` | Piutang Pendapatan (1650) | Penjualan (4000) |
| `sewa_jatuh_tempo` | Beban Sewa (5200) | Sewa Dibayar di Muka (1300) |
| `pendapatan_diakui`, `jasa_selesai` | Pendapatan Diterima Dimuka (2300) | Penjualan (4000) |

---

## 🔄 Alur Kerja Lengkap

```
Input Transaksi (natural language)
        ↓
Parse & Validasi Format
        ↓
Gemini AI Klasifikasi → Fallback lokal jika gagal
        ↓
Tampilkan: Akun Debit | Akun Kredit | Confidence
        ↓
User klik [Confirm]
        ↓
Simpan ke localStorage (double-entry)
        ↓
Update laporan real-time
        ↓
Generate PDF (A4, Times New Roman)
```

---

## 🎨 Tema Visual

| Elemen | Warna | Kode |
|--------|-------|------|
| Background | Abu-abu gelap | `#1c1c1c` |
| Panel | Charcoal | `#2e2e2e` |
| Teks | Silver | `#c0c0c0` |
| Balance ✓ | Hijau | `#4ade80` |
| Warning | Oranye | `#fb923c` |
| Error | Merah | `#ef4444` |

---

## 🛠️ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Tombol Mulai tidak aktif | Isi nama perusahaan terlebih dahulu |
| AI salah klasifikasi | Gunakan keyword spesifik: `pembelian_kredit`, `utang_gaji`, `penyusutan` |
| PDF tidak bisa di-generate | Mode Jurnal Umum & Neraca Saldo butuh status ✓ Balanced. Mode lain bisa langsung cetak. |
| Data hilang setelah update | Klik **Reset All Data** lalu input ulang transaksi |
| Jurnal pembalik kosong | Input transaksi akrual dulu: `utang_gaji`, `utang_pendapatan`, `sewa_jatuh_tempo` |
| Periode terkunci | Jurnal penutup sudah dieksekusi. Klik **Reset All Data** untuk periode baru. |
| Data hilang | Data di localStorage browser — jangan clear browser cache |

---

## 📖 Dokumentasi Lengkap

Lihat [`PANDUAN USER/BUKU_PANDUAN_LENGKAP.md`](PANDUAN%20USER/BUKU_PANDUAN_LENGKAP.md) untuk:
- Contoh kasus nyata (perusahaan dagang, jasa, klinik)
- Tabel jurnal lengkap dengan angka riil
- Panduan jurnal penutup 4 tahap
- FAQ & troubleshooting detail

---

## 👤 Author

**Eko Asif** — Accounting By Eko Asif  
Standar: PSAK (Pernyataan Standar Akuntansi Keuangan) Indonesia
