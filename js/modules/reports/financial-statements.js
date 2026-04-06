/**
 * Financial Statements (Laporan Keuangan Lengkap) — Mode 7
 * Terdiri dari 3 laporan: Laba Rugi + Perubahan Ekuitas + Neraca
 * Sumber data: semua transaksi (termasuk penyesuaian)
 */

/* ── Data Generator ──────────────────────────────────────────────────── */

function generateFinancialStatements(transactions, chartOfAccounts, metadata) {
  const balances = accountingCalculator.calculateAccountBalances(transactions, chartOfAccounts);
  const chartMap = {};
  chartOfAccounts.forEach(a => { chartMap[a.code] = a; });

  // Helper: ambil saldo positif akun
  const bal = (code) => Math.abs(balances[code] || 0);

  // ── 1. LAPORAN LABA RUGI ─────────────────────────────────────────────
  const revenues = [];       // Pendapatan operasional
  const otherRevenues = [];  // Pendapatan lain-lain (4900)
  const expenses = [];
  const hpp = [];

  chartOfAccounts.forEach(acc => {
    const b = balances[acc.code] || 0;
    if (b === 0) return;

    if (acc.type === 'Revenue') {
      if (['4100', '4200'].includes(acc.code)) {
        revenues.push({ code: acc.code, name: acc.name, amount: Math.abs(b), isDeduction: true });
      } else if (acc.code === '4900') {
        otherRevenues.push({ code: acc.code, name: acc.name, amount: Math.abs(b) });
      } else {
        revenues.push({ code: acc.code, name: acc.name, amount: Math.abs(b), isDeduction: false });
      }
    } else if (acc.type === 'Expense') {
      if (['5010', '5020', '5030', '5040'].includes(acc.code)) {
        hpp.push({ code: acc.code, name: acc.name, amount: Math.abs(b),
          isDeduction: ['5020', '5030'].includes(acc.code) });
      } else {
        expenses.push({ code: acc.code, name: acc.name, amount: Math.abs(b) });
      }
    }
  });

  const grossRevenue   = revenues.filter(r => !r.isDeduction).reduce((s, r) => s + r.amount, 0);
  const revenueDeduct  = revenues.filter(r => r.isDeduction).reduce((s, r) => s + r.amount, 0);
  const netRevenue     = grossRevenue - revenueDeduct;
  const totalOtherRev  = otherRevenues.reduce((s, r) => s + r.amount, 0);

  const hppGross   = hpp.filter(h => !h.isDeduction).reduce((s, h) => s + h.amount, 0);
  const hppDeduct  = hpp.filter(h => h.isDeduction).reduce((s, h) => s + h.amount, 0);
  const netHpp     = hppGross - hppDeduct;

  const grossProfit    = netRevenue - netHpp;
  const totalExpenses  = expenses.reduce((s, e) => s + e.amount, 0);
  const netIncome      = grossProfit - totalExpenses + totalOtherRev;

  // ── 2. LAPORAN PERUBAHAN EKUITAS ─────────────────────────────────────
  // Modal (3000) adalah credit-normal: balances['3000'] sudah positif = kredit
  // Prive (3100) adalah debit-normal: balances['3100'] sudah positif = debit
  const capitalBegin = Math.max(0, balances['3000'] || 0);
  const prive        = Math.max(0, balances['3100'] || 0);
  const capitalEnd   = capitalBegin + netIncome - prive;

  // ── 3. NERACA ────────────────────────────────────────────────────────
  const assets      = [];
  const liabilities = [];

  chartOfAccounts.forEach(acc => {
    const b = balances[acc.code] || 0;
    if (b === 0) return; // skip semua akun dengan saldo 0, termasuk 1810

    if (acc.type === 'Asset') {
      // Akumulasi Penyusutan (1810) adalah pengurang Peralatan — hanya tampil jika ada saldo
      if (acc.code === '1810') {
        assets.push({ code: acc.code, name: acc.name, amount: Math.abs(b), isContra: true });
      } else {
        assets.push({ code: acc.code, name: acc.name, amount: Math.abs(b), isContra: false });
      }
    } else if (acc.type === 'Liability') {
      liabilities.push({ code: acc.code, name: acc.name, amount: Math.abs(b) });
    }
  });

  const totalAssets      = assets.reduce((s, a) => a.isContra ? s - a.amount : s + a.amount, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
  const totalEquity      = capitalEnd;
  const totalLiabEquity  = totalLiabilities + totalEquity;
  const isBalanced       = Math.abs(totalAssets - totalLiabEquity) < 0.01;

  return {
    type: 'Financial Statements',
    metadata,
    incomeStatement: {
      revenues, revenueDeduct, grossRevenue, netRevenue,
      otherRevenues, totalOtherRev,
      hpp, netHpp, grossProfit,
      expenses, totalExpenses,
      netIncome,
      isProfit: netIncome >= 0
    },
    equityStatement: {
      capitalBegin, netIncome, prive, capitalEnd
    },
    balanceSheet: {
      assets, totalAssets,
      liabilities, totalLiabilities,
      capitalEnd, totalEquity,
      totalLiabEquity, isBalanced
    },
    summary: {
      netIncome, isProfit: netIncome >= 0,
      totalAssets, isBalanced
    }
  };
}

/* ── UI Renderer ─────────────────────────────────────────────────────── */

function renderFinancialStatements(report, elements, formatCurrency) {
  const table = elements.tableBody.closest('table');
  if (table) {
    const oldCg = table.querySelector('colgroup');
    if (oldCg) oldCg.remove();
    table.style.tableLayout = '';
    table.style.width = '';
  }

  // Mode 7 pakai layout custom — bukan tabel standar
  elements.tableHeader.innerHTML = '';

  const is = report.incomeStatement;
  const es = report.equityStatement;
  const bs = report.balanceSheet;
  const fmt = formatCurrency;

  const profitColor = is.isProfit ? 'var(--color-credit)' : 'var(--color-debit)';
  const profitLabel = is.isProfit ? '✓ LABA BERSIH' : '✗ RUGI BERSIH';

  // ── Laba Rugi ──────────────────────────────────────────────────────
  let html = `
    <tr class="fs-section-header"><td colspan="3">📊 LAPORAN LABA RUGI</td></tr>
    <tr class="fs-sub-header"><td colspan="3">PENDAPATAN</td></tr>`;

  is.revenues.filter(r => !r.isDeduction).forEach(r => {
    html += `<tr><td class="fs-indent">${r.name}</td><td></td><td class="amount-credit">${fmt(r.amount)}</td></tr>`;
  });
  if (is.revenueDeduct > 0) {
    is.revenues.filter(r => r.isDeduction).forEach(r => {
      html += `<tr><td class="fs-indent">(−) ${r.name}</td><td></td><td class="amount-debit">(${fmt(r.amount)})</td></tr>`;
    });
    html += `<tr class="fs-subtotal"><td>Penjualan Bersih</td><td></td><td class="amount-credit">${fmt(is.netRevenue)}</td></tr>`;
  }

  if (is.hpp.length > 0) {
    html += `<tr class="fs-sub-header"><td colspan="3">HARGA POKOK PENJUALAN</td></tr>`;
    is.hpp.filter(h => !h.isDeduction).forEach(h => {
      html += `<tr><td class="fs-indent">${h.name}</td><td></td><td class="amount-debit">${fmt(h.amount)}</td></tr>`;
    });
    is.hpp.filter(h => h.isDeduction).forEach(h => {
      html += `<tr><td class="fs-indent">(−) ${h.name}</td><td></td><td class="amount-credit">(${fmt(h.amount)})</td></tr>`;
    });
    html += `<tr class="fs-subtotal"><td>HPP Bersih</td><td></td><td class="amount-debit">(${fmt(is.netHpp)})</td></tr>`;
    html += `<tr class="fs-subtotal"><td><strong>Laba Kotor</strong></td><td></td><td class="amount-credit"><strong>${fmt(is.grossProfit)}</strong></td></tr>`;
  }

  html += `<tr class="fs-sub-header"><td colspan="3">BEBAN OPERASIONAL</td></tr>`;
  is.expenses.forEach(e => {
    html += `<tr><td class="fs-indent">${e.name}</td><td></td><td class="amount-debit">${fmt(e.amount)}</td></tr>`;
  });
  html += `<tr class="fs-subtotal"><td>Total Beban</td><td></td><td class="amount-debit">(${fmt(is.totalExpenses)})</td></tr>`;

  if (is.otherRevenues && is.otherRevenues.length > 0) {
    html += `<tr class="fs-sub-header"><td colspan="3">PENDAPATAN LAIN-LAIN</td></tr>`;
    is.otherRevenues.forEach(r => {
      html += `<tr><td class="fs-indent">${r.name}</td><td></td><td class="amount-credit">${fmt(r.amount)}</td></tr>`;
    });
    html += `<tr class="fs-subtotal"><td>Total Pendapatan Lain</td><td></td><td class="amount-credit">${fmt(is.totalOtherRev)}</td></tr>`;
  }
  html += `<tr class="fs-total" style="color:${profitColor}"><td colspan="2"><strong>${profitLabel}</strong></td><td><strong>${fmt(Math.abs(is.netIncome))}</strong></td></tr>`;
  html += `<tr class="fs-spacer"><td colspan="3"></td></tr>`;

  // ── Perubahan Ekuitas ──────────────────────────────────────────────
  html += `
    <tr class="fs-section-header"><td colspan="3">📈 LAPORAN PERUBAHAN EKUITAS</td></tr>
    <tr><td class="fs-indent">Modal Awal</td><td></td><td class="amount-credit">${fmt(es.capitalBegin)}</td></tr>
    <tr><td class="fs-indent">(+) ${is.isProfit ? 'Laba Bersih' : 'Rugi Bersih'}</td><td></td>
        <td class="${is.isProfit ? 'amount-credit' : 'amount-debit'}">${fmt(Math.abs(es.netIncome))}</td></tr>`;
  if (es.prive > 0) {
    html += `<tr><td class="fs-indent">(−) Prive</td><td></td><td class="amount-debit">(${fmt(es.prive)})</td></tr>`;
  }
  html += `<tr class="fs-total"><td colspan="2"><strong>Modal Akhir</strong></td><td class="amount-credit"><strong>${fmt(es.capitalEnd)}</strong></td></tr>`;
  html += `<tr class="fs-spacer"><td colspan="3"></td></tr>`;

  // ── Neraca ─────────────────────────────────────────────────────────
  html += `<tr class="fs-section-header"><td colspan="3">⚖️ NERACA (LAPORAN POSISI KEUANGAN)</td></tr>`;
  html += `<tr class="fs-sub-header"><td colspan="3">ASET</td></tr>`;

  bs.assets.filter(a => !a.isContra).forEach(a => {
    html += `<tr><td class="fs-indent">${a.name}</td><td></td><td class="amount-credit">${fmt(a.amount)}</td></tr>`;
  });
  bs.assets.filter(a => a.isContra).forEach(a => {
    html += `<tr><td class="fs-indent">(−) ${a.name}</td><td></td><td class="amount-debit">(${fmt(a.amount)})</td></tr>`;
  });
  html += `<tr class="fs-subtotal"><td><strong>Total Aset</strong></td><td></td><td class="amount-credit"><strong>${fmt(bs.totalAssets)}</strong></td></tr>`;

  html += `<tr class="fs-sub-header"><td colspan="3">LIABILITAS</td></tr>`;
  bs.liabilities.forEach(l => {
    html += `<tr><td class="fs-indent">${l.name}</td><td></td><td class="amount-debit">${fmt(l.amount)}</td></tr>`;
  });
  html += `<tr class="fs-subtotal"><td>Total Liabilitas</td><td></td><td class="amount-debit">${fmt(bs.totalLiabilities)}</td></tr>`;

  html += `<tr class="fs-sub-header"><td colspan="3">EKUITAS</td></tr>`;
  html += `<tr><td class="fs-indent">Modal Akhir</td><td></td><td class="amount-credit">${fmt(bs.capitalEnd)}</td></tr>`;
  html += `<tr class="fs-subtotal"><td>Total Liabilitas + Ekuitas</td><td></td><td class="amount-credit"><strong>${fmt(bs.totalLiabEquity)}</strong></td></tr>`;

  const balanceCheck = bs.isBalanced
    ? '<span style="color:var(--color-credit)">✓ Neraca Seimbang</span>'
    : '<span style="color:var(--color-debit)">✗ Neraca Tidak Seimbang</span>';
  html += `<tr class="fs-total"><td colspan="2">${balanceCheck}</td><td></td></tr>`;

  elements.tableBody.innerHTML = html;
}

/* ── PDF Renderer ────────────────────────────────────────────────────── */

function pdfFinancialStatements(doc, data, y, helpers) {
  const { tableHeader, tableRow, totalRow, checkNewPage, fmt, ml, pw, mr, ph, mb, mt } = helpers;
  const is = data.incomeStatement;
  const es = data.equityStatement;
  const bs = data.balanceSheet;
  const usableW = pw - ml - mr;

  const _sectionHeader = (title, yy) => {
    doc.setFillColor(50, 50, 50);
    doc.rect(ml, yy, usableW, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    doc.setTextColor(220, 220, 220);
    doc.text(title, ml + 3, yy + 5);
    doc.setTextColor(20, 20, 20);
    return yy + 9;
  };

  const _subHeader = (title, yy) => {
    doc.setFillColor(210, 210, 210);
    doc.rect(ml, yy, usableW, 6, 'F');
    doc.setFontSize(8.5);
    doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(title, ml + 3, yy + 4.5);
    return yy + 7;
  };

  const _row = (label, amount, yy, isDeduction = false, isBold = false) => {
    if (yy > ph - mb - 10) { doc.addPage(); yy = mt; }
    doc.setFontSize(8);
    doc.setFont('times', isBold ? 'bold' : 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(label, ml + 5, yy);
    if (amount !== null) {
      const amtStr = isDeduction ? `(${fmt(amount)})` : fmt(amount);
      doc.text(amtStr, pw - mr - 2, yy, { align: 'right' });
    }
    return yy + 6;
  };

  const _divider = (yy) => {
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(ml, yy, pw - mr, yy);
    return yy + 3;
  };

  // ── Laba Rugi ──────────────────────────────────────────────────────
  y = _sectionHeader('LAPORAN LABA RUGI', y);
  y = _subHeader('PENDAPATAN', y);
  is.revenues.filter(r => !r.isDeduction).forEach(r => { y = _row(r.name, r.amount, y); });
  if (is.revenueDeduct > 0) {
    is.revenues.filter(r => r.isDeduction).forEach(r => { y = _row(`(−) ${r.name}`, r.amount, y, true); });
    y = _row('Penjualan Bersih', is.netRevenue, y, false, true);
    y = _divider(y);
  }
  if (is.hpp.length > 0) {
    y = _subHeader('HARGA POKOK PENJUALAN', y);
    is.hpp.forEach(h => { y = _row(h.isDeduction ? `(−) ${h.name}` : h.name, h.amount, y, h.isDeduction); });
    y = _row('HPP Bersih', is.netHpp, y, true, true);
    y = _row('Laba Kotor', is.grossProfit, y, false, true);
    y = _divider(y);
  }
  y = _subHeader('BEBAN OPERASIONAL', y);
  is.expenses.forEach(e => { y = _row(e.name, e.amount, y); });
  y = _row('Total Beban', is.totalExpenses, y, true, true);
  y = _divider(y);

  if (is.otherRevenues && is.otherRevenues.length > 0) {
    y = _subHeader('PENDAPATAN LAIN-LAIN', y);
    is.otherRevenues.forEach(r => { y = _row(r.name, r.amount, y); });
    y = _row('Total Pendapatan Lain', is.totalOtherRev, y, false, true);
    y = _divider(y);
  }

  const profitLabel = is.isProfit ? 'LABA BERSIH' : 'RUGI BERSIH';
  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(is.isProfit ? 22 : 220, is.isProfit ? 163 : 38, is.isProfit ? 74 : 38);
  doc.text(profitLabel, ml + 5, y);
  doc.text(fmt(Math.abs(is.netIncome)), pw - mr - 2, y, { align: 'right' });
  doc.setTextColor(20, 20, 20);
  y += 10;

  // ── Perubahan Ekuitas ──────────────────────────────────────────────
  if (y > ph - mb - 50) { doc.addPage(); y = mt; }
  y = _sectionHeader('LAPORAN PERUBAHAN EKUITAS', y);
  y = _row('Modal Awal', es.capitalBegin, y);
  y = _row(is.isProfit ? '(+) Laba Bersih' : '(+) Rugi Bersih', Math.abs(es.netIncome), y, !is.isProfit);
  if (es.prive > 0) y = _row('(−) Prive', es.prive, y, true);
  y = _divider(y);
  y = _row('Modal Akhir', es.capitalEnd, y, false, true);
  y += 8;

  // ── Neraca ─────────────────────────────────────────────────────────
  if (y > ph - mb - 60) { doc.addPage(); y = mt; }
  y = _sectionHeader('NERACA (LAPORAN POSISI KEUANGAN)', y);
  y = _subHeader('ASET', y);
  bs.assets.filter(a => !a.isContra).forEach(a => { y = _row(a.name, a.amount, y); });
  bs.assets.filter(a => a.isContra).forEach(a => { y = _row(`(−) ${a.name}`, a.amount, y, true); });
  y = _row('Total Aset', bs.totalAssets, y, false, true);
  y = _divider(y);

  y = _subHeader('LIABILITAS', y);
  bs.liabilities.forEach(l => { y = _row(l.name, l.amount, y); });
  y = _row('Total Liabilitas', bs.totalLiabilities, y, false, true);

  y = _subHeader('EKUITAS', y);
  y = _row('Modal Akhir', bs.capitalEnd, y);
  y = _divider(y);
  y = _row('Total Liabilitas + Ekuitas', bs.totalLiabEquity, y, false, true);

  // Balance check
  y += 3;
  doc.setFontSize(8);
  doc.setFont('times', 'bold');
  doc.setTextColor(bs.isBalanced ? 22 : 220, bs.isBalanced ? 163 : 38, bs.isBalanced ? 74 : 38);
  doc.text(bs.isBalanced ? '✓ Neraca Seimbang (A = L + E)' : '✗ Neraca Tidak Seimbang', ml + 5, y);

  return y + 8;
}
