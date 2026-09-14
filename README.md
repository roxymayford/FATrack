# Kontor / Capital Tracker

Aplikasi pelacak keuangan dan alokasi modal dengan filosofi tipografi Swiss (International Typographic Style).

## Struktur Proyek

Struktur file telah dirapikan menjadi arsitektur modular yang memisahkan Frontend dan Backend secara bersih:

```text
Finace Advisor/
├── frontend/                     # Aplikasi Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/           # Komponen UI modular
│   │   │   ├── StatusModal.tsx
│   │   │   └── Terminal.tsx
│   │   ├── pages/                # Halaman aplikasi
│   │   │   ├── AuthPage.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── styles/               # Stylesheet
│   │   │   └── index.css
│   │   ├── App.tsx               # Root component & state navigation
│   │   ├── main.tsx              # Entry point React
│   │   └── vite-env.d.ts
│   ├── index.html                # Dokumen HTML utama
│   ├── vite.config.ts            # Konfigurasi Vite & proxy API
│   ├── tsconfig.json             # Konfigurasi TypeScript frontend
│   └── package.json              # Dependensi frontend
│
├── backend/                      # Layanan Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── middleware/           # Middleware (Error handling, dll)
│   │   │   └── errorHandler.ts
│   │   ├── routes/               # Routing API
│   │   │   └── auth.ts
│   │   └── index.ts              # Entry point Express server
│   ├── .env.example              # Template variabel lingkungan
│   ├── tsconfig.json             # Konfigurasi TypeScript backend
│   ├── package.json              # Dependensi backend
│   └── README.md
│
└── package.json                  # Root workspace runner scripts
```

## Cara Menjalankan

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Akses frontend melalui browser di: `http://localhost:5173`

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
Akses backend API di: `http://localhost:5000`

### 3. Menjalankan dari Root
```bash
# Menginstall seluruh dependensi
npm run install:all

# Menjalankan frontend
npm run dev:frontend

# Menjalankan backend
npm run dev:backend
```
