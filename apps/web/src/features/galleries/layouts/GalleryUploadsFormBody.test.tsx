import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';
import { GalleryUploadsFormBody } from './GalleryUploadsFormBody';
import type { UploadImagesValues } from '@/features/images/schemas/image-request.schema';

vi.mock('../hooks/useUploads', () => ({
  useUploads: () => ({
    fields: [],
    uploads: [],
    isDisabled: false,
    handleFiles: vi.fn(),
    handleRemove: vi.fn(),
    handleDeleteAll: vi.fn(),
    getPreviewUrl: vi.fn(),
  }),
}));

type WrapperProps = {
  mode?: 'create' | 'upload';
  isSubmitting?: boolean;
  isValid?: boolean;
};

const Wrapper = ({ mode = 'create', isSubmitting = false, isValid = false }: WrapperProps) => {
  const form = useForm<UploadImagesValues>({ defaultValues: { uploads: [] } });
  return (
    <FormProvider {...form}>
      <GalleryUploadsFormBody
        mode={mode}
        totalExisting={0}
        onSubmit={vi.fn()}
        isSubmitting={isSubmitting}
        isValid={isValid}
        uploadProgress={{ isVisible: false, status: 'idle', progress: 0, fileName: '', fileSize: 0 }}
      />
    </FormProvider>
  );
};

describe('GalleryUploadsFormBody', () => {
  it('renders "Create a new gallery" button in create mode', () => {
    render(<Wrapper mode="create" />);
    expect(screen.getByRole('button', { name: /create a new gallery/i })).toBeInTheDocument();
  });

  it('renders "Upload photos" button in upload mode', () => {
    render(<Wrapper mode="upload" />);
    expect(screen.getByRole('button', { name: /upload photos/i })).toBeInTheDocument();
  });

  it('renders "Creating..." when isSubmitting in create mode', () => {
    render(<Wrapper mode="create" isSubmitting />);
    expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
  });

  it('renders "Uploading..." when isSubmitting in upload mode', () => {
    render(<Wrapper mode="upload" isSubmitting />);
    expect(screen.getByRole('button', { name: /uploading/i })).toBeInTheDocument();
  });

  it('renders FormGalleryFields only in create mode', () => {
    render(<Wrapper mode="create" />);
    expect(screen.getByPlaceholderText('Gallery name')).toBeInTheDocument();
  });

  it('does NOT render FormGalleryFields in upload mode', () => {
    render(<Wrapper mode="upload" />);
    expect(screen.queryByPlaceholderText('Gallery name')).not.toBeInTheDocument();
  });
});