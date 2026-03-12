import axiosClient from './axiosClient';
import type { ApiResponse, AreaDTO, AreaCreateRequest } from '@/types/dto';

class AreaApi {
    async getAll(): Promise<AreaDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaDTO[]>>('/areas');
        return response.data.result;
    }

    async getById(id: string): Promise<AreaDTO> {
        const response = await axiosClient.get<ApiResponse<AreaDTO>>(`/areas/${id}`);
        return response.data.result;
    }

    async getByBranch(branchId: string): Promise<AreaDTO[]> {
        const response = await axiosClient.get<ApiResponse<AreaDTO[]>>(`/areas/branch/${branchId}`);
        return response.data.result;
    }
    
    async create(data: AreaCreateRequest): Promise<AreaDTO> {
        const response = await axiosClient.post<ApiResponse<AreaDTO>>('/areas', data);
        return response.data.result;
    }

    async update(id: string, data: Partial<AreaDTO>): Promise<AreaDTO> {
        const response = await axiosClient.put<ApiResponse<AreaDTO>>(`/areas/${id}`, data);
        return response.data.result;
    }

    async delete(id: string): Promise<void> {
        await axiosClient.delete<ApiResponse<void>>(`/areas/${id}`);
    }
}

export const areaApi = new AreaApi();
