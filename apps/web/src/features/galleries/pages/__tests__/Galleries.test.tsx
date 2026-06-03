import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUseGetGalleries = vi.fn();

vi.mock('../../gueries/gallery.queries', () => ({
  useGetGalleries: (...args: unknown[]) => mockUseGetGalleries(...args),
  useGetGalleryById: vi.fn(),
  useGetMyGalleries: vi.fn(),
}));

vi.mock('../../hooks/useGalleriesParams', () => ({
  useGalleriesParams: () => ({
    params: {
      page: 1,
      perPage: 12,
      orderBy: 'createdAt',
      orderDir: 'desc',
      search: '',
      createdFrom: null,
      createdTo: null,
      minImages: null,
      maxImages: null,
    },
    setPage: vi.fn(),
    setSearch: vi.fn(),
    setFilters: vi.fn(),
    setPerPage: vi.fn(),
    setSorting: vi.fn(),
    resetFilters: vi.fn(),
  }),
}));

vi.mock('../../blocks/Gallery/GalleryList', () => ({
  GalleryList: ({ galleries }: { galleries: { id: number; title: string }[] }) => (
    <div data-testid="gallery-list">
      {galleries.map((g) => (
        <div key={g.id} data-testid="gallery-card">{g.title}</div>
      ))}
    </div>
  ),
}));

vi.mock('../../blocks/Gallery/GalleryFooter', () => ({
  GalleryFooter: () => <div data-testid="gallery-footer" />,
}));

vi.mock('../../blocks/Gallery/GalleryPlug', () => ({
  GalleryPlug: ({ variant }: { variant: string }) => (
    <div data-testid={`gallery-plug-${variant}`} />
  ),
}));

vi.mock('../../blocks/Gallery/Header/GalleryHeader', () => ({
  GalleryHeader: () => <div data-testid="gallery-header" />,
}));

vi.mock('@/common/components/ui/loading-plug', () => ({
  LoadingPlug: () => <div data-testid="loading-plug" />,
}));

import { Galleries } from '../Galleries';
import { createWrapper } from '@/common/utils/test-utils/queryWrapper';


const renderGalleries = () =>
  render(<Galleries />, { wrapper: createWrapper() });

const galleries = [
  { id: 1, title: 'Gallery One', imagesCount: 5 },
  { id: 2, title: 'Gallery Two', imagesCount: 3 },
];

const meta = { total: 2, page: 1, perPage: 12, totalPages: 1 };

describe('Galleries', () => {
  beforeEach(() => {
    mockUseGetGalleries.mockReset();
  });

  describe('Loading state', () => {
    it('shows LoadingPlug while fetching', () => {
      mockUseGetGalleries.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      });

      renderGalleries();

      expect(screen.getByTestId('loading-plug')).toBeInTheDocument();
      expect(screen.queryByTestId('gallery-list')).toBeNull();
    });

    it('always renders GalleryHeader regardless of loading state', () => {
      mockUseGetGalleries.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      });

      renderGalleries();

      expect(screen.getByTestId('gallery-header')).toBeInTheDocument();
    });
  });

  describe('Success state', () => {
    beforeEach(() => {
      mockUseGetGalleries.mockReturnValue({
        data: { data: galleries, meta },
        isLoading: false,
        isError: false,
        error: null,
      });
    });

    it('renders GalleryList with fetched galleries', () => {
      renderGalleries();

      expect(screen.getByTestId('gallery-list')).toBeInTheDocument();
      expect(screen.getAllByTestId('gallery-card')).toHaveLength(2);
    });

    it('renders gallery titles', () => {
      renderGalleries();

      expect(screen.getByText('Gallery One')).toBeInTheDocument();
      expect(screen.getByText('Gallery Two')).toBeInTheDocument();
    });

    it('renders GalleryFooter when meta is present', () => {
      renderGalleries();

      expect(screen.getByTestId('gallery-footer')).toBeInTheDocument();
    });

    it('does not render GalleryPlug on success', () => {
      renderGalleries();

      expect(screen.queryByTestId('gallery-plug-empty')).toBeNull();
      expect(screen.queryByTestId('gallery-plug-error')).toBeNull();
    });
  });

  describe('Empty state', () => {
    beforeEach(() => {
      mockUseGetGalleries.mockReturnValue({
        data: { data: [], meta: { total: 0, page: 1, perPage: 12, totalPages: 0 } },
        isLoading: false,
        isError: false,
        error: null,
      });
    });

    it('renders empty GalleryPlug when no galleries', () => {
      renderGalleries();

      expect(screen.getByTestId('gallery-plug-empty')).toBeInTheDocument();
    });

    it('does not render GalleryList when empty', () => {
      renderGalleries();

      expect(screen.queryByTestId('gallery-list')).toBeNull();
    });

    it('does not render GalleryFooter when empty', () => {
      renderGalleries();

      expect(screen.queryByTestId('gallery-footer')).toBeNull();
    });
  });

  describe('Error state', () => {
    beforeEach(() => {
      mockUseGetGalleries.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
      });
    });

    it('renders error GalleryPlug on fetch error', () => {
      renderGalleries();

      expect(screen.getByTestId('gallery-plug-error')).toBeInTheDocument();
    });

    it('does not render GalleryList on error', () => {
      renderGalleries();

      expect(screen.queryByTestId('gallery-list')).toBeNull();
    });

    it('does not render GalleryFooter on error', () => {
      renderGalleries();

      expect(screen.queryByTestId('gallery-footer')).toBeNull();
    });
  });

  describe('Without meta', () => {
    it('does not render GalleryFooter when meta is undefined', () => {
      mockUseGetGalleries.mockReturnValue({
        data: { data: galleries, meta: undefined },
        isLoading: false,
        isError: false,
        error: null,
      });

      renderGalleries();

      expect(screen.getByTestId('gallery-list')).toBeInTheDocument();
      expect(screen.queryByTestId('gallery-footer')).toBeNull();
    });
  });
});