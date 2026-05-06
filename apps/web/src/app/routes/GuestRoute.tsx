import { useAuthStore } from '@/common/stores/auth.store';
import { Navigate, Outlet } from 'react-router-dom';
import { RoutePath } from './configs/root.config';

export function GuestRoute() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) return null;

  if (isAuthenticated) return <Navigate to={RoutePath.Gallery} replace />;

  return <Outlet />;
}