import { RoutePath } from '@/app/routes/configs/root.config';
import { useNavigate } from 'react-router-dom';

export const useGoBack = () => {
  const navigate = useNavigate();

  return () => {
    const canGoBack = window.history.length > 1;

    if (canGoBack) {
      navigate(-1);
    } else {
      navigate(RoutePath.Default, { replace: true });
    }
  };
};