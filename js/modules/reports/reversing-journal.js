/**
 * Reversing Journal (Jurnal Pembalik) Module
 * Generator data, UI renderer, dan PDF renderer untuk Jurnal Pembalik
 */

/* ── Data Generator ──────────────────────────────────────────────────── */

function generateReversingJournal(transactions, chartOfAccounts, metadata) {
  const reversingEntries = [];
  const accrualAccounts  = ['2200', '1600']; // Beban Masih Harus Dibayar, Beban Dibayar Dimuka

  chartOfAccounts.forEach(account => {
    if (!accrualAccounts.includes(account.code)) return;

    const accountTransactions = transactions.filter(t => t.accountCode === account.code);
    accountTransactions.forEach(txn => {
      const reversingDate = _getNextPeriodDate(txn.date);
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
  });

  const sorted = reversingEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    type: 'Reversing Journal',
    metadata,
    entries: sorted,
    emptyReason: sorted.length === 0
      ? 'Tidak ada transaksi akrual (akun 2200 atau 1600) yang perlu dibalik.'
      : null,
    summary: {
      totalEntries: sorted.length,
      totalDebits:  sorted.reduce((sum, e) => sum + e.debit, 0),
      totalCredits: sorted.reduce((sum, e) => sum + e.credit, 0)
    }
  };
}

function _getNextPeriodDate(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

/* ── UI Renderer ─────────────────────────────────────────────────────── */

function renderReversingJournal(report, elements, formatCurrency) {
  // Reset table layout dari buku besar jika sebelumnya aktif
  const table = elements.tableBody.closest('table');
  if (table) {
    const oldCg = table.querySelector('colgroup');
    if (oldCg) oldCg.remove();
    table.style.tableLayout = '';
    table.style.width = '';
  }

  elements.tableHeader.innerHTML =
    '<th>Tanggal</th><th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th>Debet</th><th>Kredit</th>';

  if (!report.entries || report.entries.length === 0) {
    elements.tableBody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--color-gray-400);">' +
      (report.emptyReason || 'Tidak ada entri jurnal pembalik.') +
      '</td></tr>';
    return;
  }

  const rows = report.entries.map(e =>
    '<tr><td>' + e.date + '</td><td>' + e.accountCode + '</td><td>' + (e.account || '-') + '</td><td>' + e.description + '</td>' +
    '<td class="amount-debit">'  + (e.debit  > 0 ? formatCurrency(e.debit)  : '-') + '</td>' +
    '<td class="amount-credit">' + (e.credit > 0 ? formatCurrency(e.credit) : '-') + '</td></tr>'
  );
  elements.tableBody.innerHTML = rows.join('');
}

/* ── PDF Renderer ────────────────────────────────────────────────────── */

function pdfReversingJournal(doc, data, y, helpers) {
  const { tableHeader, tableRow, checkNewPage, fmt, truncate } = helpers;

  const cols   = ['Tanggal', 'Kode', 'Nama Akun', 'Keterangan', 'Debet', 'Kredit'];
  const widths = [22, 14, 38, 52, 30, 30];

  y = tableHeader(doc, cols, widths, y);

  data.entries.forEach(e => {
    y = checkNewPage(doc, y, cols, widths, tableHeader);
    const row = [
      e.date || '',
      e.accountCode || '',
      truncate(e.account || '', 22),
      truncate(e.description || '', 30),
      e.debit  > 0 ? fmt(e.debit)  : '-',
      e.credit > 0 ? fmt(e.credit) : '-'
    ];
    y = tableRow(doc, row, widths, y);
  });

  return y + 5;
}
