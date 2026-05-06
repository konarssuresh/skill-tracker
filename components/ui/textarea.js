import { forwardRef, useId } from "react";
import { Field } from "@/components/ui/field";
import { cn } from "@/utils/cn";

export const Textarea = forwardRef(function Textarea(
  {
    id: providedId,
    label,
    error,
    hint,
    required = false,
    className = "",
    rows = 5,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      {({ hintId, errorId, hasError }) => (
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : hintId}
          aria-required={required}
          className={cn(
            "min-h-32 w-full rounded-lg border bg-surface px-4 py-3 text-base text-text-primary shadow-sm transition-colors outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:bg-bg-secondary disabled:text-text-tertiary",
            hasError
              ? "border-error/70 bg-red-50/40 focus-visible:border-error"
              : "border-border focus-visible:border-accent",
            className,
          )}
          {...props}
        />
      )}
    </Field>
  );
});
