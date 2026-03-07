import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import RestaurantSelection from "@/pages/owner/RestaurantSelection";
import RestaurantDashboard from "@/pages/owner/RestaurantDashboard";
import AreaManagement from "@/pages/owner/AreaManagement";
import TableManagement from "@/pages/owner/TableManagement";
import Navbar from "@/components/Navbar";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
