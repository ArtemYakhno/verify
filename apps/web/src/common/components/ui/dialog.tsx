import * as React from 'react';
import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { cn } from '@/common/lib/utils';
import { Button } from './button';



function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot='dialog-overlay'
      className={cn(
        'fixed inset-0 z-50 bg-black/50  cursor-pointer data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  );
}

type DialogPosition = 'center' | 'bottom';
interface IDialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
  position?: DialogPosition;
  isMobileFullWidth?: boolean;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  position = 'center',
  ...props
}: IDialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot='dialog-content'
        data-position={position}
        className={cn(
          'fixed z-50 duration-200 outline-none',
          'bg-nature-white shadow-block rounded-md',
          'max-w-108 px-7 py-10 lg:p-14 w-[calc(100vw-16px)] lg:w-auto',


          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          'data-[position=center]:top-1/2 data-[position=center]:left-1/2',
          'data-[position=center]:-translate-x-1/2 data-[position=center]:-translate-y-1/2',
          'data-[position=center]:rounded-2xl',
          'data-[position=center]:data-[state=closed]:fade-out-0 data-[position=center]:data-[state=closed]:zoom-out-95',
          'data-[position=center]:data-[state=open]:fade-in-0 data-[position=center]:data-[state=open]:zoom-in-95',

          'data-[position=bottom]:bottom-0 data-[position=bottom]:left-1/2',
          'data-[position=bottom]:-translate-x-1/2',
          'data-[position=bottom]:rounded-t-2xl',
          'data-[position=bottom]:data-[state=closed]:fade-out-0 data-[position=bottom]:data-[state=closed]:slide-out-to-bottom',
          'data-[position=bottom]:data-[state=open]:fade-in-0 data-[position=bottom]:data-[state=open]:slide-in-from-bottom',

          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot='dialog-close'
            className='absolute top-5 right-5'
            asChild
          >
            <Button className='p-1' variant='transparent' size='auto' aria-label='Закрити'>
              <X className='size-4.5 text-ui-black' />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-header'
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant='secondary'>Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot='dialog-title'
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot='dialog-description'
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
