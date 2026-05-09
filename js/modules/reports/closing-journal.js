/**
 * Closing Journal (Jurnal Penutup) — Mode 8
 * Empat tahap: A) Tutup Pendapatan, B) Tutup Beban,
 *              C) Tutup Ikhtisar L/R ke Modal, D) Tutup Prive
 * Setelah dieksekusi, periode dikunci (periodLocked = true).
 */

/* ── Konstanta ───────────────────────────────────────────────────────── */
const IKHTISAR_CODE = '9000';
const IKHTISAR_NAME = 'Ikhtisar Laba Rugi';
const MODAL_CODE    = '3000';
const PRIVE_CODE    = '3100';

/* ── Helper: hitung saldo bersih per akun dari transaksi ─────────────── */
function _getAccountBalances(transactions, chartOfAccounts) {
  const names = {};
  chartOfAccounts.forEach(a => { names[a.code] = a.name; });

  // Gunakan accountingCalculator agar konsisten dengan mode lain
  const balances = accountingCalculator.calculateAccountBalances(transactions, chartOfAccounts);
  return { balances, names };
}

/* ── Data Generator ──────────────────────────────────────────────────── */

function generateClosingJournal(transactions, chartOfAccounts, metadata) {
  // Jangan generate ulang jika sudah ada closing entries di transaksi
  const { balances, names } = _getAccountBalances(transactions, chartOfAccounts);

  const entries = [];   // semua baris jurnal penutup
  let ikhtisarDebit  = 0;
  let ikhtisarKredit = 0;

  // ── TAHAP A: Tutup Pendapatan (4xxx) → Ikhtisar L/R ─────────────────
  // calculateAccountBalances: pendapatan normal (4xxx) → saldo positif = kredit
  // Kontra-pendapatan (4100 Retur Penjualan, 4200 Potongan Penjualan) → saldo positif = debit
  // Untuk perusahaan dagang: 4000 Penjualan, 4100 Retur Penjualan, 4200 Potongan Penjualan
  const revenueEntries = [];
  let totalRevenue = 0;

  chartOfAccounts.forEach(acc => {
    if (!acc.code.startsWith('4')) return;
    const b = balances[acc.code] || 0;
    if (b === 0) return;

    if (['4100', '4200'].includes(acc.code)) {
      // Kontra-pendapatan: saldo debit (positif) → tutup dengan kredit ke Ikhtisar
      revenueEntries.push({ code: acc.code, name: acc.name, debit: 0, credit: Math.abs(b), isContra: true });
      ikhtisarDebit += Math.abs(b);
    } else {
      // Pendapatan normal: saldo kredit (positif dari calculateAccountBalances) → tutup dengan debit
      revenueEntries.push({ code: acc.code, name: acc.name, debit: Math.abs(b), credit: 0, isContra: false });
      totalRevenue += Math.abs(b);
      ikhtisarKredit += Math.abs(b);
    }
  });

  if (revenueEntries.length > 0) {
    // Ikhtisar L/R di bawah (kredit) — sesuai urutan jurnal standar
    const ikhtisarRowA = { code: IKHTISAR_CODE, name: IKHTISAR_NAME, debit: 0, credit: totalRevenue };
    entries.push({
      tahap: 'A', label: 'Menutup Akun Pendapatan',
      rows: revenueEntries,
      ikhtisarRow: ikhtisarRowA
    });
  }

  // ── TAHAP B: Tutup Beban (5xxx) ← Ikhtisar L/R ──────────────────────
  // Beban normal (5xxx): saldo debit (positif) → tutup dengan kredit
  // Kontra-beban (5020 Retur Pembelian, 5030 Potongan Pembelian): saldo kredit → tutup dengan debit ke Ikhtisar
  // Untuk perusahaan dagang: 5010 Pembelian, 5020 Retur, 5030 Potongan, 5040 Beban Angkut, 5050 HPP, dll
  const expenseEntries = [];
  let totalExpense = 0;

  chartOfAccounts.forEach(acc => {
    if (!acc.code.startsWith('5')) return;
    const b = balances[acc.code] || 0;
    if (b === 0) return;

    if (['5020', '5030'].includes(acc.code)) {
      // Kontra-beban: saldo kredit (positif) → tutup dengan debit ke Ikhtisar
      expenseEntries.push({ code: acc.code, name: acc.name, debit: Math.abs(b), credit: 0, isContra: true });
      ikhtisarKredit += Math.abs(b);
    } else {
      // Beban normal: saldo debit (positif) → tutup dengan kredit
      expenseEntries.push({ code: acc.code, name: acc.name, debit: 0, credit: Math.abs(b), isContra: false });
      totalExpense += Math.abs(b);
      ikhtisarDebit += Math.abs(b);
    }
  });

  if (expenseEntries.length > 0) {
    // Ikhtisar L/R di atas (debit) untuk Tahap B — sesuai urutan jurnal standar
    const ikhtisarRowB = { code: IKHTISAR_CODE, name: IKHTISAR_NAME, debit: totalExpense, credit: 0 };
    entries.push({
      tahap: 'B', label: 'Menutup Akun Beban',
      ikhtisarRow: ikhtisarRowB,
      rows: expenseEntries
    });
  }

  // ── TAHAP C: Tutup Ikhtisar L/R → Modal ─────────────────────────────
  // ikhtisarKredit = total pendapatan, ikhtisarDebit = total beban
  const netIncome = ikhtisarKredit - ikhtisarDebit;
  const isProfit  = netIncome >= 0;
  const absNet    = Math.abs(netIncome);

  if (absNet > 0) {
    const cRows = isProfit
      ? [
          { code: IKHTISAR_CODE, name: IKHTISAR_NAME, debit: absNet, credit: 0 },
          { code: MODAL_CODE,    name: names[MODAL_CODE] || 'Modal Pemilik', debit: 0, credit: absNet }
        ]
      : [
          { code: MODAL_CODE,    name: names[MODAL_CODE] || 'Modal Pemilik', debit: absNet, credit: 0 },
          { code: IKHTISAR_CODE, name: IKHTISAR_NAME, debit: 0, credit: absNet }
        ];
    entries.push({ tahap: 'C', label: isProfit ? 'Menutup Ikhtisar Laba Rugi (Laba)' : 'Menutup Ikhtisar Laba Rugi (Rugi)', rows: cRows });
  }

  // ── TAHAP D: Tutup Prive → Modal ─────────────────────────────────────
  const priveSaldo = balances[PRIVE_CODE] || 0;
  if (priveSaldo > 0) {
    entries.push({
      tahap: 'D', label: 'Menutup Akun Prive',
      rows: [
        { code: MODAL_CODE, name: names[MODAL_CODE] || 'Modal Pemilik', debit: priveSaldo, credit: 0 },
        { code: PRIVE_CODE, name: names[PRIVE_CODE] || 'Prive', debit: 0, credit: priveSaldo }
      ]
    });
  }

  // ── Neraca Saldo Setelah Penutupan ───────────────────────────────────
  const closingTxns = _buildClosingTransactions(entries);
  const allTxns     = [...transactions, ...closingTxns];
  const postBalances = {};
  allTxns.forEach(t => {
    const c = t.accountCode;
    if (!c) return;
    if (!postBalances[c]) postBalances[c] = 0;
    postBalances[c] += (t.debitAmount || 0) - (t.creditAmount || 0);
  });

  const postClosingAccounts = [];
  chartOfAccounts.forEach(acc => {
    const b = postBalances[acc.code] || 0;
    if (b === 0) return;
    if (acc.code.startsWith('4') || acc.code.startsWith('5')) return; // nominal sudah 0
    if (acc.code === PRIVE_CODE) return;
    if (acc.code === IKHTISAR_CODE) return;
    postClosingAccounts.push({ code: acc.code, name: acc.name, type: acc.type, balance: b });
  });

  const totalDebitPost  = postClosingAccounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalCreditPost = postClosingAccounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);
  const isBalanced      = Math.abs(totalDebitPost - totalCreditPost) < 0.01;

  // Hitung total debit/kredit jurnal penutup untuk summary
  let totalDebit = 0, totalCredit = 0;
  entries.forEach(e => {
    (e.rows || []).forEach(r => { totalDebit += r.debit || 0; totalCredit += r.credit || 0; });
    if (e.ikhtisarRow) {
      totalDebit  += e.ikhtisarRow.debit  || 0;
      totalCredit += e.ikhtisarRow.credit || 0;
    }
  });

  return {
    type: 'Closing Journal',
    metadata,
    entries,
    netIncome,
    isProfit,
    postClosingAccounts,
    totalDebitPost,
    totalCreditPost,
    isBalanced,
    summary: {
      totalDebits: totalDebit,
      totalCredits: totalCredit,
      balanced: Math.abs(totalDebit - totalCredit) < 0.01
    }
  };
}

/* ── Helper: bangun objek transaksi dari closing entries ─────────────── */
function _buildClosingTransactions(entries) {
  const txns = [];
  const date = new Date().toISOString().split('T')[0];
  let seq = 1;

  entries.forEach(e => {
    // Urutan baris sesuai standar jurnal:
    // Tahap A & C & D: akun utama dulu, lawan (ikhtisar/modal) di bawah
    // Tahap B: ikhtisar (debit) di atas, beban (kredit) di bawah
    const orderedRows = [];
    if (e.tahap === 'B') {
      if (e.ikhtisarRow) orderedRows.push(e.ikhtisarRow);
      (e.rows || []).forEach(r => orderedRows.push(r));
    } else {
      (e.rows || []).forEach(r => orderedRows.push(r));
      if (e.ikhtisarRow) orderedRows.push(e.ikhtisarRow);
    }

    orderedRows.forEach(r => {
      if ((r.debit || 0) === 0 && (r.credit || 0) === 0) return;
      txns.push({
        id: `closing_${e.tahap}_${seq++}`,
        date,
        description: `Jurnal Penutup - Tahap ${e.tahap}`,
        accountCode: r.code,
        account: r.name,
        debitAmount:  r.debit  || 0,
        creditAmount: r.credit || 0,
        totalAmount: Math.max(r.debit || 0, r.credit || 0),
        classification: 'Closing',
        isClosingEntry: true
      });
    });
  });

  return txns;
}

/* ── UI Renderer ─────────────────────────────────────────────────────── */

function renderClosingJournal(report, elements, formatCurrency) {
  const table = elements.tableBody.closest('table');
  if (table) {
    const oldCg = table.querySelector('colgroup');
    if (oldCg) oldCg.remove();
    table.style.tableLayout = '';
    table.style.width = '';
  }

  elements.tableHeader.innerHTML = '';
  const fmt = formatCurrency;

  const tahapLabels = { A: '🔴', B: '🟠', C: '🟡', D: '🟢' };

  let html = '';

  // ── Jurnal Penutup ────────────────────────────────────────────────
  html += `<tr class="fs-section-header"><td colspan="3">📕 JURNAL PENUTUP</td></tr>`;
  html += `<tr class="fs-sub-header">
    <td>Kode / Nama Akun</td>
    <td class="text-right">Debit (Rp)</td>
    <td class="text-right">Kredit (Rp)</td>
  </tr>`;

  report.entries.forEach(e => {
    html += `<tr class="fs-sub-header">
      <td colspan="3">${tahapLabels[e.tahap] || ''} Tahap ${e.tahap}: ${e.label}</td>
    </tr>`;

    if (e.tahap === 'B') {
      // Tahap B: Ikhtisar L/R (debit) di atas, beban (kredit) di bawah
      if (e.ikhtisarRow) {
        const r = e.ikhtisarRow;
        html += `<tr>
          <td class="fs-indent"><em>${r.code} — ${r.name}</em></td>
          <td class="text-right amount-debit">${r.debit  > 0 ? fmt(r.debit)  : '—'}</td>
          <td class="text-right amount-credit">${r.credit > 0 ? fmt(r.credit) : '—'}</td>
        </tr>`;
      }
      (e.rows || []).forEach(r => {
        html += `<tr>
          <td class="fs-indent" style="padding-left:2em">${r.code} — ${r.name}</td>
          <td class="text-right amount-debit">${r.debit  > 0 ? fmt(r.debit)  : '—'}</td>
          <td class="text-right amount-credit">${r.credit > 0 ? fmt(r.credit) : '—'}</td>
        </tr>`;
      });
    } else {
      // Tahap A, C, D: baris akun dulu, Ikhtisar/Modal di bawah
      (e.rows || []).forEach(r => {
        html += `<tr>
          <td class="fs-indent">${r.code} — ${r.name}</td>
          <td class="text-right amount-debit">${r.debit  > 0 ? fmt(r.debit)  : '—'}</td>
          <td class="text-right amount-credit">${r.credit > 0 ? fmt(r.credit) : '—'}</td>
        </tr>`;
      });
      if (e.ikhtisarRow) {
        const r = e.ikhtisarRow;
        html += `<tr>
          <td class="fs-indent" style="padding-left:2em"><em>${r.code} — ${r.name}</em></td>
          <td class="text-right amount-debit">${r.debit  > 0 ? fmt(r.debit)  : '—'}</td>
          <td class="text-right amount-credit">${r.credit > 0 ? fmt(r.credit) : '—'}</td>
        </tr>`;
      }
    }
  });

  // Total jurnal penutup
  const s = report.summary;
  const balColor = s.balanced ? 'var(--color-credit)' : 'var(--color-debit)';
  const balLabel = s.balanced ? '✓ Balanced' : '✗ Unbalanced';
  html += `<tr class="fs-total">
    <td><strong>TOTAL JURNAL PENUTUP</strong></td>
    <td class="text-right amount-debit"><strong>${fmt(s.totalDebits)}</strong></td>
    <td class="text-right amount-credit"><strong>${fmt(s.totalCredits)}</strong></td>
  </tr>`;
  html += `<tr><td colspan="3" style="text-align:center;color:${balColor};font-weight:bold;padding:6px">${balLabel}</td></tr>`;
  html += `<tr class="fs-spacer"><td colspan="3"></td></tr>`;

  // ── Neraca Saldo Setelah Penutupan ────────────────────────────────
  html += `<tr class="fs-section-header"><td colspan="3">📋 NERACA SALDO SETELAH PENUTUPAN</td></tr>`;
  html += `<tr class="fs-sub-header">
    <td>Kode / Nama Akun</td>
    <td class="text-right">Debit (Rp)</td>
    <td class="text-right">Kredit (Rp)</td>
  </tr>`;

  report.postClosingAccounts.forEach(a => {
    const isDebit = a.balance > 0;
    html += `<tr>
      <td class="fs-indent">${a.code} — ${a.name}</td>
      <td class="text-right amount-debit">${isDebit  ? fmt(a.balance)         : '—'}</td>
      <td class="text-right amount-credit">${!isDebit ? fmt(Math.abs(a.balance)) : '—'}</td>
    </tr>`;
  });

  const postColor = report.isBalanced ? 'var(--color-credit)' : 'var(--color-debit)';
  const postLabel = report.isBalanced ? '✓ Neraca Saldo Seimbang' : '✗ Neraca Saldo Tidak Seimbang';
  html += `<tr class="fs-total">
    <td><strong>TOTAL</strong></td>
    <td class="text-right amount-debit"><strong>${fmt(report.totalDebitPost)}</strong></td>
    <td class="text-right amount-credit"><strong>${fmt(report.totalCreditPost)}</strong></td>
  </tr>`;
  html += `<tr><td colspan="3" style="text-align:center;color:${postColor};font-weight:bold;padding:6px">${postLabel}</td></tr>`;

  // Info laba/rugi
  const incomeColor = report.isProfit ? 'var(--color-credit)' : 'var(--color-debit)';
  const incomeLabel = report.isProfit ? '✓ Laba Bersih' : '✗ Rugi Bersih';
  html += `<tr class="fs-spacer"><td colspan="3"></td></tr>`;
  html += `<tr><td colspan="3" style="text-align:center;color:${incomeColor};padding:4px">
    ${incomeLabel}: <strong>${fmt(Math.abs(report.netIncome))}</strong>
  </td></tr>`;

  elements.tableBody.innerHTML = html;
}

/* ── PDF Renderer ────────────────────────────────────────────────────── */

function pdfClosingJournal(doc, data, y, helpers) {
  const { fmt, ml, pw, mr, ph, mb, mt, tableHeader, totalRow } = helpers;
  const usableW = pw - ml - mr;

  // Lebar kolom: Nama Akun | Debit | Kredit
  const widths = [usableW * 0.55, usableW * 0.225, usableW * 0.225];
  const cols   = ['Kode / Nama Akun', 'Debit (Rp)', 'Kredit (Rp)'];

  const _sectionHeader = (title, yy) => {
    doc.setFillColor(50, 50, 50);
    doc.rect(ml, yy, usableW, 7, 'F');
    doc.setFontSize(9); doc.setFont('times', 'bold');
    doc.setTextColor(220, 220, 220);
    doc.text(title, ml + 3, yy + 5);
    doc.setTextColor(20, 20, 20);
    return yy + 9;
  };

  const _subHeader = (title, yy) => {
    doc.setFillColor(190, 190, 190);
    doc.rect(ml, yy, usableW, 7, 'F');
    doc.setFontSize(8); doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(title, ml + 3, yy + 5);
    return yy + 8;
  };

  const _row = (label, debit, credit, yy, isBold) => {
    if (yy > ph - mb - 10) { doc.addPage(); yy = mt; yy = tableHeader(doc, cols, widths, yy); }
    const rowH = 6;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    let x = ml;
    widths.forEach(w => { doc.rect(x, yy, w, rowH, 'FD'); x += w; });
    doc.setFontSize(8); doc.setFont('times', isBold ? 'bold' : 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(label, ml + 2, yy + rowH * 0.68);
    if (debit  > 0) doc.text(fmt(debit),  ml + widths[0] + widths[1] - 1.5, yy + rowH * 0.68, { align: 'right' });
    else            doc.text('—',          ml + widths[0] + widths[1] - 1.5, yy + rowH * 0.68, { align: 'right' });
    if (credit > 0) doc.text(fmt(credit), ml + widths[0] + widths[1] + widths[2] - 1.5, yy + rowH * 0.68, { align: 'right' });
    else            doc.text('—',          ml + widths[0] + widths[1] + widths[2] - 1.5, yy + rowH * 0.68, { align: 'right' });
    return yy + rowH;
  };

  // ── JURNAL PENUTUP ────────────────────────────────────────────────
  y = _sectionHeader('JURNAL PENUTUP', y);
  y = tableHeader(doc, cols, widths, y);

  data.entries.forEach(e => {
    if (y > ph - mb - 15) { doc.addPage(); y = mt; y = tableHeader(doc, cols, widths, y); }
    y = _subHeader(`Tahap ${e.tahap}: ${e.label}`, y);

    if (e.tahap === 'B') {
      // Tahap B: Ikhtisar (debit) di atas, beban (kredit) di bawah
      if (e.ikhtisarRow) {
        const r = e.ikhtisarRow;
        y = _row(`  ${r.code} — ${r.name}`, r.debit || 0, r.credit || 0, y, false);
      }
      (e.rows || []).forEach(r => {
        y = _row(`    ${r.code} — ${r.name}`, r.debit || 0, r.credit || 0, y, false);
      });
    } else {
      // Tahap A, C, D: akun dulu, Ikhtisar/Modal di bawah
      (e.rows || []).forEach(r => {
        y = _row(`  ${r.code} — ${r.name}`, r.debit || 0, r.credit || 0, y, false);
      });
      if (e.ikhtisarRow) {
        const r = e.ikhtisarRow;
        y = _row(`    ${r.code} — ${r.name}`, r.debit || 0, r.credit || 0, y, false);
      }
    }
  });

  // Total jurnal penutup
  const s = data.summary;
  y = totalRow(doc, ['TOTAL JURNAL PENUTUP', fmt(s.totalDebits), fmt(s.totalCredits)], widths, y);

  // Status balance
  y += 3;
  doc.setFontSize(8); doc.setFont('times', 'bold');
  doc.setTextColor(s.balanced ? 22 : 220, s.balanced ? 163 : 38, s.balanced ? 74 : 38);
  doc.text(s.balanced ? '✓ Jurnal Penutup Balanced' : '✗ Jurnal Penutup Tidak Balanced', ml + 3, y);
  doc.setTextColor(20, 20, 20);
  y += 10;

  // ── NERACA SALDO SETELAH PENUTUPAN ───────────────────────────────
  if (y > ph - mb - 40) { doc.addPage(); y = mt; }
  y = _sectionHeader('NERACA SALDO SETELAH PENUTUPAN', y);
  y = tableHeader(doc, cols, widths, y);

  data.postClosingAccounts.forEach(a => {
    const isDebit = a.balance > 0;
    y = _row(`  ${a.code} — ${a.name}`, isDebit ? a.balance : 0, !isDebit ? Math.abs(a.balance) : 0, y, false);
  });

  y = totalRow(doc, ['TOTAL', fmt(data.totalDebitPost), fmt(data.totalCreditPost)], widths, y);

  // Status neraca
  y += 3;
  doc.setFontSize(8); doc.setFont('times', 'bold');
  doc.setTextColor(data.isBalanced ? 22 : 220, data.isBalanced ? 163 : 38, data.isBalanced ? 74 : 38);
  doc.text(data.isBalanced ? '✓ Neraca Saldo Seimbang' : '✗ Neraca Saldo Tidak Seimbang', ml + 3, y);

  // Info laba/rugi
  y += 7;
  doc.setFontSize(9); doc.setFont('times', 'bold');
  doc.setTextColor(data.isProfit ? 22 : 220, data.isProfit ? 163 : 38, data.isProfit ? 74 : 38);
  const incomeLabel = data.isProfit ? 'Laba Bersih' : 'Rugi Bersih';
  doc.text(`${incomeLabel}: ${fmt(Math.abs(data.netIncome))}`, ml + 3, y);
  doc.setTextColor(20, 20, 20);

  return y + 8;
}
