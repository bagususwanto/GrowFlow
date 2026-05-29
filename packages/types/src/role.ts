export interface RoleResponse {
  id: string;
  name: string;
  permissions: any[]; // Or a specific type if permissions have a defined structure
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  permissions?: any[];
}

export interface UpdateRoleRequest {
  name?: string;
  permissions?: any[];
  isActive?: boolean;
}

export interface ListRolesQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'all' | 'active' | 'inactive';
}

