# BUKU PANDUAN LENGKAP
# Sistem Buku Besar Akuntansi Otomatis
# Accounting Ledger System — By Eko Asif

---

## DAFTAR ISI

| Bab | Judul | Halaman |
|-----|-------|---------|
| 1 | Pengenalan Sistem | 3 |
| 2 | Cara Memulai (Quick Start) | 5 |
| 3 | Standar Akuntansi & Chart of Accounts | 8 |
| 4 | Panduan Input Transaksi | 14 |
| 5 | Klasifikasi AI & Pola Double-Entry | 18 |
| 6 | Laporan Akuntansi | 28 |
| 7 | Contoh Kasus Nyata — Perusahaan Dagang | 36 |
| 8 | Contoh Kasus Nyata — Perusahaan Jasa | 48 |
| 9 | Contoh Kasus Nyata — Klinik Kesehatan | 56 |
| 10 | Export PDF & Manajemen Data | 64 |
| 11 | Arsitektur & Struktur Sistem | 68 |
| 12 | Troubleshooting & FAQ | 74 |
| 13 | Referensi Cepat (Cheat Sheet) | 80 |
| 14 | Jurnal Penutup (Closing Entries) | 86 |

---

---

## BAB 1 — PENGENALAN SISTEM

### 1.1 Tentang Sistem

Accounting Ledger System adalah aplikasi buku besar akuntansi berbasis web yang menggunakan kecerdasan buatan (Gemini AI) untuk mengklasifikasikan transaksi secara otomatis. Pengguna cukup mengetik transaksi dalam format natural language, dan sistem akan:

- Mengklasifikasikan transaksi ke akun yang tepat sesuai standar PSAK
- Menghasilkan jurnal double-entry secara otomatis
- Menampilkan laporan akuntansi secara real-time
- Memvalidasi persamaan akuntansi (Assets = Liabilities + Equity)

### 1.2 Fitur Utama

| Fitur | Keterangan |
|-------|------------|
| Input Natural Language | Format: `nama_item harga_satuan kuantitas tanggal` |
| AI Double-Entry | Setiap transaksi otomatis menghasilkan 2 baris jurnal |
| 4 Jenis Laporan | General Journal, General Ledger, Trial Balance, Reversing Journal |
| Standar PSAK | Saldo normal per kelompok akun, persamaan A = L + E |
| PDF Export | Download laporan A4, font Times New Roman, siap cetak |
| Undo/Redo | Batalkan atau ulangi transaksi |
| Responsive | Optimal di HP, tablet, dan laptop |
| Multi-User | Data terpisah per pengguna |

### 1.3 Jenis Perusahaan yang Didukung

```
┌─────────────────────────────────────────────────────────┐
│  PERUSAHAAN JASA          │  PERUSAHAAN DAGANG          │
│  ─────────────────────    │  ─────────────────────────  │
│  • Klinik / Dokter        │  • Toko Elektronik          │
│  • Konsultan              │  • Distributor              │
│  • Salon / Barbershop     │  • Minimarket               │
│  • Bengkel                │  • Toko Online              │
│  • Kantor Jasa            │  • Grosir / Retail          │
└─────────────────────────────────────────────────────────┘
```

### 1.4 Diagram Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│   Panel Kiri (Input)          │   Panel Kanan (Laporan)      │
│   ┌────────────────────────┐  │  ┌────────────────────────┐  │
│   │ 1. Input Transaksi     │  │  │ 4. Tampilan Laporan    │  │
│   │ 2. Klasifikasi AI      │  │  │ 5. Update Real-time    │  │
│   │ 3. Konfirmasi          │  │  │ 6. Statistik Ringkasan │  │
│   └────────────────────────┘  │  └────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                    ↓                        ↑
┌──────────────────────────────────────────────────────────────┐
│                     LOGIKA BACKEND                           │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│   │ Transaction │  │ Accounting  │  │  Report Generator   │ │
│   │  Manager    │  │ Calculator  │  │  (4 Jenis Laporan)  │ │
│   └─────────────┘  └─────────────┘  └─────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────────┐
│                    PENYIMPANAN DATA                          │
│   localStorage (Persisten)  │  Session  │  Cache (Temp)      │
└──────────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────────┐
│                   LAYANAN EKSTERNAL                          │
│              Gemini AI API (Klasifikasi Transaksi)           │
└──────────────────────────────────────────────────────────────┘
```

---

---

## BAB 2 — CARA MEMULAI (QUICK START)

### 2.1 Persyaratan

- Browser modern (Chrome, Firefox, Safari, Edge)
- Koneksi internet (untuk Gemini AI — opsional)
- Gemini API Key (opsional, sistem tetap berjalan tanpa API key)

### 2.2 Langkah Pertama

**Step 1 — Buka Aplikasi**
```
Buka file index.html di browser
atau gunakan Live Server: http://127.0.0.1:5500
```

**Step 2 — Isi Profil Perusahaan**
```
┌─────────────────────────────────────────┐
│  Nama Perusahaan  : PT. Karya Usaha     │  ← WAJIB DIISI
│  Judul Laporan    : Laporan Jan 2025    │
│  Nama Penyusun    : Eko Asif            │
│                                         │
│           [ Mulai Sekarang ]            │
└─────────────────────────────────────────┘
```

**Step 3 — Setup API Key (Opsional)**
```javascript
// Ketik di browser console (F12):
localStorage.setItem('gemini_api_key', 'YOUR_API_KEY_HERE');
```
> Tanpa API key, sistem menggunakan klasifikasi lokal berbasis aturan PSAK.

**Step 4 — Input Transaksi**
```
Format: nama_item  harga_satuan  kuantitas  tanggal

Contoh: modal_awal 50000000 1 2025-01-01
        gaji 3000000 1 2025-01-05
        penjualan_tunai 5000000 1 2025-01-10
```

**Step 5 — Konfirmasi & Lihat Laporan**
```
1. Tekan Enter setelah input
2. Review klasifikasi AI yang muncul
3. Klik [Confirm] untuk menyimpan
4. Laporan di panel kanan otomatis update
```

### 2.3 Alur Kerja Lengkap

```
Input Transaksi
      ↓
Parse & Validasi Format
      ↓
Kirim ke Gemini AI
      ↓
Tampilkan Klasifikasi (Akun, Debit/Kredit, Confidence)
      ↓
User Review → [Adjust] atau [Confirm]
      ↓
Simpan ke localStorage
      ↓
Update Laporan Real-time
      ↓
Clear Input → Siap Transaksi Berikutnya
```

### 2.4 Timeline Proses

| Waktu | Kejadian |
|-------|----------|
| T+0.0s | User tekan Enter |
| T+0.2s | Loading indicator muncul |
| T+0.3s | Request dikirim ke Gemini |
| T+1-2s | Gemini memproses |
| T+2.5s | Klasifikasi ditampilkan |
| T+3.0s | User klik Confirm |
| T+3.1s | Transaksi tersimpan |
| T+3.2s | Laporan diperbarui |
| T+3.4s | Input di-clear, siap berikutnya |

---

---

## BAB 3 — STANDAR AKUNTANSI & CHART OF ACCOUNTS

### 3.1 Persamaan Dasar Akuntansi (PSAK)

```
╔══════════════════════════════════════════════════════╗
║                                                      ║
║        ASET  =  LIABILITAS  +  EKUITAS               ║
║                                                      ║
║   (Harta)      (Utang)        (Modal)                ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

Setiap transaksi HARUS menghasilkan **2 baris jurnal** (Debit + Kredit) dengan jumlah yang sama persis.

### 3.2 Aturan Saldo Normal

| Kelompok Akun | Kode | Bertambah | Berkurang | Saldo Normal |
|---------------|------|-----------|-----------|--------------|
| Aset (Harta) | 1xxx | **Debit** | Kredit | Debit |
| Liabilitas (Utang) | 2xxx | Kredit | **Debit** | Kredit |
| Ekuitas (Modal) | 3xxx | Kredit | **Debit** | Kredit |
| Pendapatan | 4xxx | Kredit | **Debit** | Kredit |
| Beban / HPP | 5xxx | **Debit** | Kredit | Debit |

### 3.3 Chart of Accounts Lengkap (PSAK Indonesia)

#### ASET (1000–1999)

| Kode | Nama Akun | Kategori | Saldo Normal |
|------|-----------|----------|--------------|
| 1000 | Kas | Aset Lancar | Debit |
| 1010 | Bank | Aset Lancar | Debit |
| 1100 | Piutang Dagang | Aset Lancar | Debit |
| 1200 | Persediaan Barang Dagangan | Aset Lancar | Debit |
| 1500 | Perlengkapan | Aset Lancar | Debit |
| 1600 | Beban Dibayar Dimuka | Aset Lancar | Debit |
| 1650 | Piutang Pendapatan | Aset Lancar | Debit |
| 1800 | Peralatan | Aset Tetap | Debit |
| 1810 | Akumulasi Penyusutan Peralatan | Aset Tetap | Kredit |

#### LIABILITAS (2000–2999)

| Kode | Nama Akun | Kategori | Saldo Normal |
|------|-----------|----------|--------------|
| 2000 | Utang Dagang | Liabilitas Lancar | Kredit |
| 2100 | Utang Bank | Liabilitas Lancar | Kredit |
| 2200 | Beban Yang Masih Harus Dibayar | Liabilitas Lancar | Kredit |
| 2300 | Pendapatan Diterima Dimuka | Liabilitas Lancar | Kredit |

#### EKUITAS (3000–3999)

| Kode | Nama Akun | Saldo Normal |
|------|-----------|--------------|
| 3000 | Modal Pemilik | Kredit |
| 3100 | Prive (Penarikan Pemilik) | Debit |

#### PENDAPATAN (4000–4999)

| Kode | Nama Akun | Kategori | Saldo Normal |
|------|-----------|----------|--------------|
| 4000 | Penjualan | Pendapatan Usaha | Kredit |
| 4100 | Retur Penjualan dan Potongan Harga | Pendapatan Usaha | Debit |
| 4200 | Potongan Penjualan | Pendapatan Usaha | Debit |
| 4900 | Pendapatan Lain-lain | Pendapatan Lain | Kredit |

#### BEBAN & HPP (5000–5999)

| Kode | Nama Akun | Kategori | Saldo Normal |
|------|-----------|----------|--------------|
| 5010 | Pembelian | Harga Pokok | Debit |
| 5020 | Retur Pembelian dan Potongan Harga | Harga Pokok | Kredit |
| 5030 | Potongan Pembelian | Harga Pokok | Kredit |
| 5040 | Beban Angkut Pembelian | Harga Pokok | Debit |
| 5100 | Beban Gaji | Beban Usaha | Debit |
| 5200 | Beban Sewa | Beban Usaha | Debit |
| 5300 | Beban Listrik dan Air | Beban Usaha | Debit |
| 5400 | Beban Perlengkapan | Beban Usaha | Debit |
| 5500 | Beban Penyusutan | Beban Usaha | Debit |
| 5600 | Beban Asuransi | Beban Usaha | Debit |
| 5700 | Beban Pemasaran | Beban Usaha | Debit |
| 5710 | Beban Iklan | Beban Usaha | Debit |
| 5750 | Beban Angkut Penjualan | Beban Usaha | Debit |
| 5800 | Beban Bunga | Beban Lain | Debit |
| 5900 | Beban Lain-lain | Beban Lain | Debit |

---

---

## BAB 4 — PANDUAN INPUT TRANSAKSI

### 4.1 Format Input

```
[nama_item]  [harga_satuan]  [kuantitas]  [tanggal]
```

| Komponen | Keterangan | Wajib? | Contoh |
|----------|------------|--------|--------|
| nama_item | Deskripsi transaksi (gunakan underscore untuk spasi) | Ya | `modal_awal` |
| harga_satuan | Harga per unit dalam Rupiah (tanpa titik/koma) | Ya | `50000000` |
| kuantitas | Jumlah unit | Ya | `1` |
| tanggal | Format YYYY-MM-DD, DD/MM/YYYY, atau DD-MM-YYYY | Tidak (default: hari ini) | `2025-01-01` |

### 4.2 Contoh Input Valid

```
modal_awal 50000000 1 2025-01-01
pembelian_kredit 10000000 1 2025-01-05
penjualan_tunai 5000000 1 2025-01-10
gaji 3000000 1 2025-01-05
sewa 1500000 1 2025-01-05
listrik 500000 1 2025-01-20
pulpen 3000 45 2025-01-02
komputer 8000000 1 2025-01-15
pinjaman 20000000 1 2025-01-25
prive 1000000 1 2025-01-30
```

### 4.3 Keyword Penting

> Gunakan keyword yang tepat agar AI mengklasifikasikan dengan benar.

| Keyword | Artinya | Contoh Input |
|---------|---------|--------------|
| `modal_awal` / `investor` / `setoran` | Setoran modal pemilik | `modal_awal 50000000 1` |
| `pembelian_kredit` / `syarat_kredit` / `n/30` | Beli barang dagangan kredit | `pembelian_kredit 10000000 1` |
| `pembelian_tunai` / `beli_tunai` | Beli barang dagangan tunai | `pembelian_tunai 5000000 1` |
| `penjualan_kredit` / `jual_kredit` | Jual barang kredit | `penjualan_kredit 15000000 1` |
| `penjualan_tunai` / `jual_tunai` | Jual barang tunai | `penjualan_tunai 5000000 1` |
| `perlengkapan_belum_dibayar` / `atk_kredit` | Beli perlengkapan kredit | `perlengkapan_belum_dibayar 500000 1` |
| `peralatan_belum_dibayar` | Beli peralatan kredit | `peralatan_belum_dibayar 8000000 1` |
| `bayar_utang_dagang` / `lunasi_utang` | Bayar utang ke supplier | `bayar_utang_dagang 10000000 1` |
| `penerimaan_piutang` / `terima_pelunasan` | Terima pembayaran dari pembeli | `penerimaan_piutang 14500000 1` |
| `prive` / `penarikan` | Penarikan pemilik | `prive 1000000 1` |

### 4.4 Peringatan Penting

```
⚠️  "investor" / "modal" → Ekuitas (3000), BUKAN Beban
⚠️  "belum_dibayar"      → Utang Dagang (2000), BUKAN Kas
⚠️  Syarat "2/15, n/30"  → Pembelian KREDIT, bukan tunai
⚠️  Perlengkapan (habis pakai) ≠ Peralatan (tahan lama)
```

### 4.5 Perbedaan Perlengkapan vs Peralatan

| Jenis | Kode | Contoh | Masa Pakai |
|-------|------|--------|------------|
| Perlengkapan (Supplies) | 5400 | Pulpen, kertas, tinta, stapler | < 1 tahun |
| Peralatan (Equipment) | 1800 | Komputer, printer, meja, kursi, AC | > 1 tahun |

---

---

## BAB 5 — KLASIFIKASI AI & POLA DOUBLE-ENTRY

### 5.1 Cara Kerja AI Classifier

```
Input User
    ↓
Cek Rate Limit & Cache
    ↓
Kirim ke Gemini API (jika tersedia)
    ↓ (jika gagal/timeout)
Fallback → Klasifikasi Lokal (keyword-based PSAK)
    ↓
Return: { accountCode, accountName, debitCredit, confidence, reasoning }
```

**Confidence Score:**
| Score | Arti |
|-------|------|
| 0.90 – 1.00 | Sangat yakin (exact keyword match) |
| 0.80 – 0.89 | Yakin (partial keyword match) |
| 0.30 – 0.79 | Kurang yakin (fallback lokal) |

### 5.2 Pola Double-Entry — Perusahaan Dagang

#### Pembelian Barang Dagangan

| Transaksi | Debit | Kredit | Kode D | Kode K |
|-----------|-------|--------|--------|--------|
| Pembelian kredit (`pembelian_kredit`, `n/30`, `2/15`) | Pembelian | Utang Dagang | 5010 | 2000 |
| Pembelian tunai (`pembelian_tunai`) | Pembelian | Kas | 5010 | 1000 |
| Beban angkut masuk (`beban_angkut_pembelian`) | Beban Angkut Pembelian | Kas | 5040 | 1000 |
| Retur pembelian (`retur_pembelian`) | Utang Dagang | Retur Pembelian | 2000 | 5020 |
| Potongan pembelian (`potongan_pembelian`) | Utang Dagang | Potongan Pembelian | 2000 | 5030 |
| Bayar utang dagang (`bayar_utang_dagang`) | Utang Dagang | Kas | 2000 | 1000 |

#### Penjualan Barang Dagangan

| Transaksi | Debit | Kredit | Kode D | Kode K |
|-----------|-------|--------|--------|--------|
| Penjualan kredit (`penjualan_kredit`) | Piutang Dagang | Penjualan | 1100 | 4000 |
| Penjualan tunai (`penjualan_tunai`) | Kas | Penjualan | 1000 | 4000 |
| Retur penjualan (`retur_penjualan`) | Retur Penjualan | Piutang Dagang | 4100 | 1100 |
| Potongan penjualan (`potongan_penjualan`) | Potongan Penjualan | Piutang Dagang | 4200 | 1100 |
| Beban angkut keluar (`beban_angkut_penjualan`) | Beban Angkut Penjualan | Kas | 5750 | 1000 |
| Terima pelunasan piutang (`penerimaan_piutang`) | Kas | Piutang Dagang | 1000 | 1100 |

### 5.3 Pola Double-Entry — Perusahaan Jasa & Umum

#### Modal & Ekuitas

| Transaksi | Debit | Kredit | Kode D | Kode K |
|-----------|-------|--------|--------|--------|
| Setoran modal (`modal_awal`, `investor`, `setoran`) | Kas | Modal Pemilik | 1000 | 3000 |
| Penarikan pemilik (`prive`, `penarikan`) | Prive | Kas | 3100 | 1000 |

#### Pendapatan Jasa

| Transaksi | Debit | Kredit | Kode D | Kode K |
|-----------|-------|--------|--------|--------|
| Jasa tunai (`pendapatan_jasa`, `jasa`) | Kas | Penjualan | 1000 | 4000 |
| Jasa kredit (`piutang`, `jasa_kredit`) | Piutang Dagang | Penjualan | 1100 | 4000 |

#### Pembelian Aset & Perlengkapan

| Transaksi | Debit | Kredit | Kode D | Kode K |
|-----------|-------|--------|--------|--------|
| Perlengkapan tunai (`pulpen`, `atk`, `kertas`) | Beban Perlengkapan | Kas | 5400 | 1000 |
| Perlengkapan kredit (`perlengkapan_belum_dibayar`) | Beban Perlengkapan | Utang Dagang | 5400 | 2000 |
| Peralatan tunai (`komputer`, `laptop`, `printer`) | Peralatan | Kas | 1800 | 1000 |
| Peralatan kredit (`peralatan_belum_dibayar`) | Peralatan | Utang Dagang | 1800 | 2000 |

#### Beban Operasional

| Transaksi | Debit | Kredit | Kode D | Kode K |
|-----------|-------|--------|--------|--------|
| Gaji (`gaji`, `upah`, `honor`) | Beban Gaji | Kas | 5100 | 1000 |
| Sewa (`sewa`, `rental`) | Beban Sewa | Kas | 5200 | 1000 |
| Listrik/Air/Internet (`listrik`, `air`, `wifi`, `pln`) | Beban Listrik dan Air | Kas | 5300 | 1000 |
| Iklan (`beban_iklan`, `iklan`, `reklame`) | Beban Iklan | Kas | 5710 | 1000 |
| Asuransi (`asuransi`, `premi`) | Beban Asuransi | Kas | 5600 | 1000 |
| Bunga (`bunga`, `interest`) | Beban Bunga | Kas | 5800 | 1000 |

#### Utang & Pinjaman

| Transaksi | Debit | Kredit | Kode D | Kode K |
|-----------|-------|--------|--------|--------|
| Pinjaman bank (`pinjaman`, `loan`) | Kas | Utang Bank | 1000 | 2100 |

---

---

## BAB 6 — LAPORAN AKUNTANSI

### 6.1 Jenis Laporan

| Laporan | Tujuan | Organisasi Data |
|---------|--------|-----------------|
| General Journal | Catatan kronologis semua transaksi | Urutan tanggal |
| General Ledger | Detail per akun dengan running balance | Per akun |
| Trial Balance | Verifikasi persamaan akuntansi | Per akun (ringkasan) |
| Reversing Journal | Pembalikan entri akrual (2200, 1650, 1300, 1400) | Urutan tanggal (terbalik) |
| Adjusting Entries | Jurnal penyesuaian akhir periode | Per tipe penyesuaian |
| Adjusted Trial Balance | Neraca saldo setelah penyesuaian | Per akun |
| Financial Statements | Laba Rugi + Perubahan Ekuitas + Neraca | 3 laporan terintegrasi |
| Closing Journal | Jurnal penutup + Neraca Saldo Setelah Penutupan | 4 tahap otomatis |

### 6.2 Cara Memilih Laporan

```
Panel Kanan → Dropdown "Jenis Laporan" → Pilih salah satu
Laporan otomatis diperbarui setiap kali transaksi dikonfirmasi
```

### 6.3 Format General Journal

```
JURNAL UMUM
PT. Karya Usaha
Periode: Januari 2025
Penyusun: Eko Asif
─────────────────────────────────────────────────────────────────
Tanggal   | Kode | Nama Akun              | Ref | Debit       | Kredit
─────────────────────────────────────────────────────────────────
01/01/25  | 1000 | Kas                    |     | 50.000.000  |
          | 3000 | Modal Pemilik          |     |             | 50.000.000
─────────────────────────────────────────────────────────────────
05/01/25  | 5010 | Pembelian              |     | 10.000.000  |
          | 2000 | Utang Dagang           |     |             | 10.000.000
─────────────────────────────────────────────────────────────────
          |      | TOTAL                  |     | 60.000.000  | 60.000.000
─────────────────────────────────────────────────────────────────
Status: ✅ BALANCED
```

### 6.4 Format General Ledger

```
BUKU BESAR
PT. Karya Usaha | Periode: Januari 2025
─────────────────────────────────────────────────────────────────
Akun: Kas (1000) | Kategori: Aset Lancar | Saldo Normal: Debit
─────────────────────────────────────────────────────────────────
Tanggal   | Keterangan          | Debit       | Kredit      | Saldo
─────────────────────────────────────────────────────────────────
01/01/25  | Modal awal          | 50.000.000  |             | 50.000.000
12/01/25  | Penjualan tunai     |  5.000.000  |             | 55.000.000
25/01/25  | Bayar utang dagang  |             | 10.000.000  | 45.000.000
28/01/25  | Terima piutang      | 14.500.000  |             | 59.500.000
─────────────────────────────────────────────────────────────────
Saldo Awal: 0 | Total Debit: 69.500.000 | Total Kredit: 10.000.000
Saldo Akhir: 59.500.000
```

### 6.5 Format Trial Balance

```
NERACA SALDO
PT. Karya Usaha
Per 31 Januari 2025
─────────────────────────────────────────────────────────────────
Kode  | Nama Akun                        | Debit        | Kredit
─────────────────────────────────────────────────────────────────
1000  | Kas                              | 59.500.000   |
1100  | Piutang Dagang                   |    500.000   |
2000  | Utang Dagang                     |              |         0
3000  | Modal Pemilik                    |              | 50.000.000
4000  | Penjualan                        |              | 19.500.000
4100  | Retur Penjualan                  |    500.000   |
5010  | Pembelian                        | 10.000.000   |
5710  | Beban Iklan                      |    300.000   |
5750  | Beban Angkut Penjualan           |    200.000   |
─────────────────────────────────────────────────────────────────
      | TOTAL                            | 71.000.000   | 69.500.000
─────────────────────────────────────────────────────────────────
Status: ✅ BALANCED  (Selisih: 0)
```

### 6.6 Status Balance

```
✅ BALANCED   → Total Debit = Total Kredit
               Tombol "Generate PDF" AKTIF

❌ UNBALANCED → Ada selisih
               Tombol "Generate PDF" NONAKTIF
               Harus ditambah transaksi penyeimbang
```

---

---

## BAB 7 — CONTOH KASUS NYATA: PT. KARYA USAHA (PERUSAHAAN DAGANG)

### 7.1 Profil Perusahaan

```
Nama Perusahaan : PT. Karya Usaha
Jenis Usaha     : Perusahaan Dagang (Distributor Elektronik)
Periode         : Januari 2025
Penyusun        : Eko Asif
```

### 7.2 Daftar Transaksi

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

### 7.3 Jurnal Umum — PT. Karya Usaha

| Tanggal | Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|---------|------|-----------|------------|-------------|
| 01/01/25 | 1000 | Kas | 50.000.000 | |
| 01/01/25 | 3000 | Modal Pemilik | | 50.000.000 |
| 05/01/25 | 5010 | Pembelian | 10.000.000 | |
| 05/01/25 | 2000 | Utang Dagang | | 10.000.000 |
| 10/01/25 | 1100 | Piutang Dagang | 15.000.000 | |
| 10/01/25 | 4000 | Penjualan | | 15.000.000 |
| 12/01/25 | 1000 | Kas | 5.000.000 | |
| 12/01/25 | 4000 | Penjualan | | 5.000.000 |
| 14/01/25 | 4100 | Retur Penjualan | 500.000 | |
| 14/01/25 | 1100 | Piutang Dagang | | 500.000 |
| 15/01/25 | 5750 | Beban Angkut Penjualan | 200.000 | |
| 15/01/25 | 1000 | Kas | | 200.000 |
| 20/01/25 | 5710 | Beban Iklan | 300.000 | |
| 20/01/25 | 1000 | Kas | | 300.000 |
| 25/01/25 | 2000 | Utang Dagang | 10.000.000 | |
| 25/01/25 | 1000 | Kas | | 10.000.000 |
| 28/01/25 | 1000 | Kas | 14.500.000 | |
| 28/01/25 | 1100 | Piutang Dagang | | 14.500.000 |
| | | **TOTAL** | **106.500.000** | **106.500.000** |

> ✅ Status: BALANCED

### 7.4 Neraca Saldo — PT. Karya Usaha

| Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|------|-----------|------------|-------------|
| 1000 | Kas | 59.000.000 | |
| 1100 | Piutang Dagang | 0 | |
| 2000 | Utang Dagang | | 0 |
| 3000 | Modal Pemilik | | 50.000.000 |
| 4000 | Penjualan | | 20.000.000 |
| 4100 | Retur Penjualan | 500.000 | |
| 5010 | Pembelian | 10.000.000 | |
| 5710 | Beban Iklan | 300.000 | |
| 5750 | Beban Angkut Penjualan | 200.000 | |
| | **TOTAL** | **70.000.000** | **70.000.000** |

> ✅ Status: BALANCED

### 7.5 Buku Besar Kas — PT. Karya Usaha

| Tanggal | Keterangan | Debit (Rp) | Kredit (Rp) | Saldo (Rp) |
|---------|------------|------------|-------------|------------|
| 01/01/25 | Modal awal | 50.000.000 | | 50.000.000 |
| 12/01/25 | Penjualan tunai | 5.000.000 | | 55.000.000 |
| 15/01/25 | Beban angkut penjualan | | 200.000 | 54.800.000 |
| 20/01/25 | Beban iklan | | 300.000 | 54.500.000 |
| 25/01/25 | Bayar utang dagang | | 10.000.000 | 44.500.000 |
| 28/01/25 | Terima pelunasan piutang | 14.500.000 | | 59.000.000 |
| | **Saldo Akhir** | | | **59.000.000** |

### 7.6 Verifikasi Persamaan Akuntansi

```
ASET:
  Kas                    = Rp  59.000.000
  Piutang Dagang         = Rp           0
  Total Aset             = Rp  59.000.000

LIABILITAS:
  Utang Dagang           = Rp           0
  Total Liabilitas       = Rp           0

EKUITAS:
  Modal Pemilik          = Rp  50.000.000
  Laba Bersih            = Rp   9.000.000
    (Penjualan Bersih 19.500.000 - HPP 10.000.000 - Beban 500.000)
  Total Ekuitas          = Rp  59.000.000

VERIFIKASI:
  Aset (59.000.000) = Liabilitas (0) + Ekuitas (59.000.000) ✅
```

---

---

## BAB 8 — CONTOH KASUS NYATA: CV. JASA PRIMA (PERUSAHAAN JASA)

### 8.1 Profil Perusahaan

```
Nama Perusahaan : CV. Jasa Prima
Jenis Usaha     : Perusahaan Jasa (Konsultan IT)
Periode         : Januari 2025
Penyusun        : Eko Asif
```

### 8.2 Daftar Transaksi

```
modal_awal 50000000 1 2025-01-01
gaji 3000000 1 2025-01-05
sewa 1500000 1 2025-01-05
perlengkapan_belum_dibayar 500000 1 2025-01-10
pendapatan_jasa 5000000 1 2025-01-15
investor 10000000 1 2025-01-20
listrik 300000 1 2025-01-22
prive 1000000 1 2025-01-28
```

### 8.3 Jurnal Umum — CV. Jasa Prima

| Tanggal | Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|---------|------|-----------|------------|-------------|
| 01/01/25 | 1000 | Kas | 50.000.000 | |
| 01/01/25 | 3000 | Modal Pemilik | | 50.000.000 |
| 05/01/25 | 5100 | Beban Gaji | 3.000.000 | |
| 05/01/25 | 1000 | Kas | | 3.000.000 |
| 05/01/25 | 5200 | Beban Sewa | 1.500.000 | |
| 05/01/25 | 1000 | Kas | | 1.500.000 |
| 10/01/25 | 5400 | Beban Perlengkapan | 500.000 | |
| 10/01/25 | 2000 | Utang Dagang | | 500.000 |
| 15/01/25 | 1000 | Kas | 5.000.000 | |
| 15/01/25 | 4000 | Penjualan (Pendapatan Jasa) | | 5.000.000 |
| 20/01/25 | 1000 | Kas | 10.000.000 | |
| 20/01/25 | 3000 | Modal Pemilik | | 10.000.000 |
| 22/01/25 | 5300 | Beban Listrik dan Air | 300.000 | |
| 22/01/25 | 1000 | Kas | | 300.000 |
| 28/01/25 | 3100 | Prive | 1.000.000 | |
| 28/01/25 | 1000 | Kas | | 1.000.000 |
| | | **TOTAL** | **71.300.000** | **71.300.000** |

> ✅ Status: BALANCED

### 8.4 Neraca Saldo — CV. Jasa Prima

| Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|------|-----------|------------|-------------|
| 1000 | Kas | 59.200.000 | |
| 2000 | Utang Dagang | | 500.000 |
| 3000 | Modal Pemilik | | 60.000.000 |
| 3100 | Prive | 1.000.000 | |
| 4000 | Penjualan (Pendapatan Jasa) | | 5.000.000 |
| 5100 | Beban Gaji | 3.000.000 | |
| 5200 | Beban Sewa | 1.500.000 | |
| 5300 | Beban Listrik dan Air | 300.000 | |
| 5400 | Beban Perlengkapan | 500.000 | |
| | **TOTAL** | **65.500.000** | **65.500.000** |

> ✅ Status: BALANCED

### 8.5 Perhitungan Laba Rugi

```
PENDAPATAN:
  Pendapatan Jasa          = Rp   5.000.000

BEBAN USAHA:
  Beban Gaji               = Rp   3.000.000
  Beban Sewa               = Rp   1.500.000
  Beban Listrik dan Air    = Rp     300.000
  Beban Perlengkapan       = Rp     500.000
  Total Beban              = Rp   5.300.000

LABA (RUGI) BERSIH        = Rp    (300.000)  ← Rugi
```

### 8.6 Verifikasi Persamaan Akuntansi

```
ASET:
  Kas                      = Rp  59.200.000
  Total Aset               = Rp  59.200.000

LIABILITAS:
  Utang Dagang             = Rp     500.000
  Total Liabilitas         = Rp     500.000

EKUITAS:
  Modal Pemilik            = Rp  60.000.000
  Prive                    = Rp  (1.000.000)
  Rugi Bersih              = Rp    (300.000)
  Total Ekuitas            = Rp  58.700.000

VERIFIKASI:
  Aset (59.200.000) = Liabilitas (500.000) + Ekuitas (58.700.000) ✅
```

---

---

## BAB 9 — CONTOH KASUS NYATA: KLINIK SEHAT JAYA

### 9.1 Profil Perusahaan

```
Nama Perusahaan : Klinik Kesehatan Sehat Jaya
Jenis Usaha     : Jasa Kesehatan
Periode         : Januari 2025
Penyusun        : Eko Asif
```

### 9.2 Daftar Transaksi

```
modal 100000000 1 2025-01-01
peralatan 20000000 1 2025-01-02
obat 5000000 1 2025-01-03
penjualan_layanan 2000000 5 2025-01-05
gaji_dokter 3000000 1 2025-01-10
sewa_klinik 2000000 1 2025-01-15
listrik_air 500000 1 2025-01-20
penjualan_obat 1000000 1 2025-01-25
```

### 9.3 Jurnal Umum — Klinik Sehat Jaya

| Tanggal | Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|---------|------|-----------|------------|-------------|
| 01/01/25 | 1000 | Kas | 100.000.000 | |
| 01/01/25 | 3000 | Modal Pemilik | | 100.000.000 |
| 02/01/25 | 1800 | Peralatan | 20.000.000 | |
| 02/01/25 | 1000 | Kas | | 20.000.000 |
| 03/01/25 | 1200 | Persediaan (Obat) | 5.000.000 | |
| 03/01/25 | 1000 | Kas | | 5.000.000 |
| 05/01/25 | 1000 | Kas | 10.000.000 | |
| 05/01/25 | 4000 | Pendapatan Layanan | | 10.000.000 |
| 10/01/25 | 5100 | Beban Gaji | 3.000.000 | |
| 10/01/25 | 1000 | Kas | | 3.000.000 |
| 15/01/25 | 5200 | Beban Sewa | 2.000.000 | |
| 15/01/25 | 1000 | Kas | | 2.000.000 |
| 20/01/25 | 5300 | Beban Listrik dan Air | 500.000 | |
| 20/01/25 | 1000 | Kas | | 500.000 |
| 25/01/25 | 1000 | Kas | 1.000.000 | |
| 25/01/25 | 1200 | Persediaan (Obat) | | 1.000.000 |
| | | **TOTAL** | **141.500.000** | **141.500.000** |

> ✅ Status: BALANCED

### 9.4 Buku Besar Per Akun — Klinik Sehat Jaya

#### Akun 1000 — Kas

| Tanggal | Keterangan | Debit (Rp) | Kredit (Rp) | Saldo (Rp) |
|---------|------------|------------|-------------|------------|
| 01/01/25 | Modal awal | 100.000.000 | | 100.000.000 |
| 02/01/25 | Beli peralatan | | 20.000.000 | 80.000.000 |
| 03/01/25 | Beli obat | | 5.000.000 | 75.000.000 |
| 05/01/25 | Pendapatan layanan | 10.000.000 | | 85.000.000 |
| 10/01/25 | Bayar gaji dokter | | 3.000.000 | 82.000.000 |
| 15/01/25 | Bayar sewa klinik | | 2.000.000 | 80.000.000 |
| 20/01/25 | Bayar listrik & air | | 500.000 | 79.500.000 |
| 25/01/25 | Penjualan obat | 1.000.000 | | 80.500.000 |
| | **Saldo Akhir** | | | **80.500.000** |

#### Akun 1200 — Persediaan (Obat)

| Tanggal | Keterangan | Debit (Rp) | Kredit (Rp) | Saldo (Rp) |
|---------|------------|------------|-------------|------------|
| 03/01/25 | Pembelian obat | 5.000.000 | | 5.000.000 |
| 25/01/25 | Penjualan obat | | 1.000.000 | 4.000.000 |
| | **Saldo Akhir** | | | **4.000.000** |

### 9.5 Neraca Saldo — Klinik Sehat Jaya

| Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|------|-----------|------------|-------------|
| 1000 | Kas | 80.500.000 | |
| 1200 | Persediaan (Obat) | 4.000.000 | |
| 1800 | Peralatan | 20.000.000 | |
| 3000 | Modal Pemilik | | 100.000.000 |
| 4000 | Pendapatan Layanan | | 11.000.000 |
| 5100 | Beban Gaji | 3.000.000 | |
| 5200 | Beban Sewa | 2.000.000 | |
| 5300 | Beban Listrik dan Air | 500.000 | |
| | **TOTAL** | **110.000.000** | **111.000.000** |

> ⚠️ Selisih Rp 1.000.000 — perlu entri HPP untuk penjualan obat

---

---

## BAB 10 — EXPORT PDF & MANAJEMEN DATA

### 10.1 Generate PDF

**Syarat sebelum generate PDF:**
```
Status laporan harus: ✅ BALANCED
(Total Debit = Total Kredit)
```

**Langkah:**
```
1. Pilih jenis laporan dari dropdown
2. Pastikan status "✅ Balanced"
3. Klik tombol [Generate PDF]
4. File otomatis terunduh
```

**Format PDF:**
| Properti | Nilai |
|----------|-------|
| Ukuran kertas | A4 Portrait |
| Margin | 12mm semua sisi |
| Font | Times New Roman |
| Background | Putih |
| Header tabel | Abu-abu muda |
| Border | Lengkap (vertikal + horizontal) |
| Footer | Nomor halaman + "Accounting By Eko Asif" |

**Nama file otomatis:**
```
trial-balance_2025-01-31.pdf
general-journal_2025-01-31.pdf
general-ledger_2025-01-31.pdf
reversing-journal_2025-01-31.pdf
```

### 10.2 Export & Import Data

**Export Data (Backup):**
```
Pengaturan → Export Data → File JSON terunduh
Nama file: accounting_export_2025-01-31.json
```

**Import Data (Restore):**
```
Pengaturan → Import Data → Pilih file JSON → Konfirmasi
```

**Struktur data JSON:**
```json
{
  "profile": {
    "organizationName": "PT. Karya Usaha",
    "reportTitle": "Laporan Januari 2025",
    "preparer": "Eko Asif"
  },
  "transactions": [
    {
      "id": "txn_1234567890_1",
      "date": "2025-01-01",
      "description": "modal_awal",
      "quantity": 1,
      "unitAmount": 50000000,
      "totalAmount": 50000000,
      "debitAccount": "1000",
      "creditAccount": "3000",
      "status": "confirmed"
    }
  ],
  "chartOfAccounts": [ ... ]
}
```

### 10.3 Undo & Redo

| Aksi | Tombol | Keterangan |
|------|--------|------------|
| Batalkan transaksi terakhir | [Undo] | Hapus transaksi terakhir dari daftar |
| Ulangi transaksi yang dibatalkan | [Redo] | Kembalikan transaksi yang di-undo |

> Maksimum 50 langkah undo tersimpan.

### 10.4 Reset Data

```
⚠️ PERHATIAN: Reset akan menghapus SEMUA transaksi

Pengaturan → Reset All Data → Konfirmasi

Gunakan ini jika:
- Chart of accounts diperbarui setelah update sistem
- Ingin memulai periode baru dari awal
- Data lama tidak relevan
```

---

## BAB 11 — ARSITEKTUR & STRUKTUR SISTEM

### 11.1 Struktur File Proyek

```
accounting-ledger-system/
├── index.html                    ← Entry point aplikasi
├── css/
│   ├── theme.css                 ← Variabel warna & tipografi
│   ├── styles.css                ← Layout & komponen
│   └── responsive.css            ← Breakpoint mobile/tablet/desktop
├── js/
│   ├── modules/
│   │   ├── storage.js            ← localStorage management
│   │   ├── auth.js               ← Chart of accounts & profil
│   │   ├── transaction.js        ← Parse & simpan transaksi
│   │   ├── accounting.js         ← Kalkulasi double-entry & PSAK
│   │   ├── ai-classifier.js      ← Gemini AI + fallback lokal
│   │   ├── report-generator.js   ← Generate 4 jenis laporan
│   │   ├── pdf-generator.js      ← Export PDF
│   │   └── reports/
│   │       ├── general-journal.js
│   │       ├── general-ledger.js
│   │       ├── trial-balance.js
│   │       ├── adjusting-entries.js
│   │       ├── adjusted-trial-balance.js
│   │       ├── financial-statements.js
│   │       └── reversing-journal.js
│   ├── app.js                    ← Controller utama
│   ├── ui.js                     ← UI manager
│   └── main.js                   ← Event handlers
└── PANDUAN USER/
    └── BUKU_PANDUAN_LENGKAP.md   ← Dokumen ini
```

### 11.2 Modul Backend

| Modul | Fungsi Utama |
|-------|-------------|
| `storage.js` | Simpan/load/backup data ke localStorage |
| `auth.js` | Manajemen profil & chart of accounts default |
| `transaction.js` | Parse input, buat & kelola transaksi |
| `accounting.js` | Hitung debit/kredit, validasi persamaan akuntansi |
| `ai-classifier.js` | Klasifikasi via Gemini API + fallback lokal |
| `report-generator.js` | Generate 4 jenis laporan |
| `pdf-generator.js` | Export laporan ke PDF A4 |
| `app.js` | Controller utama, state management, undo/redo |

### 11.3 Tema Visual

| Elemen | Warna | Kode |
|--------|-------|------|
| Background utama | Abu-abu gelap | `#1c1c1c` |
| Panel | Charcoal | `#2e2e2e` |
| Teks utama | Silver | `#c0c0c0` |
| Sukses / Balance | Hijau | `#4ade80` |
| Peringatan | Oranye | `#fb923c` |
| Error | Merah | `#ef4444` |
| Info | Biru | `#3b82f6` |

### 11.4 Responsive Design

| Perangkat | Lebar Layar | Layout |
|-----------|-------------|--------|
| Desktop | ≥ 1024px | 2 kolom: input 340px kiri, laporan kanan |
| Tablet | 768–1023px | 1 kolom, stacked |
| Mobile | < 768px | 1 kolom, tombol full-width, tabel scroll horizontal |

---

---

## BAB 12 — TROUBLESHOOTING & FAQ

### 12.1 Masalah Umum & Solusi

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Tombol "Mulai" tidak bisa diklik | Nama perusahaan belum diisi | Isi nama perusahaan di form awal |
| Transaksi tidak balance | Ada transaksi lama dari sesi sebelumnya | Cek laporan, tambah transaksi penyeimbang atau Reset |
| AI salah klasifikasi | Keyword tidak spesifik | Gunakan keyword seperti `pembelian_kredit`, `perlengkapan_belum_dibayar` |
| PDF tidak ter-generate | Status masih "Unbalanced" | Pastikan status "✅ Balanced" sebelum generate |
| Data hilang setelah update | Chart of accounts diperbarui | Klik Reset All Data, input ulang transaksi |
| Data hilang tiba-tiba | Browser cache di-clear | Selalu export data sebagai backup rutin |
| Gemini API error | API key salah atau rate limit | Cek API key, tunggu 1 jam, atau gunakan fallback lokal |
| Transaksi terduplikat | Input dua kali | Gunakan Undo untuk hapus transaksi terakhir |

### 12.2 FAQ

**Q: Apakah sistem bisa digunakan tanpa internet?**
A: Ya. Tanpa internet, sistem menggunakan klasifikasi lokal berbasis aturan PSAK. Akurasi sedikit lebih rendah tapi tetap fungsional.

**Q: Berapa batas penyimpanan data?**
A: localStorage browser memiliki batas 5MB per domain. Untuk data besar, lakukan export rutin.

**Q: Apakah data aman?**
A: Data tersimpan di browser lokal (localStorage), tidak dikirim ke server manapun kecuali deskripsi transaksi yang dikirim ke Gemini API untuk klasifikasi.

**Q: Bisa digunakan multi-user?**
A: Ya. Setiap user memiliki data terpisah. Login dengan akun berbeda untuk isolasi data.

**Q: Bagaimana jika klasifikasi AI salah?**
A: Klik tombol [Adjust] sebelum konfirmasi untuk mengubah akun secara manual.

**Q: Apakah mendukung mata uang selain Rupiah?**
A: Saat ini hanya mendukung IDR (Rupiah). Multi-currency direncanakan di versi berikutnya.

**Q: Bagaimana cara backup data?**
A: Pengaturan → Export Data → Simpan file JSON di tempat aman.

**Q: Apakah bisa digunakan untuk laporan pajak?**
A: Laporan yang dihasilkan mengikuti standar PSAK dan dapat dijadikan dasar laporan pajak, namun konsultasikan dengan akuntan untuk kepatuhan pajak resmi.

### 12.3 Kode Error

| Kode | Pesan | Solusi |
|------|-------|--------|
| ERR_001 | "Please fill in all fields" | Isi semua field yang wajib |
| ERR_002 | "Amount must be a positive number" | Masukkan angka positif untuk harga |
| ERR_003 | "Invalid date format" | Gunakan format YYYY-MM-DD |
| ERR_004 | "Accounting equation not balanced" | Tambah transaksi penyeimbang |
| ERR_005 | "AI classification failed" | Sistem otomatis fallback ke lokal |
| ERR_006 | "Storage quota exceeded" | Export dan hapus data lama |

---

---

## BAB 13 — REFERENSI CEPAT (CHEAT SHEET)

### 13.1 Format Input Ringkas

```
[keyword]  [nominal]  [qty]  [YYYY-MM-DD]

MODAL & EKUITAS:
  modal_awal 50000000 1 2025-01-01       → Kas / Modal Pemilik
  investor 10000000 1 2025-01-20         → Kas / Modal Pemilik
  prive 1000000 1 2025-01-30             → Prive / Kas

PEMBELIAN (DAGANG):
  pembelian_kredit 10000000 1            → Pembelian / Utang Dagang
  pembelian_tunai 5000000 1              → Pembelian / Kas
  retur_pembelian 500000 1               → Utang Dagang / Retur Pembelian
  bayar_utang_dagang 10000000 1          → Utang Dagang / Kas

PENJUALAN (DAGANG):
  penjualan_kredit 15000000 1            → Piutang Dagang / Penjualan
  penjualan_tunai 5000000 1              → Kas / Penjualan
  retur_penjualan 500000 1               → Retur Penjualan / Piutang Dagang
  penerimaan_piutang 14500000 1          → Kas / Piutang Dagang

PENDAPATAN JASA:
  pendapatan_jasa 5000000 1              → Kas / Penjualan
  jasa_kredit 3000000 1                  → Piutang Dagang / Penjualan

BEBAN:
  gaji 3000000 1                         → Beban Gaji / Kas
  sewa 1500000 1                         → Beban Sewa / Kas
  listrik 500000 1                       → Beban Listrik / Kas
  pulpen 3000 45                         → Beban Perlengkapan / Kas
  perlengkapan_belum_dibayar 500000 1    → Beban Perlengkapan / Utang Dagang
  beban_iklan 300000 1                   → Beban Iklan / Kas
  beban_angkut_penjualan 200000 1        → Beban Angkut Penjualan / Kas

ASET TETAP:
  komputer 8000000 1                     → Peralatan / Kas
  peralatan_belum_dibayar 8000000 1      → Peralatan / Utang Dagang

UTANG & PINJAMAN:
  pinjaman 20000000 1                    → Kas / Utang Bank
```

### 13.2 Aturan Saldo Normal (Ringkas)

```
1xxx ASET       → Debit bertambah  | Kredit berkurang
2xxx LIABILITAS → Kredit bertambah | Debit berkurang
3xxx EKUITAS    → Kredit bertambah | Debit berkurang
4xxx PENDAPATAN → Kredit bertambah | Debit berkurang
5xxx BEBAN/HPP  → Debit bertambah  | Kredit berkurang
```

### 13.3 Checklist Sebelum Generate PDF

```
□ Semua transaksi sudah dikonfirmasi
□ Status laporan: ✅ BALANCED
□ Nama perusahaan sudah diisi
□ Periode laporan sudah benar
□ Pilih jenis laporan yang diinginkan
□ Klik [Generate PDF]
```

### 13.4 Checklist Akhir Periode

```
□ Input semua transaksi periode berjalan
□ Input jurnal penyesuaian (penyusutan, utang_gaji, utang_pendapatan, dll)
□ Verifikasi setiap klasifikasi AI
□ Cek status: ✅ BALANCED
□ Generate semua laporan (Mode 1–7)
□ Download PDF untuk arsip
□ Export data JSON sebagai backup
□ Eksekusi Jurnal Penutup (Mode 8) — kunci periode
□ Generate PDF Neraca Saldo Setelah Penutupan
```

### 13.5 Persamaan Akuntansi Cepat

```
╔══════════════════════════════════════════════════════════════╗
║  ASET = LIABILITAS + EKUITAS                                 ║
║                                                              ║
║  LABA BERSIH = PENDAPATAN - BEBAN                            ║
║                                                              ║
║  EKUITAS AKHIR = MODAL AWAL + LABA BERSIH - PRIVE            ║
║                                                              ║
║  TOTAL DEBIT = TOTAL KREDIT  (selalu, tanpa kecuali)         ║
╚══════════════════════════════════════════════════════════════╝
```

---

---

## BAB 14 — JURNAL PENUTUP (CLOSING ENTRIES)

### 14.1 Pengertian & Tujuan

Jurnal penutup adalah entri akuntansi yang dibuat **di akhir periode** untuk:

1. Mengenolkan semua akun **nominal** (Pendapatan & Beban) agar siap untuk periode berikutnya
2. Memindahkan laba/rugi bersih ke akun Modal
3. Menutup akun Prive ke Modal
4. Menghasilkan **Neraca Saldo Setelah Penutupan** yang hanya berisi akun riil

```
╔══════════════════════════════════════════════════════════════╗
║  AKUN NOMINAL (ditutup)    │  AKUN RIIL (dibawa ke depan)   ║
║  ─────────────────────     │  ──────────────────────────    ║
║  4xxx Pendapatan → 0       │  1xxx Aset → tetap             ║
║  5xxx Beban      → 0       │  2xxx Liabilitas → tetap       ║
║  3100 Prive      → 0       │  3000 Modal → diperbarui       ║
╚══════════════════════════════════════════════════════════════╝
```

### 14.2 Empat Tahap Penutupan (Urutan Wajib)

> Keempat tahap ini harus dieksekusi secara berurutan. Jika satu tahap terlewat, Neraca Saldo Setelah Penutupan tidak akan balance.

---

#### TAHAP A — Menutup Akun Pendapatan

**Aturan:** Debit semua akun Pendapatan (4xxx) → Kredit Ikhtisar Laba Rugi

```
Tujuan: Membuat saldo semua akun Pendapatan menjadi 0

Jurnal:
  DEBIT   4000  Penjualan                    [saldo akun]
  DEBIT   4xxx  Pendapatan Lain-lain         [saldo akun]
  ─────────────────────────────────────────────────────
  KREDIT  9000  Ikhtisar Laba Rugi           [total pendapatan]
```

> Catatan: Akun 4100 (Retur Penjualan) dan 4200 (Potongan Penjualan) bersaldo Debit — tidak perlu ditutup ke Ikhtisar, melainkan sudah mengurangi Penjualan bersih.

---

#### TAHAP B — Menutup Akun Beban

**Aturan:** Debit Ikhtisar Laba Rugi → Kredit semua akun Beban (5xxx) satu per satu

```
Tujuan: Membuat saldo semua akun Beban menjadi 0

Jurnal:
  DEBIT   9000  Ikhtisar Laba Rugi           [total beban]
  ─────────────────────────────────────────────────────
  KREDIT  5100  Beban Gaji                   [saldo akun]
  KREDIT  5200  Beban Sewa                   [saldo akun]
  KREDIT  5300  Beban Listrik dan Air        [saldo akun]
  KREDIT  5400  Beban Perlengkapan           [saldo akun]
  KREDIT  5xxx  Beban lainnya...             [saldo akun]
```

---

#### TAHAP C — Menutup Ikhtisar Laba Rugi ke Modal

**Aturan:** Selisih Ikhtisar Laba Rugi dipindahkan ke Modal Pemilik (3000)

```
Jika LABA (Pendapatan > Beban):
  DEBIT   9000  Ikhtisar Laba Rugi           [selisih laba]
  KREDIT  3000  Modal Pemilik                [selisih laba]

Jika RUGI (Beban > Pendapatan):
  DEBIT   3000  Modal Pemilik                [selisih rugi]
  KREDIT  9000  Ikhtisar Laba Rugi           [selisih rugi]
```

---

#### TAHAP D — Menutup Akun Prive

**Aturan:** Debit Modal → Kredit Prive (hanya jika ada saldo Prive)

```
Tujuan: Mengurangi Modal secara permanen, mengenolkan Prive

Jurnal:
  DEBIT   3000  Modal Pemilik                [saldo prive]
  KREDIT  3100  Prive                        [saldo prive]
```

---

### 14.3 Logika Sistem — Cara Kerja Otomatis

Sistem mengeksekusi jurnal penutup secara otomatis dengan logika berikut:

```
LANGKAH 1: Scan semua akun dengan code.startsWith('4')
           → Hitung total saldo Pendapatan
           → Generate entri: Debit 4xxx, Kredit 9000

LANGKAH 2: Scan semua akun dengan code.startsWith('5')
           → Hitung total saldo Beban
           → Generate entri: Debit 9000, Kredit 5xxx (rinci)

LANGKAH 3: Hitung selisih Ikhtisar Laba Rugi (9000)
           → Jika Laba: Debit 9000, Kredit 3000
           → Jika Rugi: Debit 3000, Kredit 9000

LANGKAH 4: Cek saldo akun 3100 (Prive)
           → Jika ada: Debit 3000, Kredit 3100

LANGKAH 5: Posting ke Buku Besar
           → Saldo Pendapatan & Beban → 0
           → Saldo Modal → diperbarui

LANGKAH 6: Kunci periode
           → Tidak ada input transaksi baru di periode ini
```

### 14.4 Syarat Mutlak Sistem

| Aturan | Keterangan |
|--------|------------|
| Hanya akun nominal | Sistem DILARANG menutup akun Riil (1xxx, 2xxx, 3000). Kas, Piutang, Utang, Modal tetap dibawa ke periode berikutnya |
| Update Buku Besar otomatis | Setelah jurnal penutup dibuat, sistem otomatis posting ke Buku Besar sehingga saldo Pendapatan & Beban = 0 |
| Kunci periode | Setelah jurnal penutup dieksekusi, periode dikunci — tidak ada input transaksi baru |
| Urutan wajib | Tahap A → B → C → D harus berurutan, tidak boleh dilewati |

### 14.5 Contoh Lengkap — CV. Jasa Prima (Januari 2025)

**Data Neraca Saldo Sebelum Penutupan:**

| Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|------|-----------|------------|-------------|
| 1000 | Kas | 59.200.000 | |
| 2000 | Utang Dagang | | 500.000 |
| 3000 | Modal Pemilik | | 60.000.000 |
| 3100 | Prive | 1.000.000 | |
| 4000 | Pendapatan Jasa | | 5.000.000 |
| 5100 | Beban Gaji | 3.000.000 | |
| 5200 | Beban Sewa | 1.500.000 | |
| 5300 | Beban Listrik dan Air | 300.000 | |
| 5400 | Beban Perlengkapan | 500.000 | |
| | **TOTAL** | **65.500.000** | **65.500.000** |

---

**TAHAP A — Menutup Pendapatan Jasa:**

| Tanggal | Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|---------|------|-----------|------------|-------------|
| 31/01/25 | 4000 | Pendapatan Jasa | 5.000.000 | |
| 31/01/25 | 9000 | Ikhtisar Laba Rugi | | 5.000.000 |

> Saldo akun 4000 setelah penutupan: **Rp 0** ✅

---

**TAHAP B — Menutup Semua Beban:**

| Tanggal | Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|---------|------|-----------|------------|-------------|
| 31/01/25 | 9000 | Ikhtisar Laba Rugi | 5.300.000 | |
| 31/01/25 | 5100 | Beban Gaji | | 3.000.000 |
| 31/01/25 | 5200 | Beban Sewa | | 1.500.000 |
| 31/01/25 | 5300 | Beban Listrik dan Air | | 300.000 |
| 31/01/25 | 5400 | Beban Perlengkapan | | 500.000 |

> Saldo semua akun 5xxx setelah penutupan: **Rp 0** ✅

---

**TAHAP C — Menutup Ikhtisar Laba Rugi:**

```
Ikhtisar Laba Rugi (9000):
  Kredit (dari Tahap A): 5.000.000
  Debit  (dari Tahap B): 5.300.000
  Selisih              : (300.000) → RUGI
```

| Tanggal | Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|---------|------|-----------|------------|-------------|
| 31/01/25 | 3000 | Modal Pemilik | 300.000 | |
| 31/01/25 | 9000 | Ikhtisar Laba Rugi | | 300.000 |

> Saldo akun 9000 setelah penutupan: **Rp 0** ✅
> Modal berkurang Rp 300.000 karena rugi.

---

**TAHAP D — Menutup Prive:**

| Tanggal | Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|---------|------|-----------|------------|-------------|
| 31/01/25 | 3000 | Modal Pemilik | 1.000.000 | |
| 31/01/25 | 3100 | Prive | | 1.000.000 |

> Saldo akun 3100 setelah penutupan: **Rp 0** ✅

---

**Rekap Jurnal Penutup Lengkap:**

| Tanggal | Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|---------|------|-----------|------------|-------------|
| 31/01/25 | 4000 | Pendapatan Jasa | 5.000.000 | |
| 31/01/25 | 9000 | Ikhtisar Laba Rugi | | 5.000.000 |
| 31/01/25 | 9000 | Ikhtisar Laba Rugi | 5.300.000 | |
| 31/01/25 | 5100 | Beban Gaji | | 3.000.000 |
| 31/01/25 | 5200 | Beban Sewa | | 1.500.000 |
| 31/01/25 | 5300 | Beban Listrik dan Air | | 300.000 |
| 31/01/25 | 5400 | Beban Perlengkapan | | 500.000 |
| 31/01/25 | 3000 | Modal Pemilik | 300.000 | |
| 31/01/25 | 9000 | Ikhtisar Laba Rugi | | 300.000 |
| 31/01/25 | 3000 | Modal Pemilik | 1.000.000 | |
| 31/01/25 | 3100 | Prive | | 1.000.000 |
| | | **TOTAL** | **11.600.000** | **11.600.000** |

> ✅ Jurnal Penutup BALANCED

### 14.6 Neraca Saldo Setelah Penutupan

Setelah keempat tahap selesai, laporan akhir hanya berisi akun riil:

| Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|------|-----------|------------|-------------|
| 1000 | Kas | 59.200.000 | |
| 2000 | Utang Dagang | | 500.000 |
| 3000 | Modal Pemilik | | 58.700.000 |
| | **TOTAL** | **59.200.000** | **59.200.000** |

> ✅ Status: BALANCED

**Perhitungan Modal Akhir:**
```
Modal Awal                 = Rp  60.000.000
+ Tambahan Modal (investor)= Rp           0
- Rugi Bersih              = Rp    (300.000)
- Prive                    = Rp  (1.000.000)
─────────────────────────────────────────────
Modal Akhir                = Rp  58.700.000
```

**Verifikasi Persamaan Akuntansi:**
```
Aset (59.200.000) = Liabilitas (500.000) + Ekuitas (58.700.000) ✅
```

### 14.7 Contoh Lengkap — PT. Karya Usaha (Perusahaan Dagang)

**Data Neraca Saldo Sebelum Penutupan:**

| Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|------|-----------|------------|-------------|
| 1000 | Kas | 59.000.000 | |
| 1100 | Piutang Dagang | 0 | |
| 2000 | Utang Dagang | | 0 |
| 3000 | Modal Pemilik | | 50.000.000 |
| 4000 | Penjualan | | 20.000.000 |
| 4100 | Retur Penjualan | 500.000 | |
| 5010 | Pembelian | 10.000.000 | |
| 5710 | Beban Iklan | 300.000 | |
| 5750 | Beban Angkut Penjualan | 200.000 | |
| | **TOTAL** | **70.000.000** | **70.000.000** |

**Hitung Penjualan Bersih & Laba:**
```
Penjualan                  = Rp  20.000.000
- Retur Penjualan          = Rp    (500.000)
Penjualan Bersih           = Rp  19.500.000

HPP (Pembelian)            = Rp  10.000.000
Laba Kotor                 = Rp   9.500.000

Beban Iklan                = Rp    (300.000)
Beban Angkut Penjualan     = Rp    (200.000)
Laba Bersih                = Rp   9.000.000
```

**Jurnal Penutup — PT. Karya Usaha:**

| Tanggal | Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|---------|------|-----------|------------|-------------|
| **Tahap A** | | *Tutup Pendapatan* | | |
| 31/01/25 | 4000 | Penjualan | 20.000.000 | |
| 31/01/25 | 9000 | Ikhtisar Laba Rugi | | 20.000.000 |
| **Tahap B** | | *Tutup Beban & Kontra-Pendapatan* | | |
| 31/01/25 | 9000 | Ikhtisar Laba Rugi | 11.000.000 | |
| 31/01/25 | 4100 | Retur Penjualan | | 500.000 |
| 31/01/25 | 5010 | Pembelian | | 10.000.000 |
| 31/01/25 | 5710 | Beban Iklan | | 300.000 |
| 31/01/25 | 5750 | Beban Angkut Penjualan | | 200.000 |
| **Tahap C** | | *Tutup Ikhtisar Laba Rugi (Laba)* | | |
| 31/01/25 | 9000 | Ikhtisar Laba Rugi | 9.000.000 | |
| 31/01/25 | 3000 | Modal Pemilik | | 9.000.000 |
| **Tahap D** | | *Tidak ada Prive* | | |
| | | **TOTAL** | **40.000.000** | **40.000.000** |

> ✅ Jurnal Penutup BALANCED

**Neraca Saldo Setelah Penutupan — PT. Karya Usaha:**

| Kode | Nama Akun | Debit (Rp) | Kredit (Rp) |
|------|-----------|------------|-------------|
| 1000 | Kas | 59.000.000 | |
| 1100 | Piutang Dagang | 0 | |
| 2000 | Utang Dagang | | 0 |
| 3000 | Modal Pemilik | | 59.000.000 |
| | **TOTAL** | **59.000.000** | **59.000.000** |

> ✅ BALANCED — Modal akhir = Modal awal (50 jt) + Laba bersih (9 jt) = **Rp 59.000.000**

### 14.8 Akun Ikhtisar Laba Rugi (9000)

Akun ini adalah akun **sementara** yang hanya digunakan selama proses penutupan:

| Properti | Nilai |
|----------|-------|
| Kode | 9000 |
| Nama | Ikhtisar Laba Rugi |
| Tipe | Akun Sementara (Nominal) |
| Saldo Normal | Tidak ada (sementara) |
| Setelah penutupan | Harus = 0 |

```
Cara membaca saldo Ikhtisar Laba Rugi:
  Sisi Kredit > Sisi Debit  → LABA  → pindah ke Modal (Kredit)
  Sisi Debit  > Sisi Kredit → RUGI  → pindah dari Modal (Debit)
```

### 14.9 Checklist Jurnal Penutup

```
□ Neraca Saldo sebelum penutupan sudah BALANCED
□ Tahap A: Semua akun 4xxx sudah ditutup ke 9000
□ Tahap B: Semua akun 5xxx sudah ditutup dari 9000
□ Tahap C: Ikhtisar Laba Rugi (9000) sudah ditutup ke Modal
□ Tahap D: Prive (3100) sudah ditutup ke Modal (jika ada)
□ Saldo semua akun nominal = 0
□ Neraca Saldo Setelah Penutupan hanya berisi akun riil
□ Neraca Saldo Setelah Penutupan BALANCED
□ Periode dikunci — tidak ada input transaksi baru
□ Generate PDF Neraca Saldo Setelah Penutupan
```

### 14.10 Ringkasan Aturan AI untuk Jurnal Penutup

```
╔══════════════════════════════════════════════════════════════════╗
║  ATURAN JURNAL PENUTUP — REFERENSI AI                           ║
╠══════════════════════════════════════════════════════════════════╣
║  A. Tutup Pendapatan (4xxx):                                    ║
║     DEBIT  4xxx (semua akun pendapatan)                         ║
║     KREDIT 9000 Ikhtisar Laba Rugi                              ║
║                                                                  ║
║  B. Tutup Beban (5xxx):                                         ║
║     DEBIT  9000 Ikhtisar Laba Rugi                              ║
║     KREDIT 5xxx (rinci satu per satu)                           ║
║                                                                  ║
║  C. Tutup Ikhtisar ke Modal:                                    ║
║     Jika LABA: DEBIT 9000 → KREDIT 3000                         ║
║     Jika RUGI: DEBIT 3000 → KREDIT 9000                         ║
║                                                                  ║
║  D. Tutup Prive (jika ada):                                     ║
║     DEBIT  3000 Modal Pemilik                                   ║
║     KREDIT 3100 Prive                                           ║
║                                                                  ║
║  LARANGAN:                                                       ║
║  ✗ Jangan tutup akun 1xxx (Aset)                                ║
║  ✗ Jangan tutup akun 2xxx (Liabilitas)                          ║
║  ✗ Jangan tutup akun 3000 (Modal) — hanya diperbarui            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## PENUTUP

Buku panduan ini mencakup seluruh aspek penggunaan Accounting Ledger System, mulai dari cara memulai, standar akuntansi PSAK yang digunakan, pola double-entry untuk berbagai jenis transaksi, hingga contoh kasus nyata dengan output laporan lengkap.

Sistem ini dirancang untuk membantu pelaku usaha, mahasiswa akuntansi, dan profesional keuangan dalam mencatat transaksi secara akurat dan efisien dengan bantuan kecerdasan buatan.

```
Accounting Ledger System v1.0.0
Dibuat oleh: Eko Asif
Standar: PSAK (Pernyataan Standar Akuntansi Keuangan) Indonesia
Lisensi: Untuk penggunaan pribadi dan edukasi
```

---

*Dokumen ini diperbarui secara berkala sesuai perkembangan sistem.*
*Untuk pertanyaan dan dukungan, buka GitHub Issues pada repositori proyek.*
