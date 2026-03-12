import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import StaffLogin from "@/pages/StaffLogin";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import RestaurantSelection from "@/pages/owner/RestaurantSelection";
import RestaurantDashboard from "@/pages/owner/RestaurantDashboard";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import AdminLayout from "@/components/admin/AdminLayout";
import Statistics from "@/pages/admin/Statistics";
import PackageManagement from "@/pages/admin/PackageManagement";
import UserManagement from "@/pages/admin/UserManagement";
import AreaManagement from "@/pages/owner/AreaManagement";
import TableManagement from "@/pages/owner/TableManagement";
import Navbar from "@/components/Navbar";
import PackageSelection from "@/pages/payment/PackageSelection";
import PaymentConfirm from "@/pages/payment/PaymentConfirm";
import PaymentCheckout from "@/pages/payment/PaymentCheckout";
import PaymentSuccess from "@/pages/payment/PaymentSuccess";
import PaymentFailed from "@/pages/payment/PaymentFailed";
import PaymentCancel from "@/pages/payment/PaymentCancel";
import HomePage from "@/pages/customer/HomePage";
import TableSelectionPage from "@/pages/customer/TableSelectionPage";
import MenuPage from "@/pages/customer/MenuPage";
import CheckoutPage from "@/pages/customer/CheckoutPage";

// Staff components
import ManagerLayout from "@/components/branch_manager/ManagerLayout";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ManagerAreaManagement from "@/pages/manager/ManagerAreaManagement";
import ManagerTableManagement from "@/pages/manager/ManagerTableManagement";
import BranchInfo from "@/pages/manager/BranchInfo";
import ManagerBills from "@/pages/manager/ManagerBills";
import ManagerPromotions from "@/pages/manager/ManagerPromotions";
import ManagerStaff from "@/pages/manager/ManagerStaff";

import WaiterLayout from "@/components/waiter/WaiterLayout";
import WaiterDashboard from "@/pages/waiter/WaiterDashboard";
import WaiterTableView from "@/pages/waiter/WaiterTableView";
import WaiterOrderPage from "@/pages/waiter/WaiterOrderPage";
import WaiterHistory from "@/pages/waiter/WaiterHistory";

import ReceptionistLayout from "@/components/receptionist/ReceptionistLayout";
import ReceptionistDashboard from "@/pages/receptionist/ReceptionistDashboard";
import ReceptionistTableView from "@/pages/receptionist/ReceptionistTableView";

import ComingSoon from "@/components/ComingSoon";
import { StaffRoleName } from "@/types/dto";
// Helper: map staff role → dashboard path
const getStaffDashboard = (role: string): string => {
  switch (role) {
    case "BRANCH_MANAGER": return "/manager/dashboard";
    case "RECEPTIONIST": return "/receptionist/dashboard";
    case "WAITER": return "/waiter/dashboard";
    default: return "/staff-login";
  }
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Guard for owner-only routes (regular users, NOT staff)
const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const staffInfo = useAuthStore((state) => state.staffInfo);

  // Staff trying to access owner routes → send them back to their dashboard
  if (staffInfo && !user) {
    return <Navigate to={getStaffDashboard(staffInfo.role)} replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role?.name === "ADMIN";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Guard for staff-only routes (WAITER, BRANCH_MANAGER, RECEPTIONIST)
const StaffRoute = ({ children }: { children: React.ReactNode }) => {
  const staffInfo = useAuthStore((state) => state.staffInfo);

  if (!staffInfo) {
    return <Navigate to="/staff-login" replace />;
  }

  return <>{children}</>;
};

// Guard for specific staff roles
const StaffRoleRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: StaffRoleName[] }) => {
  const staffInfo = useAuthStore((state) => state.staffInfo);

  if (!staffInfo) {
    return <Navigate to="/staff-login" replace />;
  }

  if (!staffInfo.role || !allowedRoles.includes(staffInfo.role)) {
    return <Navigate to={getStaffDashboard(staffInfo.role)} replace />;
  }

  return <>{children}</>;
};


const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const staffInfo = useAuthStore((state) => state.staffInfo);

  if (staffInfo && !user) return <Navigate to={getStaffDashboard(staffInfo.role)} replace />;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// Guard trang chủ: staff không được ở landing page
const HomeRoute = ({ children }: { children: React.ReactNode }) => {
  const staffInfo = useAuthStore((state) => state.staffInfo);
  const user = useAuthStore((state) => state.user);

  if (staffInfo && !user) return <Navigate to={getStaffDashboard(staffInfo.role)} replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <HomeRoute>
          <Navbar />
          <Index />
        </HomeRoute>
      } />

      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/staff-login" element={
        <PublicRoute>
          <StaffLogin />
        </PublicRoute>
      } />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />

      {/* Payment routes */}
      <Route path="/payment/select" element={
        <ProtectedRoute>
          <PackageSelection />
        </ProtectedRoute>
      } />

      <Route path="/payment/confirm" element={
        <ProtectedRoute>
          <PaymentConfirm />
        </ProtectedRoute>
      } />

      <Route path="/payment/checkout" element={
        <ProtectedRoute>
          <PaymentCheckout />
        </ProtectedRoute>
      } />

      <Route path="/payment/success" element={
        <ProtectedRoute>
          <PaymentSuccess />
        </ProtectedRoute>
      } />

      <Route path="/payment/failed" element={
        <ProtectedRoute>
          <PaymentFailed />
        </ProtectedRoute>
      } />

      <Route path="/payment/cancel" element={
        <OwnerRoute>
          <PaymentCancel />
        </OwnerRoute>
      } />

      {/* Protected routes */}
      <Route path="/profile" element={
        <OwnerRoute>
          <Profile />
        </OwnerRoute>
      } />

      <Route path="/restaurants" element={
        <OwnerRoute>
          <RestaurantSelection />
        </OwnerRoute>
      } />

      <Route path="/restaurant/:id/*" element={
        <OwnerRoute>
          <RestaurantDashboard />
        </OwnerRoute>
      } />

      {/* Branch Manager routes */}
      <Route path="/manager/*" element={
        <StaffRoleRoute allowedRoles={["BRANCH_MANAGER"]}>
          <ManagerLayout />
        </StaffRoleRoute>
      }>
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="branch" element={<BranchInfo />} />
        <Route path="areas" element={<ManagerAreaManagement />} />
        <Route path="areas/:areaId/tables" element={<ManagerTableManagement />} />
        <Route path="tables" element={<ManagerTableManagement />} />
        <Route path="orders" element={<ComingSoon title="Order Management" description="Manage customer orders and track order status." />} />
        <Route path="menu" element={<ComingSoon title="Menu Management" description="Manage branch menu and items." />} />
        <Route path="bills" element={<ManagerBills />} />
        <Route path="promotions" element={<ManagerPromotions />} />
        <Route path="staff" element={<ManagerStaff />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Waiter routes */}
      <Route path="/waiter/*" element={
        <StaffRoleRoute allowedRoles={["WAITER"]}>
          <WaiterLayout />
        </StaffRoleRoute>
      }>
        <Route path="dashboard" element={<WaiterDashboard />} />
        <Route path="tables" element={<WaiterTableView />} />
        <Route path="orders" element={<WaiterOrderPage />} />
        <Route path="history" element={<WaiterHistory />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Receptionist routes */}
      <Route path="/receptionist/*" element={
        <StaffRoleRoute allowedRoles={["RECEPTIONIST"]}>
          <ReceptionistLayout />
        </StaffRoleRoute>
      }>
        <Route path="dashboard" element={<ReceptionistDashboard />} />
        <Route path="tables" element={<ReceptionistTableView />} />
        <Route path="reservations" element={<ComingSoon title="Reservations" description="Manage table reservations and bookings." />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Legacy staff dashboard routes - redirect to new structure */}
      <Route path="/dashboard/waitter" element={
        <StaffRoute>
          <Navigate to="/waiter/dashboard" replace />
        </StaffRoute>
      } />

      <Route path="/dashboard/manager/*" element={
        <StaffRoute>
          <Navigate to="/manager/dashboard" replace />
        </StaffRoute>
      } />

      <Route path="/dashboard/receptionist" element={
        <StaffRoute>
          <Navigate to="/receptionist/dashboard" replace />
        </StaffRoute>
      } />

      <Route path="/dashboard/:id/*" element={
        <OwnerRoute>
          <RestaurantDashboard />
        </OwnerRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard/*" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route path="statistics" element={<Statistics />} />
        <Route path="packages" element={<PackageManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route index element={<Navigate to="statistics" replace />} />
      </Route>
        <Route path="/dashboard/:id/branches/:branchId/areas" element={
            <ProtectedRoute>
                <AreaManagement />
            </ProtectedRoute>
        } />

        <Route path="/dashboard/:id/areas/:areaId/tables" element={
            <ProtectedRoute>
                <TableManagement />
            </ProtectedRoute>
        } />
        <Route path="/home" element={

            <HomePage/>

        } />
        <Route path="/reservations" element={

            <TableSelectionPage/>

        } />
        <Route path="/menu" element={

            <MenuPage/>

        } />
        <Route path="/checkout" element={

            <CheckoutPage/>

        } />

        {/* Dynamic slug-based customer routes */}
        <Route path="/:slug/home" element={

            <HomePage/>

        } />
        <Route path="/:slug/menu" element={

            <MenuPage/>

        } />
        <Route path="/:slug/reservations" element={

            <TableSelectionPage/>

        } />
        <Route path="/:slug/checkout" element={

            <CheckoutPage/>

        } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
