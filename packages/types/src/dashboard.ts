import { PurchaseOrder } from './purchase-order';
import { SalesOrder } from './sales-order';

export interface LowStockItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  minStock: number;
  currentStock: number;
  warehouseName: string;
  itemId: string;
  warehouseId?: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

export interface DashboardSummaryResponse {
  // Operational Metrics
  totalItems?: number;
  totalPurchaseOrders?: number;
  totalSalesOrders?: number;
  pendingPurchaseOrders?: number; // SUBMITTED status (waiting for approval)
  pendingSalesOrders?: number; // CONFIRMED status (waiting for delivery)

  // Alerts
  lowStockItems?: LowStockItem[];

  // Recent logs/tables
  recentPurchaseOrders?: PurchaseOrder[];
  recentSalesOrders?: SalesOrder[];
}
