# API.md — Mini ERP

## Konvensi

| Aturan         | Detail                                                                     |
| -------------- | -------------------------------------------------------------------------- |
| Base URL       | `http://localhost:3001/api`                                                |
| Format         | JSON, `Content-Type: application/json`                                     |
| Auth           | Bearer token di header: `Authorization: Bearer <access_token>`             |
| Response shape | `{ data, message, statusCode }`                                            |
| Error shape    | `{ statusCode, message, error, timestamp }`                                |
| Pagination     | Query params: `?page=1&limit=20`, response: `{ data, total, page, limit }` |
| Soft delete    | DELETE endpoint hanya set `deleted_at`, data tidak hilang dari DB          |

---

## Auth

```
POST   /auth/login          # Login, return access + refresh token
POST   /auth/refresh        # Refresh access token
POST   /auth/logout         # Invalidate refresh token
GET    /auth/me             # Data user yang sedang login
```

**Login request/response:**

```json
// POST /auth/login
{ "email": "admin@erp.com", "password": "secret" }

// Response
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "uuid", "name": "Admin", "role": "superadmin" }
  }
}
```

---

## Users & Roles

```
GET    /users               # List users (superadmin)
POST   /users               # Buat user baru
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id

GET    /roles               # List roles & permissions
PATCH  /roles/:id/permissions
```

---

## Inventory

```
GET    /items               # List barang (?search, ?category)
POST   /items               # Tambah barang
GET    /items/:id
PATCH  /items/:id
DELETE /items/:id

GET    /items/:id/stock     # Saldo stok per gudang
GET    /stock-mutations     # Riwayat mutasi (?item_id, ?type, ?from, ?to)
POST   /stock-mutations/adjustment  # Stock opname manual

GET    /warehouses
POST   /warehouses
PATCH  /warehouses/:id
```

---

## Purchasing

```
GET    /purchase-orders           # List PO (?status, ?supplier_id)
POST   /purchase-orders           # Buat PO baru (status: DRAFT)
GET    /purchase-orders/:id
PATCH  /purchase-orders/:id       # Edit (hanya status DRAFT)
DELETE /purchase-orders/:id

POST   /purchase-orders/:id/submit    # DRAFT → SUBMITTED
POST   /purchase-orders/:id/approve   # SUBMITTED → APPROVED
POST   /purchase-orders/:id/cancel    # * → CANCELLED

GET    /goods-receipts
POST   /goods-receipts            # Terima barang (trigger stock IN)
GET    /goods-receipts/:id
```

**Buat PO:**

```json
// POST /purchase-orders
{
  "supplierId": "uuid",
  "expectedAt": "2025-09-01",
  "items": [{ "itemId": "uuid", "qtyOrdered": 100, "unitPrice": 5000 }]
}
```

---

## Sales

```
GET    /sales-orders              # List SO (?status, ?customer_id)
POST   /sales-orders              # Buat SO baru (status: DRAFT)
GET    /sales-orders/:id
PATCH  /sales-orders/:id          # Edit (hanya status DRAFT)

POST   /sales-orders/:id/confirm  # DRAFT → CONFIRMED
POST   /sales-orders/:id/cancel   # * → CANCELLED

GET    /deliveries
POST   /deliveries                # Kirim barang (trigger stock OUT)
GET    /deliveries/:id
```

---

## Accounting

```
GET    /accounts                  # Chart of Accounts
POST   /accounts
PATCH  /accounts/:id

GET    /journal-entries           # List jurnal (?from, ?to, ?reference_type)
POST   /journal-entries           # Jurnal manual (role: finance)
GET    /journal-entries/:id

GET    /reports/trial-balance     # Neraca saldo (?period_month&period_year)
GET    /reports/profit-loss       # Laba rugi (?from&to)
```

---

## HR & Payroll

```
GET    /employees
POST   /employees
GET    /employees/:id
PATCH  /employees/:id

GET    /attendances               # (?employee_id, ?month, ?year)
POST   /attendances/bulk          # Input kehadiran bulk

GET    /payrolls
POST   /payrolls                  # Generate payroll per periode
GET    /payrolls/:id
POST   /payrolls/:id/approve      # DRAFT → APPROVED
POST   /payrolls/:id/pay          # APPROVED → PAID
```

---

## Production

```
GET    /bom                       # List Bill of Materials
POST   /bom
GET    /bom/:id
PATCH  /bom/:id

GET    /work-orders
POST   /work-orders
GET    /work-orders/:id
POST   /work-orders/:id/start     # DRAFT → IN_PROGRESS (trigger stock OUT komponen)
POST   /work-orders/:id/complete  # IN_PROGRESS → DONE (trigger stock IN hasil)
POST   /work-orders/:id/cancel
```

---

## Partners (Supplier & Customer)

```
GET    /partners                  # ?type=SUPPLIER|CUSTOMER|BOTH
POST   /partners
GET    /partners/:id
PATCH  /partners/:id
DELETE /partners/:id
```

---

## Error Codes Umum

| Status | Kasus                                                            |
| ------ | ---------------------------------------------------------------- |
| `400`  | Validasi gagal, qty melebihi sisa, status transition tidak valid |
| `401`  | Token tidak ada atau expired                                     |
| `403`  | Role tidak punya akses ke endpoint ini                           |
| `404`  | Resource tidak ditemukan                                         |
| `409`  | Conflict — misal: kode barang sudah ada                          |
| `422`  | Stok tidak cukup untuk SO atau Work Order                        |
