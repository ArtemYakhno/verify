import { useAuthStore } from '@/common/stores/auth.store';
import { Navigate, Outlet } from 'react-router-dom';
import { RoutePath } from './configs/root.config';
import { LoadingPlug } from '../plugs/LoadingPlug';

export function GuestRoute() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) return <LoadingPlug />;

  if (isAuthenticated) return <Navigate to={RoutePath.Galleries} replace />;

  return <Outlet />;
}