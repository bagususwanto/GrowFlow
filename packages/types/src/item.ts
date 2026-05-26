export interface Item {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string | null;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  code: string;
  name: string;
  unit: string;
  category?: string;
  minStock?: number;
}

export interface UpdateItemRequest {
  code?: string;
  name?: string;
  unit?: string;
  category?: string;
  minStock?: number;
}

export interface ListItemsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ItemStockByWarehouse {
  warehouseId: string;
  warehouseName: string;
  qty: number;
}
