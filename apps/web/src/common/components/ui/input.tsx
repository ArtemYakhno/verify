import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/lib/utils';

const inputVariants = cva(
  [
    'w-full min-w-0 rounded-md  outline-none transition-colors',
    'bg-transparent',
    'typo-input',
    'placeholder:text-placeholder',

    'border border-border',

    'file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium',

    //hover+focus
    'hover:border-green focus:border-green',

    //disabled
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',

    //invalid
    'aria-[invalid=true]:border-red aria-[invalid=true]:hover:border-red aria-[invalid=true]:focus:border-red',
  ],
  {
    variants: {
      size: {
        sm: 'h-10 px-4 py-2',
        md: 'h-13.5 px-5 py-4.5',
        lg: 'h-16 px-8 py-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

type NativeInputProps = Omit<React.ComponentProps<'input'>, 'size'>;

export interface InputProps extends NativeInputProps, VariantProps<typeof inputVariants> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', size = 'md', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
);

Input.displayName = 'Input';
