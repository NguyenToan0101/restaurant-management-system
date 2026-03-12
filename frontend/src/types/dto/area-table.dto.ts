export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  BOOKED = 'BOOKED',
  RESERVED = 'RESERVED',
}

export interface AreaTableDTO {
  areaTableId: string;
  areaId: string;
  tag: string;
  capacity: number;
  status: TableStatus;
  qr?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AreaTableCreateRequest {
  areaId: string;
  tag: string;
  capacity: number;
  status?: TableStatus;
}
