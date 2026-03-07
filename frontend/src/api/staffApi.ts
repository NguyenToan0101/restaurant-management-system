import axiosClient from './axiosClient';
import type {
  ApiResponse,
  StaffAccountBackendDTO,
  StaffAccountDTO,
  StaffAccountCreateRequest,
  StaffAccountUpdateRequest,
  PageResponse,
} from '@/types/dto';
import { mapStaffAccountFromBackend } from '@/types/dto';

class StaffAccountApi {
  async getByBranchPaginated(
    branchId: string,
    page: number,
    size: number
  ): Promise<PageResponse<StaffAccountDTO>> {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<StaffAccountBackendDTO>>
    >('/staff/manager/paginated', {
      params: { branchId, page, size },
    });

    const backendPage = response.data.result;

    return {
      ...backendPage,
      items: backendPage.items.map(mapStaffAccountFromBackend),
    };
  }

  async getById(id: string): Promise<StaffAccountDTO> {
    const response = await axiosClient.get<ApiResponse<StaffAccountBackendDTO>>(
      `/staff/${id}`
    );
    return mapStaffAccountFromBackend(response.data.result);
  }

  async create(request: StaffAccountCreateRequest): Promise<StaffAccountDTO> {
    const response = await axiosClient.post<
      ApiResponse<StaffAccountBackendDTO>
    >('/staff', request);
    return mapStaffAccountFromBackend(response.data.result);
  }

  async update(
    request: StaffAccountUpdateRequest
  ): Promise<StaffAccountDTO> {
    const response = await axiosClient.put<
      ApiResponse<StaffAccountBackendDTO>
    >('/staff', request);
    return mapStaffAccountFromBackend(response.data.result);
  }

  async toggleStatus(id: string): Promise<StaffAccountDTO> {
    const response = await axiosClient.delete<
      ApiResponse<StaffAccountBackendDTO>
    >(`/staff/${id}`);
    return mapStaffAccountFromBackend(response.data.result);
  }
}

export const staffAccountApi = new StaffAccountApi();

