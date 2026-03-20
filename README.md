# Accounting Ledger System - By Eko Asif

Sistem buku besar akuntansi otomatis berbasis web dengan klasifikasi berbasis AI (Gemini). Aplikasi ini memungkinkan pengguna untuk memasukkan transaksi dalam format natural language, dan sistem akan secara otomatis mengklasifikasikan ke akun yang tepat menggunakan AI, kemudian menampilkan laporan akuntansi real-time dan menghasilkan PDF profesional.

## 🎯 Fitur Utama

### ✅ Input Transaksi Natural Language
- Masukkan transaksi dalam format sederhana: `item_name amount quantity date`
- Contoh: `pulpen 3000 45 2025-01-15`
- Tanggal otomatis diisi dengan hari ini jika tidak diberikan

### ✅ Klasifikasi AI Berbasis Gemini
- Integrasi dengan Gemini API untuk klasifikasi otomatis
- Fallback ke klasifikasi lokal jika AI tidak tersedia
- Confidence score untuk setiap klasifikasi
- Rate limiting: 100 requests/jam per user

### ✅ 4 Jenis Laporan Akuntansi
1. **General Journal** - Catatan kronologis semua transaksi
2. **General Ledger** - Transaksi diorganisir per akun
3. **Trial Balance** - Verifikasi persamaan akuntansi
4. **Reversing Journal** - Pembalikan entri akrual

### ✅ Standar Akuntansi Penuh
- Double-entry bookkeeping
- Persamaan akuntansi: Assets = Liabilities + Equity
- 60+ chart of accounts standar
- Debit/credit rules per jenis akun
- Validasi persamaan akuntansi sebelum finalisasi

### ✅ PDF Generation
- Generate laporan dalam format PDF profesional
- Header dengan informasi organisasi
- Tabel terformat dengan borders dan styling
- Footer dengan nomor halaman
- Automatic page breaks untuk data besar

### ✅ Multi-User Support
- Registrasi dan login user
- Data isolation per user
- Session management (30 menit timeout)
- Password hashing

### ✅ Responsive Design
- Gray space metallic theme
- Desktop (≥1024px): 30% input panel, 70% display panel
- Tablet (768-1023px): Full width stacked layout
- Mobile (<768px): Optimized untuk layar kecil
- Dark mode support

### ✅ Data Management
- Undo/redo functionality
- Auto-save ke localStorage
- Export/import data (JSON)
- Automatic backup

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/accounting-ledger-system.git
cd accounting-ledger-system
```

### 2. Setup Gemini API Key
```bash
# Buka aplikasi di browser
# Klik Settings → Masukkan Gemini API key
# Atau set di localStorage:
localStorage.setItem('gemini_api_key', 'your_api_key_here');
```

### 3. Deploy ke GitHub Pages
```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy
npm run deploy
```

## 📋 Struktur Proyek

```
accounting-ledger-system/
├── index.html                 # Main HTML file
├── css/
│   ├── theme.css             # Gray space metallic theme
│   ├── styles.css            # Main styles
│   └── responsive.css        # Responsive design
├── js/
│   ├── modules/
│   │   ├── storage.js        # localStorage management
│   │   ├── auth.js           # User authentication
│   │   ├── transaction.js    # Transaction management
│   │   ├── accounting.js     # Accounting calculations
│   │   ├── ai-classifier.js  # Gemini AI integration
│   │   ├── report-generator.js # Report generation
│   │   └── pdf-generator.js  # PDF generation
│   ├── app.js                # Main application controller
│   ├── ui.js                 # UI manager
│   └── main.js               # Event handlers
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions deployment
├── .env.example              # Environment variables template
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🔧 Konfigurasi

### Environment Variables
Buat file `.env` berdasarkan `.env.example`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_APP_NAME=Accounting System
VITE_ENABLE_AI_CLASSIFICATION=true
VITE_API_RATE_LIMIT=100
```

### Gemini API Setup
1. Buka [Google AI Studio](https://aistudio.google.com)
2. Buat API key baru
3. Masukkan ke aplikasi atau `.env` file

## 📊 Cara Penggunaan

### 1. Registrasi/Login
- Klik "Register here" untuk membuat akun baru
- Atau login dengan email dan password yang sudah terdaftar

### 2. Input Transaksi
- Masukkan transaksi di input field
- Format: `item_name amount quantity date`
- Tekan Enter atau klik tombol submit
- Sistem akan mengklasifikasi otomatis

### 3. Konfirmasi Transaksi
- Review klasifikasi AI
- Klik "Confirm" untuk menyimpan
- Atau "Adjust" untuk mengubah manual

### 4. Lihat Laporan
- Pilih jenis laporan dari dropdown
- Laporan akan update real-time
- Lihat summary (Total Debits, Credits, Status)

### 5. Generate PDF
- Klik "Generate PDF" untuk download laporan
- File akan tersimpan dengan nama: `report_type_date.pdf`

### 6. Export Data
- Klik "Export Data" untuk backup
- File JSON akan di-download
- Bisa di-import kembali nanti

## 🔐 Keamanan

### Password
- Hashing client-side (simple hash untuk demo)
- Untuk production, gunakan bcrypt library

### API Key
- Disimpan di localStorage (user's browser)
- Tidak dikirim ke server
- Gunakan GitHub Secrets untuk deployment

### Data Privacy
- Semua data disimpan di browser (localStorage)
- Tidak ada server backend
- User data tidak dikirim ke pihak ketiga

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## 🎨 Tema

### Gray Space Metallic
- Deep Space Gray: `#1a1a2e`
- Metallic Silver: `#c0c0c0`
- Light Gray: `#e8e8e8`
- Charcoal: `#2d2d44`

### Accent Colors
- Success: `#4ade80`
- Warning: `#fb923c`
- Error: `#ef4444`
- Info: `#3b82f6`

## 📈 Standar Akuntansi

### Chart of Accounts
- **Assets (1000-1999)**: Cash, Bank, Receivable, Inventory, Supplies, Equipment
- **Liabilities (2000-2999)**: Payable, Debt, Accrued Expenses
- **Equity (3000-3999)**: Stock, Retained Earnings, Dividends
- **Revenue (4000-4999)**: Sales, Service, Interest Income
- **Expenses (5000-5999)**: COGS, Salaries, Rent, Utilities, Office Supplies, Depreciation, Insurance, Marketing, Interest

### Debit/Credit Rules
- **Assets**: Debit ↑, Credit ↓
- **Liabilities**: Debit ↓, Credit ↑
- **Equity**: Debit ↓, Credit ↑
- **Revenue**: Debit ↓, Credit ↑
- **Expenses**: Debit ↑, Credit ↓

### Accounting Equation
```
Assets = Liabilities + Equity
```

Sistem memvalidasi persamaan ini sebelum finalisasi transaksi.

## 🐛 Troubleshooting

### API Key Error
- Pastikan API key valid dari Google AI Studio
- Check rate limit (100 requests/hour)
- Sistem akan fallback ke klasifikasi lokal jika AI error

### Data Tidak Tersimpan
- Check browser localStorage quota (5MB limit)
- Export data jika mendekati limit
- Clear old backups jika perlu

### PDF Tidak Generate
- Pastikan jsPDF library loaded
- Check browser console untuk error
- Coba di browser lain

### Transaksi Tidak Seimbang
- Check total debits vs credits
- Lihat discrepancy amount di status
- Adjust transaksi yang salah

## 📚 API Reference

### App Methods
```javascript
// User Management
app.registerUser(email, password)
app.loginUser(email, password)
app.logoutUser()

// Transaction Processing
await app.processTransactionInput(input)
app.confirmTransaction(data)
app.updateTransaction(id, updates)
app.deleteTransaction(id)

// Undo/Redo
app.undo()
app.redo()

// Reports
app.generateReport(type)
await app.generateAndDownloadPDF(type)

// Verification
app.verifyAccountingEquation()
app.finalizeTransactions()

// Profile
app.updateUserProfile(updates)
app.exportUserData()
app.importUserData(data)
```

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:
1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail

## 👨‍💻 Author

**Eko Asif**
- GitHub: [@ekoasif](https://github.com/ekoasif)
- Email: eko@example.com

## 🙏 Acknowledgments

- Gemini API untuk AI classification
- jsPDF untuk PDF generation
- GitHub Pages untuk hosting

## 📞 Support

Untuk pertanyaan atau issue:
1. Buka GitHub Issues
2. Jelaskan masalah dengan detail
3. Sertakan screenshot jika perlu

---

**Dibuat dengan ❤️ untuk memudahkan akuntansi**
