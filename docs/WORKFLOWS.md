# WORKFLOWS.md — Mini ERP

## Purchasing (PO)

```
DRAFT → SUBMITTED → APPROVED → PARTIAL → DONE
                 ↘           ↘
              CANCELLED    CANCELLED
```

| Transisi             | Siapa            | Efek Samping                          |
| -------------------- | ---------------- | ------------------------------------- |
| DRAFT → SUBMITTED    | staff purchasing | Notifikasi ke manager                 |
| SUBMITTED → APPROVED | manager          | Jurnal hutang dagang dibuat           |
| APPROVED → PARTIAL   | sistem           | GRN pertama masuk, stok bertambah     |
| PARTIAL → DONE       | sistem           | Semua qty_ordered = qty_received      |
| \* → CANCELLED       | manager          | Jurnal di-reverse jika sudah APPROVED |

**Penerimaan Barang (GRN):**
`GRN dibuat` → validasi qty ≤ sisa PO → `stock_mutations (IN)` → update `qty_received` di PO items → cek apakah PO jadi DONE

---

## Sales (SO)

```
DRAFT → CONFIRMED → PARTIAL → DONE
              ↘
           CANCELLED
```

| Transisi                    | Siapa       | Efek Samping                             |
| --------------------------- | ----------- | ---------------------------------------- |
| DRAFT → CONFIRMED           | staff sales | Cek stok tersedia, jurnal piutang dibuat |
| CONFIRMED → PARTIAL         | sistem      | Delivery pertama dikirim, stok berkurang |
| PARTIAL → DONE              | sistem      | Semua qty_ordered = qty_delivered        |
| DRAFT/CONFIRMED → CANCELLED | manager     | Jurnal di-reverse, stok dikembalikan     |

**Pengiriman (Delivery):**
`Delivery dibuat` → validasi qty ≤ sisa SO → `stock_mutations (OUT)` → update `qty_delivered` di SO items → cek apakah SO jadi DONE

---

## Inventory — Mutasi Stok

Semua pergerakan stok wajib lewat `stock_mutations`, tidak boleh update `stock_balances` langsung.

| type         | Trigger                                    | Efek                              |
| ------------ | ------------------------------------------ | --------------------------------- |
| `IN`         | GRN dibuat                                 | `stock_balances.qty` +            |
| `OUT`        | Delivery dibuat                            | `stock_balances.qty` -            |
| `IN`         | Work Order DONE (hasil produksi)           | `stock_balances.qty` +            |
| `OUT`        | Work Order IN_PROGRESS (konsumsi komponen) | `stock_balances.qty` -            |
| `ADJUSTMENT` | Stock opname manual                        | `stock_balances.qty` diset ulang  |
| `TRANSFER`   | Pindah antar gudang                        | OUT gudang asal, IN gudang tujuan |

---

## Production / Work Order

```
DRAFT → IN_PROGRESS → DONE
           ↘
        CANCELLED
```

| Transisi            | Siapa          | Efek Samping                                      |
| ------------------- | -------------- | ------------------------------------------------- |
| DRAFT → IN_PROGRESS | staff produksi | Komponen di-OUT dari gudang (sesuai BOM × qty)    |
| IN_PROGRESS → DONE  | staff produksi | Hasil produksi di-IN ke gudang                    |
| \* → CANCELLED      | manager        | Stok komponen dikembalikan jika sudah IN_PROGRESS |

---

## HR — Payroll

```
DRAFT → APPROVED → PAID
```

| Transisi         | Siapa   | Efek Samping                            |
| ---------------- | ------- | --------------------------------------- |
| DRAFT → APPROVED | finance | Jurnal beban gaji dibuat                |
| APPROVED → PAID  | finance | Tandai sudah dibayar, tidak bisa diedit |

Perhitungan otomatis saat DRAFT dibuat:
`net_salary = basic_salary + allowances - deductions - pajak`

---

## Accounting — Jurnal Otomatis

Jurnal dibuat otomatis oleh sistem, tidak perlu input manual untuk transaksi standar.

| Event            | Debit          | Kredit        |
| ---------------- | -------------- | ------------- |
| PO APPROVED      | Persediaan     | Hutang Dagang |
| SO CONFIRMED     | Piutang Dagang | Pendapatan    |
| Payroll APPROVED | Beban Gaji     | Hutang Gaji   |
| Payroll PAID     | Hutang Gaji    | Kas/Bank      |

Jurnal manual hanya untuk penyesuaian (adjustment) oleh role `finance`.

---

## Aturan Umum

- Dokumen dengan status `DONE` atau `PAID` **tidak bisa diedit atau dihapus**.
- Pembatalan (`CANCELLED`) hanya bisa dilakukan oleh `manager` atau `superadmin`.
- Setiap perubahan status dicatat di tabel `activity_logs` (who, what, when).
