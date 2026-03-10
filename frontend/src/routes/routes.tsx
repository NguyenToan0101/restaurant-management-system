import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import RestaurantSelection from "@/pages/owner/RestaurantSelection";
import RestaurantDashboard from "@/pages/owner/RestaurantDashboard";
import AdminLayout from "@/components/admin/AdminLayout";
import Statistics from "@/pages/admin/Statistics";
import PackageManagement from "@/pages/admin/PackageManagement";
import UserManagement from "@/pages/admin/UserManagement";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/customer/HomePage";
import TableSelectionPage from "@/pages/customer/TableSelectionPage";
import MenuPage from "@/pages/customer/MenuPage";
import CheckoutPage from "@/pages/customer/CheckoutPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
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

      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/restaurants" element={
        <ProtectedRoute>
          <RestaurantSelection />
        </ProtectedRoute>
      } />

      <Route path="/restaurant/:id/*" element={
        <ProtectedRoute>
          <RestaurantDashboard />
        </ProtectedRoute>
      } />
    
      <Route path="/dashboard/:id/*" element={
        <ProtectedRoute>
          <RestaurantDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <RestaurantDashboard />
        </ProtectedRoute>
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
      <Route path="/home" element={
        <PublicRoute>
          <HomePage/>
        </PublicRoute>
      } />
      <Route path="/reservations" element={
        <PublicRoute>
          <TableSelectionPage/>
        </PublicRoute>
      } />
      <Route path="/menu" element={
        <PublicRoute>
          <MenuPage/>
        </PublicRoute>
      } />
      <Route path="/checkout" element={
        <PublicRoute>
          <CheckoutPage/>
        </PublicRoute>
      } />
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
