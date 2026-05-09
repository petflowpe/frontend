import * as React from "react";

import { cn } from "./utils";

function sanitizeHtmlDateLikeValue(value: string): string {
  if (!value || typeof value !== "string") return value;

  // date: YYYY-MM-DD (algunos navegadores permiten más dígitos en el año al tipear)
  let m = value.match(/^(\d+)-(\d{2})-(\d{2})$/);
  if (m) return `${m[1].slice(0, 4)}-${m[2]}-${m[3]}`;

  // datetime-local: YYYY-MM-DDTHH:mm (o con segundos)
  m = value.match(/^(\d+)-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (m) return `${m[1].slice(0, 4)}-${m[2]}-${m[3]}T${m[4]}:${m[5]}${m[6] ? `:${m[6]}` : ""}`;

  return value;
}

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, onInput, ...props }, ref) => {
    const isDateLike = type === "date" || type === "datetime-local";
    const handleChange: React.ChangeEventHandler<HTMLInputElement> | undefined = isDateLike
      ? (e) => {
          const next = sanitizeHtmlDateLikeValue(e.currentTarget.value);
          if (next !== e.currentTarget.value) e.currentTarget.value = next;
          onChange?.(e);
        }
      : onChange;
    const handleInput: React.FormEventHandler<HTMLInputElement> | undefined = isDateLike
      ? (e) => {
          const target = e.currentTarget;
          const next = sanitizeHtmlDateLikeValue(target.value);
          if (next !== target.value) target.value = next;
          onInput?.(e);
        }
      : onInput;
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        onChange={handleChange}
        onInput={handleInput}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };