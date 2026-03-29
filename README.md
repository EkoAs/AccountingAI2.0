# Accounting Ledger System - By Eko Asif

Sistem buku besar akuntansi otomatis berbasis web dengan klasifikasi AI (Gemini). Masukkan transaksi dalam format natural language, sistem otomatis mengklasifikasi ke akun yang tepat sesuai standar PSAK, lalu menampilkan laporan akuntansi real-time.

Mendukung **perusahaan jasa** maupun **perusahaan dagang**.

## Fitur Utama

- Input Natural Language — Format: `nama_item harga_satuan kuantitas tanggal`
- AI Double-Entry — Setiap transaksi otomatis menghasilkan 2 baris jurnal (Debit + Kredit)
- 4 Jenis Laporan — General Journal, General Ledger, Trial Balance, Reversing Journal
- Standar PSAK — Saldo normal per kelompok akun, persamaan akuntansi A = L + E
- PDF Export — Download laporan profesional
- Undo/Redo — Batalkan atau ulangi transaksi
- Responsive — Optimal di HP, tablet, dan laptop

## Quick Start

1. Buka `index.html` di browser (atau gunakan Live Server di `127.0.0.1:5500`)
2. Isi nama perusahaan, judul laporan, nama penyusun
3. Klik **Mulai Sekarang**
4. Masukkan transaksi di input field, tekan Enter
5. Review klasifikasi AI → klik **Confirm**

### Setup Gemini API Key (Opsional)
```javascript
// Di browser console:
localStorage.setItem('gemini_api_key', 'your_api_key_here');
```
Tanpa API key, sistem menggunakan klasifikasi lokal berbasis aturan PSAK.

## Struktur Proyek

```
accounting-ledger-system/
├── index.html
├── css/
│   ├── theme.css          # Variabel warna & tipografi
│   ├── styles.css         # Layout & komponen
│   └── responsive.css     # Breakpoint mobile/tablet/desktop
├── js/
│   ├── modules/
│   │   ├── storage.js     # localStorage management
│   │   ├── auth.js        # Chart of accounts & profil
│   │   ├── transaction.js # Parse & simpan transaksi
│   │   ├── accounting.js  # Kalkulasi double-entry & PSAK
│   │   ├── ai-classifier.js # Gemini AI + fallback lokal
│   │   ├── report-generator.js # Generate 4 jenis laporan
│   │   └── pdf-generator.js    # Export PDF
│   ├── app.js             # Controller utama
│   ├── ui.js              # UI manager
│   └── main.js            # Event handlers
└── README.md
```

## Aturan Saldo Normal (PSAK)

| Kelompok | Kode | Bertambah | Berkurang | Saldo Normal |
|----------|------|-----------|-----------|--------------|
| Aset | 1xxx | Debit | Kredit | Debit |
| Liabilitas | 2xxx | Kredit | Debit | Kredit |
| Ekuitas | 3xxx | Kredit | Debit | Kredit |
| Pendapatan | 4xxx | Kredit | Debit | Kredit |
| Beban/HPP | 5xxx | Debit | Kredit | Debit |

## Pola AI Classifier — Perusahaan Dagang

| Kata Kunci Input | Debit | Kredit | Keterangan |
|-----------------|-------|--------|------------|
| `pembelian_kredit`, `syarat_kredit`, `n/30`, `2/15` | Pembelian (5010) | Utang Dagang (2000) | Beli barang dagangan kredit |
| `pembelian_tunai`, `beli_tunai` | Pembelian (5010) | Kas (1000) | Beli barang dagangan tunai |
| `retur_pembelian`, `retur_beli` | Utang Dagang (2000) | Retur Pembelian (5020) | Kembalikan barang ke supplier |
| `potongan_pembelian` | Utang Dagang (2000) | Potongan Pembelian (5030) | Diskon dari supplier |
| `beban_angkut_pembelian`, `ongkir_beli` | Beban Angkut Pembelian (5040) | Kas (1000) | Ongkos angkut masuk |
| `penjualan_kredit`, `jual_kredit` | Piutang Dagang (1100) | Penjualan (4000) | Jual barang kredit |
| `penjualan_tunai`, `jual_tunai` | Kas (1000) | Penjualan (4000) | Jual barang tunai |
| `retur_penjualan`, `retur_jual` | Retur Penjualan (4100) | Piutang Dagang (1100) | Barang dikembalikan pembeli |
| `potongan_penjualan`, `diskon_jual` | Potongan Penjualan (4200) | Piutang Dagang (1100) | Diskon ke pembeli |
| `beban_angkut_penjualan`, `ongkir`, `kirim_barang` | Beban Angkut Penjualan (5750) | Kas (1000) | Ongkos kirim ke pembeli |
| `penerimaan_piutang`, `terima_pelunasan` | Kas (1000) | Piutang Dagang (1100) | Terima pembayaran dari pembeli |
| `bayar_utang_dagang`, `lunasi_utang` | Utang Dagang (2000) | Kas (1000) | Bayar ke supplier |
| `beban_iklan`, `iklan`, `reklame` | Beban Iklan (5710) | Kas (1000) | Biaya iklan/promosi |

## Pola AI Classifier — Perusahaan Jasa & Umum

| Kata Kunci Input | Debit | Kredit | Keterangan |
|-----------------|-------|--------|------------|
| `modal`, `investor`, `setoran` | Kas (1000) | Modal Pemilik (3000) | Uang masuk dari pemilik/investor = Ekuitas |
| `prive`, `penarikan` | Prive (3100) | Kas (1000) | Penarikan pemilik |
| `pendapatan`, `jasa` | Kas (1000) | Penjualan (4000) | Pendapatan jasa tunai |
| `piutang`, `jasa_kredit` | Piutang Dagang (1100) | Penjualan (4000) | Jasa belum dibayar klien |
| `gaji`, `upah` | Beban Gaji (5100) | Kas (1000) | Bayar gaji tunai |
| `sewa` | Beban Sewa (5200) | Kas (1000) | Bayar sewa tunai |
| `listrik`, `air`, `wifi` | Beban Listrik (5300) | Kas (1000) | Bayar utilitas tunai |
| `perlengkapan`, `atk`, `pulpen` | Beban Perlengkapan (5400) | Kas (1000) | Beli tunai |
| `perlengkapan_belum_dibayar`, `atk_kredit` | Beban Perlengkapan (5400) | Utang Dagang (2000) | Belum dibayar = Utang, bukan Kas |
| `peralatan_belum_dibayar` | Peralatan (1800) | Utang Dagang (2000) | Beli peralatan kredit |
| `komputer`, `laptop`, `peralatan` | Peralatan (1800) | Kas (1000) | Beli peralatan tunai |
| `pinjaman`, `loan` | Kas (1000) | Utang Bank (2100) | Pinjaman masuk |

> Catatan penting:
> - `investor` / `modal` → Ekuitas (3000), BUKAN Beban. Uang dari investor menambah modal.
> - `belum_dibayar` → Utang Dagang (2000), BUKAN Kas. Jika belum dibayar, kas tidak berkurang.
> - Syarat kredit seperti `2/15, n/30` → pembelian kredit, bukan tunai.

## Contoh Input — PT. Karya Usaha (Perusahaan Dagang)

```
modal_awal 50000000 1 2025-01-01
pembelian_kredit 10000000 1 2025-01-05
penjualan_kredit 15000000 1 2025-01-10
penjualan_tunai 5000000 1 2025-01-12
retur_penjualan 500000 1 2025-01-14
beban_angkut_penjualan 200000 1 2025-01-15
beban_iklan 300000 1 2025-01-20
bayar_utang_dagang 10000000 1 2025-01-25
penerimaan_piutang 14500000 1 2025-01-28
```

## Contoh Input — Perusahaan Jasa

```
modal_awal 50000000 1 2025-01-01
gaji 3000000 1 2025-01-05
sewa 1500000 1 2025-01-05
perlengkapan_belum_dibayar 500000 1 2025-01-10
pendapatan_jasa 5000000 1 2025-01-15
investor 10000000 1 2025-01-20
```

## Responsive Design

- Desktop (≥1024px): Layout 2 kolom — input panel kiri (340px), laporan kanan
- Tablet (768–1023px): Layout 1 kolom, stacked
- Mobile (<768px): Layout 1 kolom, tombol full-width, tabel scroll horizontal

## Tema

- Background: `#1c1c1c` (abu-abu gelap)
- Panel: `#2e2e2e` (charcoal)
- Silver: `#c0c0c0`
- Success: `#4ade80` | Warning: `#fb923c` | Error: `#ef4444`

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Tombol Mulai tidak bisa diklik | Pastikan nama perusahaan diisi |
| Transaksi tidak balance | Setiap input menghasilkan 2 baris otomatis — cek apakah ada transaksi lama dari sesi sebelumnya |
| AI salah klasifikasi | Gunakan keyword spesifik seperti `pembelian_kredit`, `penjualan_tunai`, `perlengkapan_belum_dibayar` |
| PDF tidak generate | Pastikan status "✓ Balanced" sebelum generate PDF |
| Data hilang setelah update | Chart of accounts diperbarui — klik Reset All Data lalu input ulang transaksi |
| Data hilang | Data tersimpan di localStorage browser — jangan clear browser data |

## Author

**Eko Asif** — Accounting By Eko Asif
