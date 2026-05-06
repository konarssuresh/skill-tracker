"use client";

import { toast } from "react-toastify";

export function ToastCard({ title, message, closeToast }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface/95 px-4 py-4 text-text-primary shadow-lg backdrop-blur-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-sm">
        <span aria-hidden="true" className="text-lg font-bold leading-none">
          ✓
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={closeToast}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-bg-secondary hover:text-text-primary"
        aria-label="Dismiss notification"
      >
        <span aria-hidden="true" className="text-base leading-none">
          ×
        </span>
      </button>
    </div>
  );
}

export function showSuccessToast({ title, message, toastId }) {
  toast(
    ({ closeToast }) => (
      <ToastCard title={title} message={message} closeToast={closeToast} />
    ),
    {
      toastId,
      icon: false,
      closeButton: false,
      className: "skilltrack-toast",
      bodyClassName: "skilltrack-toast-body",
    },
  );
}
