export type PartnerType = 'SUPPLIER' | 'CUSTOMER' | 'BOTH';

export interface Partner {
  id: string;
  code: string;
  name: string;
  type: PartnerType;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerRequest {
  code: string;
  name: string;
  type: PartnerType;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdatePartnerRequest {
  code?: string;
  name?: string;
  type?: PartnerType;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface ListPartnersQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: PartnerType;
}
