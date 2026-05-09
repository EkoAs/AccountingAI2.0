/**
 * PDF Generator Module — Dispatcher + Shared Primitives
 * Mendelegasikan konten per-mode ke js/modules/reports/*.js
 *
 * ══════════════════════════════════════════════════════════════════
 * STRUKTUR FILE INI:
 *   1. generatePDF()     — Entry point, dispatch ke per-mode renderer
 *   2. _addHeader()      — Header halaman (nama perusahaan, penyusun)
 *   3. _addReportTitle() — Judul laporan di tengah halaman
 *   4. _tableHeader()    — Baris header tabel (abu-abu)
 *   5. _tableRow()       — Baris data tabel biasa
 *   6. _totalRow()       — Baris total (bold, abu lebih gelap)
 *   7. _addPageNumbers() — Footer nomor halaman
 * ══════════════════════════════════════════════════════════════════
 * UNTUK MENAMBAH MODE BARU:
 *   1. Buat file js/modules/reports/nama-mode.js
 *   2. Tambah case di switch generatePDF()
 *   3. Tambah entry di _addReportTitle() titles map
 *   4. Tambah <script> tag di index.html
 * ══════════════════════════════════════════════════════════════════
 */

class PDFGenerator {
  constructor() {
    this.pw = 210;
    this.ph = 297;
    this.ml = 12;
    this.mr = 12;
    this.mt = 12;
    this.mb = 15;
    this.lh = 6.5;
    this.usableW = 210 - 12 - 12;
  }

  /* ── Public API ──────────────────────────────────────────────────── */

  async generatePDF(reportData, metadata) {
    try {
      const JsPDF = (typeof jsPDF !== 'undefined')
        ? jsPDF
        : (window.jspdf && window.jspdf.jsPDF)
          ? window.jspdf.jsPDF
          : null;

      if (!JsPDF) { console.error('jsPDF library not loaded'); return null; }

      const doc = new JsPDF({ unit: 'mm', format: 'a4' });
      this._setDefaultStyle(doc);

      let y = this.mt;
      y = this._addHeader(doc, metadata, y);
      y = this._addReportTitle(doc, reportData.type, y);

      // Helpers object — diteruskan ke per-mode renderers
      const helpers = this._buildHelpers(doc);

      switch (reportData.type) {
        case 'General Journal':        y = pdfGeneralJournal(doc, reportData, y, helpers);        break;
        case 'General Ledger':         y = pdfGeneralLedger(doc, reportData, y, helpers);         break;
        case 'Trial Balance':          y = pdfTrialBalance(doc, reportData, y, helpers);          break;
        case 'Reversing Journal':      y = pdfReversingJournal(doc, reportData, y, helpers);      break;
        case 'Adjusting Entries':      y = pdfAdjustingEntries(doc, reportData, y, helpers);      break;
        case 'Adjusted Trial Balance': y = pdfAdjustedTrialBalance(doc, reportData, y, helpers);  break;
        case 'Financial Statements':   y = pdfFinancialStatements(doc, reportData, y, helpers);   break;
        case 'Closing Journal':        y = pdfClosingJournal(doc, reportData, y, helpers);        break;
      }

      this._addPageNumbers(doc);
      return doc.output('blob');
    } catch (err) {
      console.error('Error generating PDF:', err.message, err.stack);
      return null;
    }
  }

  downloadPDF(pdfBlob, filename) {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'report.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Build helpers object for per-mode renderers ─────────────────── */

  _buildHelpers(doc) {
    const self = this;
    return {
      ml: self.ml, mr: self.mr, mt: self.mt,
      pw: self.pw, ph: self.ph, mb: self.mb,
      tableHeader: self._tableHeader.bind(self),
      tableRow:    self._tableRow.bind(self),
      totalRow:    self._totalRow.bind(self),
      checkNewPage: self._checkNewPage.bind(self),
      fmt:      self._fmt.bind(self),
      truncate: self._truncate.bind(self)
    };
  }

  /* ── Header & Title ──────────────────────────────────────────────── */

  _addHeader(doc, meta, y) {
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(meta.organizationName || 'Laporan Keuangan', this.pw / 2, y, { align: 'center' });
    y += 7;

    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Judul: ${meta.reportTitle || '-'}`, this.ml, y);
    doc.text(`Penyusun: ${meta.preparer || '-'}`, this.pw - this.mr, y, { align: 'right' });
    y += 5;
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })}`, this.ml, y);
    y += 4;

    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.4);
    doc.line(this.ml, y, this.pw - this.mr, y);
    y += 5;
    return y;
  }

  _addReportTitle(doc, type, y) {
    const titles = {
      'General Journal':        'JURNAL UMUM',
      'General Ledger':         'BUKU BESAR',
      'Trial Balance':          'NERACA SALDO',
      'Reversing Journal':      'JURNAL PEMBALIK',
      'Adjusting Entries':      'JURNAL PENYESUAIAN',
      'Adjusted Trial Balance': 'NERACA SALDO DISESUAIKAN',
      'Financial Statements':   'LAPORAN KEUANGAN',
      'Closing Journal':        'JURNAL PENUTUP'
    };
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(titles[type] || type, this.pw / 2, y, { align: 'center' });
    return y + 8;
  }

  /* ── Table Primitives ────────────────────────────────────────────── */

  _tableHeader(doc, cols, widths, y) {
    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    
    // Calculate row height based on text wrapping
    let maxLines = 1;
    let x = this.ml;
    cols.forEach((col, i) => {
      const maxWidth = widths[i] - 3; // padding
      const lines = doc.splitTextToSize(col, maxWidth);
      maxLines = Math.max(maxLines, lines.length);
    });
    
    const rowH = Math.max(this.lh + 1, this.lh * maxLines);
    
    // Draw cell backgrounds and borders
    doc.setFillColor(210, 210, 210);
    doc.setDrawColor(140, 140, 140);
    doc.setLineWidth(0.3);
    x = this.ml;
    cols.forEach((_col, i) => {
      doc.rect(x, y, widths[i], rowH, 'FD');
      x += widths[i];
    });

    // Draw text with wrapping
    x = this.ml;
    cols.forEach((col, i) => {
      const maxWidth = widths[i] - 3;
      const lines = doc.splitTextToSize(col, maxWidth);
      
      // Center each line
      lines.forEach((line, lineIdx) => {
        const yText = y + (lineIdx + 0.68) * this.lh;
        doc.text(line, x + widths[i] / 2, yText, { align: 'center' });
      });
      
      x += widths[i];
    });

    return y + rowH;
  }

  _tableRow(doc, rowData, widths, y) {
    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    doc.setTextColor(30, 30, 30);
    
    // Calculate row height based on text wrapping
    let maxLines = 1;
    let x = this.ml;
    rowData.forEach((val, i) => {
      const str = String(val);
      const maxWidth = widths[i] - 3; // padding
      const lines = doc.splitTextToSize(str, maxWidth);
      maxLines = Math.max(maxLines, lines.length);
    });
    
    const rowH = this.lh * maxLines;
    
    // Draw cell backgrounds and borders
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.setFillColor(255, 255, 255);
    x = this.ml;
    widths.forEach(w => {
      doc.rect(x, y, w, rowH, 'FD');
      x += w;
    });

    // Draw text with wrapping
    x = this.ml;
    rowData.forEach((val, i) => {
      const str = String(val);
      const isNumeric = /^(Rp|-)/.test(str) || (/[\d.,]+/.test(str) && str.includes(','));
      const maxWidth = widths[i] - 3;
      const lines = doc.splitTextToSize(str, maxWidth);
      
      const align = isNumeric ? 'right' : 'left';
      const xText = isNumeric ? x + widths[i] - 1.5 : x + 1.5;
      
      // Draw each line
      lines.forEach((line, lineIdx) => {
        const yText = y + (lineIdx + 0.68) * this.lh;
        doc.text(line, xText, yText, { align });
      });
      
      x += widths[i];
    });

    return y + rowH;
  }

  _totalRow(doc, rowData, widths, y) {
    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    
    // Calculate row height based on text wrapping
    let maxLines = 1;
    let x = this.ml;
    rowData.forEach((val, i) => {
      const str = String(val);
      const maxWidth = widths[i] - 3; // padding
      const lines = doc.splitTextToSize(str, maxWidth);
      maxLines = Math.max(maxLines, lines.length);
    });
    
    const rowH = Math.max(this.lh + 1, this.lh * maxLines);
    
    // Draw cell backgrounds and borders
    doc.setFillColor(225, 225, 225);
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.4);
    x = this.ml;
    widths.forEach(w => {
      doc.rect(x, y, w, rowH, 'FD');
      x += w;
    });

    // Draw text with wrapping
    x = this.ml;
    rowData.forEach((val, i) => {
      const str = String(val);
      const isNumeric = /^(Rp|-)/.test(str) || (/[\d.,]+/.test(str) && str.includes(','));
      const maxWidth = widths[i] - 3;
      const lines = doc.splitTextToSize(str, maxWidth);
      
      const align = isNumeric ? 'right' : 'left';
      const xText = isNumeric ? x + widths[i] - 1.5 : x + 1.5;
      
      // Draw each line
      lines.forEach((line, lineIdx) => {
        const yText = y + (lineIdx + 0.68) * this.lh;
        doc.text(line, xText, yText, { align });
      });
      
      x += widths[i];
    });

    return y + rowH;
  }

  /* ── Helpers ─────────────────────────────────────────────────────── */

  _checkNewPage(doc, y, cols, widths, headerFn) {
    if (y > this.ph - this.mb - 12) {
      doc.addPage();
      y = this.mt;
      if (cols && widths && headerFn) y = headerFn(doc, cols, widths, y);
    }
    return y;
  }

  _addPageNumbers(doc) {
    const total = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    doc.setTextColor(100, 100, 100);
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.text(`Halaman ${i} dari ${total}`, this.pw / 2, this.ph - 5, { align: 'center' });
      doc.text('Accounting By Eko Asif', this.pw - this.mr, this.ph - 5, { align: 'right' });
    }
  }

  _setDefaultStyle(doc) {
    doc.setFont('times', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.setDrawColor(150, 150, 150);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.3);
  }

  _fmt(amount) {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  // Deprecated: Use doc.splitTextToSize() for text wrapping instead
  _truncate(str, maxLen) {
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen - 1) + '…' : str;
  }
}

const pdfGenerator = new PDFGenerator();
