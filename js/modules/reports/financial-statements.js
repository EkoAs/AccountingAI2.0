/**
 * Financial Statements (Laporan Keuangan Lengkap) — Mode 7
 * Terdiri dari 3 laporan: Laba Rugi + Perubahan Ekuitas + Neraca
 * Sumber data: semua transaksi (termasuk penyesuaian)
 *
 * ══════════════════════════════════════════════════════════════════
 * HUKUM NERACA (WAJIB TERPENUHI):
 *   Total Aset = Total Liabilitas + Modal Akhir
 *   Modal Akhir = Modal Awal + Laba Bersih - Prive
 * ══════════════════════════════════════════════════════════════════
 */

/* ── Data Generator ──────────────────────────────────────────────────── */

function generateFinancialStatements(transactions, chartOfAccounts, metadata) {
  const balances = accountingCalculator.calculateAccountBalances(transactions, chartOfAccounts);
  const chartMap = {};
  chartOfAccounts.forEach(a => { chartMap[a.code] = a; });

  // ══════════════════════════════════════════════════════════════════
  // BAGIAN 1: LAPORAN LABA RUGI
  // Sumber: akun 4xxx (Pendapatan) dan 5xxx (Beban/HPP)
  // HPP = (Persediaan Awal + Pembelian Bersih) - Persediaan Akhir
  // Pembelian Bersih = Pembelian + Beban Angkut - Retur - Potongan
  // ══════════════════════════════════════════════════════════════════
  const revenues = [];
  const otherRevenues = [];
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

  const grossRevenue  = revenues.filter(r => !r.isDeduction).reduce((s, r) => s + r.amount, 0);
  const revenueDeduct = revenues.filter(r => r.isDeduction).reduce((s, r) => s + r.amount, 0);
  const netRevenue    = grossRevenue - revenueDeduct;
  const totalOtherRev = otherRevenues.reduce((s, r) => s + r.amount, 0);
  
  // HPP Calculation with Inventory
  const inventoryBegin = metadata.inventoryBeginning || 0;
  const inventoryEnd   = metadata.inventoryEnding || 0;
  const hppGross       = hpp.filter(h => !h.isDeduction).reduce((s, h) => s + h.amount, 0);
  const hppDeduct      = hpp.filter(h => h.isDeduction).reduce((s, h) => s + h.amount, 0);
  const netPurchases   = hppGross - hppDeduct;
  const netHpp         = (inventoryBegin + netPurchases) - inventoryEnd;
  
  const grossProfit   = netRevenue - netHpp;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netIncome     = grossProfit - totalExpenses + totalOtherRev;

  // ══════════════════════════════════════════════════════════════════
  // BAGIAN 2: LAPORAN PERUBAHAN EKUITAS
  // Modal Akhir = Modal Awal (3000) + Laba Bersih - Prive (3100)
  // ⚠️ calculateAccountBalances untuk 3000 sudah mencakup semua setoran
  //    modal sepanjang periode — itulah "Modal Awal" sebelum laba/rugi
  // ══════════════════════════════════════════════════════════════════
  const capitalBegin = Math.max(0, balances['3000'] || 0);
  const prive        = Math.max(0, balances['3100'] || 0);
  const capitalEnd   = capitalBegin + netIncome - prive;

  // ══════════════════════════════════════════════════════════════════
  // BAGIAN 3: NERACA (LAPORAN POSISI KEUANGAN)
  // Hukum: Total Aset = Total Liabilitas + Modal Akhir
  // ⚠️ Ekuitas di neraca HARUS pakai capitalEnd (bukan saldo 3000 mentah)
  //    karena laba/rugi belum diposting ke Modal sebelum jurnal penutup
  // ══════════════════════════════════════════════════════════════════
  const assets      = [];
  const liabilities = [];

  chartOfAccounts.forEach(acc => {
    const b = balances[acc.code] || 0;
    if (b === 0) return;

    if (acc.type === 'Asset') {
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
  // Modal Akhir sudah memperhitungkan laba/rugi dan prive → neraca balance
  const totalLiabEquity  = totalLiabilities + capitalEnd;
  const isBalanced       = Math.abs(totalAssets - totalLiabEquity) < 0.01;

  return {
    type: 'Financial Statements',
    metadata,
    incomeStatement: {
      revenues, revenueDeduct, grossRevenue, netRevenue,
      otherRevenues, totalOtherRev,
      hpp, inventoryBegin, inventoryEnd, netPurchases, netHpp, grossProfit,
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
      capitalEnd, totalEquity: capitalEnd,
      totalLiabEquity, isBalanced
    },
    summary: {
      netIncome, isProfit: netIncome >= 0,
      totalAssets, isBalanced,
      // Header panel: tampilkan Total Aset vs Total L+E sebagai verifikasi neraca
      // Label "Total Debits/Credits" diganti konteks neraca agar tidak membingungkan
      totalDebits: totalAssets,
      totalCredits: totalLiabEquity,
      balanced: isBalanced,
      labelDebits: 'Total Aset',
      labelCredits: 'Total L + E'
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
    if (is.inventoryBegin > 0) {
      html += `<tr><td class="fs-indent">Persediaan Awal</td><td></td><td class="amount-debit">${fmt(is.inventoryBegin)}</td></tr>`;
    }
    is.hpp.filter(h => !h.isDeduction).forEach(h => {
      html += `<tr><td class="fs-indent">${h.name}</td><td></td><td class="amount-debit">${fmt(h.amount)}</td></tr>`;
    });
    is.hpp.filter(h => h.isDeduction).forEach(h => {
      html += `<tr><td class="fs-indent">(−) ${h.name}</td><td></td><td class="amount-credit">(${fmt(h.amount)})</td></tr>`;
    });
    if (is.netPurchases > 0) {
      html += `<tr class="fs-subtotal"><td>Pembelian Bersih</td><td></td><td class="amount-debit">${fmt(is.netPurchases)}</td></tr>`;
    }
    if (is.inventoryEnd > 0) {
      html += `<tr><td class="fs-indent">(−) Persediaan Akhir</td><td></td><td class="amount-credit">(${fmt(is.inventoryEnd)})</td></tr>`;
    }
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
  const { fmt, ml, pw, mr, ph, mb, mt } = helpers;
  const is = data.incomeStatement;
  const es = data.equityStatement;
  const bs = data.balanceSheet;
  const usableW = pw - ml - mr;
  const RH = 7;   // row height — cukup untuk teks + padding atas/bawah
  const colW = [usableW * 0.65, usableW * 0.35]; // [label, amount]

  // ── Primitif tabel berkotak ─────────────────────────────────────────

  const _sectionHeader = (title, yy) => {
    if (yy > ph - mb - 12) { doc.addPage(); yy = mt; }
    doc.setFillColor(40, 40, 40);
    doc.rect(ml, yy, usableW, 8, 'F');
    doc.setFontSize(9); doc.setFont('times', 'bold');
    doc.setTextColor(230, 230, 230);
    doc.text(title, ml + 4, yy + 5.5);
    doc.setTextColor(20, 20, 20);
    return yy + 10;
  };

  const _subHeader = (title, yy) => {
    if (yy > ph - mb - 10) { doc.addPage(); yy = mt; }
    doc.setFillColor(200, 200, 200);
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.2);
    doc.rect(ml, yy, usableW, RH, 'FD');
    doc.setFontSize(8.5); doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(title, ml + 4, yy + RH * 0.68);
    return yy + RH;
  };

  // Baris data dengan kotak border
  const _row = (label, amount, yy, isDeduction = false, isBold = false, isTotal = false) => {
    if (yy > ph - mb - 10) { doc.addPage(); yy = mt; }
    const fill = isTotal ? [230, 230, 230] : [255, 255, 255];
    doc.setFillColor(...fill);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    // Kotak label
    doc.rect(ml, yy, colW[0], RH, 'FD');
    // Kotak amount
    doc.rect(ml + colW[0], yy, colW[1], RH, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('times', isBold || isTotal ? 'bold' : 'normal');
    doc.setTextColor(20, 20, 20);
    // Indent label
    const indent = isTotal ? ml + 4 : ml + 8;
    doc.text(label, indent, yy + RH * 0.68);
    // Amount rata kanan
    if (amount !== null && amount !== undefined) {
      const amtStr = isDeduction ? `(${fmt(amount)})` : fmt(amount);
      doc.text(amtStr, ml + colW[0] + colW[1] - 2, yy + RH * 0.68, { align: 'right' });
    }
    return yy + RH;
  };

  const _spacer = (yy, h = 4) => yy + h;

  // ══════════════════════════════════════════════════════════════════
  // LAPORAN LABA RUGI
  // ══════════════════════════════════════════════════════════════════
  y = _sectionHeader('LAPORAN LABA RUGI', y);

  if (is.revenues.filter(r => !r.isDeduction).length > 0) {
    y = _subHeader('PENDAPATAN', y);
    is.revenues.filter(r => !r.isDeduction).forEach(r => { y = _row(r.name, r.amount, y); });
    if (is.revenueDeduct > 0) {
      is.revenues.filter(r => r.isDeduction).forEach(r => { y = _row(`(−) ${r.name}`, r.amount, y, true); });
      y = _row('Penjualan Bersih', is.netRevenue, y, false, true, true);
    }
  } else {
    y = _subHeader('PENDAPATAN', y);
    y = _row('(tidak ada pendapatan)', null, y);
  }

  if (is.hpp.length > 0) {
    y = _spacer(y, 2);
    y = _subHeader('HARGA POKOK PENJUALAN', y);
    if (is.inventoryBegin > 0) {
      y = _row('Persediaan Awal', is.inventoryBegin, y);
    }
    is.hpp.forEach(h => { y = _row(h.isDeduction ? `(−) ${h.name}` : h.name, h.amount, y, h.isDeduction); });
    if (is.netPurchases > 0) {
      y = _row('Pembelian Bersih', is.netPurchases, y, false, true, true);
    }
    if (is.inventoryEnd > 0) {
      y = _row('(−) Persediaan Akhir', is.inventoryEnd, y, true);
    }
    y = _row('HPP Bersih', is.netHpp, y, true, true, true);
    y = _row('Laba Kotor', is.grossProfit, y, false, true, true);
  }

  y = _spacer(y, 2);
  y = _subHeader('BEBAN OPERASIONAL', y);
  if (is.expenses.length === 0) {
    y = _row('(tidak ada beban)', null, y);
  } else {
    is.expenses.forEach(e => { y = _row(e.name, e.amount, y); });
  }
  y = _row('Total Beban', is.totalExpenses, y, true, true, true);

  if (is.otherRevenues && is.otherRevenues.length > 0) {
    y = _spacer(y, 2);
    y = _subHeader('PENDAPATAN LAIN-LAIN', y);
    is.otherRevenues.forEach(r => { y = _row(r.name, r.amount, y); });
    y = _row('Total Pendapatan Lain', is.totalOtherRev, y, false, true, true);
  }

  // Baris laba/rugi bersih — warna khusus
  y = _spacer(y, 2);
  const profitLabel = is.isProfit ? 'LABA BERSIH' : 'RUGI BERSIH';
  const pColor = is.isProfit ? [22, 163, 74] : [220, 38, 38];
  doc.setFillColor(240, 240, 240);
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.4);
  doc.rect(ml, y, colW[0], RH + 1, 'FD');
  doc.rect(ml + colW[0], y, colW[1], RH + 1, 'FD');
  doc.setFontSize(9); doc.setFont('times', 'bold');
  doc.setTextColor(...pColor);
  doc.text(profitLabel, ml + 4, y + (RH + 1) * 0.68);
  doc.text(fmt(Math.abs(is.netIncome)), ml + colW[0] + colW[1] - 2, y + (RH + 1) * 0.68, { align: 'right' });
  doc.setTextColor(20, 20, 20);
  y += RH + 1 + 8;

  // ══════════════════════════════════════════════════════════════════
  // LAPORAN PERUBAHAN EKUITAS
  // ══════════════════════════════════════════════════════════════════
  if (y > ph - mb - 50) { doc.addPage(); y = mt; }
  y = _sectionHeader('LAPORAN PERUBAHAN EKUITAS', y);
  y = _row('Modal Awal', es.capitalBegin, y);
  y = _row(is.isProfit ? '(+) Laba Bersih' : '(−) Rugi Bersih', Math.abs(es.netIncome), y, !is.isProfit);
  if (es.prive > 0) y = _row('(−) Prive', es.prive, y, true);
  y = _row('Modal Akhir', es.capitalEnd, y, false, true, true);
  y += 8;

  // ══════════════════════════════════════════════════════════════════
  // NERACA (LAPORAN POSISI KEUANGAN)
  // ══════════════════════════════════════════════════════════════════
  if (y > ph - mb - 60) { doc.addPage(); y = mt; }
  y = _sectionHeader('NERACA (LAPORAN POSISI KEUANGAN)', y);

  y = _subHeader('ASET', y);
  bs.assets.filter(a => !a.isContra).forEach(a => { y = _row(a.name, a.amount, y); });
  bs.assets.filter(a => a.isContra).forEach(a => { y = _row(`(−) ${a.name}`, a.amount, y, true); });
  y = _row('Total Aset', bs.totalAssets, y, false, true, true);

  y = _spacer(y, 3);
  y = _subHeader('LIABILITAS', y);
  if (bs.liabilities.length === 0) {
    y = _row('(tidak ada liabilitas)', null, y);
  } else {
    bs.liabilities.forEach(l => { y = _row(l.name, l.amount, y); });
  }
  y = _row('Total Liabilitas', bs.totalLiabilities, y, false, true, true);

  y = _spacer(y, 3);
  y = _subHeader('EKUITAS', y);
  y = _row('Modal Akhir', bs.capitalEnd, y);
  y = _row('Total Liabilitas + Ekuitas', bs.totalLiabEquity, y, false, true, true);

  // Status neraca
  y += 4;
  doc.setFontSize(8.5); doc.setFont('times', 'bold');
  doc.setTextColor(bs.isBalanced ? 22 : 220, bs.isBalanced ? 163 : 38, bs.isBalanced ? 74 : 38);
  doc.text(bs.isBalanced ? '✓ Neraca Seimbang  (A = L + E)' : '✗ Neraca Tidak Seimbang', ml + 4, y);
  doc.setTextColor(20, 20, 20);

  return y + 8;
}
