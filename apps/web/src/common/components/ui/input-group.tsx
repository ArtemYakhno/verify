import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button } from '@/common/components/ui/button';
import { Input, type InputProps } from '@/common/components/ui/input';
import { cn } from '@/common/lib/utils';
import { Textarea } from './textarea';

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role='group'
      data-slot='input-group'
      className={cn(
        'group/input-group flex w-full items-center rounded-md border transition-colors',

        // base
        'border-border',

        // hover
        'hover:border-green',

        // focus
        'has-[[data-slot=input-group-control]:focus]:border-green',

        // error
        'has-[[data-slot][aria-invalid=true]]:border-red',

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
      'inline-start': 'pl-5',
      'inline-end': 'pr-5',
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
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        size={size}
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
