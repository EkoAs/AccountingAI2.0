/**
 * AI Classifier Module - Integrates with Gemini API for transaction classification
 * Handles secure API communication and classification logic
 */

class AIClassifier {
  constructor() {
    this.apiKey = null;
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.requestCount = 0;
    this.requestLimit = 100; // per hour
    this.lastResetTime = Date.now();
    this.requestCache = new Map();
  }

  /**
   * Initialize API key from environment
   * @param {string} apiKey - Gemini API key
   * @returns {boolean} Success status
   */
  initializeApiKey(apiKey) {
    if (!apiKey) {
      console.error('API key not provided');
      return false;
    }
    this.apiKey = apiKey;
    return true;
  }

  /**
   * Check if rate limit exceeded
   * @returns {boolean} True if limit exceeded
   */
  isRateLimitExceeded() {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;

    if (now - this.lastResetTime > hourInMs) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    return this.requestCount >= this.requestLimit;
  }

  /**
   * Classify transaction using Gemini AI
   * @param {object} transactionData - Transaction data
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {Promise<object>} Classification result
   */
  async classifyTransaction(transactionData, chartOfAccounts) {
    try {
      if (!this.apiKey) {
        return this.getFallbackClassification(transactionData, chartOfAccounts);
      }

      if (this.isRateLimitExceeded()) {
        console.warn('Rate limit exceeded, using fallback classification');
        return this.getFallbackClassification(transactionData, chartOfAccounts);
      }

      // Check cache
      const cacheKey = this.generateCacheKey(transactionData);
      if (this.requestCache.has(cacheKey)) {
        return this.requestCache.get(cacheKey);
      }

      const prompt = this.buildClassificationPrompt(transactionData, chartOfAccounts);
      const response = await this.callGeminiAPI(prompt);

      this.requestCount++;

      if (response && response.classification) {
        this.requestCache.set(cacheKey, response);
        return response;
      }

      return this.getFallbackClassification(transactionData, chartOfAccounts);
    } catch (error) {
      console.error('Error classifying transaction:', error);
      return this.getFallbackClassification(transactionData, chartOfAccounts);
    }
  }

  /**
   * Build classification prompt for Gemini
   * @param {object} transactionData - Transaction data
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {string} Prompt text
   */
  buildClassificationPrompt(transactionData, chartOfAccounts) {
    const accountsList = chartOfAccounts
      .map(a => `${a.code}: ${a.name} (${a.type})`)
      .join('\n');

    // ══════════════════════════════════════════════════════════════════
    // PROMPT GEMINI AI — SISTEM AKUNTANSI PSAK
    // Bagian ini dikirim ke Gemini API sebagai instruksi klasifikasi.
    // Ubah isi prompt di sini untuk menyesuaikan perilaku AI.
    // ══════════════════════════════════════════════════════════════════
    return `Kamu adalah sistem akuntansi profesional Indonesia yang mengikuti standar PSAK dan prinsip double-entry bookkeeping. Sistem ini mendukung perusahaan jasa maupun perusahaan dagang.

TRANSAKSI:
- Deskripsi: ${transactionData.description}
- Harga Satuan: Rp ${transactionData.amount.toLocaleString('id-ID')}
- Kuantitas: ${transactionData.quantity}
- Total: Rp ${transactionData.totalAmount.toLocaleString('id-ID')}
- Tanggal: ${transactionData.date}

DAFTAR AKUN TERSEDIA:
${accountsList}

═══════════════════════════════════════════════
ATURAN SALDO NORMAL (WAJIB DIIKUTI)
═══════════════════════════════════════════════
- Akun 1xxx (Aset)      : Bertambah = DEBIT  | Berkurang = KREDIT
- Akun 2xxx (Liabilitas): Bertambah = KREDIT | Berkurang = DEBIT
- Akun 3xxx (Ekuitas)   : Bertambah = KREDIT | Berkurang = DEBIT
- Akun 4xxx (Pendapatan): Bertambah = KREDIT | Berkurang = DEBIT
- Akun 5xxx (Beban/HPP) : Bertambah = DEBIT  | Berkurang = KREDIT

═══════════════════════════════════════════════
POLA DOUBLE-ENTRY — PERUSAHAAN DAGANG
═══════════════════════════════════════════════
PEMBELIAN BARANG DAGANGAN:
- pembelian_kredit / beli_kredit / syarat_kredit (mis. 2/15,n/30) / kredit_dagang
  → DEBIT Pembelian (5010) + KREDIT Utang Dagang (2000)
  ⚠️ Syarat kredit seperti "2/15, n/30" = pembelian kredit, BUKAN tunai
- pembelian_tunai / beli_tunai / beli_barang_tunai
  → DEBIT Pembelian (5010) + KREDIT Kas (1000)
- beban_angkut_pembelian / ongkir_beli / freight_in
  → DEBIT Beban Angkut Pembelian (5040) + KREDIT Kas (1000)
- retur_pembelian / retur_beli / kembalikan_barang_beli
  → DEBIT Utang Dagang (2000) + KREDIT Retur Pembelian (5020)
- potongan_pembelian / diskon_beli
  → DEBIT Utang Dagang (2000) + KREDIT Potongan Pembelian (5030)

PENJUALAN BARANG DAGANGAN:
- penjualan_kredit / jual_kredit / jual_piutang
  → DEBIT Piutang Dagang (1100) + KREDIT Penjualan (4000)
- penjualan_tunai / jual_tunai / jual_kas
  → DEBIT Kas (1000) + KREDIT Penjualan (4000)
- retur_penjualan / retur_jual / barang_dikembalikan_pembeli
  → DEBIT Retur Penjualan (4100) + KREDIT Piutang Dagang (1100)
- potongan_penjualan / diskon_jual / sales_discount
  → DEBIT Potongan Penjualan (4200) + KREDIT Piutang Dagang (1100)
- beban_angkut_penjualan / ongkir_jual / freight_out / kirim_barang
  → DEBIT Beban Angkut Penjualan (5750) + KREDIT Kas (1000)
- penerimaan_piutang / terima_pelunasan / bayar_piutang
  → DEBIT Kas (1000) + KREDIT Piutang Dagang (1100)
- bayar_utang_dagang / lunasi_utang / pelunasan_utang
  → DEBIT Utang Dagang (2000) + KREDIT Kas (1000)

═══════════════════════════════════════════════
POLA DOUBLE-ENTRY — PERUSAHAAN JASA & UMUM
═══════════════════════════════════════════════
MODAL & EKUITAS:
- modal_awal / investasi / investor / setoran_pemilik / capital
  → DEBIT Kas (1000) + KREDIT Modal Pemilik (3000)
  ⚠️ KRITIS: "investor" atau "investasi" = EKUITAS (3000), BUKAN Beban (5xxx)
- prive / penarikan / ambil_uang / drawing
  → DEBIT Prive (3100) + KREDIT Kas (1000)

PENDAPATAN JASA:
- pendapatan_jasa_tunai / terima_jasa / jasa_tunai
  → DEBIT Kas (1000) + KREDIT Penjualan (4000)
- piutang_jasa / jasa_kredit / jasa_belum_dibayar
  → DEBIT Piutang Dagang (1100) + KREDIT Penjualan (4000)

BEBAN OPERASIONAL:
- bayar_gaji / beban_gaji / upah / honor / salary
  → DEBIT Beban Gaji (5100) + KREDIT Kas (1000)
- bayar_sewa / beban_sewa / rent
  → DEBIT Beban Sewa (5200) + KREDIT Kas (1000)
- bayar_listrik / beban_listrik / pln / token / air / pam / internet / wifi
  → DEBIT Beban Listrik dan Air (5300) + KREDIT Kas (1000)
- perlengkapan_tunai / beli_perlengkapan / atk / alat_tulis / supplies / pulpen / kertas / tinta
  → DEBIT Perlengkapan (1500) + KREDIT Kas (1000)
  ⚠️ Perlengkapan = ASET (1500) saat dibeli, BUKAN Beban (5400). Beban Perlengkapan (5400) hanya untuk jurnal penyesuaian.
- perlengkapan_belum_dibayar / perlengkapan_kredit / atk_kredit / atk_belum_dibayar
  → DEBIT Perlengkapan (1500) + KREDIT Utang Dagang (2000)
  ⚠️ "belum dibayar" = Utang Dagang (2000), BUKAN Kas
- beban_iklan / iklan / promosi / advertise / ads / marketing
  → DEBIT Beban Iklan (5710) + KREDIT Kas (1000)
- beban_asuransi / asuransi / premi / insurance
  → DEBIT Beban Asuransi (5600) + KREDIT Kas (1000)
- beban_bunga / bunga / interest
  → DEBIT Beban Bunga (5800) + KREDIT Kas (1000)

ASET TETAP:
- beli_peralatan_tunai / peralatan_tunai / equipment_tunai / komputer / laptop / mesin / kendaraan / mobil / motor / furniture
  → DEBIT Peralatan (1800) + KREDIT Kas (1000)
  ⚠️ Peralatan (1800) = barang masa manfaat > 1 tahun. Perlengkapan (1500) = barang habis pakai.
- beli_peralatan_kredit / peralatan_belum_dibayar / peralatan_kredit
  → DEBIT Peralatan (1800) + KREDIT Utang Dagang (2000)

UTANG & PINJAMAN:
- pinjaman_bank / kredit_bank / loan
  → DEBIT Kas (1000) + KREDIT Utang Bank (2100)

BEBAN DIBAYAR DI MUKA (Prepaid Expenses):
- sewa_dimuka / sewa_dibayar_dimuka / sewa_setahun / bayar_sewa_dimuka
  → DEBIT Sewa Dibayar di Muka (1300) + KREDIT Kas (1000)
  ⚠️ Bayar sewa untuk periode mendatang = ASET (1300), bukan langsung Beban Sewa (5200)
- asuransi_dimuka / asuransi_dibayar_dimuka / premi_dimuka / asuransi_setahun
  → DEBIT Asuransi Dibayar di Muka (1400) + KREDIT Kas (1000)
- bayar_dimuka / dibayar_dimuka / prepaid / bayar_setahun
  → DEBIT Beban Dibayar Dimuka (1600) + KREDIT Kas (1000)

PENDAPATAN DITERIMA DI MUKA (Unearned Revenue):
- dp_proyek / panjar / terima_dimuka / terima_dp / uang_muka_terima
  → DEBIT Kas (1000) + KREDIT Pendapatan Diterima Dimuka (2300)
  ⚠️ DP/panjar dari klien = LIABILITAS (2300), BUKAN Pendapatan (4xxx). Jasa belum dikerjakan.

PENYUSUTAN (Depreciation):
- penyusutan / depresiasi / depreciation / beban_penyusutan / penyusutan_peralatan
  → DEBIT Beban Penyusutan (5500) + KREDIT Akumulasi Penyusutan Peralatan (1810)
  ⚠️ JANGAN potong langsung akun Peralatan (1800). Gunakan akun kontra 1810.

═══════════════════════════════════════════════
JURNAL PENYESUAIAN (ADJUSTING ENTRIES) — MODE 5
═══════════════════════════════════════════════
A. PENYUSUTAN ASET TETAP:
- penyusutan / depresiasi / penyusutan_kendaraan / penyusutan_peralatan / penyusutan_mesin
  → DEBIT Beban Penyusutan (5500) + KREDIT Akumulasi Penyusutan Peralatan (1810)
  ⚠️ JANGAN potong Peralatan (1800) langsung

B. PEMAKAIAN PERLENGKAPAN:
- pemakaian_perlengkapan / perlengkapan_terpakai / pemakaian_atk / supplies_used
  → DEBIT Beban Perlengkapan (5400) + KREDIT Perlengkapan (1500)
  ⚠️ Ini kebalikan dari saat beli — sekarang Perlengkapan (Aset) berkurang, Beban bertambah

C. BEBAN DIBAYAR DI MUKA JATUH TEMPO:
- sewa_jatuh_tempo / beban_sewa_penyesuaian / sewa_dimuka_jatuh / sewa_bulan_ini
  → DEBIT Beban Sewa (5200) + KREDIT Sewa Dibayar di Muka (1300)
- asuransi_jatuh_tempo / beban_asuransi_penyesuaian / asuransi_dimuka_jatuh
  → DEBIT Beban Asuransi (5600) + KREDIT Asuransi Dibayar di Muka (1400)

D. BEBAN MASIH HARUS DIBAYAR (Accrued Expense):
- gaji_terutang / utang_gaji / gaji_belum_dibayar / accrued_salary
  → DEBIT Beban Gaji (5100) + KREDIT Beban Yang Masih Harus Dibayar (2200)
- listrik_terutang / utang_listrik / listrik_belum_dibayar
  → DEBIT Beban Listrik dan Air (5300) + KREDIT Beban Yang Masih Harus Dibayar (2200)
- beban_terutang / masih_harus_dibayar / accrued_expense
  → DEBIT Beban terkait (5xxx) + KREDIT Beban Yang Masih Harus Dibayar (2200)

F. PENDAPATAN MASIH HARUS DITERIMA (Accrued Revenue):
- utang_pendapatan / pendapatan_belum_diterima / piutang_pendapatan / accrued_revenue
- pendapatan_terutang / invoice_belum_cair / tagihan_belum_dibayar
- pendapatan_masih_harus_diterima / jasa_belum_dibayar_klien
  → DEBIT Piutang Pendapatan (1650) + KREDIT Penjualan/Pendapatan (4000)
  ⚠️ Jasa SUDAH selesai dikerjakan tapi uang BELUM diterima → Aset (1650), bukan Kas
  ⚠️ Berbeda dengan Pendapatan Diterima Dimuka (2300) yang uangnya sudah masuk tapi jasa belum dikerjakan

E. PENDAPATAN DITERIMA DI MUKA DIAKUI:
- pendapatan_diakui / jasa_selesai / dp_selesai / panjar_selesai / unearned_earned
  → DEBIT Pendapatan Diterima Dimuka (2300) + KREDIT Penjualan/Pendapatan (4000)
  ⚠️ Ini kebalikan dari saat terima DP — sekarang Liabilitas berkurang, Pendapatan diakui

═══════════════════════════════════════════════
PERSEDIAAN BARANG DAGANGAN & HPP — PERUSAHAAN DAGANG
═══════════════════════════════════════════════
PERSEDIAAN (Akun 1200 = ASET, bukan Beban):
- beli_persediaan / beli_barang_dagang / tambah_stok
  → DEBIT Persediaan Barang Dagangan (1200) + KREDIT Kas (1000)
- beli_persediaan_kredit / stok_kredit
  → DEBIT Persediaan Barang Dagangan (1200) + KREDIT Utang Dagang (2000)
⚠️ Persediaan adalah ASET (1200) sampai terjual. Saat terjual baru jadi HPP (5050).

HARGA POKOK PENJUALAN (HPP):
- hpp / harga_pokok_penjualan / cogs / cost_of_goods
  → DEBIT HPP (5050) + KREDIT Persediaan (1200)
- persediaan_akhir / stok_akhir
  → DEBIT Persediaan (1200) + KREDIT HPP (5050)
- persediaan_awal / stok_awal (metode Ikhtisar L/R)
  → DEBIT Ikhtisar Laba Rugi (9000) + KREDIT Persediaan (1200)
⚠️ Rumus HPP = Persediaan Awal + Pembelian Bersih - Persediaan Akhir
   Pembelian Bersih = Pembelian (5010) + Beban Angkut (5040) - Retur (5020) - Potongan (5030)

TERMIN / DISKON OTOMATIS (Syarat 2/10, n/30):
- Jika kata kunci mengandung syarat kredit seperti "2/10", "2/15", "n/30", "termin"
  → Catat sebagai pembelian/penjualan KREDIT (Utang/Piutang Dagang)
- Saat pelunasan dalam periode diskon (≤ 10 hari):
  - Potongan penjualan: DEBIT Potongan Penjualan (4200) + KREDIT Piutang Dagang (1100)
  - Potongan pembelian: DEBIT Utang Dagang (2000) + KREDIT Potongan Pembelian (5030)
- termin_jual / diskon_termin_jual → Potongan Penjualan (4200) / Piutang (1100)
- termin_beli / diskon_termin_beli → Utang Dagang (2000) / Potongan Pembelian (5030)

═══════════════════════════════════════════════
ATURAN KRITIS — WAJIB DIPATUHI
═══════════════════════════════════════════════
1. "investor", "investasi", "modal", "setoran" → Modal Pemilik (3000), BUKAN Beban (5xxx)
2. "belum dibayar", "kredit", "hutang" → akun lawan = Utang Dagang (2000), BUKAN Kas
3. "tunai", "cash", "bayar" (tanpa "belum") → akun lawan = Kas (1000)
4. Syarat kredit seperti "2/15, n/30", "n/60", "EOM" → transaksi KREDIT (Utang/Piutang), BUKAN tunai
5. Gunakan HANYA kode akun yang ada di DAFTAR AKUN TERSEDIA di atas
6. Setiap transaksi menghasilkan TEPAT 1 debit dan 1 kredit (double-entry)
7. PERLENGKAPAN (kertas, pulpen, ATK, supplies): gunakan Perlengkapan (1500) — ASET, bukan Beban (5400). Beban Perlengkapan (5400) hanya dipakai saat jurnal penyesuaian akhir periode.
8. PERALATAN (1800): hanya untuk barang dengan masa manfaat > 1 tahun (komputer, mesin, kendaraan, furniture). Perlengkapan (1500) untuk barang habis pakai (kertas, tinta, ATK).
9. Kata "hutang" atau "utang" tanpa konteks spesifik → default Kas (1000) Debit, Utang Dagang (2000) Kredit. Gunakan kata kunci spesifik untuk hasil lebih akurat.
10. BEBAN DIBAYAR DI MUKA: sewa/asuransi untuk periode mendatang → Aset (1300/1400/1600), BUKAN langsung Beban (5xxx).
11. PENDAPATAN DITERIMA DI MUKA: DP/panjar dari klien → Liabilitas (2300), BUKAN Pendapatan (4xxx).
12. PENYUSUTAN: selalu Debit Beban Penyusutan (5500) + Kredit Akumulasi Penyusutan (1810). JANGAN potong Peralatan (1800) langsung.
13. Kata kunci dengan underscore (mis. "modal_usaha", "sewa_dimuka") — kenali setiap kata di dalamnya. "modal_usaha" mengandung "modal" dan "usaha", keduanya relevan untuk klasifikasi.
14. JURNAL PENYESUAIAN — 5 tipe khusus dengan logika terbalik dari transaksi biasa:
    - pemakaian_perlengkapan: Debit Beban Perlengkapan (5400), Kredit Perlengkapan (1500) — kebalikan dari saat beli
    - sewa/asuransi jatuh tempo: Debit Beban (5200/5600), Kredit Prepaid (1300/1400) — kebalikan dari saat bayar dimuka
    - beban terutang: Debit Beban (5xxx), Kredit Beban Masih Harus Dibayar (2200)
    - pendapatan diakui: Debit Pendapatan Diterima Dimuka (2300), Kredit Pendapatan (4000) — kebalikan dari saat terima DP

Jawab HANYA dalam format JSON valid (tanpa markdown, tanpa komentar):
{
  "debitAccount": {
    "accountCode": "kode akun debit",
    "accountName": "nama akun debit",
    "accountType": "Asset/Liability/Equity/Revenue/Expense"
  },
  "creditAccount": {
    "accountCode": "kode akun kredit",
    "accountName": "nama akun kredit",
    "accountType": "Asset/Liability/Equity/Revenue/Expense"
  },
  "confidence": 0.95,
  "reasoning": "Penjelasan singkat dalam Bahasa Indonesia mengapa jurnal ini benar sesuai PSAK"
}`;
  }

  /**
   * Call Gemini API
   * @param {string} prompt - Prompt text
   * @returns {Promise<object>} API response
   */
  async callGeminiAPI(prompt) {
    try {
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response structure');
      }

      const responseText = data.candidates[0].content.parts[0].text;

      // Parse JSON from response
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);

      // Support both new double-entry format and legacy single-account format
      if (result.debitAccount && result.creditAccount) {
        // New double-entry format
        return {
          classification: {
            accountCode: result.debitAccount.accountCode,
            accountName: result.debitAccount.accountName,
            accountType: result.debitAccount.accountType,
            debitCredit: 'debit',
            offsetAccountCode: result.creditAccount.accountCode,
            offsetAccountName: result.creditAccount.accountName,
            offsetAccountType: result.creditAccount.accountType,
            confidence: result.confidence || 0.9,
            reasoning: result.reasoning || ''
          },
          success: true
        };
      }

      // Legacy single-account format fallback
      if (!result.accountCode || !result.accountName || !result.accountType) {
        throw new Error('Missing required classification fields');
      }
      if (result.debitCredit) {
        result.debitCredit = result.debitCredit.toLowerCase();
      }
      return { classification: result, success: true };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return null;
    }
  }

  /**
   * Get fallback classification using local rules
   * @param {object} transactionData - Transaction data
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {object} Classification result
   */
  getFallbackClassification(transactionData, chartOfAccounts) {
    const result = accountingCalculator.getDoubleEntryClassification(
      transactionData.description,
      chartOfAccounts
    );

    return {
      classification: {
        accountCode: result.debitAccount.code,
        accountName: result.debitAccount.name,
        accountType: result.debitAccount.type,
        debitCredit: 'debit',
        offsetAccountCode: result.creditAccount.code,
        offsetAccountName: result.creditAccount.name,
        offsetAccountType: result.creditAccount.type,
        confidence: result.confidence,
        reasoning: result.reasoning
      },
      success: true,
      fallback: true
    };
  }

  /**
   * Generate cache key for transaction
   * @param {object} transactionData - Transaction data
   * @returns {string} Cache key
   */
  generateCacheKey(transactionData) {
    return `${transactionData.description}_${transactionData.amount}_${transactionData.quantity}`;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.requestCache.clear();
  }

  /**
   * Get remaining requests for current hour
   * @returns {number} Remaining requests
   */
  getRemainingRequests() {
    return Math.max(0, this.requestLimit - this.requestCount);
  }

  /**
   * Reset rate limit counter
   */
  resetRateLimit() {
    this.requestCount = 0;
    this.lastResetTime = Date.now();
  }
}

const aiClassifier = new AIClassifier();
