import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffAccountApi } from '@/api/staffApi';
import type {
  PageResponse,
  StaffAccountDTO,
  StaffAccountCreateRequest,
  StaffAccountUpdateRequest,
} from '@/types/dto';
import { useToast } from '@/hooks/use-toast';

export const useStaffByBranch = (
  branchId?: string,
  page = 1,
  size = 20
) => {
  return useQuery({
    queryKey: ['staff', 'branch', branchId, page, size],
    queryFn: async () => {
      if (!branchId) {
        throw new Error('Branch ID is required');
      }
      const pageData: PageResponse<StaffAccountDTO> =
        await staffAccountApi.getByBranchPaginated(branchId, page, size);
      return pageData;
    },
    enabled: !!branchId,
  });
};

export const useCreateStaffAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: StaffAccountCreateRequest) =>
      staffAccountApi.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['staff', 'branch', variables.branchId],
      });
      toast({
        title: 'Staff created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create staff',
        description: error?.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateStaffAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: StaffAccountUpdateRequest) =>
      staffAccountApi.update(data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ['staff', 'branch', updated.branchId],
      });
      toast({
        title: 'Staff updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update staff',
        description: error?.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useToggleStaffStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (staffId: string) => staffAccountApi.toggleStatus(staffId),
    onMutate: async (staffId: string) => {
      await queryClient.cancelQueries({ queryKey: ['staff', 'branch'] });

      const previousData = queryClient.getQueriesData<PageResponse<StaffAccountDTO>>({
        queryKey: ['staff', 'branch'],
      });

      queryClient.setQueriesData<PageResponse<StaffAccountDTO>>(
        { queryKey: ['staff', 'branch'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((staff) =>
              staff.id === staffId
                ? {
                    ...staff,
                    isActive: !staff.isActive,
                    status: staff.isActive ? 'INACTIVE' : 'ACTIVE',
                  }
                : staff
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast({
        title: 'Failed to update status',
        description: error?.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'branch'] });
    },
  });
};

