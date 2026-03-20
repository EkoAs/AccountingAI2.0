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

    return `You are an accounting expert. Classify the following transaction:

Transaction Description: ${transactionData.description}
Amount: ${transactionData.amount}
Quantity: ${transactionData.quantity}
Date: ${transactionData.date}

Available Accounts:
${accountsList}

Respond in JSON format with:
{
  "accountCode": "account code",
  "accountName": "account name",
  "accountType": "Asset/Liability/Equity/Revenue/Expense",
  "debitCredit": "debit or credit",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Ensure the classification follows double-entry bookkeeping principles.`;
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
      const responseText = data.candidates[0].content.parts[0].text;

      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const classification = JSON.parse(jsonMatch[0]);
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
