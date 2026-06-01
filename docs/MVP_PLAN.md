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
- ⚠️ Jurnal hutang dagang **tidak** dibuat saat PO Approved — akan ditrigger oleh Vendor Invoice di Fase 5

**Deliverable:** Bisa buat PO, approve, terima barang, stok bertambah.

---

## Fase 4 — Sales & Invoice (Minggu 7–8)

Siklus kedua: barang keluar + penagihan ke customer.

**Target:**

- CRUD Sales Order + line items
- Flow status SO: `DRAFT → CONFIRMED → PARTIAL/DONE → CLOSED`
  - SO baru bisa `CLOSED` setelah Invoice terkait berstatus `PAID`
- Validasi stok tersedia saat SO dikonfirmasi (HTTP 422 jika kurang)
- Delivery: kirim barang → stok otomatis berkurang
- Status SO update otomatis: `PARTIAL / DONE`

**Sales Invoice:**

- Invoice terbit otomatis dari SO setelah Delivery selesai (1 SO = 1 Invoice)
- Auto-numbering: `INV-YYYYMM-0001`
- Tanggal invoice & tanggal jatuh tempo (due date / termin)
- Flow status Invoice: `DRAFT → SENT → PARTIAL → PAID → CANCELLED`
- Jurnal piutang dagang (AR) otomatis terbentuk saat Invoice `SENT` (bukan saat SO Confirmed)
- Jurnal kredit piutang saat payment masuk
- PDF invoice yang bisa di-download / print
- Rekap outstanding invoice (belum dibayar)
- Credit note untuk pembatalan sebagian invoice

**Deliverable:** Bisa buat SO, konfirmasi, kirim barang, stok berkurang, invoice terbit otomatis, PDF bisa diunduh, jurnal piutang terbuat saat invoice dikirim.

---

## Fase 5 — Accounting & Purchase Invoice (Minggu 9–10)

Laporan keuangan dasar + siklus hutang dagang dari vendor.

**Target:**

- Chart of Accounts (COA) dengan hirarki
- Jurnal manual untuk penyesuaian (role: `finance`)

**Purchase Invoice (Vendor Bill):**

- Vendor Invoice terbit dari GRN (flow: `PO → GRN → Vendor Invoice → Payment`)
- Auto-numbering: `BILL-YYYYMM-0001`
- Tanggal invoice vendor & tanggal jatuh tempo
- Flow status: `DRAFT → RECEIVED → PARTIAL → PAID → CANCELLED`
- Jurnal hutang dagang (AP) otomatis terbentuk saat Vendor Invoice `RECEIVED`
- Jurnal kredit hutang saat payment ke vendor dilakukan

**Laporan:**

- Pencatatan pembayaran/pelunasan Hutang & Piutang (AP/AR)
- Laporan Trial Balance
- Laporan Laba Rugi sederhana
- Laporan Saldo & Umur Hutang Piutang (AP/AR Aging)

**Deliverable:** Finance bisa input Vendor Invoice dari GRN, jurnal hutang terbuat otomatis, serta lihat neraca saldo, laba rugi, dan aging report AP/AR.

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

- Dashboard: ringkasan stok, PO pending, SO pending, kas, saldo hutang & piutang
- Notifikasi: stok di bawah minimum, PO/SO butuh approval
- Export laporan ke PDF/Excel
- Rate limiting, helmet, CSP headers
- E2E test critical flows (Playwright)
- Load testing, optimasi query N+1

**Deliverable:** Siap deploy ke production.

---

## Ringkasan Timeline

| Fase | Scope                                  | Minggu |
| ---- | -------------------------------------- | ------ |
| 1    | Foundation + Auth                      | 1–2    |
| 2    | Inventory + Master Data                | 3–4    |
| 3    | Purchasing (PO + GRN)                  | 5–6    |
| 4    | Sales (SO + Delivery + Sales Invoice)  | 7–8    |
| 5    | Accounting + Purchase Invoice + Laporan| 9–10   |
| 6    | HR + Payroll                           | 11–12  |
| 7    | Production + MRP                       | 13–14  |
| 8    | Polish + Production Ready              | 15–16  |

**Total estimasi: ~4 bulan** (tim 2–3 developer)

---

## Kriteria MVP Selesai (Fase 1–5)

MVP dianggap selesai ketika siklus berikut bisa berjalan end-to-end tanpa error:

1. Admin tambah barang & set stok awal
2. Staff purchasing buat PO → manager approve → warehouse terima barang (GRN) → stok bertambah
3. Finance input Vendor Invoice dari GRN → jurnal hutang dagang terbuat otomatis
4. Staff sales buat SO → konfirmasi (validasi stok) → kirim barang → stok berkurang
5. Sales Invoice terbit otomatis → dikirim ke customer → jurnal piutang dagang terbuat
6. Finance catat payment dari customer → piutang lunas → SO closed
7. Finance lihat Trial Balance, Laba Rugi, dan AP/AR Aging

---

## Prioritas Jika Scope Harus Dipotong

Jika deadline mepet, urutkan pengurangan dari belakang:

1. Potong **Fase 7** (Production/MRP) — paling jarang dibutuhkan di awal
2. Sederhanakan **Fase 6** (Payroll) — hanya master karyawan, tanpa jurnal otomatis
3. Sederhanakan **Fase 5** (Accounting) — hanya jurnal manual, tanpa laporan otomatis
4. **Fase 1–4 tidak boleh dipotong** — ini adalah inti ERP
