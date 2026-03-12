import axiosClient from './axiosClient';
import type { ApiResponse, AreaTableDTO, AreaTableCreateRequest, TableStatus } from '@/types/dto';

class AreaTableApi {
    async getAll(): Promise<AreaTableDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO[]>>('/area-tables');
        return response.data.result;
    }

    async getById(id: string): Promise<AreaTableDTO> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO>>(`/area-tables/${id}`);
        return response.data.result;
    }

    async getByArea(areaId: string): Promise<AreaTableDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO[]>>(`/area-tables/area/${areaId}`);
        return response.data.result;
    }

    async getByBranch(branchId: string): Promise<AreaTableDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO[]>>(`/area-tables/branch/${branchId}`);
        return response.data.result;
    }

    async getAvailableByArea(areaId: string): Promise<AreaTableDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO[]>>(`/area-tables/area/${areaId}/available`);
        return response.data.result;
    }

    async getAvailableByBranch(branchId: string): Promise<AreaTableDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaTableDTO[]>>(`/area-tables/branch/${branchId}/available`);
        return response.data.result;
    }

    async create(data: AreaTableCreateRequest): Promise<AreaTableDTO> {
        const response = await axiosClient.post<ApiResponse<AreaTableDTO>>('/area-tables', data);
        return response.data.result;
    }

    async update(id: string, data: Partial<AreaTableDTO>): Promise<AreaTableDTO> {
        const response = await axiosClient.put<ApiResponse<AreaTableDTO>>(`/area-tables/${id}`, data);
        return response.data.result;
    }

    async updateStatus(id: string, status: TableStatus): Promise<AreaTableDTO> {
        const response = await axiosClient.patch<ApiResponse<AreaTableDTO>>(`/area-tables/${id}/status`, { status });
        return response.data.result;
    }

    async delete(id: string): Promise<void> {
        await axiosClient.delete<ApiResponse<void>>(`/area-tables/${id}`);
    }
}

export const areaTableApi = new AreaTableApi();
