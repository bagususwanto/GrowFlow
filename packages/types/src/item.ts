export interface CategoryItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  unit: string;
  categoryId: string | null;
  category?: CategoryItem | null;
  minStock: number;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  code: string;
  name: string;
  unit: string;
  categoryId?: string | null;
  minStock?: number;
}

export interface UpdateItemRequest {
  code?: string;
  name?: string;
  unit?: string;
  categoryId?: string | null;
  minStock?: number;
  isActive?: boolean;
}

export interface ListItemsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'all' | 'active' | 'inactive';
}

export interface ItemStockByWarehouse {
  warehouseId: string;
  warehouseName: string;
  qty: number;
}

export interface CreateCategoryItemRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryItemRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ListCategoryItemsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'all' | 'active' | 'inactive';
}
