/**
 * General Ledger (Buku Besar) Module
 * Generator data, UI renderer, dan PDF renderer untuk Buku Besar
 * Depends on: accountingCalculator (global)
 */

/* ── Data Generator ──────────────────────────────────────────────────── */

function generateGeneralLedger(transactions, chartOfAccounts, metadata) {
  const ledger = [];
  const isDebitNormal = (type) => type === 'Asset' || type === 'Expense';

  chartOfAccounts.forEach(account => {
    const accountTransactions = transactions.filter(t => t.accountCode === account.code);
    if (accountTransactions.length === 0) return;

    const sorted = accountTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    const debitNormal = isDebitNormal(account.type);

    let runningDebit = 0;
    let runningCredit = 0;
    const txnRows = sorted.map((t, idx) => {
      runningDebit += t.debitAmount;
      runningCredit += t.creditAmount;
      const saldoDebet  = debitNormal ? Math.max(0, runningDebit - runningCredit) : 0;
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

    const totalDebits  = sorted.reduce((sum, t) => sum + t.debitAmount, 0);
    const totalCredits = sorted.reduce((sum, t) => sum + t.creditAmount, 0);
    const closingDebit  = debitNormal ? Math.max(0, totalDebits - totalCredits) : 0;
    const closingCredit = debitNormal ? 0 : Math.max(0, totalCredits - totalDebits);
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

/* ── UI Renderer ─────────────────────────────────────────────────────── */

function renderGeneralLedger(report, elements, formatCurrency) {
  elements.tableHeader.innerHTML = '';
  elements.tableBody.innerHTML = '';

  if (!report.accounts || report.accounts.length === 0) {
    if (elements.emptyState) elements.emptyState.style.display = 'flex';
    return;
  }

  // Colgroup proporsional — paksa fit dalam container tanpa scroll horizontal
  const colgroup =
    '<colgroup>' +
    '<col style="width:11%">' +
    '<col style="width:29%">' +
    '<col style="width:8%">'  +
    '<col style="width:13%">' +
    '<col style="width:13%">' +
    '<col style="width:13%">' +
    '<col style="width:13%">' +
    '</colgroup>';

  const table = elements.tableBody.closest('table');
  if (table) {
    const oldCg = table.querySelector('colgroup');
    if (oldCg) oldCg.remove();
    table.insertAdjacentHTML('afterbegin', colgroup);
    table.style.tableLayout = 'fixed';
    table.style.width = '100%';
  }

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni',
                      'Juli','Agustus','September','Oktober','November','Desember'];

  const html = report.accounts.map(account => {
    const bulan = monthNames[(account.month || 1) - 1] || account.month;
    const tahun = account.year || '-';

    const txnRows = account.transactions.map(t =>
      '<tr>' +
      '<td style="word-break:keep-all">' + t.date + '</td>' +
      '<td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + t.description + '</td>' +
      '<td class="ref-col">' + t.ref + '</td>' +
      '<td class="amount-debit">'  + (t.debit > 0        ? formatCurrency(t.debit)        : '-') + '</td>' +
      '<td class="amount-credit">' + (t.credit > 0       ? formatCurrency(t.credit)       : '-') + '</td>' +
      '<td class="amount-debit">'  + (t.balanceDebit > 0  ? formatCurrency(t.balanceDebit)  : '-') + '</td>' +
      '<td class="amount-credit">' + (t.balanceCredit > 0 ? formatCurrency(t.balanceCredit) : '-') + '</td>' +
      '</tr>'
    ).join('');

    return `
      <tr class="ledger-account-header">
        <td colspan="7">
          <div class="ledger-account-meta">
            <div class="ledger-meta-left">
              <span><strong>Kode</strong> : ${account.accountCode}</span>
              <span><strong>Nama Akun</strong> : ${account.accountName}</span>
            </div>
            <div class="ledger-meta-right">
              <span><strong>Bulan</strong> : ${bulan}</span>
              <span><strong>Tahun</strong> : ${tahun}</span>
            </div>
          </div>
          <div class="ledger-balance-summary">
            <div class="ledger-balance-group">
              <span>Saldo Awal Debet: <strong>${formatCurrency(account.openingBalanceDebit)}</strong></span>
              <span>Saldo Awal Kredit: <strong>${formatCurrency(account.openingBalanceCredit)}</strong></span>
            </div>
            <div class="ledger-balance-group">
              <span>Mutasi Debet: <strong>${formatCurrency(account.totalDebits)}</strong></span>
              <span>Mutasi Kredit: <strong>${formatCurrency(account.totalCredits)}</strong></span>
            </div>
            <div class="ledger-balance-group">
              <span>Saldo Akhir Debet: <strong>${formatCurrency(account.closingBalanceDebit)}</strong></span>
              <span>Saldo Akhir Kredit: <strong>${formatCurrency(account.closingBalanceCredit)}</strong></span>
            </div>
          </div>
        </td>
      </tr>
      <tr class="ledger-col-header">
        <th>Tanggal</th><th>Keterangan</th><th>No Ref</th>
        <th>Debet</th><th>Kredit</th>
        <th colspan="2" class="saldo-header">Saldo</th>
      </tr>
      <tr class="ledger-col-subheader">
        <th colspan="5"></th><th>Debet</th><th>Kredit</th>
      </tr>
      ${txnRows}
      <tr class="ledger-total-row">
        <td colspan="3"><strong>Total</strong></td>
        <td class="amount-debit"><strong>${formatCurrency(account.totalDebits)}</strong></td>
        <td class="amount-credit"><strong>${formatCurrency(account.totalCredits)}</strong></td>
        <td colspan="2"></td>
      </tr>
      <tr class="ledger-spacer"><td colspan="7"></td></tr>
    `;
  }).join('');

  elements.tableBody.innerHTML = html;
}

/* ── PDF Renderer ────────────────────────────────────────────────────── */

function pdfGeneralLedger(doc, data, y, helpers) {
  const { tableHeader, tableRow, totalRow, checkNewPage, fmt, truncate, ph, mb, mt } = helpers;

  const cols   = ['Tanggal', 'Keterangan', 'No Ref', 'Debet', 'Kredit', 'Saldo D', 'Saldo K'];
  const widths = [22, 52, 18, 24, 24, 23, 23];

  data.accounts.forEach(acc => {
    const minNeeded = 54;
    if (y > ph - mb - minNeeded) {
      doc.addPage();
      y = mt;
    }

    y = _pdfAccountInfoBlock(doc, acc, y, helpers);
    y = tableHeader(doc, cols, widths, y);

    acc.transactions.forEach(t => {
      y = checkNewPage(doc, y, cols, widths, tableHeader);
      const row = [
        t.date || '',
        truncate(t.description || '', 32),
        t.ref || '',
        t.debit > 0        ? fmt(t.debit)        : '-',
        t.credit > 0       ? fmt(t.credit)       : '-',
        t.balanceDebit > 0  ? fmt(t.balanceDebit)  : '-',
        t.balanceCredit > 0 ? fmt(t.balanceCredit) : '-'
      ];
      y = tableRow(doc, row, widths, y);
    });

    y = totalRow(doc,
      ['', 'TOTAL', '',
        fmt(acc.totalDebits), fmt(acc.totalCredits),
        fmt(acc.closingBalanceDebit), fmt(acc.closingBalanceCredit)],
      widths, y
    );
    y += 14;
  });

  return y;
}

function _pdfAccountInfoBlock(doc, acc, y, helpers) {
  const { ml, pw, mr, fmt } = helpers;
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni',
                      'Juli','Agustus','September','Oktober','November','Desember'];
  const bulan = monthNames[(acc.month || 1) - 1] || String(acc.month);
  const usableW = pw - ml - mr;

  const lineH = 6, padTop = 5, padBot = 5;
  const boxH = padTop + lineH * 4 + padBot;

  doc.setFillColor(235, 235, 235);
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.rect(ml, y, usableW, boxH, 'FD');

  const lx = ml + 4;
  const rx = pw - mr - 4;

  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(`Kode      : ${acc.accountCode}`, lx, y + padTop + lineH);
  doc.text(`Bulan  : ${bulan}`, rx, y + padTop + lineH, { align: 'right' });
  doc.text(`Nama Akun : ${acc.accountName}`, lx, y + padTop + lineH * 2);
  doc.text(`Tahun  : ${acc.year || '-'}`, rx, y + padTop + lineH * 2, { align: 'right' });

  const sepY = y + padTop + lineH * 2 + 2;
  doc.setDrawColor(170, 170, 170);
  doc.setLineWidth(0.2);
  doc.line(ml + 2, sepY, pw - mr - 2, sepY);

  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(
    `Saldo Awal  Debet: ${fmt(acc.openingBalanceDebit)}    Kredit: ${fmt(acc.openingBalanceCredit)}`,
    lx, y + padTop + lineH * 3
  );
  doc.text(
    `Mutasi  Debet: ${fmt(acc.totalDebits)}    Kredit: ${fmt(acc.totalCredits)}`,
    lx, y + padTop + lineH * 4
  );
  doc.text(
    `Saldo Akhir  Debet: ${fmt(acc.closingBalanceDebit)}    Kredit: ${fmt(acc.closingBalanceCredit)}`,
    rx, y + padTop + lineH * 4, { align: 'right' }
  );

  return y + boxH + 2;
}
