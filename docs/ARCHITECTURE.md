# ARCHITECTURE.md — Mini ERP

## Gambaran Sistem

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│              Next.js App Router (apps/web)              │
│         Server Components + Client Components           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST (fetch / TanStack Query)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              NestJS API (apps/api)                      │
│   Controller → Service → Repository → Prisma Client    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  PostgreSQL DB │
              └────────────────┘
```

---

## Alur Request

### Server Component (SSR)

```
Browser
  → Next.js Server Component
    → fetch() ke NestJS API (server-to-server, pakai service account token)
      → Controller → Service → Prisma
        → Response JSON
    → Render HTML
  → Browser terima HTML siap pakai
```

### Client Component (CSR / Mutation)

```
Browser
  → TanStack Query / useMutation
    → fetch() ke NestJS API (pakai access token dari memory)
      → JwtAuthGuard → RolesGuard
        → Controller → Service → Prisma
          → Response JSON
    → Invalidate cache → UI update otomatis
```

### Server Action (Form Submit)

```
Browser (form submit)
  → Next.js Server Action
    → Validasi Zod
      → fetch() ke NestJS API
        → Response
    → revalidatePath() → UI refresh
```

---

## Struktur Folder Detail

```
/
├── apps/
│   ├── api/                        # NestJS
│   │   ├── src/
│   │   │   ├── main.ts             # Bootstrap: helmet, cors, pipes, swagger
│   │   │   ├── app.module.ts       # Root module
│   │   │   ├── common/
│   │   │   │   ├── filters/        # GlobalExceptionFilter
│   │   │   │   ├── guards/         # JwtAuthGuard, RolesGuard
│   │   │   │   ├── interceptors/   # LoggingInterceptor, TransformInterceptor
│   │   │   │   ├── decorators/     # @Roles(), @CurrentUser()
│   │   │   │   └── pipes/          # ZodValidationPipe
│   │   │   └── modules/
│   │   │       ├── auth/
│   │   │       ├── users/
│   │   │       ├── inventory/
│   │   │       ├── purchasing/
│   │   │       ├── sales/
│   │   │       ├── accounting/
│   │   │       ├── hr/
│   │   │       └── production/
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       ├── migrations/
│   │       └── seed.ts
│   │
│   └── web/                        # Next.js
│       └── src/
│           ├── app/                # App Router
│           │   ├── (auth)/         # Route group: login page
│           │   ├── (dashboard)/    # Route group: semua halaman utama
│           │   │   ├── layout.tsx  # Sidebar + header
│           │   │   ├── inventory/
│           │   │   ├── purchasing/
│           │   │   ├── sales/
│           │   │   ├── accounting/
│           │   │   ├── hr/
│           │   │   └── production/
│           │   └── api/            # Next.js Route Handlers (proxy jika perlu)
│           ├── components/
│           │   ├── ui/             # shadcn/ui — JANGAN EDIT MANUAL
│           │   ├── layout/         # Sidebar, Header, Breadcrumb
│           │   └── [feature]/      # Komponen per fitur
│           ├── hooks/              # Custom hooks (useDebounce, usePagination)
│           ├── lib/
│           │   ├── api.ts          # Fetch wrapper dengan auth header
│           │   └── utils.ts        # cn(), formatRupiah(), formatDate()
│           ├── stores/             # Zustand stores per domain
│           └── types/              # Frontend-only types
│
└── packages/
    ├── types/                      # Shared: API request/response types
    ├── utils/                      # Pure functions tanpa framework dependency
    ├── tsconfig/                   # base.json, nextjs.json, nestjs.json
    └── eslint-config/              # Shared ESLint flat config
```

---

## Struktur Modul NestJS

Setiap modul mengikuti pola yang sama:

```
modules/purchasing/
├── purchasing.module.ts        # Import dependencies, register providers
├── purchasing.controller.ts    # Route handler, HTTP concern only
├── purchasing.service.ts       # Business logic, orchestration
├── purchasing.repository.ts    # Prisma queries (data access layer)
├── dto/
│   ├── create-po.dto.ts        # class-validator + @ApiProperty
│   └── update-po.dto.ts        # PartialType(CreatePoDto)
├── entities/
│   └── purchase-order.entity.ts
└── purchasing.spec.ts          # Unit test service
```

**Aturan dependency antar layer:**

```
Controller  →  Service  →  Repository  →  Prisma
               ↓
           @repo/types (shared types)
```

Controller tidak boleh import Repository langsung. Service tidak boleh import Prisma Client langsung.

---

## Auth Flow

```
Login
  → POST /auth/login
    → Validasi credentials
      → Generate accessToken (15m) + refreshToken (7d)
        → refreshToken disimpan hashed di DB
          → accessToken: return di response body
          → refreshToken: set httpOnly cookie

Request ke protected endpoint
  → Header: Authorization: Bearer <accessToken>
    → JwtAuthGuard: verify & decode token
      → RolesGuard: cek role vs @Roles() decorator
        → @CurrentUser() decorator inject user ke handler

Refresh Token
  → POST /auth/refresh (kirim cookie otomatis oleh browser)
    → Verifikasi refreshToken hash di DB
      → Generate accessToken baru
```

---

## Error Handling

Semua error melewati `GlobalExceptionFilter` dan menghasilkan shape yang konsisten:

```json
{
  "statusCode": 400,
  "message": "Stok tidak cukup untuk item X",
  "error": "Bad Request",
  "timestamp": "2025-08-01T10:00:00.000Z",
  "path": "/api/sales-orders/uuid/confirm"
}
```

| Layer          | Penanganan                                                        |
| -------------- | ----------------------------------------------------------------- |
| DTO validation | `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` |
| Business error | 던던 던던던 `throw new BadRequestException(...)` di service       |
| Stok kurang    | `throw new UnprocessableEntityException(...)` → HTTP 422          |
| Not found      | `throw new NotFoundException(...)` → HTTP 404                     |
| Uncaught error | `GlobalExceptionFilter` → HTTP 500 + log ke logger                |

---

## State Management Frontend

```
┌─────────────────────────────────────────────┐
│              UI Components                  │
└──────┬──────────────────────────┬───────────┘
       │                          │
       ▼                          ▼
┌─────────────┐          ┌────────────────────┐
│   Zustand   │          │   TanStack Query   │
│ (UI state)  │          │  (server state)    │
│             │          │                    │
│ • sidebar   │          │ • fetch data       │
│ • modals    │          │ • cache & revalidate│
│ • filters   │          │ • mutations        │
└─────────────┘          └────────┬───────────┘
                                  │
                                  ▼
                          ┌───────────────┐
                          │  NestJS API   │
                          └───────────────┘
```

**Aturan:**

- Data dari API → TanStack Query (bukan Zustand)
- UI state lokal → `useState`
- UI state global (sidebar, theme) → Zustand
- Form state → React Hook Form (bukan Zustand)

---

## Dependency Antar Package

```
apps/api   →  packages/types
apps/api   →  packages/utils
apps/web   →  packages/types
apps/web   →  packages/utils

packages/* → TIDAK BOLEH import dari apps/*
apps/api   → TIDAK BOLEH import dari apps/web
apps/web   → TIDAK BOLEH import dari apps/api
```

---

## Konvensi Penamaan File

| Konteks           | Pattern                   | Contoh                       |
| ----------------- | ------------------------- | ---------------------------- |
| NestJS module     | `[feature].module.ts`     | `purchasing.module.ts`       |
| NestJS service    | `[feature].service.ts`    | `purchasing.service.ts`      |
| NestJS controller | `[feature].controller.ts` | `purchasing.controller.ts`   |
| Next.js page      | `app/[route]/page.tsx`    | `app/purchasing/page.tsx`    |
| Next.js layout    | `app/[route]/layout.tsx`  | `app/(dashboard)/layout.tsx` |
| React component   | `[component-name].tsx`    | `po-detail-sheet.tsx`        |
| Custom hook       | `use-[name].ts`           | `use-stock-balance.ts`       |
| Zustand store     | `[feature].store.ts`      | `inventory.store.ts`         |
| TanStack Query    | `[feature].queries.ts`    | `purchasing.queries.ts`      |
