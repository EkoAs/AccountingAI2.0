/**
 * Adjusting Entries (Jurnal Penyesuaian) — Mode 5
 * 5 tipe: Penyusutan, Pemakaian Perlengkapan, Prepaid, Accrued, Unearned
 * Input: sama seperti mode lain (input field + AI deteksi kata kunci penyesuaian)
 */

/* ── Kata kunci penyesuaian untuk deteksi otomatis ───────────────────── */
const ADJUSTING_KEYWORDS = {
  depreciation:    ['penyusutan', 'depresiasi', 'depreciation', 'beban_penyusutan',
                    'penyusutan_kendaraan', 'penyusutan_peralatan', 'penyusutan_mesin'],
  supplies:        ['pemakaian_perlengkapan', 'perlengkapan_terpakai', 'supplies_used',
                    'beban_perlengkapan_penyesuaian', 'pemakaian_atk'],
  prepaid:         ['sewa_jatuh_tempo', 'asuransi_jatuh_tempo', 'prepaid_expired',
                    'beban_sewa_penyesuaian', 'beban_asuransi_penyesuaian',
                    'sewa_dimuka_jatuh', 'asuransi_dimuka_jatuh'],
  accrued:         ['gaji_terutang', 'listrik_terutang', 'beban_terutang', 'accrued',
                    'masih_harus_dibayar', 'utang_gaji', 'utang_listrik', 'utang_beban'],
  accrued_revenue: ['utang_pendapatan', 'pendapatan_belum_diterima', 'piutang_pendapatan',
                    'accrued_revenue', 'pendapatan_terutang', 'jasa_belum_dibayar_klien',
                    'invoice_belum_cair', 'tagihan_belum_dibayar', 'pendapatan_masih_harus_diterima'],
  unearned:        ['pendapatan_diakui', 'jasa_selesai', 'unearned_earned',
                    'pendapatan_dimuka_diakui', 'dp_selesai', 'panjar_selesai'],
  // Penyesuaian persediaan barang dagangan (perusahaan dagang)
  inventory:       ['persediaan_akhir', 'stok_akhir', 'persediaan_awal', 'stok_awal',
                    'hpp', 'harga_pokok_penjualan', 'cogs', 'penyesuaian_persediaan']
};

/**
 * Deteksi apakah deskripsi adalah transaksi penyesuaian
 * @param {string} description
 * @returns {string|null} tipe penyesuaian atau null
 */
function detectAdjustingType(description) {
  const lower = description.toLowerCase();
  for (const [type, keywords] of Object.entries(ADJUSTING_KEYWORDS)) {
    for (const kw of keywords) {
      if (kw.includes('_')) {
        const parts = kw.split('_');
        if (parts.every(p => p.length > 1 && lower.includes(p))) return type;
      } else if (lower.includes(kw)) {
        return type;
      }
    }
  }
  return null;
}

/* ── Data Generator ──────────────────────────────────────────────────── */

function generateAdjustingEntries(transactions, chartOfAccounts, metadata) {
  // Filter hanya transaksi yang merupakan jurnal penyesuaian
  // Ditandai dengan field adjustingType atau kata kunci penyesuaian
  const adjustingTxns = transactions.filter(t => {
    if (t.adjustingType) return true;
    return detectAdjustingType(t.description || '') !== null;
  });

  const sorted = adjustingTxns.sort((a, b) => new Date(a.date) - new Date(b.date));
  const { totalDebits, totalCredits } = accountingCalculator.calculateTotals(sorted);

  // Kelompokkan per tipe
  const byType = {};
  sorted.forEach(t => {
    const type = t.adjustingType || detectAdjustingType(t.description) || 'other';
    if (!byType[type]) byType[type] = [];
    byType[type].push(t);
  });

  return {
    type: 'Adjusting Entries',
    metadata,
    entries: sorted.map(t => ({
      date: t.date,
      account: t.account,
      accountCode: t.accountCode,
      description: t.description,
      adjustingType: t.adjustingType || detectAdjustingType(t.description) || 'other',
      debit: t.debitAmount,
      credit: t.creditAmount
    })),
    byType,
    summary: {
      totalEntries: sorted.length,
      totalDebits,
      totalCredits,
      balanced: Math.abs(totalDebits - totalCredits) < 0.01,
      emptyReason: sorted.length === 0
        ? 'Belum ada jurnal penyesuaian. Gunakan kata kunci: penyusutan, pemakaian_perlengkapan, gaji_terutang, sewa_jatuh_tempo, pendapatan_diakui.'
        : null
    }
  };
}

/* ── UI Renderer ─────────────────────────────────────────────────────── */

const ADJUSTING_TYPE_LABELS = {
  depreciation:    '📉 Penyusutan Aset Tetap',
  supplies:        '📦 Pemakaian Perlengkapan',
  prepaid:         '📅 Beban Dibayar di Muka',
  accrued:         '⏳ Beban Masih Harus Dibayar',
  accrued_revenue: '💵 Pendapatan Masih Harus Diterima',
  unearned:        '💰 Pendapatan Diterima di Muka',
  inventory:       '📦 Penyesuaian Persediaan (HPP)',
  other:           '📝 Penyesuaian Lainnya'
};

function renderAdjustingEntries(report, elements, formatCurrency) {
  // Reset table layout
  const table = elements.tableBody.closest('table');
  if (table) {
    const oldCg = table.querySelector('colgroup');
    if (oldCg) oldCg.remove();
    table.style.tableLayout = '';
    table.style.width = '';
  }

  elements.tableHeader.innerHTML =
    '<th>Tanggal</th><th>Tipe Penyesuaian</th><th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th>Debet</th><th>Kredit</th>';

  if (!report.entries || report.entries.length === 0) {
    elements.tableBody.innerHTML =
      '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--color-gray-400);">' +
      (report.summary.emptyReason || 'Tidak ada jurnal penyesuaian.') +
      '</td></tr>';
    return;
  }

  const rows = report.entries.map(e => {
    const typeLabel = ADJUSTING_TYPE_LABELS[e.adjustingType] || e.adjustingType;
    return '<tr>' +
      '<td>' + e.date + '</td>' +
      '<td><span class="adjusting-type-badge">' + typeLabel + '</span></td>' +
      '<td>' + (e.accountCode || '-') + '</td>' +
      '<td>' + (e.account || '-') + '</td>' +
      '<td>' + e.description + '</td>' +
      '<td class="amount-debit">'  + (e.debit  > 0 ? formatCurrency(e.debit)  : '-') + '</td>' +
      '<td class="amount-credit">' + (e.credit > 0 ? formatCurrency(e.credit) : '-') + '</td>' +
      '</tr>';
  });

  rows.push(
    '<tr class="total-row"><td colspan="5"><strong>Total</strong></td>' +
    '<td class="amount-debit"><strong>'  + formatCurrency(report.summary.totalDebits)  + '</strong></td>' +
    '<td class="amount-credit"><strong>' + formatCurrency(report.summary.totalCredits) + '</strong></td></tr>'
  );

  elements.tableBody.innerHTML = rows.join('');
}

/* ── PDF Renderer ────────────────────────────────────────────────────── */

function pdfAdjustingEntries(doc, data, y, helpers) {
  const { tableHeader, tableRow, totalRow, checkNewPage, fmt, truncate } = helpers;

  const cols   = ['Tanggal', 'Tipe', 'Kode', 'Nama Akun', 'Keterangan', 'Debet', 'Kredit'];
  const widths = [20, 30, 12, 32, 40, 26, 26];

  y = tableHeader(doc, cols, widths, y);

  if (!data.entries || data.entries.length === 0) {
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(data.summary.emptyReason || 'Tidak ada jurnal penyesuaian.', helpers.ml + 2, y + 6);
    return y + 12;
  }

  data.entries.forEach(e => {
    y = checkNewPage(doc, y, cols, widths, tableHeader);
    const typeLabel = {
      depreciation: 'Penyusutan', supplies: 'Perlengkapan',
      prepaid: 'Prepaid', accrued: 'Accrued Beban',
      accrued_revenue: 'Accrued Rev', unearned: 'Unearned', other: 'Lainnya'
    }[e.adjustingType] || e.adjustingType;

    const row = [
      e.date || '',
      typeLabel,
      e.accountCode || '',
      truncate(e.account || '', 20),
      truncate(e.description || '', 24),
      e.debit  > 0 ? fmt(e.debit)  : '-',
      e.credit > 0 ? fmt(e.credit) : '-'
    ];
    y = tableRow(doc, row, widths, y);
  });

  y = totalRow(doc,
    ['', '', '', '', 'TOTAL', fmt(data.summary.totalDebits), fmt(data.summary.totalCredits)],
    widths, y
  );
  return y + 5;
}
