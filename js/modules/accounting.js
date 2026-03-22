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
   * Follows normal balance rules: Asset/Expense = Debit normal, Liability/Equity/Revenue = Credit normal
   * @param {array} transactions - Array of transactions
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {object} Account balances keyed by account code (positive = normal side)
   */
  calculateAccountBalances(transactions, chartOfAccounts) {
    const balances = {};
    const accountTypes = {};
    chartOfAccounts.forEach(account => {
      balances[account.code] = 0;
      accountTypes[account.code] = account.type;
    });
    transactions.forEach(txn => {
      if (txn.accountCode && balances.hasOwnProperty(txn.accountCode)) {
        const type = accountTypes[txn.accountCode];
        const isDebitNormal = type === 'Asset' || type === 'Expense';
        if (isDebitNormal) {
          balances[txn.accountCode] += txn.debitAmount - txn.creditAmount;
        } else {
          // Credit-normal: positive balance = credit side
          balances[txn.accountCode] += txn.creditAmount - txn.debitAmount;
        }
      }
    });
    return balances;
  }

  /**
   * Verify accounting equation using account balances
   * @param {object} balances - Account balances keyed by code (positive = normal side)
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {object} Verification result
   */
  verifyAccountingEquationByType(balances, chartOfAccounts) {
    let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;
    let totalRevenue = 0, totalExpenses = 0;

    chartOfAccounts.forEach(account => {
      const balance = Math.abs(balances[account.code] || 0);
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
        // Normal balance: Asset & Expense = Debit (positive), Liability/Equity/Revenue = Credit (negative)
        const isDebitNormal = account.type === 'Asset' || account.type === 'Expense';
        trialBalance.push({
          code: account.code,
          name: account.name,
          type: account.type,
          debitBalance: isDebitNormal ? (balance > 0 ? balance : 0) : (balance < 0 ? Math.abs(balance) : 0),
          creditBalance: isDebitNormal ? (balance < 0 ? Math.abs(balance) : 0) : (balance > 0 ? balance : 0)
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
      const balance = Math.abs(balances[account.code] || 0);
      if (account.type === 'Revenue') totalRevenue += balance;
      else if (account.type === 'Expense') totalExpenses += balance;
    });
    return totalRevenue - totalExpenses;
  }

  /**
   * Get double-entry classification (debit + credit pair) for a transaction
   * Follows PSAK/Indonesian accounting standards
   * @param {string} description - Transaction description
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {object} {debitAccount, creditAccount, confidence, reasoning}
   */
  getDoubleEntryClassification(description, chartOfAccounts) {
    const lowerDesc = description.toLowerCase();

    // Helper to find account by code
    const findAccount = (code) => {
      const acc = chartOfAccounts.find(a => a.code === code);
      return acc || { code, name: code, type: 'Asset' };
    };

    // Default offset is Kas (1000)
    const kas = findAccount('1000');

    // Double-entry pattern rules (ordered by specificity — more specific rules FIRST)
    const patterns = [
      // ── KREDIT / BELUM DIBAYAR (harus di atas pola tunai) ──────────────────
      // Perlengkapan belum dibayar / kredit → Debit Beban Perlengkapan, Kredit Utang Usaha
      {
        keywords: ['perlengkapan_belum_dibayar', 'perlengkapan_kredit', 'beli_perlengkapan_kredit',
                   'supplies_kredit', 'atk_kredit', 'atk_belum_dibayar'],
        debit: '5400', credit: '2000',
        reasoning: 'Perlengkapan belum dibayar: Beban Perlengkapan bertambah (Debit), Utang Usaha bertambah (Kredit) — bukan Kas karena belum dibayar tunai',
        confidence: 0.97
      },
      // Peralatan belum dibayar / kredit → Debit Peralatan, Kredit Utang Usaha
      {
        keywords: ['peralatan_belum_dibayar', 'peralatan_kredit', 'beli_peralatan_kredit',
                   'equipment_kredit', 'equipment_belum_dibayar'],
        debit: '1800', credit: '2000',
        reasoning: 'Peralatan belum dibayar: Peralatan bertambah (Debit), Utang Usaha bertambah (Kredit) — bukan Kas karena belum dibayar tunai',
        confidence: 0.97
      },
      // Pembelian kredit umum (belum dibayar) → Debit Beban/Aset, Kredit Utang Usaha
      {
        keywords: ['belum_dibayar', 'kredit_beli', 'beli_kredit', 'hutang_usaha',
                   'utang_usaha', 'payable', 'on_credit', 'kredit_pembelian'],
        debit: '5400', credit: '2000',
        reasoning: 'Pembelian kredit/belum dibayar: Beban/Aset bertambah (Debit), Utang Usaha bertambah (Kredit)',
        confidence: 0.95
      },

      // ── MODAL & EKUITAS ────────────────────────────────────────────────────
      // Investor / modal awal / setoran pemilik → Debit Kas, Kredit Modal
      {
        keywords: ['investor', 'investasi', 'modal', 'setoran', 'modal_awal',
                   'modal_usaha', 'capital', 'owner_equity', 'equity_in'],
        debit: '1000', credit: '3000',
        reasoning: 'Setoran modal/investor: Kas bertambah (Debit), Modal Pemilik bertambah (Kredit) — uang masuk dari pemilik/investor adalah Ekuitas, bukan Beban',
        confidence: 0.98
      },
      // Prive / penarikan pemilik → Debit Prive, Kredit Kas
      {
        keywords: ['prive', 'penarikan', 'ambil_uang', 'withdraw', 'drawing'],
        debit: '3100', credit: '1000',
        reasoning: 'Prive: Prive bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.95
      },

      // ── PENDAPATAN ─────────────────────────────────────────────────────────
      // Pendapatan tunai → Debit Kas, Kredit Pendapatan
      {
        keywords: ['pendapatan', 'jasa', 'revenue', 'penjualan', 'service',
                   'terima_pembayaran', 'bayar_jasa', 'income'],
        debit: '1000', credit: '4000',
        reasoning: 'Pendapatan jasa tunai: Kas bertambah (Debit), Pendapatan bertambah (Kredit)',
        confidence: 0.95
      },
      // Piutang usaha → Debit Piutang, Kredit Pendapatan
      {
        keywords: ['piutang', 'receivable', 'kredit_jasa', 'jasa_kredit', 'jasa_belum_dibayar'],
        debit: '1100', credit: '4000',
        reasoning: 'Piutang usaha: Piutang bertambah (Debit), Pendapatan bertambah (Kredit)',
        confidence: 0.93
      },

      // ── ASET TETAP (tunai) ─────────────────────────────────────────────────
      // Beli peralatan tunai → Debit Peralatan, Kredit Kas
      {
        keywords: ['komputer', 'laptop', 'printer', 'meja', 'kursi', 'lemari', 'rak',
                   'mobil', 'motor', 'kendaraan', 'furniture', 'peralatan', 'equipment',
                   'mesin', 'ac', 'kulkas', 'dispenser', 'beli_peralatan'],
        debit: '1800', credit: '1000',
        reasoning: 'Pembelian peralatan tunai: Peralatan bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.92
      },

      // ── BEBAN (tunai) ──────────────────────────────────────────────────────
      // Bayar gaji → Debit Beban Gaji, Kredit Kas
      {
        keywords: ['gaji', 'upah', 'honor', 'salary', 'wage', 'beban_gaji', 'bayar_gaji'],
        debit: '5100', credit: '1000',
        reasoning: 'Beban gaji: Beban Gaji bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.97
      },
      // Bayar sewa → Debit Beban Sewa, Kredit Kas
      {
        keywords: ['sewa', 'rental', 'rent', 'beban_sewa', 'bayar_sewa'],
        debit: '5200', credit: '1000',
        reasoning: 'Beban sewa: Beban Sewa bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.95
      },
      // Bayar listrik/utilitas → Debit Beban Listrik, Kredit Kas
      {
        keywords: ['listrik', 'air', 'internet', 'telepon', 'wifi', 'pulsa', 'token',
                   'pln', 'pam', 'beban_listrik', 'utilitas'],
        debit: '5300', credit: '1000',
        reasoning: 'Beban utilitas: Beban Listrik/Air bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.95
      },
      // Beli perlengkapan tunai → Debit Beban Perlengkapan, Kredit Kas
      {
        keywords: ['pulpen', 'kertas', 'tinta', 'sticky', 'penghapus', 'penggaris',
                   'stapler', 'klip', 'amplop', 'pensil', 'spidol', 'alat_tulis',
                   'perlengkapan', 'supplies', 'atk', 'buku_tulis'],
        debit: '5400', credit: '1000',
        reasoning: 'Beban perlengkapan tunai: Beban Perlengkapan bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.92
      },
      // Bayar asuransi → Debit Beban Asuransi, Kredit Kas
      {
        keywords: ['asuransi', 'insurance', 'premi'],
        debit: '5600', credit: '1000',
        reasoning: 'Beban asuransi: Beban Asuransi bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.93
      },
      // Bayar marketing → Debit Beban Marketing, Kredit Kas
      {
        keywords: ['marketing', 'iklan', 'promosi', 'advertise', 'ads'],
        debit: '5700', credit: '1000',
        reasoning: 'Beban pemasaran: Beban Marketing bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.92
      },
      // Bayar bunga → Debit Beban Bunga, Kredit Kas
      {
        keywords: ['bunga', 'interest', 'beban_bunga'],
        debit: '5800', credit: '1000',
        reasoning: 'Beban bunga: Beban Bunga bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.95
      },

      // ── UTANG & PINJAMAN ───────────────────────────────────────────────────
      // Hutang usaha generik → Debit Beban, Kredit Utang Usaha
      {
        keywords: ['hutang', 'utang', 'payable'],
        debit: '5400', credit: '2000',
        reasoning: 'Pembelian kredit: Beban/Aset bertambah (Debit), Utang Usaha bertambah (Kredit)',
        confidence: 0.88
      },
      // Pinjaman bank → Debit Kas, Kredit Utang Bank
      {
        keywords: ['pinjaman', 'loan', 'kredit_bank', 'pinjam'],
        debit: '1000', credit: '2100',
        reasoning: 'Pinjaman bank: Kas bertambah (Debit), Utang Bank bertambah (Kredit)',
        confidence: 0.95
      },

      // ── PERSEDIAAN ─────────────────────────────────────────────────────────
      // Beli persediaan/barang dagangan → Debit Persediaan, Kredit Kas
      {
        keywords: ['barang', 'stok', 'inventory', 'persediaan', 'dagangan', 'beli_barang'],
        debit: '1200', credit: '1000',
        reasoning: 'Pembelian persediaan: Persediaan bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.88
      }
    ];

    // Find matching pattern
    for (const pattern of patterns) {
      for (const keyword of pattern.keywords) {
        if (lowerDesc.includes(keyword)) {
          return {
            debitAccount: findAccount(pattern.debit),
            creditAccount: findAccount(pattern.credit),
            confidence: pattern.confidence,
            reasoning: pattern.reasoning
          };
        }
      }
    }

    // Default fallback: treat as expense paid in cash
    return {
      debitAccount: findAccount('5900'), // Other Expenses
      creditAccount: kas,
      confidence: 0.5,
      reasoning: 'Tidak dikenali, diasumsikan sebagai beban lain-lain dibayar tunai'
    };
  }

  /**
   * Suggest account classification (legacy single-entry, kept for compatibility)
   */
  suggestAccountClassification(description, chartOfAccounts) {
    const result = this.getDoubleEntryClassification(description, chartOfAccounts);
    return {
      accountCode: result.debitAccount.code,
      accountName: result.debitAccount.name,
      accountType: result.debitAccount.type,
      debitCredit: 'debit',
      confidence: result.confidence
    };
  }
}

const accountingCalculator = new AccountingCalculator();
