/**
 * General Journal Module
 * Generator data, UI renderer, dan PDF renderer untuk Jurnal Umum
 * Depends on: accountingCalculator, autoBalancer (globals)
 */

/* ── Data Generator ──────────────────────────────────────────────────── */

function generateGeneralJournal(transactions, chartOfAccounts, metadata) {
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
      totalDebits,
      totalCredits,
      balanced: Math.abs(totalDebits - totalCredits) < 0.01
    }
  };
}

/* ── UI Renderer ─────────────────────────────────────────────────────── */

function renderGeneralJournal(report, elements, formatCurrency) {
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

  const rows = report.entries.map(e =>
    '<tr><td>' + e.date + '</td><td>' + (e.accountCode || '-') + '</td><td>' + (e.account || '-') + '</td><td>' + e.description + '</td>' +
    '<td class="amount-debit">' + (e.debit > 0 ? formatCurrency(e.debit) : '-') + '</td>' +
    '<td class="amount-credit">' + (e.credit > 0 ? formatCurrency(e.credit) : '-') + '</td></tr>'
  );
  rows.push(
    '<tr class="total-row"><td colspan="4"><strong>Total</strong></td>' +
    '<td class="amount-debit"><strong>' + formatCurrency(report.summary.totalDebits) + '</strong></td>' +
    '<td class="amount-credit"><strong>' + formatCurrency(report.summary.totalCredits) + '</strong></td></tr>'
  );
  elements.tableBody.innerHTML = rows.join('');
}

/* ── PDF Renderer ────────────────────────────────────────────────────── */

function pdfGeneralJournal(doc, data, y, helpers) {
  const { tableHeader, tableRow, totalRow, checkNewPage, fmt, truncate, ml } = helpers;

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
      e.debit > 0 ? fmt(e.debit) : '-',
      e.credit > 0 ? fmt(e.credit) : '-'
    ];
    y = tableRow(doc, row, widths, y);
  });

  y = totalRow(doc,
    ['', '', '', 'TOTAL', fmt(data.summary.totalDebits), fmt(data.summary.totalCredits)],
    widths, y
  );
  return y + 5;
}
