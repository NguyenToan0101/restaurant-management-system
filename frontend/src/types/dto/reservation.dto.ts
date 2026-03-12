export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ReservationDTO {
  reservationId: string;
  branchId: string;
  areaTableId?: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  guestNumber: number;
  note?: string;
  status: ReservationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReservationCreateRequest {
  branchId: string;
  areaTableId?: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  guestNumber: number;
  note?: string;
}
