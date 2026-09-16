# FATrack / Personal Finance Advisor

Aplikasi penasihat keuangan personal untuk first-jobber & pekerja muda Indonesia berbasis filosofi Swiss Design. Dilengkapi kalkulator Safe-to-Spend, alokasi 50/30/20 adaptif, plafon sewa kost maksimal 25%, dan rekomendasi belanja kebutuhan riil.

---

## 📋 Prasyarat Sistem

Pastikan perangkat Anda sudah terpasang:
- **Node.js** (v18 atau lebih baru) & **npm**
- **Docker** & **Docker Compose** (jika ingin menjalankan via Container)
- **Git**

---

## 🐳 Cara Menjalankan Menggunakan Docker Container

Docker Compose memudahkan deployment frontend dan backend dalam container terisolasi secara otomatis.

### 1. Jalankan Seluruh Container (Frontend & Backend)
Dari folder root proyek:
```bash
docker-compose up -d --build
```
> Flag `-d` menjalankan container di background (detached mode), sedangkan `--build` memastikan image dibangun ulang dengan source code terbaru.

### 2. Memeriksa Status Container
```bash
docker-compose ps
```
Pastikan kedua container berstatus `Up`:
- `kontor_backend` (Port `5000`)
- `kontor_frontend` (Port `80`)

### 3. Mengakses Aplikasi
- **Frontend App**: Buka browser di [http://localhost](http://localhost) (Port 80)
- **Backend API**: Buka browser / Postman di [http://localhost:5000](http://localhost:5000)

### 4. Melihat Log Container
Untuk memantau aktivitas atau debugging:
```bash
# Log seluruh service
docker-compose logs -f

# Log frontend saja
docker-compose logs -f frontend

# Log backend saja
docker-compose logs -f backend
```

### 5. Menghentikan Container
```bash
# Menghentikan container tanpa menghapus data
docker-compose stop

# Mematikan dan menghapus container beserta jaringannya
docker-compose down
```

### 6. Menjalankan Container Individual (Manual Tanpa Compose)
Jika hanya ingin build atau run salah satu service:

**Backend:**
```bash
cd backend
docker build -t fatrack-backend .
docker run -d -p 5000:5000 --name fatrack_backend fatrack-backend
```

**Frontend:**
```bash
cd frontend
docker build -t fatrack-frontend .
docker run -d -p 80:80 --name fatrack_frontend fatrack-frontend
```

---

## 💻 Cara Menjalankan Secara Lokal (Development / Tanpa Docker)

Jika ingin melakukan development dengan hot-reload:

### 1. Jalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Akses di: `http://localhost:5173`

### 2. Jalankan Backend
```bash
cd backend
npm install
npm run dev
```
Akses di: `http://localhost:5000`

### 3. Shortcut dari Root
```bash
# Install dependencies di root, frontend, dan backend
npm run install:all

# Jalankan frontend dev server
npm run dev:frontend

# Jalankan backend dev server
npm run dev:backend
```

---

## 📁 Arsitektur & Struktur Direktori

```text
Finace Advisor/
├── frontend/                     # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── components/           # UI Cards, Charts, Forms, Sliders
│   │   ├── contexts/             # AuthContext (Supabase / Local Demo Mode)
│   │   ├── data/                 # Master data rekomendasi kost & minimarket
│   │   ├── lib/                  # Formula Safe-to-Spend, kalkulator, Supabase client
│   │   ├── pages/                # LandingPage, AuthPage, OnboardingPage,
│   │   │                         # DashboardPage, AllocationPage, RecommendationsPage,
│   │   │                         # TransactionsPage
│   │   └── styles/               # Modular Swiss Editorial CSS
│   ├── Dockerfile                # Multi-stage build (Node -> Nginx Alpine)
│   └── package.json
│
├── backend/                      # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── lib/                  # Midtrans Snap client, Supabase admin client
│   │   ├── middleware/           # Error handler, Supabase JWT auth middleware
│   │   ├── routes/               # /api/auth, /api/subscription, /api/midtrans webhook
│   │   ├── types/                # Type declarations (midtrans-client)
│   │   └── index.ts              # Express Server entrypoint
│   ├── supabase/
│   │   └── schema.sql            # SQL schema & trigger untuk table subscriptions
│   ├── Dockerfile                # Production Node.js Alpine runtime
│   └── package.json
│
├── docker-compose.yml            # Orkestrasi multi-container Docker
└── README.md                     # Dokumentasi panduan proyek
```

---

## 💳 Model Freemium (Money Tracker vs Financial Advisor)

| Fitur | Mode Free (Money Tracker) | Mode Premium (Financial Advisor) |
|---|:---:|:---:|
| Pencatatan transaksi harian & riwayat | ✅ Gratis Selamanya | ✅ Lengkap |
| Filter & ringkasan arus kas | ✅ Gratis Selamanya | ✅ Lengkap |
| Kalkulator Safe-to-Spend adaptif | 🔒 Locked | ✅ Aktif (Live Sync) |
| Alokasi 50/30/20 kustom | 🔒 Locked | ✅ Aktif |
| Rekomendasi sewa kost (maks 25% gaji) | 🔒 Locked | ✅ Aktif |
| Rekomendasi belanja minimarket & gizi | 🔒 Locked | ✅ Aktif |
| Financial Health Score (0–100) | 🔒 Locked | ✅ Aktif |
| Integrasi Pembayaran Midtrans Snap | — | ✅ QRIS, VA, E-Wallet |

---

## 🔐 Variabel Lingkungan (.env)

### Frontend (`frontend/.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:5000
```
> *Catatan: Jika Supabase/Midtrans belum dikonfigurasi, sistem otomatis menggunakan Demo Mode / LocalStorage failover sehingga aplikasi tetap dapat dicoba secara penuh.*

### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development

# Supabase Admin / Service Role
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Atau gunakan SUPABASE_ANON_KEY jika service role belum tersedia
SUPABASE_ANON_KEY=your_anon_key

# Midtrans Payment Gateway (Sandbox)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
MIDTRANS_IS_PRODUCTION=false
```

