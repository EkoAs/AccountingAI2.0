/**
 * Reversing Journal (Jurnal Pembalik) Module
 * Generator data, UI renderer, dan PDF renderer untuk Jurnal Pembalik
 */

/* ── Data Generator ──────────────────────────────────────────────────── */

function generateReversingJournal(transactions, chartOfAccounts, metadata) {
  const reversingEntries = [];
  // Akun yang memerlukan jurnal pembalik: akrual dan prepaid
  const accrualAccounts  = ['2200', '1600', '1300', '1400', '1650'];

  // Buat map akun untuk lookup nama
  const chartMap = {};
  chartOfAccounts.forEach(a => { chartMap[a.code] = a; });

  // Strategi: cari pasangan transaksi berdasarkan ID berurutan
  // Sistem menyimpan debit entry lalu credit entry dengan ID berurutan dari 1 input
  // Pasangan valid: 2 transaksi dengan deskripsi + tanggal + totalAmount sama
  const processed = new Set();

  // Buat index transaksi berdasarkan deskripsi+tanggal+amount untuk matching akurat
  const txnGroups = {};
  transactions.forEach(t => {
    const key = `${t.description}|${t.date}|${t.totalAmount || Math.max(t.debitAmount, t.creditAmount)}`;
    if (!txnGroups[key]) txnGroups[key] = [];
    txnGroups[key].push(t);
  });

  transactions.forEach(txn => {
    if (processed.has(txn.id)) return;
    if (!accrualAccounts.includes(txn.accountCode)) return;

    // Cari pasangan dari group yang sama (deskripsi + tanggal + amount sama)
    const groupKey = `${txn.description}|${txn.date}|${txn.totalAmount || Math.max(txn.debitAmount, txn.creditAmount)}`;
    const group = txnGroups[groupKey] || [];
    const partner = group.find(t =>
      t.id !== txn.id &&
      !processed.has(t.id) &&
      t.accountCode !== txn.accountCode &&        // akun berbeda (bukan sesama akrual)
      !accrualAccounts.includes(t.accountCode)    // pasangan bukan akun akrual
    );

    processed.add(txn.id);
    if (partner) processed.add(partner.id);

    const reversingDate = _getNextPeriodDate(txn.date);
    const keterangan    = `Pembalik: ${txn.description}`;

    // Baris 1: balik akun akrual (debit↔kredit dibalik)
    reversingEntries.push({
      date: reversingDate,
      originalDate: txn.date,
      account: chartMap[txn.accountCode]?.name || txn.account || txn.accountCode,
      accountCode: txn.accountCode,
      description: keterangan,
      debit:  txn.creditAmount,
      credit: txn.debitAmount
    });

    // Baris 2: balik akun pasangan
    if (partner) {
      reversingEntries.push({
        date: reversingDate,
        originalDate: partner.date,
        account: chartMap[partner.accountCode]?.name || partner.account || partner.accountCode,
        accountCode: partner.accountCode,
        description: keterangan,
        debit:  partner.creditAmount,
        credit: partner.debitAmount
      });
    }
  });

  const sorted = reversingEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
  const totalDebits  = sorted.reduce((sum, e) => sum + (e.debit  || 0), 0);
  const totalCredits = sorted.reduce((sum, e) => sum + (e.credit || 0), 0);

  return {
    type: 'Reversing Journal',
    metadata,
    entries: sorted,
    emptyReason: sorted.length === 0
      ? 'Tidak ada transaksi akrual (akun 2200, 1600, 1300, 1400, 1650) yang perlu dibalik.'
      : null,
    summary: {
      totalEntries: sorted.length,
      totalDebits,
      totalCredits,
      balanced: Math.abs(totalDebits - totalCredits) < 0.01
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
  const { tableHeader, tableRow, totalRow, checkNewPage, fmt, ml, ph, mb } = helpers;

  const cols   = ['Tanggal', 'Kode', 'Nama Akun', 'Keterangan', 'Debet', 'Kredit'];
  const widths = [22, 14, 38, 52, 30, 30];

  // Jika tidak ada entri, tampilkan pesan
  if (!data.entries || data.entries.length === 0) {
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(
      data.emptyReason || 'Tidak ada entri jurnal pembalik.',
      ml + 2, y + 6
    );
    return y + 14;
  }

  y = tableHeader(doc, cols, widths, y);

  data.entries.forEach(e => {
    y = checkNewPage(doc, y, cols, widths, tableHeader);
    const row = [
      e.date || '',
      e.accountCode || '',
      e.account || '',
      e.description || '',
      e.debit  > 0 ? fmt(e.debit)  : '-',
      e.credit > 0 ? fmt(e.credit) : '-'
    ];
    y = tableRow(doc, row, widths, y);
  });

  // Baris total
  y = totalRow(doc,
    ['', '', '', 'TOTAL', fmt(data.summary.totalDebits), fmt(data.summary.totalCredits)],
    widths, y
  );

  return y + 5;
}
