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
      if (!txn.accountCode) return; // skip transaksi tanpa kode akun
      // Jika akun tidak ada di chart, tambahkan dinamis agar tidak hilang dari laporan
      if (!balances.hasOwnProperty(txn.accountCode)) {
        balances[txn.accountCode] = 0;
        accountTypes[txn.accountCode] = txn.accountType || 'Asset';
      }
      const type = accountTypes[txn.accountCode];
      const isDebitNormal = type === 'Asset' || type === 'Expense';
      if (isDebitNormal) {
        balances[txn.accountCode] += txn.debitAmount - txn.creditAmount;
      } else {
        balances[txn.accountCode] += txn.creditAmount - txn.debitAmount;
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

    // Buat map akun dari chart untuk lookup cepat
    const chartMap = {};
    chartOfAccounts.forEach(a => { chartMap[a.code] = a; });

    // Iterasi semua kode akun di balances (termasuk akun dinamis yang tidak ada di chart)
    Object.keys(balances).forEach(code => {
      const balance = balances[code] || 0;
      if (balance === 0) return;

      // Gunakan data dari chart jika ada, fallback ke data transaksi
      const account = chartMap[code];
      const name = account ? account.name : code;
      const type = account ? account.type : 'Asset';

      const isDebitNormal = type === 'Asset' || type === 'Expense';
      trialBalance.push({
        code,
        name,
        type,
        debitBalance:  isDebitNormal ? (balance > 0 ? balance : 0) : (balance < 0 ? Math.abs(balance) : 0),
        creditBalance: isDebitNormal ? (balance < 0 ? Math.abs(balance) : 0) : (balance > 0 ? balance : 0)
      });
    });

    // Urutkan sesuai urutan chart of accounts, akun dinamis di akhir
    trialBalance.sort((a, b) => {
      const ai = chartOfAccounts.findIndex(x => x.code === a.code);
      const bi = chartOfAccounts.findIndex(x => x.code === b.code);
      if (ai === -1 && bi === -1) return a.code.localeCompare(b.code);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
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

    /**
     * Matching helper — mengenali keyword dengan dua cara:
     * 1. Exact substring: "modal" cocok jika deskripsi mengandung "modal"
     * 2. Underscore split: "modal_usaha" → semua kata ("modal" DAN "usaha") harus ada di deskripsi
     */
    const matchesKeyword = (keyword) => {
      if (lowerDesc.includes(keyword)) return true;
      if (keyword.includes('_')) {
        const parts = keyword.split('_');
        return parts.every(part => part.length > 1 && lowerDesc.includes(part));
      }
      return false;
    };

    // Double-entry pattern rules (ordered by specificity — more specific rules FIRST)
    const patterns = [
      // ══════════════════════════════════════════════════════════════════════
      // PERUSAHAAN DAGANG — PEMBELIAN
      // ══════════════════════════════════════════════════════════════════════
      // Pembelian kredit / syarat kredit (2/15,n/30) → Debit Pembelian, Kredit Utang Dagang
      {
        keywords: ['pembelian_kredit', 'beli_kredit', 'syarat_kredit', 'kredit_dagang',
                   'n/30', '2/15', 'syarat_2', 'pembelian_dengan_syarat', 'beli_dagang_kredit'],
        debit: '5010', credit: '2000',
        reasoning: 'Pembelian barang dagangan kredit: Pembelian bertambah (Debit), Utang Dagang bertambah (Kredit) — syarat kredit berarti belum dibayar tunai',
        confidence: 0.97
      },
      // Pembelian tunai barang dagangan → Debit Pembelian, Kredit Kas
      {
        keywords: ['pembelian_tunai', 'beli_tunai', 'beli_barang_tunai', 'pembelian_barang_tunai'],
        debit: '5010', credit: '1000',
        reasoning: 'Pembelian barang dagangan tunai: Pembelian bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.97
      },
      // Beban angkut pembelian → Debit Beban Angkut Pembelian, Kredit Kas
      {
        keywords: ['beban_angkut_pembelian', 'ongkir_beli', 'freight_in', 'angkut_pembelian',
                   'ongkos_angkut_beli'],
        debit: '5040', credit: '1000',
        reasoning: 'Beban angkut pembelian: Beban Angkut Pembelian bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.97
      },
      // Retur pembelian → Debit Utang Dagang, Kredit Retur Pembelian
      {
        keywords: ['retur_pembelian', 'retur_beli', 'kembalikan_barang_beli', 'return_purchase',
                   'retur_dan_potongan_pembelian'],
        debit: '2000', credit: '5020',
        reasoning: 'Retur pembelian: Utang Dagang berkurang (Debit), Retur Pembelian bertambah (Kredit)',
        confidence: 0.97
      },
      // Potongan pembelian → Debit Utang Dagang, Kredit Potongan Pembelian
      {
        keywords: ['potongan_pembelian', 'diskon_beli', 'purchase_discount'],
        debit: '2000', credit: '5030',
        reasoning: 'Potongan pembelian: Utang Dagang berkurang (Debit), Potongan Pembelian bertambah (Kredit)',
        confidence: 0.96
      },
      // Bayar utang dagang / pelunasan utang → Debit Utang Dagang, Kredit Kas
      {
        keywords: ['bayar_utang_dagang', 'lunasi_utang', 'pelunasan_utang', 'bayar_utang',
                   'bayar_hutang_dagang', 'lunasi_hutang'],
        debit: '2000', credit: '1000',
        reasoning: 'Pelunasan utang dagang: Utang Dagang berkurang (Debit), Kas berkurang (Kredit)',
        confidence: 0.97
      },

      // ══════════════════════════════════════════════════════════════════════
      // PERUSAHAAN DAGANG — PENJUALAN
      // ══════════════════════════════════════════════════════════════════════
      // Penjualan kredit → Debit Piutang Dagang, Kredit Penjualan
      {
        keywords: ['penjualan_kredit', 'jual_kredit', 'jual_piutang', 'penjualan_dengan_piutang',
                   'sales_credit'],
        debit: '1100', credit: '4000',
        reasoning: 'Penjualan kredit: Piutang Dagang bertambah (Debit), Penjualan bertambah (Kredit)',
        confidence: 0.97
      },
      // Penjualan tunai → Debit Kas, Kredit Penjualan
      {
        keywords: ['penjualan_tunai', 'jual_tunai', 'jual_kas', 'sales_cash'],
        debit: '1000', credit: '4000',
        reasoning: 'Penjualan tunai: Kas bertambah (Debit), Penjualan bertambah (Kredit)',
        confidence: 0.97
      },
      // Retur penjualan → Debit Retur Penjualan, Kredit Piutang Dagang
      {
        keywords: ['retur_penjualan', 'retur_jual', 'barang_dikembalikan_pembeli',
                   'return_sales', 'retur_dan_potongan_penjualan'],
        debit: '4100', credit: '1100',
        reasoning: 'Retur penjualan: Retur Penjualan bertambah (Debit), Piutang Dagang berkurang (Kredit)',
        confidence: 0.97
      },
      // Potongan penjualan → Debit Potongan Penjualan, Kredit Piutang Dagang
      {
        keywords: ['potongan_penjualan', 'diskon_jual', 'sales_discount', 'potongan_tunai_jual'],
        debit: '4200', credit: '1100',
        reasoning: 'Potongan penjualan: Potongan Penjualan bertambah (Debit), Piutang Dagang berkurang (Kredit)',
        confidence: 0.96
      },
      // Beban angkut penjualan / ongkir → Debit Beban Angkut Penjualan, Kredit Kas
      {
        keywords: ['beban_angkut_penjualan', 'ongkir_jual', 'freight_out', 'angkut_penjualan',
                   'beban_angkut', 'ongkir', 'kirim_barang', 'biaya_kirim'],
        debit: '5750', credit: '1000',
        reasoning: 'Beban angkut penjualan: Beban Angkut Penjualan bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.96
      },
      // Penerimaan piutang / pelunasan piutang → Debit Kas, Kredit Piutang Dagang
      {
        keywords: ['penerimaan_piutang', 'terima_pelunasan', 'bayar_piutang', 'pelunasan_piutang',
                   'terima_pembayaran_piutang', 'lunasi_piutang'],
        debit: '1000', credit: '1100',
        reasoning: 'Penerimaan piutang: Kas bertambah (Debit), Piutang Dagang berkurang (Kredit)',
        confidence: 0.97
      },

      // ══════════════════════════════════════════════════════════════════════
      // KREDIT / BELUM DIBAYAR (harus di atas pola tunai generik)
      // ══════════════════════════════════════════════════════════════════════
      // Perlengkapan belum dibayar → Debit Perlengkapan (Aset 1500), Kredit Utang Dagang
      {
        keywords: ['perlengkapan_belum_dibayar', 'perlengkapan_kredit', 'beli_perlengkapan_kredit',
                   'supplies_kredit', 'atk_kredit', 'atk_belum_dibayar'],
        debit: '1500', credit: '2000',
        reasoning: 'Perlengkapan belum dibayar: Perlengkapan (Aset) bertambah (Debit), Utang Dagang bertambah (Kredit). Perlengkapan adalah Aset saat dibeli, bukan langsung Beban.',
        confidence: 0.97
      },
      // Peralatan belum dibayar → Debit Peralatan, Kredit Utang Dagang
      {
        keywords: ['peralatan_belum_dibayar', 'peralatan_kredit', 'beli_peralatan_kredit',
                   'equipment_kredit', 'equipment_belum_dibayar'],
        debit: '1800', credit: '2000',
        reasoning: 'Peralatan belum dibayar: Peralatan bertambah (Debit), Utang Dagang bertambah (Kredit) — bukan Kas karena belum dibayar tunai',
        confidence: 0.97
      },
      // Pembelian kredit umum (belum dibayar) → Debit Beban Perlengkapan, Kredit Utang Dagang
      {
        keywords: ['belum_dibayar', 'kredit_beli', 'hutang_usaha', 'utang_usaha',
                   'payable', 'on_credit', 'kredit_pembelian'],
        debit: '5400', credit: '2000',
        reasoning: 'Pembelian kredit/belum dibayar: Beban/Aset bertambah (Debit), Utang Dagang bertambah (Kredit)',
        confidence: 0.95
      },

      // ══════════════════════════════════════════════════════════════════════
      // BEBAN DIBAYAR DI MUKA (Prepaid Expenses) — Aset Lancar
      // ══════════════════════════════════════════════════════════════════════
      // Sewa dibayar di muka → Debit Sewa Dibayar di Muka (1300), Kredit Kas
      {
        keywords: ['sewa_dimuka', 'sewa_dibayar_dimuka', 'bayar_sewa_dimuka',
                   'prepaid_rent', 'sewa_setahun', 'sewa_tahunan'],
        debit: '1300', credit: '1000',
        reasoning: 'Sewa dibayar di muka: Sewa Dibayar di Muka (Aset) bertambah (Debit), Kas berkurang (Kredit). Dicatat sebagai Aset karena manfaatnya belum habis.',
        confidence: 0.97
      },
      // Asuransi dibayar di muka → Debit Asuransi Dibayar di Muka (1400), Kredit Kas
      {
        keywords: ['asuransi_dimuka', 'asuransi_dibayar_dimuka', 'bayar_asuransi_dimuka',
                   'prepaid_insurance', 'asuransi_setahun', 'premi_dimuka'],
        debit: '1400', credit: '1000',
        reasoning: 'Asuransi dibayar di muka: Asuransi Dibayar di Muka (Aset) bertambah (Debit), Kas berkurang (Kredit). Dicatat sebagai Aset karena manfaatnya belum habis.',
        confidence: 0.97
      },
      // Beban dibayar di muka generik → Debit Beban Dibayar Dimuka (1600), Kredit Kas
      {
        keywords: ['bayar_dimuka', 'dibayar_dimuka', 'prepaid', 'bayar_setahun',
                   'bayar_tahunan', 'dimuka'],
        debit: '1600', credit: '1000',
        reasoning: 'Beban dibayar di muka: Beban Dibayar Dimuka (Aset) bertambah (Debit), Kas berkurang (Kredit). Dicatat sebagai Aset karena manfaatnya belum habis.',
        confidence: 0.93
      },

      // ══════════════════════════════════════════════════════════════════════
      // PENDAPATAN DITERIMA DI MUKA (Unearned Revenue) — Liabilitas
      // ══════════════════════════════════════════════════════════════════════
      // DP / panjar / terima di muka → Debit Kas, Kredit Pendapatan Diterima Dimuka (2300)
      {
        keywords: ['dp_proyek', 'dp_jasa', 'dp_pekerjaan', 'uang_muka_proyek',
                   'panjar', 'terima_dimuka', 'pendapatan_dimuka', 'unearned_revenue',
                   'terima_dp', 'bayar_dp', 'down_payment', 'uang_muka_terima'],
        debit: '1000', credit: '2300',
        reasoning: 'Pendapatan diterima di muka: Kas bertambah (Debit), Pendapatan Diterima Dimuka (Liabilitas) bertambah (Kredit). Ini BUKAN pendapatan karena jasa belum dikerjakan.',
        confidence: 0.97
      },

      // ══════════════════════════════════════════════════════════════════════
      // PENYUSUTAN (Depreciation)
      // ══════════════════════════════════════════════════════════════════════
      // Penyusutan peralatan → Debit Beban Penyusutan (5500), Kredit Akum. Penyusutan (1810)
      // ⚠️ JANGAN potong langsung akun Aset (1800)
      {
        keywords: ['penyusutan', 'depresiasi', 'depreciation', 'beban_penyusutan',
                   'penyusutan_peralatan', 'penyusutan_kendaraan', 'penyusutan_mesin',
                   'akumulasi_penyusutan'],
        debit: '5500', credit: '1810',
        reasoning: 'Penyusutan: Beban Penyusutan bertambah (Debit), Akumulasi Penyusutan Peralatan bertambah (Kredit). JANGAN potong langsung akun Aset (1800).',
        confidence: 0.98
      },

      // ══════════════════════════════════════════════════════════════════════
      // JURNAL PENYESUAIAN — MODE 5
      // ══════════════════════════════════════════════════════════════════════
      // A. Penyusutan sudah ada di seksi PENYUSUTAN di atas — tidak duplikat
      // B. Pemakaian Perlengkapan → Debit Beban Perlengkapan, Kredit Perlengkapan (Aset)
      {
        keywords: ['pemakaian_perlengkapan', 'perlengkapan_terpakai', 'supplies_used',
                   'pemakaian_atk', 'beban_perlengkapan_penyesuaian'],
        debit: '5400', credit: '1500',
        reasoning: 'Pemakaian perlengkapan: Beban Perlengkapan bertambah (Debit), Perlengkapan (Aset) berkurang (Kredit). Kebalikan dari saat beli.',
        confidence: 0.98
      },
      // C. Sewa dibayar dimuka jatuh tempo → Debit Beban Sewa, Kredit Sewa Dibayar di Muka
      {
        keywords: ['sewa_jatuh_tempo', 'beban_sewa_penyesuaian', 'sewa_dimuka_jatuh',
                   'sewa_bulan_ini', 'sewa_expired'],
        debit: '5200', credit: '1300',
        reasoning: 'Sewa dibayar dimuka jatuh tempo: Beban Sewa bertambah (Debit), Sewa Dibayar di Muka (Aset) berkurang (Kredit).',
        confidence: 0.97
      },
      // C2. Asuransi dibayar dimuka jatuh tempo → Debit Beban Asuransi, Kredit Asuransi Dibayar di Muka
      {
        keywords: ['asuransi_jatuh_tempo', 'beban_asuransi_penyesuaian', 'asuransi_dimuka_jatuh',
                   'asuransi_expired', 'premi_jatuh_tempo'],
        debit: '5600', credit: '1400',
        reasoning: 'Asuransi dibayar dimuka jatuh tempo: Beban Asuransi bertambah (Debit), Asuransi Dibayar di Muka (Aset) berkurang (Kredit).',
        confidence: 0.97
      },
      // D. Beban masih harus dibayar (Accrued) → Debit Beban, Kredit Utang Beban
      {
        keywords: ['gaji_terutang', 'utang_gaji', 'gaji_belum_dibayar', 'accrued_salary'],
        debit: '5100', credit: '2200',
        reasoning: 'Gaji terutang: Beban Gaji bertambah (Debit), Beban Yang Masih Harus Dibayar (Liabilitas) bertambah (Kredit).',
        confidence: 0.97
      },
      {
        keywords: ['listrik_terutang', 'utang_listrik', 'listrik_belum_dibayar', 'accrued_utility'],
        debit: '5300', credit: '2200',
        reasoning: 'Listrik terutang: Beban Listrik bertambah (Debit), Beban Yang Masih Harus Dibayar (Liabilitas) bertambah (Kredit).',
        confidence: 0.97
      },
      {
        keywords: ['beban_terutang', 'masih_harus_dibayar', 'accrued_expense', 'accrued'],
        debit: '5900', credit: '2200',
        reasoning: 'Beban terutang: Beban Lain-lain bertambah (Debit), Beban Yang Masih Harus Dibayar (Liabilitas) bertambah (Kredit).',
        confidence: 0.90
      },
      // F. Pendapatan masih harus diterima (Accrued Revenue) → Debit Piutang Pendapatan, Kredit Pendapatan
      // Terjadi saat jasa sudah selesai tapi uang belum diterima (invoice belum cair)
      // Kata kunci: utang_pendapatan, pendapatan_belum_diterima, piutang_pendapatan, accrued_revenue
      {
        keywords: ['utang_pendapatan', 'pendapatan_belum_diterima', 'piutang_pendapatan',
                   'accrued_revenue', 'pendapatan_terutang', 'jasa_belum_dibayar_klien',
                   'invoice_belum_cair', 'tagihan_belum_dibayar', 'pendapatan_masih_harus_diterima'],
        debit: '1650', credit: '4000',
        reasoning: 'Pendapatan masih harus diterima: Piutang Pendapatan (Aset) bertambah (Debit), Pendapatan bertambah (Kredit). Jasa sudah selesai tapi uang belum diterima.',
        confidence: 0.97
      },
      {
        keywords: ['pendapatan_diakui', 'jasa_selesai', 'dp_selesai', 'panjar_selesai',
                   'unearned_earned', 'pendapatan_dimuka_diakui'],
        debit: '2300', credit: '4000',
        reasoning: 'Pendapatan diterima dimuka diakui: Pendapatan Diterima Dimuka (Liabilitas) berkurang (Debit), Pendapatan bertambah (Kredit). Jasa sudah selesai dikerjakan.',
        confidence: 0.97
      },
      {
        keywords: ['investor', 'investasi', 'modal', 'setoran', 'modal_awal',
                   'modal_usaha', 'capital', 'owner_equity', 'equity_in'],
        debit: '1000', credit: '3000',
        reasoning: 'Setoran modal/investor: Kas bertambah (Debit), Modal Pemilik bertambah (Kredit) — uang masuk dari pemilik/investor adalah Ekuitas, bukan Beban',
        confidence: 0.98
      },
      {
        keywords: ['prive', 'penarikan', 'ambil_uang', 'withdraw', 'drawing'],
        debit: '3100', credit: '1000',
        reasoning: 'Prive: Prive bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.95
      },

      // ══════════════════════════════════════════════════════════════════════
      // PENDAPATAN JASA
      // ══════════════════════════════════════════════════════════════════════
      {
        keywords: ['pendapatan', 'jasa', 'revenue', 'service', 'terima_pembayaran',
                   'bayar_jasa', 'income'],
        debit: '1000', credit: '4000',
        reasoning: 'Pendapatan jasa tunai: Kas bertambah (Debit), Pendapatan bertambah (Kredit)',
        confidence: 0.95
      },
      {
        keywords: ['piutang', 'receivable', 'kredit_jasa', 'jasa_kredit', 'jasa_belum_dibayar'],
        debit: '1100', credit: '4000',
        reasoning: 'Piutang usaha: Piutang Dagang bertambah (Debit), Pendapatan bertambah (Kredit)',
        confidence: 0.93
      },

      // ══════════════════════════════════════════════════════════════════════
      // ASET TETAP
      // ══════════════════════════════════════════════════════════════════════
      {
        keywords: ['komputer', 'laptop', 'printer', 'meja', 'kursi', 'lemari', 'rak',
                   'mobil', 'motor', 'kendaraan', 'furniture', 'peralatan', 'equipment',
                   'mesin', 'ac', 'kulkas', 'dispenser', 'beli_peralatan'],
        debit: '1800', credit: '1000',
        reasoning: 'Pembelian peralatan tunai: Peralatan bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.92
      },

      // ══════════════════════════════════════════════════════════════════════
      // BEBAN OPERASIONAL
      // ══════════════════════════════════════════════════════════════════════
      {
        keywords: ['gaji', 'upah', 'honor', 'salary', 'wage', 'beban_gaji', 'bayar_gaji'],
        debit: '5100', credit: '1000',
        reasoning: 'Beban gaji: Beban Gaji bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.97
      },
      {
        keywords: ['sewa', 'rental', 'rent', 'beban_sewa', 'bayar_sewa'],
        debit: '5200', credit: '1000',
        reasoning: 'Beban sewa: Beban Sewa bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.95
      },
      {
        keywords: ['listrik', 'air', 'internet', 'telepon', 'wifi', 'pulsa', 'token',
                   'pln', 'pam', 'beban_listrik', 'utilitas'],
        debit: '5300', credit: '1000',
        reasoning: 'Beban utilitas: Beban Listrik/Air bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.95
      },
      // Perlengkapan tunai → Debit Perlengkapan (Aset 1500), Kredit Kas
      // Catatan: Perlengkapan adalah Aset saat dibeli. Dipindah ke Beban (5400) saat jurnal penyesuaian.
      {
        keywords: ['pulpen', 'kertas', 'tinta', 'sticky', 'penghapus', 'penggaris',
                   'stapler', 'klip', 'amplop', 'pensil', 'spidol', 'alat_tulis',
                   'perlengkapan', 'supplies', 'atk', 'buku_tulis'],
        debit: '1500', credit: '1000',
        reasoning: 'Pembelian perlengkapan tunai: Perlengkapan (Aset) bertambah (Debit), Kas berkurang (Kredit). Perlengkapan dicatat sebagai Aset terlebih dahulu, bukan langsung Beban.',
        confidence: 0.92
      },
      {
        keywords: ['asuransi', 'insurance', 'premi'],
        debit: '5600', credit: '1000',
        reasoning: 'Beban asuransi: Beban Asuransi bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.93
      },
      // Beban iklan (lebih spesifik dari marketing)
      {
        keywords: ['beban_iklan', 'iklan', 'advertise', 'ads', 'reklame'],
        debit: '5710', credit: '1000',
        reasoning: 'Beban iklan: Beban Iklan bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.95
      },
      {
        keywords: ['marketing', 'promosi', 'pemasaran'],
        debit: '5700', credit: '1000',
        reasoning: 'Beban pemasaran: Beban Pemasaran bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.92
      },
      {
        keywords: ['bunga', 'interest', 'beban_bunga'],
        debit: '5800', credit: '1000',
        reasoning: 'Beban bunga: Beban Bunga bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.95
      },

      // ══════════════════════════════════════════════════════════════════════
      // UTANG & PINJAMAN
      // ══════════════════════════════════════════════════════════════════════
      // Pinjaman / terima uang tunai → Debit Kas, Kredit Utang Bank
      {
        keywords: ['pinjaman', 'loan', 'kredit_bank', 'pinjam'],
        debit: '1000', credit: '2100',
        reasoning: 'Pinjaman bank: Kas bertambah (Debit), Utang Bank bertambah (Kredit)',
        confidence: 0.95
      },
      // Hutang/utang generik — default: terima uang tunai → Debit Kas, Kredit Utang Dagang
      // (lebih aman daripada asumsi ke Beban Perlengkapan)
      {
        keywords: ['hutang', 'utang', 'payable'],
        debit: '1000', credit: '2000',
        reasoning: 'Hutang/utang generik: Kas bertambah (Debit), Utang Dagang bertambah (Kredit). Gunakan kata kunci lebih spesifik (mis. pembelian_kredit, perlengkapan_belum_dibayar) untuk klasifikasi yang lebih tepat.',
        confidence: 0.70
      },

      // ══════════════════════════════════════════════════════════════════════
      // PERSEDIAAN BARANG DAGANGAN
      // ══════════════════════════════════════════════════════════════════════
      // Pembelian persediaan tunai → Debit Persediaan (1200), Kredit Kas
      {
        keywords: ['barang', 'stok', 'inventory', 'persediaan', 'dagangan', 'beli_barang'],
        debit: '1200', credit: '1000',
        reasoning: 'Pembelian persediaan: Persediaan Barang Dagangan (Aset) bertambah (Debit), Kas berkurang (Kredit)',
        confidence: 0.88
      },
      // Pembelian persediaan kredit → Debit Persediaan (1200), Kredit Utang Dagang
      {
        keywords: ['persediaan_kredit', 'beli_persediaan_kredit', 'stok_kredit'],
        debit: '1200', credit: '2000',
        reasoning: 'Pembelian persediaan kredit: Persediaan bertambah (Debit), Utang Dagang bertambah (Kredit)',
        confidence: 0.95
      },

      // ══════════════════════════════════════════════════════════════════════
      // HARGA POKOK PENJUALAN (HPP) — Pendekatan HPP
      // Digunakan saat jurnal penyesuaian dengan metode HPP
      // HPP = Persediaan Awal + Pembelian Bersih - Persediaan Akhir
      // ══════════════════════════════════════════════════════════════════════
      // Input HPP awal (debit HPP, kredit Persediaan Awal + Pembelian + Beban Angkut)
      {
        keywords: ['hpp', 'harga_pokok_penjualan', 'cost_of_goods', 'cogs'],
        debit: '5050', credit: '1200',
        reasoning: 'HPP: Harga Pokok Penjualan bertambah (Debit), Persediaan berkurang (Kredit)',
        confidence: 0.97
      },
      // Persediaan akhir (debit Persediaan Akhir, kredit HPP)
      {
        keywords: ['persediaan_akhir', 'stok_akhir', 'saldo_persediaan_akhir'],
        debit: '1200', credit: '5050',
        reasoning: 'Persediaan akhir: Persediaan Akhir (Aset) bertambah (Debit), HPP berkurang (Kredit)',
        confidence: 0.97
      },
      // Persediaan awal (debit Ikhtisar L/R, kredit Persediaan Awal) — metode Ikhtisar L/R
      {
        keywords: ['persediaan_awal', 'stok_awal', 'saldo_persediaan_awal'],
        debit: '9000', credit: '1200',
        reasoning: 'Persediaan awal: Ikhtisar Laba Rugi (Debit), Persediaan Awal berkurang (Kredit) — metode Ikhtisar L/R',
        confidence: 0.97
      },

      // ══════════════════════════════════════════════════════════════════════
      // TERMIN / DISKON OTOMATIS (2/10, n/30)
      // Jika pelunasan ≤ 10 hari dari tanggal transaksi → diskon berlaku
      // ══════════════════════════════════════════════════════════════════════
      // Potongan penjualan (diskon ke pembeli yang bayar tepat waktu)
      {
        keywords: ['termin_jual', 'diskon_termin_jual', 'potongan_termin_penjualan'],
        debit: '4200', credit: '1100',
        reasoning: 'Potongan penjualan termin: Potongan Penjualan bertambah (Debit), Piutang Dagang berkurang (Kredit)',
        confidence: 0.97
      },
      // Potongan pembelian (diskon dari supplier karena bayar tepat waktu)
      {
        keywords: ['termin_beli', 'diskon_termin_beli', 'potongan_termin_pembelian'],
        debit: '2000', credit: '5030',
        reasoning: 'Potongan pembelian termin: Utang Dagang berkurang (Debit), Potongan Pembelian bertambah (Kredit)',
        confidence: 0.97
      }
    ];

    // Find matching pattern
    for (const pattern of patterns) {
      for (const keyword of pattern.keywords) {
        if (matchesKeyword(keyword)) {
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

  // ══════════════════════════════════════════════════════════════════════
  // HARGA POKOK PENJUALAN (HPP)
  // HPP = Persediaan Awal + Pembelian + Beban Angkut - Retur Pembelian
  //       - Potongan Pembelian - Persediaan Akhir
  // ══════════════════════════════════════════════════════════════════════
  /**
   * Hitung HPP dari saldo akun
   * @param {object} balances - Saldo akun dari calculateAccountBalances
   * @param {number} persediaanAkhir - Nilai persediaan akhir (dari data penyesuaian)
   * @returns {object} { hpp, pembelianBersih, persediaanAwal }
   */
  calculateHPP(balances, persediaanAkhir = 0) {
    const persediaanAwal  = Math.abs(balances['1200'] || 0);
    const pembelian       = Math.abs(balances['5010'] || 0);
    const bebanAngkut     = Math.abs(balances['5040'] || 0);
    const returPembelian  = Math.abs(balances['5020'] || 0);
    const potonganBeli    = Math.abs(balances['5030'] || 0);

    const pembelianBersih = pembelian + bebanAngkut - returPembelian - potonganBeli;
    const hpp = persediaanAwal + pembelianBersih - persediaanAkhir;

    return { hpp: Math.max(0, hpp), pembelianBersih, persediaanAwal, persediaanAkhir };
  }

  // ══════════════════════════════════════════════════════════════════════
  // TERMIN / DISKON OTOMATIS
  // Syarat 2/10, n/30: diskon 2% jika bayar ≤ 10 hari dari tanggal faktur
  // ══════════════════════════════════════════════════════════════════════
  /**
   * Cek apakah pembayaran masih dalam periode diskon
   * @param {string} transactionDate - Tanggal transaksi asal (YYYY-MM-DD)
   * @param {string} paymentDate - Tanggal pembayaran (YYYY-MM-DD)
   * @param {number} discountDays - Batas hari diskon (default: 10)
   * @param {number} discountRate - Persentase diskon (default: 0.02 = 2%)
   * @returns {object} { eligible, discountRate, daysDiff }
   */
  checkTermin(transactionDate, paymentDate, discountDays = 10, discountRate = 0.02) {
    const txDate  = new Date(transactionDate);
    const payDate = new Date(paymentDate);
    const daysDiff = Math.floor((payDate - txDate) / (1000 * 60 * 60 * 24));
    return {
      eligible:     daysDiff >= 0 && daysDiff <= discountDays,
      discountRate: daysDiff <= discountDays ? discountRate : 0,
      daysDiff
    };
  }
}

const accountingCalculator = new AccountingCalculator();
