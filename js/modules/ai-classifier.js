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
- perlengkapan_tunai / beli_perlengkapan / atk / alat_tulis / supplies
  → DEBIT Beban Perlengkapan (5400) + KREDIT Kas (1000)
- perlengkapan_belum_dibayar / perlengkapan_kredit / atk_kredit / atk_belum_dibayar
  → DEBIT Beban Perlengkapan (5400) + KREDIT Utang Dagang (2000)
  ⚠️ "belum dibayar" = Utang Dagang (2000), BUKAN Kas
- beban_iklan / iklan / promosi / advertise / ads / marketing
  → DEBIT Beban Iklan (5710) + KREDIT Kas (1000)
- beban_asuransi / asuransi / premi / insurance
  → DEBIT Beban Asuransi (5600) + KREDIT Kas (1000)
- beban_bunga / bunga / interest
  → DEBIT Beban Bunga (5800) + KREDIT Kas (1000)

ASET TETAP:
- beli_peralatan_tunai / peralatan_tunai / equipment_tunai
  → DEBIT Peralatan (1800) + KREDIT Kas (1000)
- beli_peralatan_kredit / peralatan_belum_dibayar / peralatan_kredit
  → DEBIT Peralatan (1800) + KREDIT Utang Dagang (2000)

UTANG & PINJAMAN:
- pinjaman_bank / kredit_bank / loan
  → DEBIT Kas (1000) + KREDIT Utang Bank (2100)

═══════════════════════════════════════════════
ATURAN KRITIS — WAJIB DIPATUHI
═══════════════════════════════════════════════
1. "investor", "investasi", "modal", "setoran" → Modal Pemilik (3000), BUKAN Beban (5xxx)
2. "belum dibayar", "kredit", "hutang" → akun lawan = Utang Dagang (2000), BUKAN Kas
3. "tunai", "cash", "bayar" (tanpa "belum") → akun lawan = Kas (1000)
4. Syarat kredit seperti "2/15, n/30" atau "n/30" → pembelian/penjualan KREDIT
5. Gunakan HANYA kode akun yang ada di DAFTAR AKUN TERSEDIA di atas
6. Setiap transaksi menghasilkan TEPAT 1 debit dan 1 kredit (double-entry)

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
