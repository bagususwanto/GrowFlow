export interface RoleResponse {
  id: string;
  name: string;
  permissions: string[]; // Or a specific type if permissions have a defined structure
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  permissions?: string[];
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

