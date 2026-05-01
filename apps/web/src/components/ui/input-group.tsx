import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/utils/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, type InputProps } from '@/components/ui/input';
import { Textarea } from './textarea';

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role='group'
      data-slot='input-group'
      className={cn(
        'group/input-group flex w-full items-center rounded-sm border transition-colors',

        // base
        'border-transparent bg-gray-30',

        // hover
        'hover:border-primary-40',

        // focus
        'has-[[data-slot=input-group-control]:focus]:border-primary-40',

        // error
        'has-[[data-slot][aria-invalid=true]]:border-error',

        // success
        'has-[[data-slot][data-valid=true]]:border-success',

        // disabled
        'has-[[data-slot=input-group-control]:disabled]:opacity-50',

        className
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva('flex items-center', {
  variants: {
    align: {
      'inline-start': 'pl-6',
      'inline-end': 'pr-6',
    },
  },
  defaultVariants: {
    align: 'inline-start',
  },
});

function InputGroupAddon({
  className,
  align = 'inline-end',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      data-slot='input-group-addon'
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  );
}

function InputGroupButton({
  className,
  type = 'button',
  variant = 'transparent',
  size = 'auto',
  ...props
}: React.ComponentProps<typeof Button>) {
  return <Button type={type} variant={variant} size={size} className={cn(className)} {...props} />;
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

const InputGroupInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = 'md', bg, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        size={size}
        bg={bg}
        data-slot='input-group-control'
        className={cn('border-0 bg-transparent', className)}
        {...props}
      />
    );
  }
);

InputGroupInput.displayName = 'InputGroupInput';

function InputGroupTextarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot='input-group-control'
      className={cn(
        'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
        className
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
