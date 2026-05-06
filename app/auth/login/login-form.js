"use client";

import { useMutation } from "@tanstack/react-query";
import { startTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Logo, TextInput } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { apiRequest } from "@/utils/api";

const defaultValues = {
  email: "",
  password: "",
};

const emailRules = {
  required: "Email is required",
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Enter a valid email address",
  },
};

const passwordRules = {
  required: "Password is required",
};

export function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: (data) => {
      setUser(data.user ?? null);

      startTransition(() => {
        router.replace("/dashboard");
      });
    },
  });

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-border-subtle bg-[linear-gradient(160deg,rgba(5,150,105,0.12),transparent_42%),linear-gradient(180deg,var(--color-bg-secondary),var(--color-bg-primary))] lg:flex">
        <div className="page-shell flex w-full flex-col justify-between py-10">
          <Logo />

          <div className="max-w-xl space-y-8 pb-16">
            <div className="inline-flex items-center rounded-full border border-accent/15 bg-accent-subtle px-4 py-2 text-sm font-medium text-accent">
              See every hour you&apos;ve invested in becoming better.
            </div>

            <div className="space-y-5">
              <h1 className="text-balance text-3xl font-bold leading-tight text-text-primary xl:text-5xl">
                Practice tracking that feels focused, visual, and motivating.
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-text-secondary">
                Log sessions, protect streaks, and turn slow progress into
                something you can actually see.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="surface-card space-y-2 p-5">
                <p className="text-sm font-medium text-text-tertiary">
                  Current streak
                </p>
                <p className="font-heading text-3xl font-bold text-streak">
                  12 days
                </p>
                <p className="text-sm text-text-secondary">
                  Keep today alive with one more session.
                </p>
              </div>

              <div className="surface-card space-y-2 p-5">
                <p className="text-sm font-medium text-text-tertiary">
                  Total hours
                </p>
                <p className="font-heading text-3xl font-bold text-text-primary">
                  47.5h
                </p>
                <p className="text-sm text-text-secondary">
                  Structured history across all your skills.
                </p>
              </div>

              <div className="surface-card space-y-2 p-5">
                <p className="text-sm font-medium text-text-tertiary">
                  Heatmap view
                </p>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[
                    "bg-heatmap-empty",
                    "bg-heatmap-light",
                    "bg-heatmap-empty",
                    "bg-heatmap-medium",
                    "bg-heatmap-heavy",
                    "bg-heatmap-empty",
                    "bg-heatmap-light",
                    "bg-heatmap-light",
                    "bg-heatmap-medium",
                    "bg-heatmap-heavy",
                  ].map((className, index) => (
                    <span
                      key={`${className}-${index}`}
                      className={`h-4 rounded-sm ${className}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-text-secondary">
                  A quick visual read on consistency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen flex-col">
        <div className="page-shell flex flex-1 flex-col justify-center py-8 lg:max-w-xl">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          <div className="surface-card w-full rounded-[1.75rem] p-6 sm:p-8">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                Welcome back
              </p>
              <h2 className="text-3xl font-bold leading-tight text-text-primary">
                Sign in to your practice dashboard
              </h2>
              <p className="text-base leading-relaxed text-text-secondary">
                Pick up where you left off and keep your momentum visible.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
              <Controller
                name="email"
                control={control}
                rules={emailRules}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    type="email"
                    label="Email"
                    autoComplete="email"
                    placeholder="jordan@example.com"
                    error={fieldState.error}
                    required
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                rules={passwordRules}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    type="password"
                    label="Password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    error={fieldState.error}
                    required
                  />
                )}
              />

              {loginMutation.error ? (
                <div className="rounded-lg border border-error/20 bg-red-50 px-4 py-3 text-sm text-error">
                  {loginMutation.error.message}
                </div>
              ) : null}

              <Button
                type="submit"
                className="mt-2 w-full"
                disabled={loginMutation.isPending || isSubmitting}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3 border-t border-border-subtle pt-6 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
              <p>
                New here?{" "}
                <Link href="/auth/signup" className="font-semibold text-accent">
                  Create an account
                </Link>
              </p>
              <span className="font-medium text-text-tertiary">
                Password reset flow comes next.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
