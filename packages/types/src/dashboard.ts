import { PurchaseOrder } from './purchase-order';
import { SalesOrder } from './sales-order';
import { Item } from './item';

export interface DashboardSummaryResponse {
  // Operational Metrics
  totalItems?: number;
  totalPurchaseOrders?: number;
  totalSalesOrders?: number;
  pendingPurchaseOrders?: number; // SUBMITTED status (waiting for approval)
  pendingSalesOrders?: number; // CONFIRMED status (waiting for delivery)

  // Alerts
  lowStockItems?: Item[];

  // Recent logs/tables
  recentPurchaseOrders?: PurchaseOrder[];
  recentSalesOrders?: SalesOrder[];
}
