import { useAuthStore } from '@/common/stores/auth.store';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RoutePath } from './configs/root.config';
import { LoadingPlug } from '../plugs/LoadingPlug';

export function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) return <LoadingPlug />

  if (!isAuthenticated) {
    return <Navigate to={RoutePath.SignIn} state={{ from: location }} replace />;
  }

  return <Outlet />;
}