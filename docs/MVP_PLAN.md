# MVP & Implementation Plan — Mini ERP

## Filosofi MVP

Fokus pada **satu siklus bisnis yang utuh**: barang masuk → barang keluar → tercatat di keuangan. Modul lain ditambahkan setelah siklus inti stabil.

---

## Fase 1 — Foundation (Minggu 1–2)

Infrastruktur & auth. Semua fase berikutnya bergantung pada ini.

**Target:**

- Monorepo berjalan (pnpm + Turborepo)
- NestJS boilerplate: global exception filter, validation pipe, swagger
- Next.js boilerplate: App Router, shadcn/ui, TanStack Query setup
- Auth: login, logout, refresh token, role guard
- RBAC: role `superadmin`, `manager`, `staff`, `finance`, `warehouse`
- Shared `@repo/types` tersambung ke kedua app
- CI pipeline: lint + typecheck + test

**Deliverable:** Bisa login, lihat halaman dashboard kosong, token refresh berjalan.

---

## Fase 2 — Inventory & Master Data (Minggu 3–4)

Fondasi data untuk semua modul transaksi.

**Target:**

- Master: barang (`items`), gudang (`warehouses`), partner (`partners`)
- Stok balance per item per gudang
- Mutasi stok manual (adjustment)
- CRUD dengan pagination, search, filter

**Deliverable:** Bisa tambah barang, set stok awal, lihat saldo stok per gudang.

---

## Fase 3 — Purchasing (Minggu 5–6)

Siklus pertama: barang masuk.

**Target:**

- CRUD Purchase Order + line items
- Flow status: `DRAFT → SUBMITTED → APPROVED → CANCELLED`
- Goods Receipt (GRN): terima barang → stok otomatis bertambah
- Status PO update otomatis: `PARTIAL / DONE`
- Jurnal otomatis saat PO approved (hutang dagang)

**Deliverable:** Bisa buat PO, approve, terima barang, stok bertambah, jurnal terbuat.

---

## Fase 4 — Sales (Minggu 7–8)

Siklus kedua: barang keluar.

**Target:**

- CRUD Sales Order + line items
- Flow status: `DRAFT → CONFIRMED → CANCELLED`
- Validasi stok tersedia saat SO dikonfirmasi (HTTP 422 jika kurang)
- Delivery: kirim barang → stok otomatis berkurang
- Status SO update otomatis: `PARTIAL / DONE`
- Jurnal otomatis saat SO confirmed (piutang dagang)

**Deliverable:** Bisa buat SO, konfirmasi, kirim barang, stok berkurang, jurnal terbuat.

---

## Fase 5 — Accounting (Minggu 9–10)

Laporan keuangan dasar dari jurnal yang sudah terkumpul.

**Target:**

- Chart of Accounts (COA) dengan hirarki
- Jurnal manual untuk penyesuaian (role: `finance`)
- Laporan Trial Balance
- Laporan Laba Rugi sederhana

**Deliverable:** Finance bisa lihat neraca saldo dan laba rugi dari transaksi PO & SO.

---

## Fase 6 — HR & Payroll (Minggu 11–12)

**Target:**

- Master karyawan
- Input kehadiran (bulk per bulan)
- Generate payroll per periode
- Flow: `DRAFT → APPROVED → PAID`
- Jurnal otomatis: beban gaji & hutang gaji

**Deliverable:** Bisa generate slip gaji bulanan, approve, dan jurnal terbuat otomatis.

---

## Fase 7 — Production / MRP (Minggu 13–14)

**Target:**

- Bill of Materials (BOM) dengan versi
- Work Order: `DRAFT → IN_PROGRESS → DONE → CANCELLED`
- Saat IN_PROGRESS: komponen di-OUT dari gudang otomatis
- Saat DONE: hasil produksi di-IN ke gudang otomatis

**Deliverable:** Bisa jalankan work order, komponen berkurang, hasil produksi masuk stok.

---

## Fase 8 — Polish & Production Ready (Minggu 15–16)

**Target:**

- Dashboard: ringkasan stok, PO pending, SO pending, kas
- Notifikasi: stok di bawah minimum, PO/SO butuh approval
- Export laporan ke PDF/Excel
- Rate limiting, helmet, CSP headers
- E2E test critical flows (Playwright)
- Load testing, optimasi query N+1

**Deliverable:** Siap deploy ke production.

---

## Ringkasan Timeline

| Fase | Scope                     | Minggu |
| ---- | ------------------------- | ------ |
| 1    | Foundation + Auth         | 1–2    |
| 2    | Inventory + Master Data   | 3–4    |
| 3    | Purchasing (PO + GRN)     | 5–6    |
| 4    | Sales (SO + Delivery)     | 7–8    |
| 5    | Accounting + Laporan      | 9–10   |
| 6    | HR + Payroll              | 11–12  |
| 7    | Production + MRP          | 13–14  |
| 8    | Polish + Production Ready | 15–16  |

**Total estimasi: ~4 bulan** (tim 2–3 developer)

---

## Kriteria MVP Selesai (Fase 1–4)

MVP dianggap selesai ketika siklus berikut bisa berjalan end-to-end tanpa error:

1. Admin tambah barang & set stok awal
2. Staff purchasing buat PO → manager approve → warehouse terima barang → stok bertambah
3. Staff sales buat SO → konfirmasi (validasi stok) → kirim barang → stok berkurang
4. Finance lihat jurnal otomatis dari kedua transaksi di atas

---

## Prioritas Jika Scope Harus Dipotong

Jika deadline mepet, urutkan pengurangan dari belakang:

1. Potong **Fase 7** (Production/MRP) — paling jarang dibutuhkan di awal
2. Sederhanakan **Fase 6** (Payroll) — hanya master karyawan, tanpa jurnal otomatis
3. Sederhanakan **Fase 5** (Accounting) — hanya jurnal manual, tanpa laporan otomatis
4. **Fase 1–4 tidak boleh dipotong** — ini adalah inti ERP
