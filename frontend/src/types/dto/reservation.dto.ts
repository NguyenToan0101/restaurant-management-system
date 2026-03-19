export enum ReservationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface ReservationDTO {
  reservationId: string;
  branchId: string;
  areaTableId?: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guestNumber: number;
  note?: string;
  status: ReservationStatus;
  arrivalTime?: string;
  completionTime?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  branchName?: string;
  branchAddress?: string;
  tableTag?: string;
  tableCapacity?: number;
  serviceDurationMinutes?: number;
}

export interface CreateReservationRequest {
  branchId: string;
  areaTableId?: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guestNumber: number;
  note?: string;
}

export interface RejectReservationRequest {
  reason?: string;
}

export interface ReservationAnalyticsDTO {
  totalReservations: number;
  pendingCount: number;
  approvedCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  approvalRate: number;
  noShowRate: number;
  averageServiceDurationMinutes: number;
  reservationsByDate: Record<string, number>;
  reservationsByTimeSlot: Record<string, number>;
}

export interface ReservationFilterParams {
  statuses?: ReservationStatus[];
  startDate?: string;
  endDate?: string;
  search?: string;
}
