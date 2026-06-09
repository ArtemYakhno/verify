import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';
import { FormUploader } from '../FormUploader';
import type { UploadImagesValues } from '@/features/images/schemas/image-request.schema';

const Wrapper = ({
  isDisabled = false,
  onFilesSelect = vi.fn(),
  uploadProgress,
}: Partial<React.ComponentProps<typeof FormUploader>> = {}) => {
  const form = useForm<UploadImagesValues>({ defaultValues: { uploads: [] } });
  return (
    <FormProvider {...form}>
      <FormUploader
        isDisabled={isDisabled}
        onFilesSelect={onFilesSelect}
        uploadProgress={uploadProgress}
      />
    </FormProvider>
  );
};

describe('FormUploader', () => {
  it('renders Upload button when not disabled', () => {
    render(<Wrapper />);
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('shows drag-and-drop text when not disabled', () => {
    render(<Wrapper />);
    expect(screen.getByText(/drag and drop photo here/i)).toBeInTheDocument();
  });

  it('shows limit message when disabled', () => {
    render(<Wrapper isDisabled />);
    expect(screen.getByText(/can't upload more than/i)).toBeInTheDocument();
  });

  it('hides upload button when disabled', () => {
    render(<Wrapper isDisabled />);
    expect(screen.queryByRole('button', { name: /upload/i })).not.toBeInTheDocument();
  });

  it('calls onFilesSelect when files selected via input', async () => {
    const onFilesSelect = vi.fn();
    render(<Wrapper onFilesSelect={onFilesSelect} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    await userEvent.upload(input, file);
    expect(onFilesSelect).toHaveBeenCalledOnce();
  });

  it('calls onFilesSelect on drop', () => {
    const onFilesSelect = vi.fn();
    render(<Wrapper onFilesSelect={onFilesSelect} />);
    const dropZone = screen.getByText(/drag and drop/i).closest('div')!;
    const file = new File(['img'], 'dropped.jpg', { type: 'image/jpeg' });
    const dataTransfer = { files: [file] };
    fireEvent.drop(dropZone, { dataTransfer });
    expect(onFilesSelect).toHaveBeenCalledOnce();
  });

  it('does NOT call onFilesSelect on drop when disabled', () => {
    const onFilesSelect = vi.fn();
    render(<Wrapper isDisabled onFilesSelect={onFilesSelect} />);
    const dropZone = screen.getByText(/can't upload more/i).closest('div')!;
    const file = new File(['img'], 'dropped.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    expect(onFilesSelect).not.toHaveBeenCalled();
  });

  it('shows progress bar when uploadProgress is visible', () => {
    render(
      <Wrapper
        uploadProgress={{
          isVisible: true,
          status: 'uploading',
          progress: 45,
          fileName: 'photo.jpg',
          fileSize: 2048000,
        }}
      />
    );
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('shows "Completed!" on success status', () => {
    render(
      <Wrapper
        uploadProgress={{
          isVisible: true,
          status: 'success',
          progress: 100,
          fileName: 'photo.jpg',
          fileSize: 1024,
        }}
      />
    );
    expect(screen.getByText('Completed!')).toBeInTheDocument();
  });

  it('shows "Failed to load" on error status', () => {
    render(
      <Wrapper
        uploadProgress={{
          isVisible: true,
          status: 'error',
          progress: 0,
          fileName: 'photo.jpg',
          fileSize: 1024,
        }}
      />
    );
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });
});