import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { GalleryUploadForm } from '../GalleryUploadForm';
import { createWrapper } from '@/common/utils/test-utils/queryWrapper';

vi.mock('../../gueries/gallery.queries', () => ({
  useGetGalleryById: vi.fn(() => ({
    data: { id: 2, title: 'Test Gallery', imagesCount: 3 },
    isLoading: false,
  })),
}));

vi.mock('../../hooks/useSubmitUpload', () => ({
  useSubmitUpload: vi.fn(() => ({
    uploadProgress: { isVisible: false, status: 'idle', progress: 0, fileName: '', fileSize: 0 },
    uploadFiles: vi.fn().mockResolvedValue({ successCount: 1 }),
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
      <MemoryRouter initialEntries={['/galleries/2/upload']}>
        <Routes>
          <Route path="/galleries/:id/upload" element={<GalleryUploadForm />} />
        </Routes>
      </MemoryRouter>
    </Wrapper>
  );
};

describe('GalleryUploadForm', () => {
  it('renders header title', () => {
    renderComponent();
    expect(screen.getByText('Edit And Upload Photos')).toBeInTheDocument();
  });

  it('renders header description', () => {
    renderComponent();
    expect(screen.getByText(/edit and upload new photos/i)).toBeInTheDocument();
  });

  it('renders "Upload photos" button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /upload photos/i })).toBeInTheDocument();
  });

  it('does NOT render gallery name field (upload mode only)', () => {
    renderComponent();
    expect(screen.queryByPlaceholderText('Gallery name')).not.toBeInTheDocument();
  });
});