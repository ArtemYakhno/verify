import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "@/common/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 bg-nature-white", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

const selectTriggerVariants = cva(
  [
    "flex w-full min-w-0 items-center justify-between gap-1.5 rounded-md outline-none transition-colors",
    "bg-transparent",
    "typo-input",
    "box-border",
    "border border-border",

    "hover:border-green focus:border-green",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "aria-[invalid=true]:border-red aria-[invalid=true]:hover:border-red aria-[invalid=true]:focus:border-red",

    "data-[placeholder]:text-placeholder",

    "[&>span]:truncate",
    "[&>span]:flex",
    "[&>span]:min-w-0",
    "[&>span]:items-center",
    "[&>span]:gap-1.5",

    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        sm: "h-10 px-4 py-2",
        md: "h-12.5 px-5 py-4.5",
        lg: "h-16 px-8 py-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

type SelectTriggerProps =
  React.ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof selectTriggerVariants>;

function SelectTrigger({
  className,
  size = "md",
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        selectTriggerVariants({ size }),
        "group",
        className
      )}
      {...props}
    >
      {children}

      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 text-placeholder transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn("relative z-50 max-h-(--radix-select-content-available-height)  origin-(--radix-select-content-transform-origin)",
          "overflow-x-hidden overflow-y-auto rounded-md duration-100 border border-border",
          "data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            "data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
            position === "popper" && ""
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "w-full cursor-pointer rounded-md px-5 py-4 typo-input",
        "focus:bg-light-green",
        "focus:border-none",
        "focus:outline-none",
        "data-[state=checked]:bg-light-green",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-nature-white py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-nature-white py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
