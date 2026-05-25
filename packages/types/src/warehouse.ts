export interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseRequest {
  name: string;
  address?: string;
}

export interface UpdateWarehouseRequest {
  name?: string;
  address?: string;
  isActive?: boolean;
}

export interface ListWarehousesQuery {
  page?: number;
  limit?: number;
  search?: string;
}
