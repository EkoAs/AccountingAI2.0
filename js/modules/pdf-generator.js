/**
 * PDF Generator Module — Dispatcher + Shared Primitives
 * Mendelegasikan konten per-mode ke js/modules/reports/*.js
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
        case 'General Journal':   y = pdfGeneralJournal(doc, reportData, y, helpers);   break;
        case 'General Ledger':    y = pdfGeneralLedger(doc, reportData, y, helpers);    break;
        case 'Trial Balance':     y = pdfTrialBalance(doc, reportData, y, helpers);     break;
        case 'Reversing Journal': y = pdfReversingJournal(doc, reportData, y, helpers); break;
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
      'General Journal':   'JURNAL UMUM',
      'General Ledger':    'BUKU BESAR',
      'Trial Balance':     'NERACA SALDO',
      'Reversing Journal': 'JURNAL PEMBALIK'
    };
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(titles[type] || type, this.pw / 2, y, { align: 'center' });
    return y + 8;
  }

  /* ── Table Primitives ────────────────────────────────────────────── */

  _tableHeader(doc, cols, widths, y) {
    const rowH = this.lh + 1;
    doc.setFillColor(210, 210, 210);
    doc.setDrawColor(140, 140, 140);
    doc.setLineWidth(0.3);

    let x = this.ml;
    cols.forEach((_col, i) => {
      doc.rect(x, y, widths[i], rowH, 'FD');
      x += widths[i];
    });

    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    x = this.ml;
    cols.forEach((col, i) => {
      doc.text(col, x + widths[i] / 2, y + rowH * 0.68, { align: 'center' });
      x += widths[i];
    });

    return y + rowH;
  }

  _tableRow(doc, rowData, widths, y) {
    const rowH = this.lh;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.setFillColor(255, 255, 255);

    let x = this.ml;
    widths.forEach(w => {
      doc.rect(x, y, w, rowH, 'FD');
      x += w;
    });

    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    doc.setTextColor(30, 30, 30);
    x = this.ml;
    rowData.forEach((val, i) => {
      const str = String(val);
      const isNumeric = /^(Rp|-)/.test(str) || (/[\d.,]+/.test(str) && str.includes(','));
      const align = isNumeric ? 'right' : 'left';
      const xText = isNumeric ? x + widths[i] - 1.5 : x + 1.5;
      doc.text(str, xText, y + rowH * 0.68, { align });
      x += widths[i];
    });

    return y + rowH;
  }

  _totalRow(doc, rowData, widths, y) {
    const rowH = this.lh + 1;
    doc.setFillColor(225, 225, 225);
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.4);

    let x = this.ml;
    widths.forEach(w => {
      doc.rect(x, y, w, rowH, 'FD');
      x += w;
    });

    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    x = this.ml;
    rowData.forEach((val, i) => {
      const str = String(val);
      const isNumeric = /^(Rp|-)/.test(str) || (/[\d.,]+/.test(str) && str.includes(','));
      const align = isNumeric ? 'right' : 'left';
      const xText = isNumeric ? x + widths[i] - 1.5 : x + 1.5;
      doc.text(str, xText, y + rowH * 0.68, { align });
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

  _truncate(str, maxLen) {
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen - 1) + '…' : str;
  }
}

const pdfGenerator = new PDFGenerator();
