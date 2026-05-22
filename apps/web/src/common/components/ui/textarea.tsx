import * as React from "react";

import { cn } from "@/common/lib/utils";

type TextareaProps =
  React.ComponentProps<"textarea"> & {
    maxLength?: number;
  };

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(
  (
    {
      className,
      maxLength,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const isControlled =
      value !== undefined;

    const [internalLength, setInternalLength] =
      React.useState(
        String(defaultValue ?? "").length
      );

    const length = isControlled
      ? String(value ?? "").length
      : internalLength;

    const handleChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      if (!isControlled) {
        setInternalLength(
          e.target.value.length
        );
      }

      onChange?.(e);
    };

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          maxLength={maxLength}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            "w-full min-w-0 resize-none rounded-md border border-border bg-transparent outline-none transition-colors",
            "typo-input",
            "placeholder:text-placeholder",
            "hover:border-green focus:border-green",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "aria-[invalid=true]:border-red",
            "aria-[invalid=true]:hover:border-red",
            "aria-[invalid=true]:focus:border-red",
            "min-h-28 px-5 py-4.5",
            className
          )}
          {...props}
        />

        {maxLength && (
          <div className="pointer-events-none absolute right-5 bottom-4 typo-main text-placeholder">
            {length}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };