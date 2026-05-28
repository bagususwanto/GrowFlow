import { Item } from './item';
import { Warehouse } from './warehouse';

export type MutationType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';

export interface StockBalance {
  id: string;
  qty: number;
  itemId: string;
  item?: Item;
  warehouseId: string;
  warehouse?: Warehouse;
  createdAt: string;
  updatedAt: string;
}

export interface StockMutation {
  id: string;
  qty: number;
  type: MutationType;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  itemId: string;
  item?: Item;
  warehouseId: string;
  warehouse?: Warehouse;
  createdById: string | null;
  createdAt: string;
}

export interface StockAdjustmentRequest {
  itemId: string;
  warehouseId: string;
  qty: number;
  note?: string;
}

export interface ListStockMutationsQuery {
  page?: number;
  limit?: number;
  itemId?: string;
  warehouseId?: string;
  type?: MutationType;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListStockBalancesQuery {
  page?: number;
  limit?: number;
  itemId?: string;
  warehouseId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

