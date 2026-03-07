import axiosClient from './axiosClient';
import { ApiResponse, CustomizationDTO, CustomizationCreateRequest } from '@/types/dto';

export const customizationApi = {
  getAllByRestaurant: (restaurantId: string) =>
    axiosClient.get<ApiResponse<CustomizationDTO[]>>('/customizations', {
      params: { restaurantId },
    }),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<CustomizationDTO>>(`/customizations/${id}`),

  create: (data: CustomizationCreateRequest) =>
    axiosClient.post<ApiResponse<CustomizationDTO>>('/customizations', data),

  update: (id: string, data: CustomizationDTO) =>
    axiosClient.put<ApiResponse<CustomizationDTO>>(`/customizations/${id}`, data),

  delete: (id: string) =>
    axiosClient.delete<ApiResponse<void>>(`/customizations/${id}`),

  getByCategory: (categoryId: string) =>
    axiosClient.get<ApiResponse<string[]>>(`/customizations/category/${categoryId}`),
};
