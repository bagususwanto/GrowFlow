# DECISIONS.md — Mini ERP

Catatan keputusan teknis dan arsitektur. Tujuan: mencegah pertanyaan "kenapa tidak pakai X?" dan menghindari refactor hal yang sudah diputuskan.

---

## ADR-001 — Monorepo dengan Turborepo + pnpm

**Keputusan:** Satu repo untuk `apps/api` dan `apps/web`.

**Alasan:**

- Shared types (`@repo/types`) antara backend dan frontend tanpa publish ke npm.
- Satu pipeline CI untuk lint, test, build sekaligus.
- Turborepo menangani caching build secara efisien.

**Trade-off:** Repo lebih besar, onboarding perlu paham struktur monorepo.

---

## ADR-002 — NestJS untuk Backend

**Keputusan:** NestJS, bukan Express/Fastify/Hono murni.

**Alasan:**

- Struktur modular cocok untuk ERP yang punya banyak domain terpisah.
- Dependency injection built-in mempermudah testing.
- Ekosistem lengkap: guards, interceptors, pipes, swagger sudah tersedia.

---

## ADR-003 — Prisma sebagai ORM

**Keputusan:** Prisma, bukan TypeORM atau Drizzle.

**Alasan:**

- Schema deklaratif di `schema.prisma` mudah dibaca dan di-review.
- Prisma Client fully typed, mengurangi runtime error.
- Migration workflow lebih aman dibanding TypeORM sync.

**Batasan:** Prisma kurang optimal untuk query relasi yang sangat kompleks — gunakan `$queryRaw` dengan komentar alasan jika terpaksa.

---

## ADR-004 — JWT dengan Refresh Token di httpOnly Cookie

**Keputusan:** Access token di memory (tidak di localStorage), refresh token di httpOnly cookie.

**Alasan:**

- Mencegah XSS mencuri token dari localStorage.
- Refresh token di httpOnly cookie tidak bisa diakses JavaScript.
- Access token berumur pendek (15 menit) meminimalkan risiko kebocoran.

**Jangan diubah** ke localStorage meski ada permintaan fitur "remember me" — gunakan masa berlaku refresh token yang lebih panjang sebagai gantinya.

---

## ADR-005 — Satu Tabel `partners` untuk Supplier & Customer

**Keputusan:** Supplier dan customer digabung di tabel `partners` dengan kolom `type`.

**Alasan:**

- Entitas bisnis yang sama sering berperan ganda (supplier sekaligus customer).
- Menghindari duplikasi data kontak.

**Konsekuensi:** Selalu filter dengan `?type=` saat query untuk menghindari hasil campur.

---

## ADR-006 — Semua Mutasi Stok Lewat `stock_mutations`

**Keputusan:** Dilarang update `stock_balances` langsung. Semua perubahan stok wajib insert ke `stock_mutations` terlebih dahulu.

**Alasan:**

- Audit trail lengkap — bisa trace dari mana setiap perubahan stok berasal.
- Konsistensi: `stock_balances` adalah agregat dari `stock_mutations`.
- Memudahkan rekonsiliasi stok.

---

## ADR-007 — Nominal Uang sebagai Integer (Rupiah Penuh)

**Keputusan:** Semua kolom uang disimpan sebagai `integer` dalam satuan rupiah penuh.

**Alasan:**

- Menghindari floating point error pada kalkulasi keuangan.
- Rupiah tidak memiliki desimal dalam praktik bisnis sehari-hari.

**Jangan** simpan sebagai `float` atau `decimal` tanpa diskusi lebih lanjut.

---

## ADR-008 — Zustand untuk Global State di Frontend

**Keputusan:** Zustand, bukan Redux atau Context API untuk global state.

**Alasan:**

- Boilerplate minimal dibanding Redux.
- Tidak menyebabkan re-render berlebihan seperti Context API.
- Cukup untuk skala ERP ini; Redux overkill untuk kebutuhan saat ini.

---

## ADR-009 — TanStack Query untuk Server State

**Keputusan:** TanStack Query untuk semua data fetching dan caching di client.

**Alasan:**

- Menangani loading, error, refetch, cache invalidation secara otomatis.
- Memisahkan server state dari UI state dengan jelas.
- Menghindari `useEffect` untuk fetch data.

---

## ADR-010 — Jurnal Akuntansi Dibuat Otomatis oleh Sistem

**Keputusan:** Jurnal untuk transaksi standar (PO, SO, Payroll) dibuat otomatis, bukan input manual.

**Alasan:**

- Mengurangi human error pada pencatatan akuntansi.
- Staff operasional tidak perlu paham double-entry accounting.
- Konsistensi mapping akun terjamin.

**Jurnal manual** hanya untuk penyesuaian (adjustment), terbatas pada role `finance`.
