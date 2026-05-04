# E-Cycle Platform ♻️

E-Cycle adalah sebuah platform manajemen limbah elektronik (E-Waste) modern yang dirancang untuk menghubungkan masyarakat dengan lokasi Drop Point sampah elektronik terdekat, memperkirakan nilai tukar (valuasi) dari barang bekas, serta memantau dampak lingkungan yang dihasilkan.

## 🚀 Teknologi yang Digunakan (Tech Stack)

Platform ini dibangun menggunakan arsitektur *Fullstack JavaScript*:

*   **Frontend:** React.js, Vite
*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL (Cloud via Supabase)
*   **ORM (Object Relational Mapping):** Prisma ORM

## 📂 Struktur Direktori

Project ini dibagi menjadi dua folder utama (Monorepo-style):

*   `/frontend` - Berisi seluruh antarmuka pengguna (UI) berupa halaman (Home, DropPoints, Estimator, Impact) dan komponen React.
*   `/backend` - Berisi logika server (API), konfigurasi Prisma ORM, dan koneksi ke database.

## 🛠️ Cara Menjalankan Project di Lokal

Untuk menjalankan project ini di komputer kamu, ikuti langkah-langkah berikut:

### 1. Persiapan Awal
Pastikan komputer kamu sudah terinstall **Node.js** dan **Git**.

Buka terminal dan jalankan perintah:
```bash
git clone https://github.com/jettt017/e-cycle-platform.git
cd e-cycle-platform
```

### 2. Setup Database (Supabase & Prisma)
Kamu perlu membuat project di [Supabase](https://supabase.com) terlebih dahulu untuk mendapatkan akses database PostgreSQL.

1. Buka folder backend: `cd backend`
2. Install dependencies: `npm install`
3. Buat file `.env` di dalam folder `backend` dan masukkan URI koneksi dari Supabase:
   ```env
   DATABASE_URL="postgresql://postgres.[ID-PROJECT]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres.[ID-PROJECT]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
   PORT=5000
   ```
4. Jalankan perintah ini untuk menyinkronkan tabel ke Supabase:
   ```bash
   npx prisma db push
   ```

### 3. Menjalankan Frontend dan Backend
Kamu memerlukan **dua terminal** yang berjalan secara bersamaan.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*Server API akan berjalan di http://localhost:5000*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install   # (Hanya perlu dijalankan pertama kali)
npm run dev
```
*Aplikasi React akan berjalan di http://localhost:5173*

## 🗄️ Database Schema

Platform ini menggunakan tabel inti berikut:
1.  **Users** (`users`): Menyimpan data pengguna dan admin, termasuk saldo poin E-Cycle.
2.  **Drop Points** (`drop_points`): Menyimpan lokasi fisik penampungan sampah elektronik.
3.  **Waste Categories** (`waste_categories`): Daftar jenis sampah (Handphone, Laptop, Baterai) beserta nilai tukarnya per kilogram.
4.  **Transactions** (`transactions`): Riwayat aktivitas setor sampah pengguna di Drop Point tertentu.
5.  **Transaction Items** (`transaction_items`): Rincian barang elektronik yang disetorkan dalam satu transaksi.

---
Dibuat untuk mempermudah pengelolaan E-Waste dan menjaga lingkungan yang lebih hijau! 🌱
