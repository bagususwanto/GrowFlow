# Panduan Deployment (MVP)

Panduan ini mencakup langkah-langkah untuk melakukan _deployment_ aplikasi GrowFlow (Mini ERP) secara gratis untuk MVP menggunakan Vercel (Frontend), Render (Backend), dan Supabase/Neon (Database).

## 1. Database (PostgreSQL) - Supabase / Neon

Karena banyak provider hosting tidak lagi menyediakan database PostgreSQL permanen secara gratis tanpa masa kedaluwarsa pendek, disarankan menggunakan **Supabase** atau **Neon** untuk Free Tier PostgreSQL.

**Langkah-langkah:**

1. Buat akun dan project baru di [Supabase](https://supabase.com/) atau [Neon](https://neon.tech/).
2. Buat database baru (catat password yang Anda masukkan).
3. Dapatkan **Connection String (URI)** PostgreSQL Anda.
   - Contoh format: `postgresql://user:password@host:5432/dbname?pgbouncer=true&connection_limit=1`
   - _Catatan: Jika menggunakan Supabase dengan Prisma, pastikan menggunakan connection string dengan port pooler (contoh: 6543) dan tambahkan parameter `?pgbouncer=true`._

---

## 2. Backend API (NestJS) - Render

Kita akan menggunakan [Render](https://render.com) Web Service (Free Tier) untuk menghosting Backend API. Render mendukung aplikasi Node.js secara langsung.

**Langkah-langkah:**

1. Buat akun di **Render.com** dan hubungkan akun GitHub Anda.
2. Di dashboard Render, klik **New +** > **Web Service**.
3. Pilih repository GitHub `GrowFlow` Anda.
4. Lakukan konfigurasi Web Service sebagai berikut:
   - **Name:** `growflow-api` (atau sesuaikan dengan keinginan)
   - **Region:** Pilih yang terdekat dengan lokasi Anda (misal: Singapore)
   - **Branch:** `main`
   - **Root Directory:** biarkan kosong (root dari monorepo)
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install -g pnpm && pnpm install && pnpm build --filter=@growflow/api
     ```
   - **Start Command:**
     ```bash
     pnpm --filter @growflow/api start:prod
     ```
5. Buka bagian **Environment Variables** dan tambahkan variabel berikut:
   - `DATABASE_URL`: `[URL Database Supabase/Neon dari langkah 1]`
   - `JWT_ACCESS_SECRET`: `[Ketik string acak dan aman untuk rahasia akses]`
   - `JWT_REFRESH_SECRET`: `[Ketik string acak dan aman untuk rahasia refresh]`
   - `JWT_ACCESS_EXPIRES`: `15m`
   - `JWT_REFRESH_EXPIRES`: `7d`
   - `PORT`: `3001`
6. Klik **Create Web Service**.
7. Tunggu hingga proses build selesai. Setelah berhasil, Anda akan mendapatkan URL publik untuk API Anda (contoh: `https://growflow-api.onrender.com`).

**Catatan Migrasi Database:**
Setelah database berhasil dibuat dan terhubung, Anda harus menjalankan migrasi dan _seeding_ struktur database Anda.
Dari lokal komputer Anda:

```bash
# Ubah URL di file apps/api/.env menjadi URL database production
pnpm db:migrate
pnpm db:seed
```

---

## 3. Frontend (Next.js) - Vercel

Kita akan menggunakan [Vercel](https://vercel.com) yang memiliki dukungan native, performa tinggi, dan gratis untuk aplikasi Next.js. Vercel juga secara otomatis mendeteksi monorepo Turborepo.

**Langkah-langkah:**

1. Buat akun di **Vercel.com** dan masuk menggunakan GitHub.
2. Klik **Add New...** > **Project**.
3. Import repository GitHub `GrowFlow` Anda.
4. Konfigurasi Project:
   - Vercel akan secara otomatis mendeteksi **Next.js** dan monorepo configuration (jika menggunakan pnpm, Vercel secara otomatis mendeteksinya).
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Pilih `apps/web`
5. Buka bagian **Environment Variables** dan tambahkan:
   - `NEXT_PUBLIC_API_URL`: `[URL API Render dari Langkah 2]/api`
     _(Contoh: `https://growflow-api.onrender.com/api`)_
6. Klik **Deploy**.
7. Tunggu hingga build selesai dan Vercel akan memberikan domain publik untuk Frontend Anda (contoh: `https://growflow-web.vercel.app`).
