import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';
import { FormImageCard } from '../FormImageCard';
import type { UploadImagesValues } from '@/features/images/schemas/image-request.schema';

const Wrapper = ({ onDelete = vi.fn(), nameError = '', commentError = '' } = {}) => {
  const form = useForm<UploadImagesValues>({
    defaultValues: { uploads: [{ file: undefined, name: '', comment: '' }] },
  });
  return (
    <FormProvider {...form}>
      <FormImageCard
        imageSrc="http://example.com/photo.jpg"
        imageAlt="Test photo"
        nameProps={form.register('uploads.0.name')}
        commentProps={form.register('uploads.0.comment')}
        nameError={nameError}
        commentError={commentError}
        onDelete={onDelete}
      />
    </FormProvider>
  );
};

describe('GalleryImageFormCard', () => {
  it('renders image with correct src and alt', () => {
    render(<Wrapper />);
    const img = screen.getByAltText('Test photo');
    expect(img).toHaveAttribute('src', 'http://example.com/photo.jpg');
  });

  it('renders Name and Comment fields', () => {
    render(<Wrapper />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn();
    render(<Wrapper onDelete={onDelete} />);
    const deleteBtn = screen.getByRole('button');
    await userEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('shows nameError message when provided', () => {
    render(<Wrapper nameError="Name is required" />);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('shows commentError message when provided', () => {
    render(<Wrapper commentError="Comment too long" />);
    expect(screen.getByText('Comment too long')).toBeInTheDocument();
  });

  it('comment textarea has maxLength of 100', () => {
    render(<Wrapper />);
    const textarea = screen.getByPlaceholderText('Type here...');
    expect(textarea).toHaveAttribute('maxLength', '100');
  });

  it('marks name input as aria-invalid when nameError provided', () => {
    render(<Wrapper nameError="Required" />);
    const input = screen.getByPlaceholderText('Name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});