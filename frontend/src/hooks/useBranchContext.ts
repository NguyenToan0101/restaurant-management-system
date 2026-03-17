import { useAuthStore } from "@/stores/authStore";

/**
 * Hook to get branch ID for manager dashboard
 * - For staff accounts: uses branchId from staffInfo
 * - For restaurant owners: uses branchId from localStorage (set when accessing from branch selection)
 */
export const useBranchContext = () => {
  const { user, staffInfo } = useAuthStore();
  
  // If user is staff, use their assigned branch
  if (staffInfo?.branchId) {
    return {
      branchId: staffInfo.branchId,
      isStaff: true,
      isOwner: false
    };
  }
  
  // If user is restaurant owner, use selected branch from localStorage
  if (user?.role?.name === 'RESTAURANT_OWNER') {
    const selectedBranchId = localStorage.getItem('selectedBranchId');
    return {
      branchId: selectedBranchId,
      isStaff: false,
      isOwner: true
    };
  }
  
  return {
    branchId: null,
    isStaff: false,
    isOwner: false
  };
};