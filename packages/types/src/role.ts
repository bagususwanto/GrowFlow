export interface RoleResponse {
  id: string;
  name: string;
  permissions: any[]; // Or a specific type if permissions have a defined structure
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
}
