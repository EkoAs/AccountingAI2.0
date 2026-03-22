/**
 * Accounting Module - Handles accounting calculations and validations
 * Implements double-entry bookkeeping and accounting equation
 */

class AccountingCalculator {
  constructor() {
    this.debitAccountTypes = ['Asset', 'Expense'];
    this.creditAccountTypes = ['Liability', 'Equity', 'Revenue'];
  }

  /**
   * Determine if account should be debited or credited
   * @param {string} accountType - Account type (Asset, Liability, Equity, Revenue, Expense)
   * @returns {string} 'debit' or 'credit'
   */
  getDefaultDebitCredit(accountType) {
    if (this.debitAccountTypes.includes(accountType)) {
      return 'debit';
    } else if (this.creditAccountTypes.includes(accountType)) {
      return 'credit';
    }
    return 'debit';
  }

  /**
   * Calculate debit and credit amounts based on account type
   * @param {number} totalAmount - Total transaction amount
   * @param {string} accountType - Account type
   * @returns {object} {debitAmount, creditAmount}
   */
  calculateDebitCredit(totalAmount, accountType) {
    const defaultType = this.getDefaultDebitCredit(accountType);
    
    if (defaultType === 'debit') {
      return {
        debitAmount: totalAmount,
        creditAmount: 0
      };
    } else {
      return {
        debitAmount: 0,
        creditAmount: totalAmount
      };
    }
  }

  /**
   * Calculate account balance
   * @param {array} transactions - Array of transactions for account
   * @returns {number} Account balance
   */
  calculateAccountBalance(transactions) {
    let balance = 0;
    transactions.forEach(txn => {
      balance += txn.debitAmount;
      balance -= txn.creditAmount;
    });
    return balance;
  }

  /**
   * Calculate running balance for transactions
   * @param {array} transactions - Array of transactions sorted by date
   * @returns {array} Transactions with running balance
   */
  calculateRunningBalance(transactions) {
    let balance = 0;
    return transactions.map(txn => ({
      ...txn,
      runningBalance: (balance += txn.debitAmount - txn.creditAmount)
    }));
  }

  /**
   * Calculate total debits and credits
   * @param {array} transactions - Array of transactions
   * @returns {object} {totalDebits, totalCredits}
   */
  calculateTotals(transactions) {
    let totalDebits = 0;
    let totalCredits = 0;
    transactions.forEach(txn => {
      totalDebits += txn.debitAmount;
      totalCredits += txn.creditAmount;
    });
    return { totalDebits, totalCredits };
  }

  /**
   * Verify accounting equation (debits = credits)
   * @param {array} transactions - Array of transactions
   * @returns {object} {balanced, totalDebits, totalCredits, discrepancy}
   */
  verifyAccountingEquation(transactions) {
    const { totalDebits, totalCredits } = this.calculateTotals(transactions);
    const discrepancy = Math.abs(totalDebits - totalCredits);
    const balanced = discrepancy < 0.01;
    return { balanced, totalDebits, totalCredits, discrepancy };
  }

  /**
   * Calculate account balances by account code
   * @param {array} transactions - Array of transactions
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {object} Account balances keyed by account code
   */
  calculateAccountBalances(transactions, chartOfAccounts) {
    const balances = {};
    chartOfAccounts.forEach(account => {
      balances[account.code] = 0;
    });
    transactions.forEach(txn => {
      if (txn.accountCode && balances.hasOwnProperty(txn.accountCode)) {
        balances[txn.accountCode] += txn.debitAmount - txn.creditAmount;
      }
    });
    return balances;
  }

  /**
   * Verify accounting equation using account balances
   * @param {object} balances - Account balances keyed by code
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {object} Verification result
   */
  verifyAccountingEquationByType(balances, chartOfAccounts) {
    let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;
    let totalRevenue = 0, totalExpenses = 0;

    chartOfAccounts.forEach(account => {
      const balance = balances[account.code] || 0;
      switch (account.type) {
        case 'Asset': totalAssets += balance; break;
        case 'Liability': totalLiabilities += balance; break;
        case 'Equity': totalEquity += balance; break;
        case 'Revenue': totalRevenue += balance; break;
        case 'Expense': totalExpenses += balance; break;
      }
    });

    const netIncome = totalRevenue - totalExpenses;
    const rightSide = totalLiabilities + totalEquity + netIncome;
    const discrepancy = Math.abs(totalAssets - rightSide);
    const balanced = discrepancy < 0.01;

    return {
      balanced, totalAssets, totalLiabilities, totalEquity,
      totalRevenue, totalExpenses, netIncome, discrepancy
    };
  }

  /**
   * Generate trial balance
   * @param {array} transactions - All transactions
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {array} Trial balance entries
   */
  generateTrialBalance(transactions, chartOfAccounts) {
    const balances = this.calculateAccountBalances(transactions, chartOfAccounts);
    const trialBalance = [];

    chartOfAccounts.forEach(account => {
      const balance = balances[account.code] || 0;
      if (balance !== 0) {
        trialBalance.push({
          code: account.code,
          name: account.name,
          type: account.type,
          debitBalance: balance > 0 ? balance : 0,
          creditBalance: balance < 0 ? Math.abs(balance) : 0
        });
      }
    });
    return trialBalance;
  }

  /**
   * Calculate net income
   * @param {array} transactions - All transactions
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {number} Net income
   */
  calculateNetIncome(transactions, chartOfAccounts) {
    const balances = this.calculateAccountBalances(transactions, chartOfAccounts);
    let totalRevenue = 0, totalExpenses = 0;

    chartOfAccounts.forEach(account => {
      const balance = balances[account.code] || 0;
      if (account.type === 'Revenue') totalRevenue += balance;
      else if (account.type === 'Expense') totalExpenses += balance;
    });
    return totalRevenue - totalExpenses;
  }

  /**
   * Suggest account classification with enhanced logic
   * @param {string} description - Transaction description
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {object} Classification suggestion
   */
  suggestAccountClassification(description, chartOfAccounts) {
    const lowerDesc = description.toLowerCase();
    
    // Enhanced keyword mapping with better categorization
    // Order matters - check more specific keywords first
    const keywordMap = {
      // Payable/Hutang (2000) - MUST CHECK FIRST before Expense
      '2000': {
        keywords: ['hutang', 'utang', 'payable', 'payables', 'hutang usaha', 'hutang_usaha'],
        confidence: 0.95
      },
      
      // Debt/Pinjaman (2100)
      '2100': {
        keywords: ['pinjaman', 'loan', 'kredit', 'cicilan'],
        confidence: 0.95
      },
      
      // Salary/Gaji (5100) - CHECK BEFORE general expense
      '5100': {
        keywords: ['gaji', 'upah', 'honor', 'salary', 'wage', 'bayar karyawan', 'tunjangan', 'bebangaji', 'beban_gaji'],
        confidence: 0.95
      },
      
      // Interest/Bunga (5800) - CHECK BEFORE general expense
      '5800': {
        keywords: ['bunga', 'interest', 'riba', 'bunga_bank', 'beban_bunga'],
        confidence: 0.95
      },
      
      // Rent/Sewa (5200)
      '5200': {
        keywords: ['sewa', 'rental', 'rent', 'kos', 'tempat', 'ruang'],
        confidence: 0.9
      },
      
      // Utilities/Listrik (5300)
      '5300': {
        keywords: ['listrik', 'air', 'internet', 'telepon', 'wifi', 'pulsa', 'token',
                   'utilitas', 'utilities', 'pln', 'pam', 'beban_listrik', 'beban_air'],
        confidence: 0.9
      },
      
      // Depreciation/Penyusutan (5500)
      '5500': {
        keywords: ['penyusutan', 'depreciation', 'depresiasi'],
        confidence: 0.95
      },
      
      // Insurance/Asuransi (5600)
      '5600': {
        keywords: ['asuransi', 'insurance', 'premi'],
        confidence: 0.9
      },
      
      // Marketing/Pemasaran (5700)
      '5700': {
        keywords: ['marketing', 'pemasaran', 'iklan', 'promosi', 'advertise', 'ads'],
        confidence: 0.9
      },
      
      // Equipment/Peralatan (1800) - CHECK BEFORE general supplies
      '1800': {
        keywords: ['komputer', 'laptop', 'printer', 'meja', 'kursi', 'lemari', 'rak',
                   'mobil', 'motor', 'kendaraan', 'furniture', 'peralatan', 'equipment',
                   'mesin', 'ac', 'kulkas', 'dispenser', 'meja kerja', 'kursi kerja'],
        confidence: 0.9
      },
      
      // Supplies/Perlengkapan (5400) - CHECK LAST as fallback
      '5400': {
        keywords: ['pulpen', 'kertas', 'tinta', 'sticky', 'penghapus', 'penggaris', 
                   'stapler', 'klip', 'map', 'amplop', 'buku tulis', 'pensil', 'spidol',
                   'perlengkapan', 'supplies', 'alat tulis', 'kantor', 'buku'],
        confidence: 0.9
      },
      
      // Inventory (1200)
      '1200': {
        keywords: ['barang', 'stok', 'inventory', 'persediaan', 'dagangan'],
        confidence: 0.85
      },
      
      // Bank (1010)
      '1010': {
        keywords: ['bank', 'rekening', 'transfer', 'deposit'],
        confidence: 0.9
      },
      
      // Cash (1000)
      '1000': {
        keywords: ['tunai', 'cash', 'uang', 'kas'],
        confidence: 0.9
      }
    };

    // Find best matching account
    // Check in order of priority (more specific first)
    let bestMatch = { code: '5400', confidence: 0.3 }; // Default to Miscellaneous Expense
    
    // Priority order: check most specific keywords first
    const priorityOrder = ['2000', '2100', '5100', '5800', '5200', '5300', '5500', '5600', '5700', '1800', '5400', '1200', '1010', '1000'];
    
    for (const code of priorityOrder) {
      const data = keywordMap[code];
      if (!data) continue;
      
      for (const keyword of data.keywords) {
        if (lowerDesc.includes(keyword)) {
          bestMatch = { code, confidence: data.confidence };
          break; // Found a match, stop searching
        }
      }
      
      // If we found a match, stop checking other codes
      if (bestMatch.code !== '5400' || bestMatch.confidence > 0.3) {
        break;
      }
    }

    // Find account in chart of accounts
    let account = chartOfAccounts.find(a => a.code === bestMatch.code);
    
    if (!account) {
      if (chartOfAccounts && chartOfAccounts.length > 0) {
        account = chartOfAccounts[0];
      } else {
        account = {
          code: bestMatch.code,
          name: 'Miscellaneous Expense',
          type: 'Expense'
        };
      }
    }

    const debitCredit = this.getDefaultDebitCredit(account.type);

    console.log('Classification:', {
      description: lowerDesc,
      suggestedCode: bestMatch.code,
      accountName: account.name,
      accountType: account.type,
      debitCredit: debitCredit,
      confidence: bestMatch.confidence
    });

    return {
      accountCode: account.code,
      accountName: account.name,
      accountType: account.type,
      debitCredit: debitCredit,
      confidence: bestMatch.confidence
    };
  }
}

const accountingCalculator = new AccountingCalculator();
