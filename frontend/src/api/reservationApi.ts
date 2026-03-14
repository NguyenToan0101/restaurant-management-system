import axiosClient from './axiosClient';
import type { ApiResponse, ReservationDTO, ReservationCreateRequest } from '@/types/dto';

class ReservationApi {
    async getAll(): Promise<ReservationDTO[]> {
        const response = await axiosClient.get<ApiResponse<ReservationDTO[]>>('/reservations');
        return response.data.result;
    }

    async getById(id: string): Promise<ReservationDTO> {
        const response = await axiosClient.get<ApiResponse<ReservationDTO>>(`/reservations/${id}`);
        return response.data.result;
    }

    async getByBranch(branchId: string): Promise<ReservationDTO[]> {
        const response = await axiosClient.get<ApiResponse<ReservationDTO[]>>(`/reservations/branch/${branchId}`);
        return response.data.result;
    }

    async getByTable(areaTableId: string): Promise<ReservationDTO[]> {
        const response = await axiosClient.get<ApiResponse<ReservationDTO[]>>(`/reservations/table/${areaTableId}`);
        return response.data.result;
    }

    async create(data: ReservationCreateRequest): Promise<ReservationDTO> {
        const response = await axiosClient.post<ApiResponse<ReservationDTO>>('/reservations', data);
        return response.data.result;
    }

    async update(id: string, data: Partial<ReservationDTO>): Promise<ReservationDTO> {
        const response = await axiosClient.put<ApiResponse<ReservationDTO>>(`/reservations/${id}`, data);
        return response.data.result;
    }

    async delete(id: string): Promise<void> {
        await axiosClient.delete<ApiResponse<void>>(`/reservations/${id}`);
    }
}

export const reservationApi = new ReservationApi();
