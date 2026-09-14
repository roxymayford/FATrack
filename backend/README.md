# Kontor Backend API

Layanan API untuk Kontor Capital Tracker menggunakan Express dan TypeScript.

## Struktur Direktori

```
backend/
├── src/
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── routes/
│   │   └── auth.ts
│   └── index.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Menjalankan Server

1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Salin environment file:
   ```bash
   cp .env.example .env
   ```
3. Pasang dependensi:
   ```bash
   npm install
   ```
4. Jalankan mode pengembangan:
   ```bash
   npm run dev
   ```

## Endpoint API

- `GET /api/health` - Cek status layanan
- `POST /api/auth/register` - Pendaftaran akun
- `POST /api/auth/login` - Masuk / Autentikasi
- `POST /api/auth/forgot-password` - Pemulihan kata sandi
