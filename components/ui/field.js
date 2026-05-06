import { cn } from "@/utils/cn";

const getErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return "Invalid value";
};

export function Field({
  id,
  label,
  error,
  hint,
  required = false,
  className = "",
  labelClassName = "",
  children,
}) {
  const errorMessage = getErrorMessage(error);
  const hasError = Boolean(errorMessage);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = hasError ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-text-primary",
            labelClassName,
          )}
        >
          <span>{label}</span>
          {required ? (
            <span className="ml-1 text-sm text-accent" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children({ hintId, errorId, hasError })}

      {hasError ? (
        <p id={errorId} className="text-sm leading-loose text-error">
          {errorMessage}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm leading-loose text-text-tertiary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
