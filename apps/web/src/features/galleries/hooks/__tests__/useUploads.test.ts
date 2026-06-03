import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUploads } from '../useUploads';
import { useGalleryUploadsStore } from '../../stores/gallery-uploads.store';
import { MAX_FILES } from '@/features/images/constants/image.constants';
import { toast } from 'sonner';


vi.mock('sonner', () => ({
  toast: { warning: vi.fn() },
}));

vi.mock('../../stores/gallery-uploads.store', () => ({
  useGalleryUploadsStore: vi.fn(),
}));

const mockEnsurePreviews = vi.fn();
const mockGetPreviewUrl = vi.fn();
const mockRemovePreview = vi.fn();
const mockClearPreviews = vi.fn();

vi.mocked(useGalleryUploadsStore).mockReturnValue({
  ensurePreviews: mockEnsurePreviews,
  getPreviewUrl: mockGetPreviewUrl,
  removePreview: mockRemovePreview,
  clearPreviews: mockClearPreviews,
});

const mockAppend = vi.fn();
const mockRemove = vi.fn();
const mockReplace = vi.fn();
const mockClearErrors = vi.fn();

let mockUploads: { file: File; name: null; comment: null }[] = [];

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    useFormContext: vi.fn(() => ({
      control: {},
      watch: vi.fn(() => mockUploads),
      clearErrors: mockClearErrors,
    })),
    useFieldArray: vi.fn(() => ({
      fields: mockUploads,
      append: mockAppend,
      remove: mockRemove,
      replace: mockReplace,
    })),
  };
});

function makeFile(name = 'photo.jpg', type = 'image/jpeg', size = 1024) {
  const file = new File(['x'.repeat(size)], name, { type });
  return file;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUploads = [];
  vi.mocked(useGalleryUploadsStore).mockReturnValue({
    ensurePreviews: mockEnsurePreviews,
    getPreviewUrl: mockGetPreviewUrl,
    removePreview: mockRemovePreview,
    clearPreviews: mockClearPreviews,
  });
});


describe('useUploads', () => {

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useUploads());

    expect(result.current.fields).toEqual([]);
    expect(result.current.uploads).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.isDisabled).toBe(false);
  });

  it('calculates totalCount from totalExisting + fields length', () => {
    mockUploads = [{ file: makeFile(), name: null, comment: null }];

    const { result } = renderHook(() => useUploads({ totalExisting: 3 }));

    expect(result.current.totalCount).toBe(4);
  });

  it('isDisabled is true when totalCount reaches MAX_FILES', () => {
    mockUploads = Array.from({ length: MAX_FILES }, () => ({
      file: makeFile(),
      name: null,
      comment: null,
    }));

    const { result } = renderHook(() => useUploads());

    expect(result.current.isDisabled).toBe(true);
  });

  it('appends valid files', () => {
    const { result } = renderHook(() => useUploads());
    const file = makeFile();

    act(() => { result.current.handleFiles([file]); });

    expect(mockAppend).toHaveBeenCalledWith([
      { file, name: null, comment: null },
    ]);
  });

  it('calls ensurePreviews with appended files', () => {
    const { result } = renderHook(() => useUploads());
    const file = makeFile();

    act(() => { result.current.handleFiles([file]); });

    expect(mockEnsurePreviews).toHaveBeenCalledWith([file]);
  });

  it('calls clearErrors on successful append', () => {
    const { result } = renderHook(() => useUploads());

    act(() => { result.current.handleFiles([makeFile()]); });

    expect(mockClearErrors).toHaveBeenCalledWith('uploads');
  });

  it('shows warning toast and does nothing when isDisabled', () => {
    mockUploads = Array.from({ length: MAX_FILES }, () => ({
      file: makeFile(),
      name: null,
      comment: null,
    }));

    const { result } = renderHook(() => useUploads());

    act(() => { result.current.handleFiles([makeFile('extra.jpg')]); });

    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining("Can't upload more than"),
    );
    expect(mockAppend).not.toHaveBeenCalled();
  });

  it('slices files to available slots when too many files provided', () => {
    const totalExisting = MAX_FILES - 2;
    const files = [makeFile('a.jpg'), makeFile('b.jpg'), makeFile('c.jpg')];

    const { result } = renderHook(() => useUploads({ totalExisting }));

    act(() => { result.current.handleFiles(files); });

    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining('2 more photos are allowed'),
    );
    expect(mockAppend).toHaveBeenCalledWith([
      { file: files[0], name: null, comment: null },
      { file: files[1], name: null, comment: null },
    ]);
  });

  it('shows warning toast for invalid file type', () => {
    const { result } = renderHook(() => useUploads());
    const invalidFile = makeFile('doc.pdf', 'application/pdf');

    act(() => { result.current.handleFiles([invalidFile]); });

    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining('Photo 1:'),
    );
    expect(mockAppend).not.toHaveBeenCalled();
  });

  it('does nothing when empty file list is provided', () => {
    const { result } = renderHook(() => useUploads());

    act(() => { result.current.handleFiles([]); });

    expect(mockAppend).not.toHaveBeenCalled();
    expect(toast.warning).not.toHaveBeenCalled();
  });

  it('calls removePreview and remove with correct index', () => {
    const file = makeFile('photo.jpg');
    mockUploads = [{ file, name: null, comment: null }];

    const { result } = renderHook(() => useUploads());

    act(() => { result.current.handleRemove(0); });

    expect(mockRemovePreview).toHaveBeenCalledWith(file);
    expect(mockRemove).toHaveBeenCalledWith(0);
  });

  it('does not throw when removing index that has no file', () => {
    mockUploads = [];

    const { result } = renderHook(() => useUploads());

    expect(() => {
      act(() => { result.current.handleRemove(99); });
    }).not.toThrow();
  });

  it('clears all previews and replaces fields with empty array', () => {
    const { result } = renderHook(() => useUploads());

    act(() => { result.current.handleDeleteAll(); });

    expect(mockClearPreviews).toHaveBeenCalledOnce();
    expect(mockReplace).toHaveBeenCalledWith([]);
  });

  it('calls clearPreviews on unmount', () => {
    const { unmount } = renderHook(() => useUploads());

    unmount();

    expect(mockClearPreviews).toHaveBeenCalled();
  });
});