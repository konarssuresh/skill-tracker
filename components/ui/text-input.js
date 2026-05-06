import { forwardRef, useId } from "react";
import { Field } from "@/components/ui/field";
import { cn } from "@/utils/cn";

const baseInputClassName =
  "w-full rounded-lg border bg-surface px-4 py-3 text-base text-text-primary shadow-sm transition-colors outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:bg-bg-secondary disabled:text-text-tertiary";

export const TextInput = forwardRef(function TextInput(
  {
    id: providedId,
    label,
    error,
    hint,
    required = false,
    className = "",
    inputClassName = "",
    type = "text",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      {({ hintId, errorId, hasError }) => (
        <input
          ref={ref}
          id={id}
          type={type}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : hintId}
          aria-required={required}
          className={cn(
            baseInputClassName,
            hasError
              ? "border-error/70 bg-red-50/40 focus-visible:border-error"
              : "border-border focus-visible:border-accent",
            className,
            inputClassName,
          )}
          {...props}
        />
      )}
    </Field>
  );
});
