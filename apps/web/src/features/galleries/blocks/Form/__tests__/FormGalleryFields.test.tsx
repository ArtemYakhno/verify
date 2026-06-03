import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { describe, it, expect } from 'vitest';
import { FormGalleryFields } from '../FormGalleryFields';
import { createGallerySchema, type CreateGalleryValues } from '../../../schemas/gallery-request.schema';

const Wrapper = ({ defaultValues }: { defaultValues?: Partial<CreateGalleryValues> }) => {
  const form = useForm<CreateGalleryValues>({
    resolver: zodResolver(createGallerySchema),
    defaultValues: {
      gallery: { title: '', description: undefined },
      uploads: [],
      ...defaultValues,
    },
    mode: 'onChange',
  });
  return (
    <FormProvider {...form}>
      <FormGalleryFields />
    </FormProvider>
  );
};

describe('FormGalleryFields', () => {
  it('renders gallery name and description fields', () => {
    render(<Wrapper />);
    expect(screen.getByPlaceholderText('Gallery name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('renders "Gallery name" label', () => {
    render(<Wrapper />);
    expect(screen.getByText('Gallery name')).toBeInTheDocument();
  });

  it('renders "Description" label with optional marker', () => {
    render(<Wrapper />);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('accepts input in gallery name field', async () => {
    render(<Wrapper />);
    const input = screen.getByPlaceholderText('Gallery name');
    await userEvent.type(input, 'My Gallery');
    expect(input).toHaveValue('My Gallery');
  });

  it('accepts input in description textarea', async () => {
    render(<Wrapper />);
    const textarea = screen.getByPlaceholderText('Type here...');
    await userEvent.type(textarea, 'Some description');
    expect(textarea).toHaveValue('Some description');
  });

  it('description textarea has maxLength of 255', () => {
    render(<Wrapper />);
    const textarea = screen.getByPlaceholderText('Type here...');
    expect(textarea).toHaveAttribute('maxLength', '255');
  });
});