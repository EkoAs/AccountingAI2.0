# Aturan Balance & Pola Double-Entry (PSAK)

## 1. Persamaan Dasar Akuntansi

```
Aset (Harta) = Liabilitas (Utang) + Ekuitas (Modal)
```

Setiap transaksi HARUS menghasilkan **2 baris jurnal** (Debit + Kredit) dengan jumlah yang sama.

---

## 2. Aturan Saldo Normal

| Kelompok Akun | Kode Awal | Bertambah | Berkurang | Saldo Normal |
|---------------|-----------|-----------|-----------|--------------|
| Aset | 1xxx | Debit | Kredit | Debit |
| Liabilitas | 2xxx | Kredit | Debit | Kredit |
| Ekuitas/Modal | 3xxx | Kredit | Debit | Kredit |
| Pendapatan | 4xxx | Kredit | Debit | Kredit |
| Beban/HPP | 5xxx | Debit | Kredit | Debit |

---

## 3. Chart of Accounts (PSAK Indonesia)

### Aset (1000–1999)
| Kode | Nama | Kategori |
|------|------|----------|
| 1000 | Kas | Aset Lancar |
| 1010 | Bank | Aset Lancar |
| 1100 | Piutang Dagang | Aset Lancar |
| 1200 | Persediaan Barang Dagangan | Aset Lancar |
| 1500 | Perlengkapan | Aset Lancar |
| 1600 | Beban Dibayar Dimuka | Aset Lancar |
| 1800 | Peralatan | Aset Tetap |
| 1810 | Akumulasi Penyusutan Peralatan | Aset Tetap |

### Liabilitas (2000–2999)
| Kode | Nama | Kategori |
|------|------|----------|
| 2000 | Utang Dagang | Liabilitas Lancar |
| 2100 | Utang Bank | Liabilitas Lancar |
| 2200 | Beban Yang Masih Harus Dibayar | Liabilitas Lancar |
| 2300 | Pendapatan Diterima Dimuka | Liabilitas Lancar |

### Ekuitas (3000–3999)
| Kode | Nama |
|------|------|
| 3000 | Modal Pemilik |
| 3100 | Prive |

### Pendapatan (4000–4999)
| Kode | Nama | Kategori |
|------|------|----------|
| 4000 | Penjualan | Pendapatan Usaha |
| 4100 | Retur Penjualan dan Potongan Harga | Pendapatan Usaha |
| 4200 | Potongan Penjualan | Pendapatan Usaha |
| 4900 | Pendapatan Lain-lain | Pendapatan Lain |

### Beban & HPP (5000–5999)
| Kode | Nama | Kategori |
|------|------|----------|
| 5010 | Pembelian | Harga Pokok |
| 5020 | Retur Pembelian dan Potongan Harga | Harga Pokok |
| 5030 | Potongan Pembelian | Harga Pokok |
| 5040 | Beban Angkut Pembelian | Harga Pokok |
| 5100 | Beban Gaji | Beban Usaha |
| 5200 | Beban Sewa | Beban Usaha |
| 5300 | Beban Listrik dan Air | Beban Usaha |
| 5400 | Beban Perlengkapan | Beban Usaha |
| 5500 | Beban Penyusutan | Beban Usaha |
| 5600 | Beban Asuransi | Beban Usaha |
| 5700 | Beban Pemasaran | Beban Usaha |
| 5710 | Beban Iklan | Beban Usaha |
| 5750 | Beban Angkut Penjualan | Beban Usaha |
| 5800 | Beban Bunga | Beban Lain |
| 5900 | Beban Lain-lain | Beban Lain |

---

## 4. Pola Double-Entry — Perusahaan Dagang

### Pembelian Barang Dagangan
```
pembelian_kredit / syarat_kredit / n/30 / 2/15 (KREDIT)
  → DEBIT  Pembelian (5010)    [HPP bertambah]
  → KREDIT Utang Dagang (2000) [Utang bertambah]
  ⚠️ Syarat "2/15, n/30" = pembelian kredit, BUKAN tunai

pembelian_tunai / beli_tunai (TUNAI)
  → DEBIT  Pembelian (5010) [HPP bertambah]
  → KREDIT Kas (1000)       [Kas berkurang]

beban_angkut_pembelian / ongkir_beli
  → DEBIT  Beban Angkut Pembelian (5040) [Beban bertambah]
  → KREDIT Kas (1000)                    [Kas berkurang]

retur_pembelian / retur_beli
  → DEBIT  Utang Dagang (2000)    [Utang berkurang]
  → KREDIT Retur Pembelian (5020) [Retur bertambah]

potongan_pembelian / diskon_beli
  → DEBIT  Utang Dagang (2000)      [Utang berkurang]
  → KREDIT Potongan Pembelian (5030) [Potongan bertambah]

bayar_utang_dagang / lunasi_utang
  → DEBIT  Utang Dagang (2000) [Utang berkurang]
  → KREDIT Kas (1000)          [Kas berkurang]
```

### Penjualan Barang Dagangan
```
penjualan_kredit / jual_kredit (KREDIT)
  → DEBIT  Piutang Dagang (1100) [Piutang bertambah]
  → KREDIT Penjualan (4000)      [Pendapatan bertambah]

penjualan_tunai / jual_tunai (TUNAI)
  → DEBIT  Kas (1000)       [Kas bertambah]
  → KREDIT Penjualan (4000) [Pendapatan bertambah]

retur_penjualan / retur_jual
  → DEBIT  Retur Penjualan (4100) [Retur bertambah]
  → KREDIT Piutang Dagang (1100)  [Piutang berkurang]

potongan_penjualan / diskon_jual
  → DEBIT  Potongan Penjualan (4200) [Potongan bertambah]
  → KREDIT Piutang Dagang (1100)     [Piutang berkurang]

beban_angkut_penjualan / ongkir / kirim_barang
  → DEBIT  Beban Angkut Penjualan (5750) [Beban bertambah]
  → KREDIT Kas (1000)                    [Kas berkurang]

penerimaan_piutang / terima_pelunasan
  → DEBIT  Kas (1000)            [Kas bertambah]
  → KREDIT Piutang Dagang (1100) [Piutang berkurang]
```

---

## 5. Pola Double-Entry — Perusahaan Jasa & Umum

### Modal & Ekuitas
```
modal_awal / investor / setoran_pemilik
  → DEBIT  Kas (1000)           [Kas bertambah]
  → KREDIT Modal Pemilik (3000) [Modal bertambah]
  ⚠️ KRITIS: "investor" = EKUITAS (3000), BUKAN Beban (5xxx)

prive / penarikan
  → DEBIT  Prive (3100) [Prive bertambah]
  → KREDIT Kas (1000)   [Kas berkurang]
```

### Pendapatan Jasa
```
pendapatan_jasa / jasa (tunai)
  → DEBIT  Kas (1000)       [Kas bertambah]
  → KREDIT Penjualan (4000) [Pendapatan bertambah]

piutang / jasa_belum_dibayar (kredit)
  → DEBIT  Piutang Dagang (1100) [Piutang bertambah]
  → KREDIT Penjualan (4000)      [Pendapatan bertambah]
```

### Pembelian Tunai vs Kredit
```
perlengkapan / atk / pulpen (TUNAI)
  → DEBIT  Beban Perlengkapan (5400) [Beban bertambah]
  → KREDIT Kas (1000)                [Kas berkurang]

perlengkapan_belum_dibayar / atk_kredit (KREDIT)
  → DEBIT  Beban Perlengkapan (5400) [Beban bertambah]
  → KREDIT Utang Dagang (2000)       [Utang bertambah]
  ⚠️ "Belum dibayar" = Utang Dagang (2000), BUKAN Kas

peralatan / komputer / laptop (TUNAI)
  → DEBIT  Peralatan (1800) [Peralatan bertambah]
  → KREDIT Kas (1000)       [Kas berkurang]

peralatan_belum_dibayar / beli_peralatan_kredit (KREDIT)
  → DEBIT  Peralatan (1800)    [Peralatan bertambah]
  → KREDIT Utang Dagang (2000) [Utang bertambah]
```

### Beban Operasional
```
gaji / upah / honor
  → DEBIT  Beban Gaji (5100) | KREDIT Kas (1000)

sewa / rental
  → DEBIT  Beban Sewa (5200) | KREDIT Kas (1000)

listrik / air / wifi / internet / pln
  → DEBIT  Beban Listrik dan Air (5300) | KREDIT Kas (1000)

beban_iklan / iklan / reklame
  → DEBIT  Beban Iklan (5710) | KREDIT Kas (1000)

asuransi / premi
  → DEBIT  Beban Asuransi (5600) | KREDIT Kas (1000)

bunga / interest
  → DEBIT  Beban Bunga (5800) | KREDIT Kas (1000)
```

### Utang & Pinjaman
```
pinjaman / loan / kredit_bank
  → DEBIT  Kas (1000)       [Kas bertambah]
  → KREDIT Utang Bank (2100) [Utang bertambah]
```

---

## 6. Contoh Jurnal — PT. Karya Usaha (Perusahaan Dagang)

### Pembelian Kredit (syarat 2/15, n/30)
```
Input: pembelian_kredit 10000000 1 2025-01-05

Jurnal:
2025-01-05 | 5010 | Pembelian    | Debit  Rp 10.000.000
2025-01-05 | 2000 | Utang Dagang | Kredit Rp 10.000.000
✅ Balance — Syarat kredit = Utang Dagang, bukan Kas
```

### Penjualan Kredit
```
Input: penjualan_kredit 15000000 1 2025-01-10

Jurnal:
2025-01-10 | 1100 | Piutang Dagang | Debit  Rp 15.000.000
2025-01-10 | 4000 | Penjualan      | Kredit Rp 15.000.000
✅ Balance
```

### Retur Penjualan
```
Input: retur_penjualan 500000 1 2025-01-14

Jurnal:
2025-01-14 | 4100 | Retur Penjualan | Debit  Rp 500.000
2025-01-14 | 1100 | Piutang Dagang  | Kredit Rp 500.000
✅ Balance
```

### Beban Angkut Penjualan
```
Input: beban_angkut_penjualan 200000 1 2025-01-15

Jurnal:
2025-01-15 | 5750 | Beban Angkut Penjualan | Debit  Rp 200.000
2025-01-15 | 1000 | Kas                    | Kredit Rp 200.000
✅ Balance
```

### Beban Iklan
```
Input: beban_iklan 300000 1 2025-01-20

Jurnal:
2025-01-20 | 5710 | Beban Iklan | Debit  Rp 300.000
2025-01-20 | 1000 | Kas         | Kredit Rp 300.000
✅ Balance
```

---

## 7. Contoh Jurnal — Perusahaan Jasa

### Modal Awal / Investor
```
Input: modal_awal 50000000 1 2025-01-01
Input: investor 10000000 1 2025-01-20

Jurnal:
2025-01-01 | 1000 | Kas           | Debit  Rp 50.000.000
2025-01-01 | 3000 | Modal Pemilik | Kredit Rp 50.000.000
✅ Balance — Investor = Ekuitas, bukan Beban
```

### Perlengkapan Belum Dibayar
```
Input: perlengkapan_belum_dibayar 500000 1 2025-01-10

Jurnal:
2025-01-10 | 5400 | Beban Perlengkapan | Debit  Rp 500.000
2025-01-10 | 2000 | Utang Dagang       | Kredit Rp 500.000
✅ Balance — Belum dibayar = Utang Dagang, bukan Kas
```

---

## 8. Format Input Transaksi

```
[nama_item] [harga_satuan] [kuantitas] [tanggal]
```

| Contoh Input | Debit | Kredit |
|-------------|-------|--------|
| `modal_awal 50000000 1 2025-01-01` | Kas (1000) | Modal Pemilik (3000) |
| `pembelian_kredit 10000000 1 2025-01-05` | Pembelian (5010) | Utang Dagang (2000) |
| `penjualan_kredit 15000000 1 2025-01-10` | Piutang Dagang (1100) | Penjualan (4000) |
| `penjualan_tunai 5000000 1 2025-01-12` | Kas (1000) | Penjualan (4000) |
| `retur_penjualan 500000 1 2025-01-14` | Retur Penjualan (4100) | Piutang Dagang (1100) |
| `beban_angkut_penjualan 200000 1 2025-01-15` | Beban Angkut Penjualan (5750) | Kas (1000) |
| `beban_iklan 300000 1 2025-01-20` | Beban Iklan (5710) | Kas (1000) |
| `gaji 3000000 1 2025-01-05` | Beban Gaji (5100) | Kas (1000) |
| `perlengkapan_belum_dibayar 500000 1 2025-01-10` | Beban Perlengkapan (5400) | Utang Dagang (2000) |
| `pinjaman 20000000 1 2025-01-25` | Kas (1000) | Utang Bank (2100) |
| `prive 1000000 1 2025-01-30` | Prive (3100) | Kas (1000) |

---

## 9. Validasi Balance

Sistem menampilkan status di panel laporan:

```
✓ Balanced  → Total Debit = Total Kredit (tombol Generate PDF aktif)
✗ Unbalanced → Ada selisih (tombol Generate PDF nonaktif)
```

> Catatan: Jika chart of accounts diperbarui (setelah update sistem), klik **Reset All Data** di panel pengaturan untuk menghapus data lama dan mulai dengan chart of accounts terbaru.
