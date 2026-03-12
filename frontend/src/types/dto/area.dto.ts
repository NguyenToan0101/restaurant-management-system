export interface AreaDTO {
  areaId: string;
  branchId: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AreaCreateRequest {
  branchId: string;
  name: string;
  description?: string;
}
