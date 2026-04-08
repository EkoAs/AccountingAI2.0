/**
 * Report Generator Module — Delegator
 * Mendelegasikan ke file per-mode di js/modules/reports/
 * Depends on: general-journal.js, general-ledger.js, trial-balance.js, reversing-journal.js
 */

class ReportGenerator {
  constructor() {
    this.reportTypes = [
      'general-journal', 'general-ledger', 'trial-balance', 'reversing-journal',
      'adjusting-entries', 'adjusted-trial-balance', 'financial-statements',
      'closing-journal'
    ];
  }

  generateGeneralJournal(transactions, chartOfAccounts, metadata) {
    return generateGeneralJournal(transactions, chartOfAccounts, metadata);
  }

  generateGeneralLedger(transactions, chartOfAccounts, metadata) {
    return generateGeneralLedger(transactions, chartOfAccounts, metadata);
  }

  generateTrialBalance(transactions, chartOfAccounts, metadata) {
    return generateTrialBalance(transactions, chartOfAccounts, metadata);
  }

  generateReversingJournal(transactions, chartOfAccounts, metadata) {
    return generateReversingJournal(transactions, chartOfAccounts, metadata);
  }

  generateReport(reportType, transactions, chartOfAccounts, metadata) {
    switch (reportType) {
      case 'general-journal':        return this.generateGeneralJournal(transactions, chartOfAccounts, metadata);
      case 'general-ledger':         return this.generateGeneralLedger(transactions, chartOfAccounts, metadata);
      case 'trial-balance':          return this.generateTrialBalance(transactions, chartOfAccounts, metadata);
      case 'reversing-journal':      return this.generateReversingJournal(transactions, chartOfAccounts, metadata);
      case 'adjusting-entries':      return generateAdjustingEntries(transactions, chartOfAccounts, metadata);
      case 'adjusted-trial-balance': return generateAdjustedTrialBalance(transactions, chartOfAccounts, metadata);
      case 'financial-statements':   return generateFinancialStatements(transactions, chartOfAccounts, metadata);
      case 'closing-journal':        return generateClosingJournal(transactions, chartOfAccounts, metadata);
      default: return null;
    }
  }

  // Kept for backward compatibility
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Kept for backward compatibility (used by generateReversingJournal in old code)
  getNextPeriodDate(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }
}

const reportGenerator = new ReportGenerator();
