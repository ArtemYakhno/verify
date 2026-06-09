import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, it, expect } from 'vitest';
import { FormImagesList } from '../FormImagesList';
import type { UpdateGalleryValues } from '@/features/galleries/schemas/gallery-request.schema';

const images = [
  { id: 1, path: '/img1.jpg', name: 'Photo 1', comment: 'comment 1' },
  { id: 2, path: '/img2.jpg', name: 'Photo 2', comment: 'comment 2' },
];

const Wrapper = ({ defaultValues }: { defaultValues?: Partial<UpdateGalleryValues> }) => {
  const form = useForm<UpdateGalleryValues>({
    defaultValues: {
      gallery: { title: '', description: null },
      images,
      deletedImageIds: [],
      ...defaultValues,
    },
  });
  return (
    <FormProvider {...form}>
      <FormImagesList />
    </FormProvider>
  );
};

describe('FormImagesList', () => {
  it('renders all visible images', () => {
    render(<Wrapper />);
    expect(screen.getByAltText('Photo 1')).toBeInTheDocument();
    expect(screen.getByAltText('Photo 2')).toBeInTheDocument();
  });

  it('shows photo count', () => {
    render(<Wrapper />);
    expect(screen.getByText(/2 photos available/i)).toBeInTheDocument();
  });

  it('hides deleted image after clicking delete', async () => {
    render(<Wrapper />);
    const deleteBtns = screen.getAllByRole('button');
    await userEvent.click(deleteBtns[0]); // delete first image
    expect(screen.queryByAltText('Photo 1')).not.toBeInTheDocument();
    expect(screen.getByAltText('Photo 2')).toBeInTheDocument();
  });

  it('shows plug when all images are deleted', async () => {
    render(<Wrapper />);
    const deleteBtns = screen.getAllByRole('button');
    await userEvent.click(deleteBtns[0]);
    await userEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.queryByText(/photos available/i)).not.toBeInTheDocument();
  });

  it('renders plug when images list is empty', () => {
    render(<Wrapper defaultValues={{ images: [], deletedImageIds: [] }} />);
    expect(screen.queryByText(/photos available/i)).not.toBeInTheDocument();
  });
});