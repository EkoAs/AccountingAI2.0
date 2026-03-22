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

    return `Kamu adalah sistem akuntansi Indonesia yang mengikuti standar PSAK dan double-entry bookkeeping.

TRANSAKSI:
- Deskripsi: ${transactionData.description}
- Harga Satuan: Rp ${transactionData.amount.toLocaleString('id-ID')}
- Kuantitas: ${transactionData.quantity}
- Total: Rp ${transactionData.totalAmount.toLocaleString('id-ID')}
- Tanggal: ${transactionData.date}

DAFTAR AKUN:
${accountsList}

ATURAN SALDO NORMAL (WAJIB DIIKUTI):
- Akun 1xxx (Aset): Bertambah = DEBIT, Berkurang = KREDIT
- Akun 2xxx (Liabilitas): Bertambah = KREDIT, Berkurang = DEBIT
- Akun 3xxx (Ekuitas/Modal): Bertambah = KREDIT, Berkurang = DEBIT
- Akun 4xxx (Pendapatan): Bertambah = KREDIT, Berkurang = DEBIT
- Akun 5xxx (Beban): Bertambah = DEBIT, Berkurang = KREDIT

POLA DOUBLE-ENTRY (setiap transaksi HARUS menghasilkan 2 baris jurnal):
- modal_awal / investasi → DEBIT Kas (1000) + KREDIT Modal (3000)
- beli_peralatan tunai → DEBIT Peralatan (1800) + KREDIT Kas (1000)
- beli_perlengkapan tunai → DEBIT Beban Perlengkapan (5400) + KREDIT Kas (1000)
- pendapatan_jasa tunai → DEBIT Kas (1000) + KREDIT Pendapatan Jasa (4000)
- bayar_gaji → DEBIT Beban Gaji (5100) + KREDIT Kas (1000)
- bayar_sewa → DEBIT Beban Sewa (5200) + KREDIT Kas (1000)
- bayar_listrik → DEBIT Beban Listrik (5300) + KREDIT Kas (1000)
- piutang_usaha → DEBIT Piutang (1100) + KREDIT Pendapatan (4000)
- hutang_usaha → DEBIT Aset/Beban + KREDIT Utang Usaha (2000)

Jawab HANYA dalam format JSON valid (tanpa markdown):
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
  "reasoning": "Penjelasan singkat dalam Bahasa Indonesia mengapa jurnal ini benar"
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
