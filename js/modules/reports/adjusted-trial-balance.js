/**
 * Adjusted Trial Balance (Neraca Saldo Setelah Penyesuaian) — Mode 6
 * Menggabungkan saldo Buku Besar + Jurnal Penyesuaian
 */

/* ── Data Generator ──────────────────────────────────────────────────── */

function generateAdjustedTrialBalance(transactions, chartOfAccounts, metadata) {
  // Semua transaksi (termasuk penyesuaian) sudah ada di transactions
  // generateTrialBalance sudah menghitung semua saldo — tinggal pakai
  const trialBalance = accountingCalculator.generateTrialBalance(transactions, chartOfAccounts);

  const totalDebits  = trialBalance.reduce((sum, e) => sum + e.debitBalance, 0);
  const totalCredits = trialBalance.reduce((sum, e) => sum + e.creditBalance, 0);

  // Tandai akun mana yang dipengaruhi penyesuaian
  // Guard: detectAdjustingType berasal dari adjusting-entries.js yang di-load lebih dulu
  const _detectAdjusting = (typeof detectAdjustingType === 'function') ? detectAdjustingType : () => null;
  const adjustingCodes = new Set();
  transactions.forEach(t => {
    if (t.adjustingType || _detectAdjusting(t.description || '')) {
      if (t.accountCode) adjustingCodes.add(t.accountCode);
    }
  });

  return {
    type: 'Adjusted Trial Balance',
    metadata,
    entries: trialBalance.map(e => ({
      ...e,
      isAdjusted: adjustingCodes.has(e.code)
    })),
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

function renderAdjustedTrialBalance(report, elements, formatCurrency) {
  const table = elements.tableBody.closest('table');
  if (table) {
    const oldCg = table.querySelector('colgroup');
    if (oldCg) oldCg.remove();
    table.style.tableLayout = '';
    table.style.width = '';
  }

  elements.tableHeader.innerHTML =
    '<th>Kode Akun</th><th>Nama Akun</th><th>Debet</th><th>Kredit</th><th>Ket.</th>';

  const rows = report.entries.map(e => {
    const adjBadge = e.isAdjusted
      ? '<span style="font-size:0.7em;color:var(--color-warning);margin-left:4px">✦ Disesuaikan</span>'
      : '';
    return '<tr' + (e.isAdjusted ? ' class="adjusted-row"' : '') + '>' +
      '<td>' + e.code + '</td>' +
      '<td>' + e.name + adjBadge + '</td>' +
      '<td class="amount-debit">'  + (e.debitBalance  > 0 ? formatCurrency(e.debitBalance)  : '-') + '</td>' +
      '<td class="amount-credit">' + (e.creditBalance > 0 ? formatCurrency(e.creditBalance) : '-') + '</td>' +
      '<td style="font-size:0.75em;color:var(--color-gray-400)">' + (e.isAdjusted ? '✦' : '') + '</td>' +
      '</tr>';
  });

  rows.push(
    '<tr class="total-row"><td colspan="2"><strong>Total</strong></td>' +
    '<td class="amount-debit"><strong>'  + formatCurrency(report.summary.totalDebits)  + '</strong></td>' +
    '<td class="amount-credit"><strong>' + formatCurrency(report.summary.totalCredits) + '</strong></td>' +
    '<td></td></tr>'
  );

  elements.tableBody.innerHTML = rows.join('');
}

/* ── PDF Renderer ────────────────────────────────────────────────────── */

function pdfAdjustedTrialBalance(doc, data, y, helpers) {
  const { tableHeader, tableRow, totalRow, checkNewPage, fmt, truncate } = helpers;

  const cols   = ['Kode Akun', 'Nama Akun', 'Debet', 'Kredit', 'Ket.'];
  const widths = [24, 100, 27, 27, 8];

  y = tableHeader(doc, cols, widths, y);

  data.entries.forEach(e => {
    y = checkNewPage(doc, y, cols, widths, tableHeader);
    const row = [
      e.code,
      truncate(e.name, 58),
      e.debitBalance  > 0 ? fmt(e.debitBalance)  : '-',
      e.creditBalance > 0 ? fmt(e.creditBalance) : '-',
      e.isAdjusted ? '✦' : ''
    ];
    y = tableRow(doc, row, widths, y);
  });

  y = totalRow(doc,
    ['', 'TOTAL', fmt(data.summary.totalDebits), fmt(data.summary.totalCredits), ''],
    widths, y
  );

  // Keterangan
  y += 4;
  doc.setFontSize(7.5);
  doc.setFont('times', 'italic');
  doc.setTextColor(80, 80, 80);
  doc.text('✦ = Akun yang dipengaruhi jurnal penyesuaian', helpers.ml, y);

  return y + 8;
}
