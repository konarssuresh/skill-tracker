"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
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

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 sm:items-center"
          aria-hidden={!open}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

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

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
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

              <motion.button
                type="button"
                whileHover={{ rotate: 90, scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => onOpenChange?.(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-secondary text-text-secondary transition-colors hover:border-border hover:bg-bg-tertiary hover:text-text-primary"
                aria-label="Close dialog"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  ×
                </span>
              </motion.button>
            </div>

            <div className="overflow-y-auto px-6 py-6">{children}</div>

            {footer ? (
              <div className="border-t border-border-subtle px-6 py-4">{footer}</div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
