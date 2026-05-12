import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../common/queries/queryClient';
import { AuthInitializer } from './AuthInitializer';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Root } from '../routes/Root';

export const GlobalProvider = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <Root />
      </AuthInitializer>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
