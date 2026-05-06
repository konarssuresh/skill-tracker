"use client";

import { useMutation } from "@tanstack/react-query";
import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { apiRequest } from "@/utils/api";

export function LogoutSection() {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      clearUser();

      startTransition(() => {
        router.replace("/auth/login");
      });
    },
  });

  return (
    <div className="surface-card p-6">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
        Session
      </p>
      <h2 className="mt-3 text-2xl font-bold text-text-primary">Log out</h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-text-secondary">
        End your current session on this device. More account and product
        settings can live here in the next iteration.
      </p>

      {logoutMutation.error ? (
        <div className="mt-5 rounded-lg border border-error/20 bg-red-50 px-4 py-3 text-sm text-error">
          {logoutMutation.error.message}
        </div>
      ) : null}

      <div className="mt-6">
        <Button
          variant="secondary"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </div>
  );
}
