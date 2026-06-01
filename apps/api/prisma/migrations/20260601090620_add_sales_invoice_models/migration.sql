-- CreateEnum
CREATE TYPE "SalesInvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIAL', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalesCreditNoteStatus" AS ENUM ('DRAFT', 'APPLIED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "SalesOrderStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "payment_terms_days" INTEGER DEFAULT 30;

-- CreateTable
CREATE TABLE "sales_invoices" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "status" "SalesInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "invoice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "payment_terms_days" INTEGER NOT NULL DEFAULT 30,
    "total_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_by_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_invoice_line_items" (
    "id" TEXT NOT NULL,
    "sales_invoice_id" TEXT NOT NULL,
    "so_line_item_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price" DECIMAL(18,2) NOT NULL,
    "total_price" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_invoice_payments" (
    "id" TEXT NOT NULL,
    "sales_invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "recorded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_invoice_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_credit_notes" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "sales_invoice_id" TEXT NOT NULL,
    "status" "SalesCreditNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "amount" DECIMAL(18,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "issued_at" TIMESTAMP(3),
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sales_invoices_number_key" ON "sales_invoices"("number");

-- CreateIndex
CREATE UNIQUE INDEX "sales_invoices_sales_order_id_key" ON "sales_invoices"("sales_order_id");

-- CreateIndex
CREATE INDEX "sales_invoices_status_customer_id_created_at_idx" ON "sales_invoices"("status", "customer_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sales_credit_notes_number_key" ON "sales_credit_notes"("number");

-- CreateIndex
CREATE INDEX "delivery_notes_status_created_at_idx" ON "delivery_notes"("status", "created_at");

-- CreateIndex
CREATE INDEX "goods_receipts_status_created_at_idx" ON "goods_receipts"("status", "created_at");

-- CreateIndex
CREATE INDEX "items_deleted_at_is_active_category_id_idx" ON "items"("deleted_at", "is_active", "category_id");

-- CreateIndex
CREATE INDEX "purchase_orders_status_supplier_id_created_at_idx" ON "purchase_orders"("status", "supplier_id", "created_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_expires_at_idx" ON "refresh_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "sales_orders_status_customer_id_created_at_idx" ON "sales_orders"("status", "customer_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_balances_item_id_warehouse_id_idx" ON "stock_balances"("item_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "stock_mutations_item_id_warehouse_id_created_at_type_idx" ON "stock_mutations"("item_id", "warehouse_id", "created_at", "type");

-- CreateIndex
CREATE INDEX "users_deleted_at_is_active_idx" ON "users"("deleted_at", "is_active");

-- AddForeignKey
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoice_line_items" ADD CONSTRAINT "sales_invoice_line_items_sales_invoice_id_fkey" FOREIGN KEY ("sales_invoice_id") REFERENCES "sales_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoice_payments" ADD CONSTRAINT "sales_invoice_payments_sales_invoice_id_fkey" FOREIGN KEY ("sales_invoice_id") REFERENCES "sales_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_credit_notes" ADD CONSTRAINT "sales_credit_notes_sales_invoice_id_fkey" FOREIGN KEY ("sales_invoice_id") REFERENCES "sales_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
