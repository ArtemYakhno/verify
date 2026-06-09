import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, type FieldArrayWithId } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';
import { FormUploadsList } from '../FormUploadsList';
import type { UploadImagesValues } from '../../../../images/schemas/image-request.schema';

const makeFile = (name: string) => new File(['content'], name, { type: 'image/jpeg' });

const Wrapper = ({
  fields = [],
  uploads = [],
  totalExisting = 0,
  onRemove = vi.fn(),
  onDeleteAll = vi.fn(),
  getPreviewUrl = vi.fn(() => undefined as string | undefined),
}: Partial<React.ComponentProps<typeof FormUploadsList>> = {}) => {
  const form = useForm<UploadImagesValues>({ defaultValues: { uploads: [] } });
  return (
    <FormProvider {...form}>
      <FormUploadsList
        fields={fields as FieldArrayWithId<UploadImagesValues, "uploads", "id">[]}
        uploads={uploads}
        totalExisting={totalExisting}
        onRemove={onRemove}
        onDeleteAll={onDeleteAll}
        getPreviewUrl={getPreviewUrl}
      />
    </FormProvider>
  );
};

describe('FormUploadsList', () => {
  it('shows plug when no fields', () => {
    render(<Wrapper />);
    expect(screen.queryByRole('button', { name: /delete all/i })).toBeNull();
  });

  it('renders photo count when fields exist', () => {
    const file = makeFile('photo.jpg');
    const fields = [{ id: 'f1' }];
    const uploads = [{ file, name: '', comment: '' }];
    render(
      <Wrapper
        fields={fields as FieldArrayWithId<UploadImagesValues, "uploads", "id">[]}
        uploads={uploads}
        totalExisting={0}
        getPreviewUrl={() => 'blob:preview'}
      />
    );
    expect(screen.getByText(/photos selected/i)).toBeInTheDocument();
  });

  it('calls onDeleteAll when "Delete All" clicked', async () => {
    const onDeleteAll = vi.fn();
    const file = makeFile('photo.jpg');
    const fields = [{ id: 'f1' }];
    const uploads = [{ file, name: '', comment: '' }];
    render(
      <Wrapper
        fields={fields as FieldArrayWithId<UploadImagesValues, "uploads", "id">[]}
        uploads={uploads}
        onDeleteAll={onDeleteAll}
        getPreviewUrl={() => 'blob:preview'}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /delete all/i }));
    expect(onDeleteAll).toHaveBeenCalledOnce();
  });

  it('calls onRemove with correct index when card delete is clicked', async () => {
    const onRemove = vi.fn();
    const fields = [{ id: 'f1' }, { id: 'f2' }];
    const uploads = [
      { file: makeFile('a.jpg'), name: '', comment: '' },
      { file: makeFile('b.jpg'), name: '', comment: '' },
    ];
    render(
      <Wrapper
        fields={fields as FieldArrayWithId<UploadImagesValues, "uploads", "id">[]}
        uploads={uploads}
        onRemove={onRemove}
        getPreviewUrl={() => 'blob:preview'}
      />
    );
    const deleteBtns = screen.getAllByRole('button', { name: '' });
    await userEvent.click(deleteBtns[0]);
    expect(onRemove).toHaveBeenCalledWith(0);
  });
});