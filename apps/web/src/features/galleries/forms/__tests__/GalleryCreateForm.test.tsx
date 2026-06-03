import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { GalleryCreateForm } from '../GalleryCreateForm';
import { createWrapper } from '@/common/utils/test-utils/queryWrapper';

vi.mock('../../gueries/gallery.mutations', () => ({
  useCreateGallery: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 1 }),
    isPending: false,
  })),
}));

vi.mock('../../hooks/useSubmitUpload', () => ({
  useSubmitUpload: vi.fn(() => ({
    uploadProgress: { isVisible: false, status: 'idle', progress: 0, fileName: '', fileSize: 0 },
    resetUploadProgress: vi.fn(),
    uploadFiles: vi.fn().mockResolvedValue({ successCount: 0 }),
    isUploadingImages: false,
  })),
}));

vi.mock('../../hooks/useUploads', () => ({
  useUploads: vi.fn(() => ({
    fields: [],
    uploads: [],
    isDisabled: false,
    handleFiles: vi.fn(),
    handleRemove: vi.fn(),
    handleDeleteAll: vi.fn(),
    getPreviewUrl: vi.fn(),
  })),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => vi.fn() };
});

const renderComponent = () => {
  const Wrapper = createWrapper();
  return render(
    <Wrapper>
      <MemoryRouter>
        <GalleryCreateForm />
      </MemoryRouter>
    </Wrapper>
  );
};

describe('GalleryCreateForm', () => {
  it('renders header title', () => {
    renderComponent();
    expect(screen.getByText('Upload Photos')).toBeInTheDocument();
  });

  it('renders header description', () => {
    renderComponent();
    expect(screen.getByText(/you can upload one photo/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /create a new gallery/i })).toBeInTheDocument();
  });

  it('renders gallery name input', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('Gallery name')).toBeInTheDocument();
  });
});