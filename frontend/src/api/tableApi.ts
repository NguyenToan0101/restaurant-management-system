import axios from 'axios';
import type { AreaTableDTO } from '@/types/dto';
import { TableStatus } from '@/types/dto';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const tableApi = {
    getAll: async (): Promise<AreaTableDTO[]> => {
        const response = await api.get('/api/tables');
        return response.data.result;
    },

    getById: async (id: string): Promise<AreaTableDTO> => {
        const response = await api.get(`/api/tables/${id}`);
        return response.data.result;
    },

    getByArea: async (areaId: string): Promise<AreaTableDTO[]> => {
        const response = await api.get(`/api/tables/area/${areaId}`);
        return response.data.result;
    },

    getByBranch: async (branchId: string): Promise<AreaTableDTO[]> => {
        const response = await api.get(`/api/tables/branch/${branchId}`);
        return response.data.result;
    },

    getByAreaAndStatus: async (areaId: string, status: TableStatus): Promise<AreaTableDTO[]> => {
        const response = await api.get(`/api/tables/area/${areaId}/status/${status}`);
        return response.data.result;
    },

    create: async (data: AreaTableDTO): Promise<AreaTableDTO> => {
        const response = await api.post('/api/tables', data);
        return response.data.result;
    },

    update: async (id: string, data: Partial<AreaTableDTO>): Promise<AreaTableDTO> => {
        const response = await api.put(`/api/tables/${id}`, data);
        return response.data.result;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/tables/${id}`);
    },

    setStatus: async (id: string, status: TableStatus): Promise<AreaTableDTO> => {
        const response = await api.put(`/api/tables/${id}/status?status=${status}`);
        return response.data.result;
    },

    markOutOfOrder: async (id: string): Promise<AreaTableDTO> => {
        const response = await api.put(`/api/tables/${id}/out-of-order`);
        return response.data.result;
    },

    markAvailable: async (id: string): Promise<AreaTableDTO> => {
        const response = await api.put(`/api/tables/${id}/available`);
        return response.data.result;
    },

    getByQrCode: async (qrCode: string): Promise<AreaTableDTO> => {
        const response = await api.get(`/api/tables/qr?qrCode=${encodeURIComponent(qrCode)}`);
        return response.data.result;
    },
};
