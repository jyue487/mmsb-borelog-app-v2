// ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContextProvider";

export function ProtectedRoute() {
  const { userId, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!userId) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}