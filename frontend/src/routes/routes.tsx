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
    const role = staffInfo.role;
    if (role === 'WAITER') return <Navigate to="/dashboard/waitter" replace />;
    if (role === 'BRANCH_MANAGER') return <Navigate to="/dashboard/manager" replace />;
    if (role === 'RECEPTIONIST') return <Navigate to="/dashboard/receptionist" replace />;
    return <Navigate to="/staff-login" replace />;
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

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <>
          <Navbar />
          <Index />
        </>
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

      {/* Staff dashboard routes - must be before /dashboard/:id/* */}
      <Route path="/dashboard/waitter" element={
        <StaffRoute>
          <NotFound />
        </StaffRoute>
      } />

      <Route path="/dashboard/manager/*" element={
        <StaffRoute>
          <ManagerDashboard />
        </StaffRoute>
      } />

      <Route path="/dashboard/receptionist" element={
        <StaffRoute>
          <NotFound />
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

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
