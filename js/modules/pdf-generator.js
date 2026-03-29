/**
 * PDF Generator Module
 * Menggunakan jsPDF — output A4, bg putih, teks hitam (standar cetak)
 * Struktur tabel sama dengan tampilan web, tanpa warna dark theme
 */

class PDFGenerator {
  constructor() {
    this.pw = 210;       // A4 width mm
    this.ph = 297;       // A4 height mm
    this.ml = 12;        // margin left
    this.mr = 12;        // margin right
    this.mt = 12;        // margin top
    this.mb = 15;        // margin bottom
    this.lh = 6.5;       // line height per row
    this.usableW = 210 - 12 - 12; // 186mm
  }

  /* ── Public API ──────────────────────────────────────────────────── */

  async generatePDF(reportData, metadata) {
    try {
      // jsPDF UMD exposes as window.jspdf.jsPDF
      const JsPDF = (typeof jsPDF !== 'undefined')
        ? jsPDF
        : (window.jspdf && window.jspdf.jsPDF)
          ? window.jspdf.jsPDF
          : null;

      if (!JsPDF) {
        console.error('jsPDF library not loaded');
        return null;
      }

      const doc = new JsPDF({ unit: 'mm', format: 'a4' });
      this._setDefaultStyle(doc);

      let y = this.mt;
      y = this._addHeader(doc, metadata, y);
      y = this._addReportTitle(doc, reportData.type, y);

      switch (reportData.type) {
        case 'General Journal':
          y = this._addGeneralJournal(doc, reportData, y); break;
        case 'General Ledger':
          y = this._addGeneralLedger(doc, reportData, y); break;
        case 'Trial Balance':
          y = this._addTrialBalance(doc, reportData, y); break;
        case 'Reversing Journal':
          y = this._addReversingJournal(doc, reportData, y); break;
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

  /* ── Header & Title ──────────────────────────────────────────────── */

  _addHeader(doc, meta, y) {
    // Company name — bold, large
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

    // Horizontal rule
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
    y += 8;
    return y;
  }

  /* ── General Journal ─────────────────────────────────────────────── */

  _addGeneralJournal(doc, data, y) {
    // cols: Tanggal | Kode | Nama Akun | Keterangan | Debet | Kredit
    const cols  = ['Tanggal', 'Kode', 'Nama Akun', 'Keterangan', 'Debet', 'Kredit'];
    const widths = [22, 14, 38, 52, 30, 30];

    y = this._tableHeader(doc, cols, widths, y);

    data.entries.forEach(e => {
      y = this._checkNewPage(doc, y, cols, widths, this._tableHeader.bind(this));
      const row = [
        e.date || '',
        e.accountCode || '',
        this._truncate(e.account || '', 22),
        this._truncate(e.description || '', 30),
        e.debit > 0 ? this._fmt(e.debit) : '-',
        e.credit > 0 ? this._fmt(e.credit) : '-'
      ];
      y = this._tableRow(doc, row, widths, y);
    });

    // Total row
    y = this._totalRow(doc,
      ['', '', '', 'TOTAL', this._fmt(data.summary.totalDebits), this._fmt(data.summary.totalCredits)],
      widths, y
    );
    return y + 5;
  }

  /* ── General Ledger ──────────────────────────────────────────────── */

  _addGeneralLedger(doc, data, y) {
    const cols   = ['Tanggal', 'Keterangan', 'No Ref', 'Debet', 'Kredit', 'Saldo D', 'Saldo K'];
    const widths = [22, 52, 18, 24, 24, 23, 23];

    data.accounts.forEach(acc => {
      // Hitung tinggi minimum yang dibutuhkan: info block ~39mm + header ~8mm + 1 row ~7mm
      const minNeeded = 54;
      if (y > this.ph - this.mb - minNeeded) {
        doc.addPage();
        y = this.mt;
      }

      // ── Info Block ─────────────────────────────────────────────
      y = this._accountInfoBlock(doc, acc, y);

      // ── Column header ──────────────────────────────────────────
      y = this._tableHeader(doc, cols, widths, y);

      acc.transactions.forEach(t => {
        y = this._checkNewPage(doc, y, cols, widths, this._tableHeader.bind(this));
        const row = [
          t.date || '',
          this._truncate(t.description || '', 32),
          t.ref || '',
          t.debit > 0 ? this._fmt(t.debit) : '-',
          t.credit > 0 ? this._fmt(t.credit) : '-',
          t.balanceDebit > 0 ? this._fmt(t.balanceDebit) : '-',
          t.balanceCredit > 0 ? this._fmt(t.balanceCredit) : '-'
        ];
        y = this._tableRow(doc, row, widths, y);
      });

      // Total row
      y = this._totalRow(doc,
        ['', 'TOTAL', '',
          this._fmt(acc.totalDebits), this._fmt(acc.totalCredits),
          this._fmt(acc.closingBalanceDebit), this._fmt(acc.closingBalanceCredit)],
        widths, y
      );

      // Spacer antar akun — 8mm jarak jelas
      y += 8;
    });

    return y;
  }

  _accountInfoBlock(doc, acc, y) {
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni',
                        'Juli','Agustus','September','Oktober','November','Desember'];
    const bulan = monthNames[(acc.month || 1) - 1] || String(acc.month);

    const lineH = 5;
    const padTop = 5;   // jarak teks baris pertama dari atas box
    const padBot = 4;   // padding bawah
    const boxH = padTop + lineH * 4 + padBot; // = 5 + 28 + 4 = 37mm

    doc.setFillColor(235, 235, 235);
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.rect(this.ml, y, this.usableW, boxH, 'FD');

    const lx = this.ml + 4;
    const rx = this.pw - this.mr - 4;

    // Baris 1 — Kode & Bulan
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(`Kode      : ${acc.accountCode}`, lx, y + padTop + lineH * 0 + lineH);
    doc.text(`Bulan  : ${bulan}`, rx, y + padTop + lineH * 0 + lineH, { align: 'right' });

    // Baris 2 — Nama Akun & Tahun
    doc.text(`Nama Akun : ${acc.accountName}`, lx, y + padTop + lineH * 1 + lineH);
    doc.text(`Tahun  : ${acc.year || '-'}`, rx, y + padTop + lineH * 1 + lineH, { align: 'right' });

    // Garis pemisah
    const sepY = y + padTop + lineH * 2 + 2;
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(0.2);
    doc.line(this.ml + 2, sepY, this.pw - this.mr - 2, sepY);

    // Baris 3 — Saldo Awal
    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(
      `Saldo Awal  Debet: ${this._fmt(acc.openingBalanceDebit)}    Kredit: ${this._fmt(acc.openingBalanceCredit)}`,
      lx, y + padTop + lineH * 2 + lineH
    );

    // Baris 4 — Mutasi (kiri) + Saldo Akhir (kanan)
    doc.text(
      `Mutasi  Debet: ${this._fmt(acc.totalDebits)}    Kredit: ${this._fmt(acc.totalCredits)}`,
      lx, y + padTop + lineH * 3 + lineH
    );
    doc.text(
      `Saldo Akhir  Debet: ${this._fmt(acc.closingBalanceDebit)}    Kredit: ${this._fmt(acc.closingBalanceCredit)}`,
      rx, y + padTop + lineH * 3 + lineH, { align: 'right' }
    );

    return y + boxH + 2;
  }

  /* ── Trial Balance ───────────────────────────────────────────────── */

  _addTrialBalance(doc, data, y) {
    const cols   = ['Kode Akun', 'Nama Akun', 'Debet', 'Kredit'];
    const widths = [24, 108, 27, 27];

    y = this._tableHeader(doc, cols, widths, y);

    data.entries.forEach(e => {
      y = this._checkNewPage(doc, y, cols, widths, this._tableHeader.bind(this));
      const row = [
        e.code,
        this._truncate(e.name, 60),
        e.debitBalance > 0 ? this._fmt(e.debitBalance) : '-',
        e.creditBalance > 0 ? this._fmt(e.creditBalance) : '-'
      ];
      y = this._tableRow(doc, row, widths, y);
    });

    y = this._totalRow(doc,
      ['', 'TOTAL', this._fmt(data.summary.totalDebits), this._fmt(data.summary.totalCredits)],
      widths, y
    );
    return y + 5;
  }

  /* ── Reversing Journal ───────────────────────────────────────────── */

  _addReversingJournal(doc, data, y) {
    const cols   = ['Tanggal', 'Kode', 'Nama Akun', 'Keterangan', 'Debet', 'Kredit'];
    const widths = [22, 14, 38, 52, 30, 30];

    y = this._tableHeader(doc, cols, widths, y);

    data.entries.forEach(e => {
      y = this._checkNewPage(doc, y, cols, widths, this._tableHeader.bind(this));
      const row = [
        e.date || '',
        e.accountCode || '',
        this._truncate(e.account || '', 22),
        this._truncate(e.description || '', 30),
        e.debit > 0 ? this._fmt(e.debit) : '-',
        e.credit > 0 ? this._fmt(e.credit) : '-'
      ];
      y = this._tableRow(doc, row, widths, y);
    });

    return y + 5;
  }

  /* ── Table Primitives ────────────────────────────────────────────── */

  _tableHeader(doc, cols, widths, y) {
    const rowH = this.lh + 1;
    doc.setFillColor(210, 210, 210);
    doc.setDrawColor(140, 140, 140);
    doc.setLineWidth(0.3);

    // Rect dari y ke bawah (konsisten dengan _accountInfoBlock)
    let x = this.ml;
    cols.forEach((col, i) => {
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
      const isNumeric = /^(Rp|-)/.test(str) || /[\d.,]+/.test(str) && str.includes(',');
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
      const isNumeric = /^(Rp|-)/.test(str) || /[\d.,]+/.test(str) && str.includes(',');
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
      if (cols && widths && headerFn) {
        y = headerFn(doc, cols, widths, y);
      }
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
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  _truncate(str, maxLen) {
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen - 1) + '…' : str;
  }
}

const pdfGenerator = new PDFGenerator();
