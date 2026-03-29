/**
 * Report Generator Module - Generates accounting reports
 * Supports General Journal, General Ledger, Trial Balance, and Reversing Journal
 */

class ReportGenerator {
  constructor() {
    this.reportTypes = ['general-journal', 'general-ledger', 'trial-balance', 'reversing-journal'];
  }

  /**
   * Generate General Journal report
   * @param {array} transactions - All transactions
   * @param {array} chartOfAccounts - Chart of accounts
   * @param {object} metadata - Report metadata
   * @returns {object} Report data
   */
  generateGeneralJournal(transactions, chartOfAccounts, metadata) {
    // Arrange transactions in proper order
    const arranged = autoBalancer.arrangeTransactions(transactions, chartOfAccounts || []);
    const sorted = arranged.sort((a, b) => new Date(a.date) - new Date(b.date));

    const { totalDebits, totalCredits } = accountingCalculator.calculateTotals(sorted);

    return {
      type: 'General Journal',
      metadata: metadata,
      entries: sorted.map(txn => ({
        date: txn.date,
        account: txn.account,
        accountCode: txn.accountCode,
        description: txn.description,
        debit: txn.debitAmount,
        credit: txn.creditAmount
      })),
      summary: {
        totalEntries: sorted.length,
        totalDebits: totalDebits,
        totalCredits: totalCredits,
        balanced: Math.abs(totalDebits - totalCredits) < 0.01
      }
    };
  }

  /**
   * Generate General Ledger report (T-account / running balance format per PSAK)
   * Each account shows: header info, opening balance, transactions with running balance, totals
   * @param {array} transactions - All transactions
   * @param {array} chartOfAccounts - Chart of accounts
   * @param {object} metadata - Report metadata
   * @returns {object} Report data
   */
  generateGeneralLedger(transactions, chartOfAccounts, metadata) {
    const ledger = [];
    const isDebitNormal = (type) => type === 'Asset' || type === 'Expense';

    chartOfAccounts.forEach(account => {
      const accountTransactions = transactions.filter(t => t.accountCode === account.code);
      if (accountTransactions.length === 0) return;

      const sorted = accountTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      const debitNormal = isDebitNormal(account.type);

      // Calculate running balance per PSAK normal balance rules
      let runningDebit = 0;
      let runningCredit = 0;
      const txnRows = sorted.map((t, idx) => {
        runningDebit += t.debitAmount;
        runningCredit += t.creditAmount;
        // Saldo = selisih di sisi normal
        const saldoDebet = debitNormal ? Math.max(0, runningDebit - runningCredit) : 0;
        const saldoKredit = debitNormal ? 0 : Math.max(0, runningCredit - runningDebit);
        return {
          date: t.date,
          description: t.description,
          ref: t.id ? t.id.replace('txn_', '').substring(0, 6) : String(idx + 1).padStart(6, '0'),
          debit: t.debitAmount,
          credit: t.creditAmount,
          balanceDebit: saldoDebet,
          balanceCredit: saldoKredit
        };
      });

      const totalDebits = sorted.reduce((sum, t) => sum + t.debitAmount, 0);
      const totalCredits = sorted.reduce((sum, t) => sum + t.creditAmount, 0);
      const closingDebit = debitNormal ? Math.max(0, totalDebits - totalCredits) : 0;
      const closingCredit = debitNormal ? 0 : Math.max(0, totalCredits - totalDebits);

      // Extract period from first transaction date
      const firstDate = new Date(sorted[0].date);

      ledger.push({
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        month: firstDate.getMonth() + 1,
        year: firstDate.getFullYear(),
        openingBalanceDebit: 0,
        openingBalanceCredit: 0,
        transactions: txnRows,
        totalDebits,
        totalCredits,
        closingBalanceDebit: closingDebit,
        closingBalanceCredit: closingCredit
      });
    });

    const { totalDebits, totalCredits } = accountingCalculator.calculateTotals(transactions);

    return {
      type: 'General Ledger',
      metadata,
      accounts: ledger,
      summary: {
        totalAccounts: ledger.length,
        totalDebits,
        totalCredits,
        balanced: Math.abs(totalDebits - totalCredits) < 0.01
      }
    };
  }

  /**
   * Generate Trial Balance report
   * @param {array} transactions - All transactions
   * @param {array} chartOfAccounts - Chart of accounts
   * @param {object} metadata - Report metadata
   * @returns {object} Report data
   */
  generateTrialBalance(transactions, chartOfAccounts, metadata) {
    const trialBalance = accountingCalculator.generateTrialBalance(transactions, chartOfAccounts);

    const totalDebits = trialBalance.reduce((sum, entry) => sum + entry.debitBalance, 0);
    const totalCredits = trialBalance.reduce((sum, entry) => sum + entry.creditBalance, 0);

    return {
      type: 'Trial Balance',
      metadata: metadata,
      entries: trialBalance,
      summary: {
        totalAccounts: trialBalance.length,
        totalDebits: totalDebits,
        totalCredits: totalCredits,
        balanced: Math.abs(totalDebits - totalCredits) < 0.01,
        discrepancy: Math.abs(totalDebits - totalCredits)
      }
    };
  }

  /**
   * Generate Reversing Journal report
   * @param {array} transactions - All transactions
   * @param {array} chartOfAccounts - Chart of accounts
   * @param {object} metadata - Report metadata
   * @returns {object} Report data
   */
  generateReversingJournal(transactions, chartOfAccounts, metadata) {
    const reversingEntries = [];
    const accrualAccounts = ['2200', '1600']; // Accrued Expenses, Prepaid Expenses

    chartOfAccounts.forEach(account => {
      if (accrualAccounts.includes(account.code)) {
        const accountTransactions = transactions.filter(t => t.accountCode === account.code);

        accountTransactions.forEach(txn => {
          const reversingDate = this.getNextPeriodDate(txn.date);

          reversingEntries.push({
            date: reversingDate,
            originalDate: txn.date,
            account: account.name,
            accountCode: account.code,
            description: `Reversing entry for ${account.name}`,
            debit: txn.creditAmount,
            credit: txn.debitAmount,
            originalDebit: txn.debitAmount,
            originalCredit: txn.creditAmount
          });
        });
      }
    });

    const sorted = reversingEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      type: 'Reversing Journal',
      metadata: metadata,
      entries: sorted,
      summary: {
        totalEntries: sorted.length,
        totalDebits: sorted.reduce((sum, e) => sum + e.debit, 0),
        totalCredits: sorted.reduce((sum, e) => sum + e.credit, 0)
      }
    };
  }

  /**
   * Get next period date
   * @param {string} date - Current date (YYYY-MM-DD)
   * @returns {string} Next period date
   */
  getNextPeriodDate(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }

  /**
   * Generate report by type
   * @param {string} reportType - Report type
   * @param {array} transactions - All transactions
   * @param {array} chartOfAccounts - Chart of accounts
   * @param {object} metadata - Report metadata
   * @returns {object} Report data
   */
  generateReport(reportType, transactions, chartOfAccounts, metadata) {
    switch (reportType) {
      case 'general-journal':
        return this.generateGeneralJournal(transactions, chartOfAccounts, metadata);
      case 'general-ledger':
        return this.generateGeneralLedger(transactions, chartOfAccounts, metadata);
      case 'trial-balance':
        return this.generateTrialBalance(transactions, chartOfAccounts, metadata);
      case 'reversing-journal':
        return this.generateReversingJournal(transactions, chartOfAccounts, metadata);
      default:
        return null;
    }
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format date
   * @param {string} date - Date string (YYYY-MM-DD)
   * @returns {string} Formatted date
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

const reportGenerator = new ReportGenerator();
