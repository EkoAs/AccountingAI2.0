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

    return `You are an expert Indonesian accounting classifier. Your task is to classify transactions according to Indonesian accounting standards (SAK).

TRANSACTION TO CLASSIFY:
- Item/Description: ${transactionData.description}
- Unit Price: Rp ${transactionData.amount.toLocaleString('id-ID')}
- Quantity: ${transactionData.quantity}
- Total Amount: Rp ${transactionData.totalAmount.toLocaleString('id-ID')}
- Date: ${transactionData.date}

AVAILABLE ACCOUNTS:
${accountsList}

CLASSIFICATION RULES:
1. DEBIT/CREDIT DETERMINATION:
   - Asset accounts (1xxx): DEBIT when increasing
   - Liability accounts (2xxx): CREDIT when increasing
   - Equity accounts (3xxx): CREDIT when increasing
   - Revenue accounts (4xxx): CREDIT when increasing
   - Expense accounts (5xxx): DEBIT when increasing

2. EXPENSE CLASSIFICATION:
   - Supplies/Perlengkapan (5400): Pulpen, kertas, tinta, sticky notes, dll (habis dalam 1 tahun)
   - Equipment/Peralatan (1800): Komputer, printer, furniture, kendaraan (tahan lama >1 tahun)
   - Salary/Gaji (5100): Gaji karyawan, upah
   - Rent/Sewa (5200): Sewa kantor, sewa kendaraan
   - Utilities/Listrik (5300): Listrik, air, internet, telepon
   - Depreciation/Penyusutan (5500): Penyusutan aset
   - Insurance/Asuransi (5600): Asuransi kendaraan, asuransi kantor
   - Marketing/Pemasaran (5700): Iklan, promosi
   - Interest/Bunga (5800): Bunga pinjaman

3. ASSET CLASSIFICATION:
   - Cash (1000): Uang tunai
   - Bank (1010): Rekening bank
   - Receivable/Piutang (1100): Piutang usaha
   - Inventory (1200): Barang dagangan, stok
   - Supplies/Perlengkapan (1500): Perlengkapan kantor (aset)
   - Equipment/Peralatan (1800): Peralatan, kendaraan, furniture

4. LIABILITY CLASSIFICATION:
   - Payable/Hutang (2000): Hutang usaha
   - Debt/Pinjaman (2100): Pinjaman bank, pinjaman jangka panjang
   - Accrued/Akrual (2200): Beban yang masih harus dibayar

KEYWORD MATCHING:
- "pulpen", "kertas", "tinta", "sticky", "penghapus", "penggaris" → Supplies (5400)
- "komputer", "printer", "meja", "kursi", "lemari", "mobil", "motor" → Equipment (1800)
- "gaji", "upah", "honor" → Salary (5100)
- "sewa", "rental" → Rent (5200)
- "listrik", "air", "internet", "telepon" → Utilities (5300)
- "hutang", "utang", "payable" → Payable (2000)
- "pinjaman", "loan" → Debt (2100)

Respond ONLY in valid JSON format (no markdown, no extra text):
{
  "accountCode": "exact account code from list",
  "accountName": "exact account name from list",
  "accountType": "Asset/Liability/Equity/Revenue/Expense",
  "debitCredit": "debit or credit",
  "confidence": 0.95,
  "reasoning": "Brief explanation in Indonesian why this classification is correct"
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

      // Parse JSON from response - handle various formats
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const classification = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!classification.accountCode || !classification.accountName || !classification.accountType) {
        throw new Error('Missing required classification fields');
      }

      // Normalize debitCredit field
      if (classification.debitCredit) {
        classification.debitCredit = classification.debitCredit.toLowerCase();
      }

      return {
        classification: classification,
        success: true
      };
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
    const suggestion = accountingCalculator.suggestAccountClassification(
      transactionData.description,
      chartOfAccounts
    );

    return {
      classification: {
        accountCode: suggestion.accountCode,
        accountName: suggestion.accountName,
        accountType: suggestion.accountType,
        debitCredit: suggestion.debitCredit,
        confidence: suggestion.confidence,
        reasoning: 'Classified using local rules (AI unavailable)'
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
