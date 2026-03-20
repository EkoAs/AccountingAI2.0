/**
 * PDF Generator Module - Generates PDF reports
 * Uses jsPDF library for PDF creation
 */

class PDFGenerator {
  constructor() {
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 10;
    this.lineHeight = 7;
    this.fontSize = 10;
  }

  /**
   * Generate PDF from report data
   * @param {object} reportData - Report data
   * @param {object} metadata - Report metadata
   * @returns {Promise<Blob>} PDF blob
   */
  async generatePDF(reportData, metadata) {
    try {
      // Check if jsPDF is available
      if (typeof jsPDF === 'undefined') {
        console.error('jsPDF library not loaded');
        return null;
      }

      const doc = new jsPDF();
      let yPosition = this.margin;

      // Add header
      yPosition = this.addHeader(doc, metadata, yPosition);

      // Add report title
      yPosition = this.addReportTitle(doc, reportData.type, yPosition);

      // Add content based on report type
      switch (reportData.type) {
        case 'General Journal':
          yPosition = this.addGeneralJournalContent(doc, reportData, yPosition);
          break;
        case 'General Ledger':
          yPosition = this.addGeneralLedgerContent(doc, reportData, yPosition);
          break;
        case 'Trial Balance':
          yPosition = this.addTrialBalanceContent(doc, reportData, yPosition);
          break;
        case 'Reversing Journal':
          yPosition = this.addReversingJournalContent(doc, reportData, yPosition);
          break;
      }

      // Add footer
      this.addFooter(doc);

      return doc.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  }

  /**
   * Add header to PDF
   * @param {object} doc - jsPDF document
   * @param {object} metadata - Metadata
   * @param {number} yPosition - Current Y position
   * @returns {number} New Y position
   */
  addHeader(doc, metadata, yPosition) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(metadata.organizationName || 'Accounting Report', this.margin, yPosition);

    yPosition += this.lineHeight + 2;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Report: ${metadata.reportTitle || 'Accounting Report'}`, this.margin, yPosition);

    yPosition += this.lineHeight;
    doc.text(`Prepared by: ${metadata.preparer || 'System Generated'}`, this.margin, yPosition);

    yPosition += this.lineHeight;
    doc.text(`Date: ${new Date().toLocaleDateString('id-ID')}`, this.margin, yPosition);

    yPosition += this.lineHeight + 5;
    return yPosition;
  }

  /**
   * Add report title
   * @param {object} doc - jsPDF document
   * @param {string} reportType - Report type
   * @param {number} yPosition - Current Y position
   * @returns {number} New Y position
   */
  addReportTitle(doc, reportType, yPosition) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(reportType, this.margin, yPosition);
    return yPosition + this.lineHeight + 3;
  }

  /**
   * Add General Journal content
   * @param {object} doc - jsPDF document
   * @param {object} reportData - Report data
   * @param {number} yPosition - Current Y position
   * @returns {number} New Y position
   */
  addGeneralJournalContent(doc, reportData, yPosition) {
    const columns = ['Date', 'Account', 'Description', 'Debit', 'Credit'];
    const columnWidths = [25, 30, 50, 30, 30];

    yPosition = this.addTableHeader(doc, columns, columnWidths, yPosition);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    reportData.entries.forEach(entry => {
      if (yPosition > this.pageHeight - this.margin - 10) {
        doc.addPage();
        yPosition = this.margin;
        yPosition = this.addTableHeader(doc, columns, columnWidths, yPosition);
      }

      const rowData = [
        entry.date,
        entry.accountCode,
        entry.description,
        this.formatCurrency(entry.debit),
        this.formatCurrency(entry.credit)
      ];

      this.addTableRow(doc, rowData, columnWidths, yPosition);
      yPosition += this.lineHeight;
    });

    yPosition += 5;
    doc.setFont(undefined, 'bold');
    doc.text(`Total Debits: ${this.formatCurrency(reportData.summary.totalDebits)}`, this.margin, yPosition);
    yPosition += this.lineHeight;
    doc.text(`Total Credits: ${this.formatCurrency(reportData.summary.totalCredits)}`, this.margin, yPosition);

    return yPosition + this.lineHeight;
  }

  /**
   * Add General Ledger content
   * @param {object} doc - jsPDF document
   * @param {object} reportData - Report data
   * @param {number} yPosition - Current Y position
   * @returns {number} New Y position
   */
  addGeneralLedgerContent(doc, reportData, yPosition) {
    reportData.accounts.forEach(account => {
      if (yPosition > this.pageHeight - this.margin - 20) {
        doc.addPage();
        yPosition = this.margin;
      }

      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text(`${account.accountCode}: ${account.accountName}`, this.margin, yPosition);
      yPosition += this.lineHeight;

      const columns = ['Date', 'Description', 'Debit', 'Credit', 'Balance'];
      const columnWidths = [25, 50, 25, 25, 30];

      yPosition = this.addTableHeader(doc, columns, columnWidths, yPosition);

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');

      account.transactions.forEach(txn => {
        if (yPosition > this.pageHeight - this.margin - 10) {
          doc.addPage();
          yPosition = this.margin;
          yPosition = this.addTableHeader(doc, columns, columnWidths, yPosition);
        }

        const rowData = [
          txn.date,
          txn.description,
          this.formatCurrency(txn.debit),
          this.formatCurrency(txn.credit),
          this.formatCurrency(txn.balance)
        ];

        this.addTableRow(doc, rowData, columnWidths, yPosition);
        yPosition += this.lineHeight;
      });

      yPosition += 3;
      doc.setFont(undefined, 'bold');
      doc.text(`Closing Balance: ${this.formatCurrency(account.closingBalance)}`, this.margin, yPosition);
      yPosition += this.lineHeight + 5;
    });

    return yPosition;
  }

  /**
   * Add Trial Balance content
   * @param {object} doc - jsPDF document
   * @param {object} reportData - Report data
   * @param {number} yPosition - Current Y position
   * @returns {number} New Y position
   */
  addTrialBalanceContent(doc, reportData, yPosition) {
    const columns = ['Account Code', 'Account Name', 'Debit', 'Credit'];
    const columnWidths = [30, 80, 30, 30];

    yPosition = this.addTableHeader(doc, columns, columnWidths, yPosition);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    reportData.entries.forEach(entry => {
      if (yPosition > this.pageHeight - this.margin - 15) {
        doc.addPage();
        yPosition = this.margin;
        yPosition = this.addTableHeader(doc, columns, columnWidths, yPosition);
      }

      const rowData = [
        entry.code,
        entry.name,
        this.formatCurrency(entry.debitBalance),
        this.formatCurrency(entry.creditBalance)
      ];

      this.addTableRow(doc, rowData, columnWidths, yPosition);
      yPosition += this.lineHeight;
    });

    yPosition += 5;
    doc.setFont(undefined, 'bold');
    doc.text(`Total Debits: ${this.formatCurrency(reportData.summary.totalDebits)}`, this.margin, yPosition);
    yPosition += this.lineHeight;
    doc.text(`Total Credits: ${this.formatCurrency(reportData.summary.totalCredits)}`, this.margin, yPosition);

    return yPosition + this.lineHeight;
  }

  /**
   * Add Reversing Journal content
   * @param {object} doc - jsPDF document
   * @param {object} reportData - Report data
   * @param {number} yPosition - Current Y position
   * @returns {number} New Y position
   */
  addReversingJournalContent(doc, reportData, yPosition) {
    const columns = ['Date', 'Account', 'Description', 'Debit', 'Credit'];
    const columnWidths = [25, 30, 50, 30, 30];

    yPosition = this.addTableHeader(doc, columns, columnWidths, yPosition);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    reportData.entries.forEach(entry => {
      if (yPosition > this.pageHeight - this.margin - 10) {
        doc.addPage();
        yPosition = this.margin;
        yPosition = this.addTableHeader(doc, columns, columnWidths, yPosition);
      }

      const rowData = [
        entry.date,
        entry.accountCode,
        entry.description,
        this.formatCurrency(entry.debit),
        this.formatCurrency(entry.credit)
      ];

      this.addTableRow(doc, rowData, columnWidths, yPosition);
      yPosition += this.lineHeight;
    });

    return yPosition + this.lineHeight;
  }

  /**
   * Add table header
   * @param {object} doc - jsPDF document
   * @param {array} columns - Column names
   * @param {array} columnWidths - Column widths
   * @param {number} yPosition - Current Y position
   * @returns {number} New Y position
   */
  addTableHeader(doc, columns, columnWidths, yPosition) {
    doc.setFont(undefined, 'bold');
    doc.setFillColor(200, 200, 200);

    let xPosition = this.margin;
    columns.forEach((col, i) => {
      doc.rect(xPosition, yPosition - 3, columnWidths[i], this.lineHeight, 'F');
      doc.text(col, xPosition + 2, yPosition);
      xPosition += columnWidths[i];
    });

    return yPosition + this.lineHeight;
  }

  /**
   * Add table row
   * @param {object} doc - jsPDF document
   * @param {array} rowData - Row data
   * @param {array} columnWidths - Column widths
   * @param {number} yPosition - Current Y position
   */
  addTableRow(doc, rowData, columnWidths, yPosition) {
    let xPosition = this.margin;
    rowData.forEach((data, i) => {
      doc.text(String(data), xPosition + 2, yPosition);
      xPosition += columnWidths[i];
    });
  }

  /**
   * Add footer to PDF
   * @param {object} doc - jsPDF document
   */
  addFooter(doc) {
    const pageCount = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 5,
        { align: 'center' }
      );
    }
  }

  /**
   * Format currency
   * @param {number} amount - Amount
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Download PDF
   * @param {Blob} pdfBlob - PDF blob
   * @param {string} filename - Filename
   */
  downloadPDF(pdfBlob, filename) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

const pdfGenerator = new PDFGenerator();
