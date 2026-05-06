import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const variantClasses = {
  primary:
    "bg-accent text-white hover:bg-accent-hover focus-visible:border-accent",
  secondary:
    "border border-border bg-surface text-text-primary hover:bg-bg-secondary",
  ghost: "bg-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary",
};

const sizeClasses = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-base",
  lg: "h-14 px-6 text-base",
};

export const Button = forwardRef(function Button(
  {
    className = "",
    variant = "primary",
    size = "md",
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold shadow-sm transition-all disabled:opacity-60",
        variantClasses[variant] ?? variantClasses.primary,
        sizeClasses[size] ?? sizeClasses.md,
        className,
      )}
      {...props}
    />
  );
});
