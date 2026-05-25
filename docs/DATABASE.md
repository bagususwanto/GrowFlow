# DATABASE.md — Mini ERP

## Konvensi

| Aturan      | Detail                                            |
| ----------- | ------------------------------------------------- |
| ORM         | Prisma, schema di `apps/api/prisma/schema.prisma` |
| Naming      | `snake_case` untuk tabel & kolom                  |
| Primary key | `id` — UUID v4                                    |
| Timestamps  | `created_at`, `updated_at` di semua tabel         |
| Soft delete | `deleted_at` nullable di semua entitas utama      |
| Uang        | `integer` (satuan rupiah penuh, bukan sen)        |
| Timezone    | UTC di DB, konversi ke WIB di frontend            |

---

## Entitas & Relasi

### Auth & User

```
users
├── id, name, email, password_hash
├── role_id → roles
└── is_active

roles
├── id, name (superadmin | manager | staff | finance | warehouse)
└── permissions (JSON — daftar aksi yang diizinkan)
```

---

### Inventory

```
warehouses         # Lokasi gudang
└── id, name, address

items              # Master barang
├── id, code, name, unit, category
└── min_stock      # Batas stok minimum (trigger alert)

stock_balances     # Saldo stok per item per gudang
├── item_id → items
├── warehouse_id → warehouses
└── qty

stock_mutations    # Setiap pergerakan stok (masuk/keluar/transfer)
├── item_id, warehouse_id
├── type (IN | OUT | TRANSFER | ADJUSTMENT)
├── qty, reference_type, reference_id
└── note
```

---

### Purchasing

```
purchase_orders
├── id, po_number (PO-YYYYMM-XXXX)
├── supplier_id → partners
├── status (DRAFT | SUBMITTED | APPROVED | PARTIAL | DONE | CANCELLED)
├── ordered_at, expected_at
└── created_by → users

purchase_order_items
├── po_id → purchase_orders
├── item_id → items
├── qty_ordered, qty_received, unit_price
└── subtotal

goods_receipts     # Penerimaan barang (GRN)
├── id, grn_number, po_id → purchase_orders
├── received_at, warehouse_id → warehouses
└── created_by → users

goods_receipt_items
├── grn_id → goods_receipts
├── item_id → items
└── qty_received
```

---

### Sales

```
sales_orders
├── id, so_number (SO-YYYYMM-XXXX)
├── customer_id → partners
├── status (DRAFT | CONFIRMED | PARTIAL | DONE | CANCELLED)
├── ordered_at, due_at
└── created_by → users

sales_order_items
├── so_id → sales_orders
├── item_id → items
├── qty_ordered, qty_delivered, unit_price
└── subtotal

deliveries
├── id, delivery_number, so_id → sales_orders
├── warehouse_id → warehouses
├── delivered_at
└── created_by → users

delivery_items
├── delivery_id → deliveries
├── item_id → items
└── qty
```

---

### Accounting

```
accounts           # Chart of Accounts
├── id, code, name
├── type (ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE)
└── parent_id → accounts (self-relation untuk hirarki)

journal_entries
├── id, entry_number, date, description
├── reference_type, reference_id (polymorphic ke PO/SO/Payroll)
└── created_by → users

journal_lines      # Double-entry per jurnal
├── journal_id → journal_entries
├── account_id → accounts
├── debit, credit
└── note
```

---

### HR & Payroll

```
employees
├── id, nik, name, email, phone
├── department, position
├── join_date, basic_salary
└── user_id → users (nullable — tidak semua employee punya akun)

attendances
├── employee_id → employees
├── date, check_in, check_out
└── status (PRESENT | ABSENT | LEAVE | HOLIDAY)

payrolls            # Header penggajian per periode
├── id, period_month, period_year
└── status (DRAFT | APPROVED | PAID)

payroll_items       # Detail per karyawan per periode
├── payroll_id → payrolls
├── employee_id → employees
├── basic_salary, allowances, deductions
└── net_salary
```

---

### Production / MRP

```
bom                # Bill of Materials
├── id, finished_item_id → items
├── version, is_active
└── note

bom_lines
├── bom_id → bom
├── component_item_id → items
└── qty_required

work_orders
├── id, wo_number, bom_id → bom
├── qty_planned, qty_produced
├── status (DRAFT | IN_PROGRESS | DONE | CANCELLED)
├── planned_start, planned_end
└── created_by → users
```

---

### Shared

```
partners           # Supplier & Customer dalam satu tabel
├── id, code, name, type (SUPPLIER | CUSTOMER | BOTH)
├── email, phone, address
└── is_active

document_sequences # Auto-increment kode dokumen per tipe per bulan
├── type (PO | SO | GRN | WO | ...)
├── year, month
└── last_seq
```

---

## Relasi Antar Modul

```
GRN → stock_mutations (IN)
Delivery → stock_mutations (OUT)
Work Order selesai → stock_mutations (IN hasil produksi, OUT komponen)
PO approved → journal_entry (hutang dagang)
SO delivered → journal_entry (piutang dagang)
Payroll approved → journal_entry (beban gaji)
```
