import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/utils/lib/utils';

const inputVariants = cva(
  [
    'w-full min-w-0 rounded-sm border outline-none transition-colors',

    'border-transparent',

    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',

    // default focus/hover border
    'hover:border-primary-40 focus:border-primary-40',

    // error
    'aria-[invalid=true]:border-error aria-[invalid=true]:hover:border-error aria-[invalid=true]:focus:border-error',

    // success
    'data-[valid=true]:border-success data-[valid=true]:hover:border-success data-[valid=true]:focus:border-success',
  ],
  {
    variants: {
      size: {
        sm: 'h-10 px-4 py-2',
        md: 'h-13.5 px-6 py-4',
        lg: 'h-16 px-8 py-6',
      },
      bg: {
        gray30: 'bg-gray-30',
        white: 'bg-gray-0',
      },
    },
    defaultVariants: {
      size: 'md',
      bg: 'gray30',
    },
  }
);

type NativeInputProps = Omit<React.ComponentProps<'input'>, 'size'>;

export interface InputProps extends NativeInputProps, VariantProps<typeof inputVariants> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', size = 'md', bg, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(inputVariants({ size, bg }), className)}
      {...props}
    />
  )
);

Input.displayName = 'Input';
