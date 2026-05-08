import { useAuthStore } from '@/common/stores/auth.store';
import { Navigate, Outlet } from 'react-router-dom';
import { RoutePath } from './configs/root.config';
import { Spinner } from '@/common/components/ui/spinner';

export function GuestRoute() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) return <Spinner />;

  if (isAuthenticated) return <Navigate to={RoutePath.Galleries} replace />;

  return <Outlet />;
}