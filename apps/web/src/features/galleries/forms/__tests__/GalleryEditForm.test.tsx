import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { GalleryEditForm } from '../GalleryEditForm';
import { createWrapper } from '@/common/utils/test-utils/queryWrapper';

vi.mock('../../gueries/gallery.queries', () => ({
  useGetGalleryById: vi.fn(() => ({
    data: { id: 1, title: 'My Gallery', description: 'Some desc' },
    isLoading: false,
  })),
}));

vi.mock('@/features/images/gueries/images.queries', () => ({
  useGetMyImages: vi.fn(() => ({
    data: [{ id: 10, path: '/img.jpg', name: 'Img', comment: 'cmt' }],
    isLoading: false,
  })),
}));

vi.mock('../../gueries/gallery.mutations', () => ({
  useUpdateGallery: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock('@/features/images/gueries/images.mutations', () => ({
  useUpdateImage: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useSoftDeleteImage: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

const renderComponent = () => {
  const Wrapper = createWrapper();
  return render(
    <Wrapper>
      <MemoryRouter initialEntries={['/galleries/1/edit']}>
        <Routes>
          <Route path="/galleries/:id/edit" element={<GalleryEditForm />} />
        </Routes>
      </MemoryRouter>
    </Wrapper>
  );
};

describe('GalleryEditForm', () => {
  it('renders header title', () => {
    renderComponent();
    expect(screen.getByText('Edit Description')).toBeInTheDocument();
  });

  it('renders header description text', () => {
    renderComponent();
    expect(screen.getByText(/edit description for your gallery/i)).toBeInTheDocument();
  });

  it('prefills title from fetched gallery data', async () => {
    renderComponent();
    const titleInput = await screen.findByDisplayValue('My Gallery');
    expect(titleInput).toBeInTheDocument();
  });

  it('prefills description from fetched gallery data', async () => {
    renderComponent();
    const descTextarea = await screen.findByDisplayValue('Some desc');
    expect(descTextarea).toBeInTheDocument();
  });

  it('renders "Save changes" submit button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('renders image from loaded images list', async () => {
    renderComponent();
    const img = await screen.findByAltText('Photo 1');
    expect(img).toHaveAttribute('src', '/img.jpg');
  });
});