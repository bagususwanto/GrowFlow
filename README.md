# GrowFlow — Mini ERP

## Gambaran Umum

**GrowFlow** adalah aplikasi ERP berbasis web untuk mengelola operasional bisnis skala menengah. Dibangun di atas arsitektur monorepo **NestJS + Next.js** dengan antarmuka modern menggunakan shadcn/ui.

**Target pengguna:** Staff operasional, manajer, dan admin perusahaan.

---

## Status Proyek Saat Ini

Proyek ini telah menyelesaikan lingkup utama MVP (Fase 1-5) dan saat ini sedang dalam proses deployment.
- ✅ **Fase 1:** Foundation (Infrastruktur & Auth) — Selesai
- ✅ **Fase 2:** Inventory & Master Data — Selesai
- ✅ **Fase 3:** Purchasing (PO & GRN) — Selesai
- ✅ **Fase 4:** Sales & Invoice — Selesai
- ✅ **Fase 5:** Accounting & Purchase Invoice — Selesai
- ⏳ **Fase 6:** HR & Payroll — Post-MVP
- ⏳ **Fase 7:** Production / MRP — Post-MVP
- 🚀 **Fase 8:** Polish & Production Deployment — Sedang dikerjakan (Deploy MVP)

---

## Tech Stack

| Layer    | Teknologi                                           |
| -------- | --------------------------------------------------- |
| Frontend | Next.js 15 (App Router), shadcn/ui, Tailwind CSS    |
| Backend  | NestJS, REST API                                    |
| Database | PostgreSQL (Prisma ORM)                             |
| Auth     | JWT (access token + refresh token, httpOnly cookie) |
| Monorepo | pnpm workspaces + Turborepo                         |
| State    | Zustand (client), TanStack Query (server state)     |
| Form     | React Hook Form + Zod                               |
| Testing  | Jest (API), Vitest + RTL (Web), Playwright (E2E)    |

---

## Struktur Monorepo

```text
/
├── apps/
│   ├── api/          # NestJS — business logic & REST API
│   └── web/          # Next.js — frontend App Router
├── packages/
│   ├── types/        # Shared TypeScript types & Zod schemas
│   ├── utils/        # Pure utility functions
│   ├── tsconfig/     # Base tsconfig
│   └── eslint-config/# Shared ESLint rules
└── docs/             # Dokumentasi project
```

---

## Role Pengguna

| Role         | Akses                                        |
| ------------ | -------------------------------------------- |
| `superadmin` | Full access semua modul + konfigurasi sistem |
| `manager`    | Approval PO/SO, baca laporan semua modul     |
| `staff`      | Input transaksi sesuai modul yang ditugaskan |
| `finance`    | Akses penuh modul Accounting & Payroll       |
| `warehouse`  | Akses penuh modul Inventory & penerimaan PO  |

---

## Setup Lokal

### Prasyarat

- Node.js >= 20
- pnpm >= 9
- PostgreSQL >= 15

### Langkah

```bash
# 1. Install dependencies
pnpm install

# 2. Salin dan isi env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Jalankan migrasi & seed
pnpm db:migrate
pnpm db:seed

# 4. Jalankan dev server
pnpm dev
```

### Perintah Penting

```bash
pnpm dev              # Jalankan api + web bersamaan
pnpm build            # Build semua apps
pnpm lint             # Lint semua packages
pnpm test             # Unit test semua packages
pnpm db:migrate       # Prisma migrate dev
pnpm db:seed          # Seed data awal (role, user admin, COA)
pnpm db:studio        # Buka Prisma Studio
```

---

## Environment Variables

### `apps/api/.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/erp_db
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=3001
```

### `apps/web/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Konvensi Penting

- Semua response API mengikuti shape: `{ data, message, statusCode }`
- Soft delete pada semua entitas utama (`deletedAt: timestamp | null`)
- Semua nominal uang disimpan sebagai `integer` (satuan sen/terkecil)
- Timezone: **UTC** di DB, konversi ke WIB di frontend
- Kode dokumen di-generate otomatis: `PO-YYYYMM-XXXX`, `SO-YYYYMM-XXXX`

---

## Dokumentasi Lanjutan

- [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — alur request, diagram sistem
- [`DATABASE.md`](./docs/DATABASE.md) — schema lengkap & relasi antar tabel
- [`API.md`](./docs/API.md) — endpoint per modul & contoh payload
- [`WORKFLOWS.md`](./docs/WORKFLOWS.md) — alur bisnis & state machine dokumen
- [`DECISIONS.md`](./docs/DECISIONS.md) — catatan keputusan teknis
- [`MVP_PLAN.md`](./docs/MVP_PLAN.md) — rencana implementasi MVP
- [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — panduan deployment MVP ke production
