import { useAuthStore } from '@/stores/authStore';

export const useRoleAccess = () => {
    const user = useAuthStore((state) => state.user);
    const staffInfo = useAuthStore((state) => state.staffInfo);

    // Check if current user is Restaurant Owner
    const isRestaurantOwner = !!user && user.role?.name === 'RESTAURANT_OWNER';

    // Check if current user is Branch Manager
    const isBranchManager = !!staffInfo && staffInfo.role === 'BRANCH_MANAGER';

    // Check if current user is Waiter
    const isWaiter = !!staffInfo && staffInfo.role === 'WAITER';

    // Check if current user is Receptionist
    const isReceptionist = !!staffInfo && staffInfo.role === 'RECEPTIONIST';

    const canManageAreas = isRestaurantOwner || isBranchManager;
    const canManageTables = isRestaurantOwner || isBranchManager;

    // All authenticated users can view areas and tables
    const canViewAreas = !!user || !!staffInfo;
    const canViewTables = !!user || !!staffInfo;

    // Get current user role name for display
    const currentRole = user?.role?.name || staffInfo?.role || null;

    return {
        isRestaurantOwner,
        isBranchManager,
        isWaiter,
        isReceptionist,
        canManageAreas,
        canManageTables,
        canViewAreas,
        canViewTables,
        currentRole,
    };
};