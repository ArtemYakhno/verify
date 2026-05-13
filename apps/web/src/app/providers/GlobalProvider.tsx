import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../common/queries/queryClient';
import { AuthInitializer } from './AuthInitializer';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Root } from '../routes/Root';
import { SuccessModal } from '../modals/SuccessModal';
import { useCloseSuccessModal, useSuccessModalDescription, useSuccessModalOpen, useSuccessModalTitle } from '@/common/stores/success-modal.store';

export const GlobalProvider = () => {
  const isOpen = useSuccessModalOpen();
  const title = useSuccessModalTitle();
  const description = useSuccessModalDescription();
  const close = useCloseSuccessModal();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <Root />
      </AuthInitializer>
      <SuccessModal
        isOpen={isOpen}
        onClose={close}
        title={title}
        description={description}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>

  );
};
