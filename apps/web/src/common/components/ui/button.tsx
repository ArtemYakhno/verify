import * as React from 'react'
import { Slot } from 'radix-ui'
import { type VariantProps } from 'class-variance-authority'
// import { buttonVariants } from '../../styles/variants/button-variants'
import { cn } from '../../lib/utils'

import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  "typo-button inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-md border border-solid bg-clip-padding transition-all shrink-0 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-green border-none hover:bg-accent-green  active:bg-strong-green disabled:bg-border disabled:text-gray",
        secondary:
          "text-green border-green hover:border-accent-green  active:border-bg-strong-green  disabled:border-gray disabled:text-gray",
        lightDisabled: "bg-border text-gray border-none",
        transparent:
          "border-none bg-transparent hover:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:border-transparent",
      },
      size: {
        default: "h-12.5 px-4.5",
        auto: "h-auto w-auto p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);


function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }