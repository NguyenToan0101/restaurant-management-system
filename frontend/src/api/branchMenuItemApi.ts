import axiosClient from './axiosClient';
import type { ApiResponse } from '@/types/dto';
import type { BranchMenuItemDTO } from '@/types/dto/branch-menu-item.dto';

export const branchMenuItemApi = {
  getMenuItemsByBranch: async (branchId: string): Promise<BranchMenuItemDTO[]> => {
    const response = await axiosClient.get<ApiResponse<BranchMenuItemDTO[]>>(
      `/branch-menu-items/branch/${branchId}`
    );
    return response.data.result || [];
  },

  updateAvailability: async (
    branchId: string,
    menuItemId: string,
    available: boolean
  ): Promise<void> => {
    await axiosClient.put('/branch-menu-items/availability', null, {
      params: { branchId, menuItemId, available },
    });
  },
};
