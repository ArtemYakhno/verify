import { cn } from '@/common/lib/utils';
import * as React from 'react';

type TextareaProps = React.ComponentProps<'textarea'> & {
  maxLength?: number;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength, onChange, ...props }, ref) => {
    const [length, setLength] = React.useState((props.defaultValue as string)?.length || 0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLength(e.target.value.length);
      onChange?.(e);
    };

    const isOverflow = maxLength ? length > maxLength : false;

    return (
      <div className='relative w-full'>
        <textarea
          ref={ref}
          maxLength={maxLength}
          onChange={handleChange}
          className={cn(
            'flex field-sizing-fixed resize-none min-h-49 w-full border border-transparent rounded-sm bg-gray-30 px-6 py-4 type-main outline-none',
            'placeholder:text-gray-50',
            'hover:border-primary-40 focus:border-primary-40',
            'disabled:cursor-not-allowed disabled:text-gray-70',
            'aria-invalid:border-error aria-invalid:ring-error/20',
            className
          )}
          {...props}
        />

        {maxLength && (
          <div
            className={cn(
              'absolute right-6 bottom-4 typo-main',
              isOverflow ? 'text-error' : 'text-gray-70'
            )}
          >
            {length}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
