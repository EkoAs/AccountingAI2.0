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
   * Suggest account classification
   * @param {string} description - Transaction description
   * @param {array} chartOfAccounts - Chart of accounts
   * @returns {object} Classification suggestion
   */
  suggestAccountClassification(description, chartOfAccounts) {
    const lowerDesc = description.toLowerCase();
    const keywords = {
      'cash': '1000', 'bank': '1010', 'receivable': '1100',
      'inventory': '1200', 'supplies': '1500', 'equipment': '1800',
      'payable': '2000', 'debt': '2100', 'accrued': '2200',
      'revenue': '4000', 'sales': '4000', 'service': '4100',
      'salary': '5100', 'rent': '5200', 'utilities': '5300',
      'office': '5400', 'depreciation': '5500', 'insurance': '5600',
      'marketing': '5700', 'interest': '5800'
    };

    let suggestedCode = '5400', confidence = 0.3;
    for (const [keyword, code] of Object.entries(keywords)) {
      if (lowerDesc.includes(keyword)) {
        suggestedCode = code;
        confidence = 0.8;
        break;
      }
    }

    const account = chartOfAccounts.find(a => a.code === suggestedCode);
    const debitCredit = this.getDefaultDebitCredit(account.type);

    return {
      accountCode: suggestedCode,
      accountName: account.name,
      accountType: account.type,
      debitCredit: debitCredit,
      confidence: confidence
    };
  }
}

const accountingCalculator = new AccountingCalculator();
