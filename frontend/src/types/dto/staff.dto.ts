import type { RoleDTO } from './user.dto';

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export type StaffRoleName =
  | 'ADMIN'
  | 'RESTAURANT_OWNER'
  | 'BRANCH_MANAGER'
  | 'WAITER'
  | 'RECEPTIONIST';

export interface StaffAccountBackendDTO {
  staffAccountId: string;
  role: RoleDTO;
  username: string;
  status: EntityStatus;
  branchId: string;
}

export interface StaffAccountDTO {
  id: string;
  username: string;
  role: RoleDTO;
  status: EntityStatus;
  isActive: boolean;
  branchId: string;
}

export interface StaffAccountCreateRequest {
  username: string;
  password: string;
  branchId: string;
  role: RoleDTO;
}

export interface StaffAccountUpdateRequest {
  staffAccountId: string;
  username: string;
  role: RoleDTO;
  status?: EntityStatus;
  branchId: string;
}

export interface PageResponse<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
}

export function mapStaffAccountFromBackend(
  backend: StaffAccountBackendDTO
): StaffAccountDTO {
  return {
    id: backend.staffAccountId,
    username: backend.username,
    role: backend.role,
    status: backend.status,
    isActive: backend.status === 'ACTIVE',
    branchId: backend.branchId,
  };
}

