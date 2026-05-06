"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  initialFocusRef,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const previousFocusedElementRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previousFocusedElementRef.current = document.activeElement;
    document.body.style.overflow = "hidden";

    const focusTarget =
      initialFocusRef?.current ??
      dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ??
      dialogRef.current;

    focusTarget?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange?.(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusedElementRef.current?.focus?.();
    };
  }, [initialFocusRef, onOpenChange, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/40 px-4 py-6 backdrop-blur-sm sm:items-center"
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog backdrop"
        onClick={() => {
          if (closeOnBackdrop) {
            onOpenChange?.(false);
          }
        }}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "surface-card relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-surface",
          sizeClasses[size] ?? sizeClasses.md,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div className="space-y-1">
            {title ? (
              <h2 id={titleId} className="text-xl font-semibold leading-normal">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                id={descriptionId}
                className="text-sm leading-loose text-text-secondary"
              >
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-secondary text-text-secondary transition-colors hover:border-border hover:bg-bg-tertiary hover:text-text-primary"
            aria-label="Close dialog"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">{children}</div>

        {footer ? (
          <div className="border-t border-border-subtle px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
