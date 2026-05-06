import { forwardRef, useId } from "react";
import { Field } from "@/components/ui/field";
import { cn } from "@/utils/cn";

export const SelectInput = forwardRef(function SelectInput(
  {
    id: providedId,
    label,
    error,
    hint,
    required = false,
    className = "",
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      {({ hintId, errorId, hasError }) => (
        <select
          ref={ref}
          id={id}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : hintId}
          aria-required={required}
          className={cn(
            "w-full rounded-lg border bg-surface px-4 py-3 text-base text-text-primary shadow-sm outline-none transition-colors disabled:cursor-not-allowed disabled:bg-bg-secondary disabled:text-text-tertiary",
            hasError
              ? "border-error/70 bg-red-50/40 focus-visible:border-error"
              : "border-border focus-visible:border-accent",
            className,
          )}
          {...props}
        >
          {children}
        </select>
      )}
    </Field>
  );
});
