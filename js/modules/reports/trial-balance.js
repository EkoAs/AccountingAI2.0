/**
 * Trial Balance (Neraca Saldo) Module
 * Generator data, UI renderer, dan PDF renderer untuk Neraca Saldo
 * Depends on: accountingCalculator (global)
 */

/* ── Data Generator ──────────────────────────────────────────────────── */

function generateTrialBalance(transactions, chartOfAccounts, metadata) {
  const trialBalance = accountingCalculator.generateTrialBalance(transactions, chartOfAccounts);
  const totalDebits  = trialBalance.reduce((sum, e) => sum + e.debitBalance, 0);
  const totalCredits = trialBalance.reduce((sum, e) => sum + e.creditBalance, 0);

  return {
    type: 'Trial Balance',
    metadata,
    entries: trialBalance,
    summary: {
      totalAccounts: trialBalance.length,
      totalDebits,
      totalCredits,
      balanced: Math.abs(totalDebits - totalCredits) < 0.01,
      discrepancy: Math.abs(totalDebits - totalCredits)
    }
  };
}

/* ── UI Renderer ─────────────────────────────────────────────────────── */

function renderTrialBalance(report, elements, formatCurrency) {
  // Reset table layout dari buku besar jika sebelumnya aktif
  const table = elements.tableBody.closest('table');
  if (table) {
    const oldCg = table.querySelector('colgroup');
    if (oldCg) oldCg.remove();
    table.style.tableLayout = '';
    table.style.width = '';
  }

  elements.tableHeader.innerHTML =
    '<th>Kode Akun</th><th>Nama Akun</th><th>Debet</th><th>Kredit</th>';

  const rows = report.entries.map(e =>
    '<tr><td>' + e.code + '</td><td>' + e.name + '</td>' +
    '<td class="amount-debit">'  + (e.debitBalance  > 0 ? formatCurrency(e.debitBalance)  : '-') + '</td>' +
    '<td class="amount-credit">' + (e.creditBalance > 0 ? formatCurrency(e.creditBalance) : '-') + '</td></tr>'
  );
  rows.push(
    '<tr class="total-row"><td colspan="2"><strong>Total</strong></td>' +
    '<td class="amount-debit"><strong>'  + formatCurrency(report.summary.totalDebits)  + '</strong></td>' +
    '<td class="amount-credit"><strong>' + formatCurrency(report.summary.totalCredits) + '</strong></td></tr>'
  );
  elements.tableBody.innerHTML = rows.join('');
}

/* ── PDF Renderer ────────────────────────────────────────────────────── */

function pdfTrialBalance(doc, data, y, helpers) {
  const { tableHeader, tableRow, totalRow, checkNewPage, fmt } = helpers;

  const cols   = ['Kode Akun', 'Nama Akun', 'Debet', 'Kredit'];
  const widths = [24, 108, 27, 27];

  y = tableHeader(doc, cols, widths, y);

  data.entries.forEach(e => {
    y = checkNewPage(doc, y, cols, widths, tableHeader);
    const row = [
      e.code,
      e.name,
      e.debitBalance  > 0 ? fmt(e.debitBalance)  : '-',
      e.creditBalance > 0 ? fmt(e.creditBalance) : '-'
    ];
    y = tableRow(doc, row, widths, y);
  });

  y = totalRow(doc,
    ['', 'TOTAL', fmt(data.summary.totalDebits), fmt(data.summary.totalCredits)],
    widths, y
  );
  return y + 5;
}
