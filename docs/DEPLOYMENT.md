# Panduan Deployment Lengkap (GrowFlow MVP)

Panduan ini menjelaskan langkah demi langkah untuk men-deploy aplikasi GrowFlow (Mini ERP) ke production secara gratis menggunakan:
1. **Supabase / Neon** (Database PostgreSQL)
2. **Render** (Backend API NestJS)
3. **Vercel** (Frontend Next.js)

---

## 🛠️ Ringkasan Alur Deployment
Untuk menghindari masalah CORS (*Cross-Origin Resource Sharing*), ikuti urutan berikut:
1. **Buat Database** di Supabase atau Neon (dapatkan URI koneksi).
2. **Jalankan Migrasi & Seed** database dari komputer lokal ke database online.
3. **Deploy Backend API** di Render (dapatkan URL API, misalnya `https://growflow-api.onrender.com`).
4. **Deploy Frontend** di Vercel (dapatkan URL Frontend, misalnya `https://growflow.vercel.app`).
5. **Update CORS di Backend:** Tambahkan URL Frontend Vercel ke variabel lingkungan Backend di Render agar frontend diizinkan mengakses data dari backend.

---

## Langkah 1: Setup Database (Supabase / Neon)
Karena Render Free Tier membatasi masa aktif database gratis hanya selama 90 hari, kita menggunakan **Supabase** atau **Neon** yang menyediakan PostgreSQL gratis tanpa batasan waktu (permanen).

### Opsi A: Menggunakan Supabase (Direkomendasikan)
1. Buat akun di [Supabase.com](https://supabase.com/).
2. Klik **New Project** dan pilih nama organisasi Anda.
3. Isi detail project:
   - **Database Name:** `growflow-db`
   - **Database Password:** Buat password yang kuat (dan catat!).
   - **Region:** Pilih wilayah terdekat (contoh: **Singapore - ap-southeast-1**).
4. Setelah project siap (proses provisioning selesai sekitar 2 menit):
   - Pergi ke **Project Settings** (ikon roda gigi di kiri bawah) > **Database**.
   - Gulir ke bawah ke bagian **Connection String**.
   - Pilih tab **URI** dan ubah mode dari *Transaction* ke **Session** (port `5432`). 
     > ⚠️ **Penting:** Karena backend kita dideploy di Render sebagai server jangka panjang (*long-lived service*), gunakan **Session Connection** (port `5432`) agar Prisma tidak mengalami masalah pooling koneksi.
   - Salin URI tersebut, lalu ganti placeholder `[YOUR-PASSWORD]` dengan password database yang Anda buat tadi.
     - *Format URI:* `postgresql://postgres.[username]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`

### Opsi B: Menggunakan Neon.tech
1. Buat akun di [Neon.tech](https://neon.tech/).
2. Buat project baru bernama `growflow`.
3. Pilih versi PostgreSQL (disarankan 15 atau lebih baru) dan pilih Region **Singapore**.
4. Salin string koneksi yang langsung ditampilkan di dashboard (*format: postgres://...*).

---

## Langkah 2: Menjalankan Migrasi & Seed Database
Sebelum backend dinyalakan, database online harus diisi dengan tabel-tabel dan data awal (Role Admin, Akun Keuangan/COA, dll).

1. Di komputer lokal Anda, buka file konfigurasi lingkungan API di `apps/api/.env`.
2. Ganti nilai `DATABASE_URL` dengan URI database online yang baru saja Anda salin pada **Langkah 1**:
   ```env
   DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   ```
3. Buka terminal Anda di root proyek `GrowFlow` dan jalankan perintah berikut secara berurutan:
   ```bash
   # Generate Prisma client terbaru
   pnpm --filter @growflow/api prisma:generate

   # Kirim schema lokal ke database online (Migrasi)
   pnpm db:migrate

   # Masukkan data bawaan penting (Seeding admin, roles, dll)
   pnpm db:seed
   ```
4. Setelah proses sukses, Anda bisa mengembalikan `DATABASE_URL` di `.env` lokal Anda ke database lokal (`localhost`) agar pengerjaan lokal tidak terganggu.

---

## Langkah 3: Deploy Backend API (NestJS) di Render
Kita menggunakan Render Web Service untuk menjalankan backend NestJS.

### Langkah-langkah di Render:
1. Hubungkan akun GitHub Anda ke [Render.com](https://render.com).
2. Di dashboard Render, klik tombol **New** di kanan atas > **Web Service**.
3. Hubungkan ke repository GitHub `GrowFlow` Anda.
4. Di halaman konfigurasi, atur detail berikut:
   - **Name:** `growflow-api` (bebas sesuaikan).
   - **Region:** Pilih **Singapore** (samakan dengan region database agar latensi rendah).
   - **Branch:** `main` (atau cabang rilis Anda).
   - **Root Directory:** *Biarkan Kosong* (secara default akan menggunakan root monorepo).
   - **Runtime:** `Node`
   - **Build Command:** 
     ```bash
     pnpm install && pnpm build --filter=@growflow/api
     ```
     *(Render mendeteksi pnpm karena adanya file `pnpm-lock.yaml` di root proyek)*.
   - **Start Command:** 
     ```bash
     pnpm --filter @growflow/api start:prod
     ```
5. Buka bagian **Advanced** dan klik **Add Environment Variable**. Tambahkan variabel-variabel wajib berikut:
   
   | Key | Value / Keterangan |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | *[Salin URI database online dari Langkah 1]* |
   | `JWT_ACCESS_SECRET` | *[Buat string acak min. 32 karakter]* (Contoh: `4d75d315998a44d8b02447953bb529e4d`) |
   | `JWT_REFRESH_SECRET` | *[Buat string acak min. 32 karakter]* (Contoh: `e1f822aa74a54eb4b1cc337bbfe9923bb`) |
   | `JWT_ACCESS_EXPIRES` | `15m` |
   | `JWT_REFRESH_EXPIRES` | `7d` |
   | `PORT` | `3001` |
   | `WEB_URL` | `http://localhost:3000` *(Ini akan kita ubah setelah mendapat URL Vercel)* |

6. Klik **Create Web Service** di bagian paling bawah.
7. Tunggu proses build selesai. Jika berhasil, Anda akan melihat status hijau `Live` dan link API Anda di bawah nama service, misalnya: `https://growflow-api.onrender.com`.

> ⚠️ **Catatan Penting Layanan Gratis Render:**
> Akun gratis Render akan menonaktifkan aplikasi (mode *sleep*) setelah 15 menit tanpa aktivitas. Ketika dipanggil kembali, akan ada waktu tunggu awal (cold start) sekitar **30–60 detik** sebelum API merespons kembali.

---

## Langkah 4: Deploy Frontend (Next.js) di Vercel
Vercel sangat optimal dan gratis untuk menjalankan frontend Next.js 15.

### Langkah-langkah di Vercel:
1. Masuk ke [Vercel.com](https://vercel.com/) menggunakan akun GitHub.
2. Klik **Add New...** > **Project**.
3. Klik **Import** pada repository `GrowFlow`.
4. Di bagian **Configure Project**:
   - Vercel akan otomatis mendeteksi konfigurasi monorepo Turborepo.
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Klik **Edit** dan pilih `apps/web`.
5. Di bagian **Environment Variables**, tambahkan:
   
   | Key | Value / Keterangan |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | *[URL Render API Anda]* + `/api` (Contoh: `https://growflow-api.onrender.com/api`) |

6. Klik **Deploy**.
7. Setelah selesai, Anda akan mendapatkan URL frontend, misalnya `https://growflow-app.vercel.app`.

---

## Langkah 5: Sinkronisasi CORS (Langkah Terakhir & Wajib)
Agar frontend di Vercel diizinkan mengambil data dari backend Render:

1. Salin URL frontend lengkap yang diberikan oleh Vercel (misal: `https://growflow-app.vercel.app`).
2. Buka dashboard **Render.com** > pilih Web Service `growflow-api` Anda.
3. Masuk ke tab **Environment** di menu kiri.
4. Temukan variabel `WEB_URL` dan ganti nilainya menjadi URL Vercel yang baru Anda salin.
   - Contoh: `WEB_URL` = `https://growflow-app.vercel.app`
5. Klik **Save Changes**. Render akan melakukan *re-deploy* otomatis untuk menerapkan perubahan.

---

## 🔍 Cara Verifikasi & Troubleshooting

### 1. Masalah CORS (Error: Failed to fetch / CORS Policy)
- Buka Inspect Element di browser Anda (F12) > tab **Console**.
- Jika terdapat tulisan error merah bermuatan `CORS policy`, pastikan variabel `WEB_URL` di Render sudah sama persis dengan domain Vercel Anda (termasuk `https://` dan tanpa garis miring `/` di bagian akhir).

### 2. NestJS Crash saat Startup
- Buka dashboard Render > pilih Web Service Anda > tab **Logs**.
- Jika error berisi tentang *validation failed*, periksa nilai `JWT_ACCESS_SECRET` dan `JWT_REFRESH_SECRET` Anda. Pastikan masing-masing memiliki panjang minimal 32 karakter karena sistem validasi Zod backend mewajibkannya untuk keamanan.

### 3. Database Connection Timeouts
- Periksa status koneksi di log Render. Pastikan Anda tidak menggunakan format koneksi ipv6 jika server Anda belum mendukungnya. Di Supabase, Anda dapat mencentang opsi penggunaan koneksi IPv4/Pooler jika mengalami masalah koneksi timeout.
