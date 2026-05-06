"use client";

import { useMutation } from "@tanstack/react-query";
import { startTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Logo, TextInput } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { apiRequest } from "@/utils/api";
import {
  signupPasswordMessage,
  validateEmail,
  validateFullName,
  validatePasswordForSignup,
} from "@/utils/form-validation";

const defaultValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function SignupForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const passwordValue = useWatch({
    control,
    name: "password",
  });

  const signupMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      };

      return apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
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
    signupMutation.mutate(values);
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.98fr_1.02fr]">
      <section className="flex min-h-screen flex-col">
        <div className="page-shell flex flex-1 flex-col justify-center py-8 lg:max-w-xl">
          <div className="mb-10">
            <Logo />
          </div>

          <div className="surface-card w-full rounded-[1.75rem] p-6 sm:p-8">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                Start tracking
              </p>
              <h1 className="text-3xl font-bold leading-tight text-text-primary">
                Create your SkillTrack account
              </h1>
              <p className="text-base leading-relaxed text-text-secondary">
                Build a home for your practice history, streaks, and long-term
                progress across every skill you&apos;re growing.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
              <Controller
                name="fullName"
                control={control}
                rules={{ validate: validateFullName }}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    label="Full name"
                    autoComplete="name"
                    placeholder="Jordan Lee"
                    error={fieldState.error}
                    required
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                rules={{ validate: validateEmail }}
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
                rules={{ validate: validatePasswordForSignup }}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    type="password"
                    label="Password"
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    hint={signupPasswordMessage}
                    error={fieldState.error}
                    required
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  validate: (value) => {
                    if (!value) {
                      return "Confirm password is required";
                    }

                    if (value !== passwordValue) {
                      return "Passwords do not match";
                    }

                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    type="password"
                    label="Confirm password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    error={fieldState.error}
                    required
                  />
                )}
              />

              {signupMutation.error ? (
                <div className="rounded-lg border border-error/20 bg-red-50 px-4 py-3 text-sm text-error">
                  {signupMutation.error.message}
                </div>
              ) : null}

              <Button
                type="submit"
                className="mt-2 w-full"
                disabled={signupMutation.isPending || isSubmitting}
              >
                {signupMutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3 border-t border-border-subtle pt-6 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
              <p>
                Already have an account?{" "}
                <Link href="/auth/login" className="font-semibold text-accent">
                  Sign in
                </Link>
              </p>
              <span className="font-medium text-text-tertiary">
                You&apos;ll be signed in automatically after signup.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative hidden overflow-hidden border-l border-border-subtle bg-[linear-gradient(180deg,var(--color-bg-secondary),var(--color-bg-primary)),radial-gradient(circle_at_top_right,rgba(5,150,105,0.14),transparent_28rem)] lg:flex">
        <div className="page-shell flex w-full flex-col justify-between py-10">
          <div className="self-end rounded-full border border-success/20 bg-white/75 px-4 py-2 text-sm font-medium text-success shadow-sm">
            Your first dashboard is one step away
          </div>

          <div className="ml-auto max-w-xl space-y-8 pb-16">
            <div className="surface-card space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
                    Featured skill
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-text-primary">
                    Spanish
                  </h2>
                </div>
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-accent-subtle text-2xl font-bold text-accent">
                  75%
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-text-tertiary">Total hours</p>
                  <p className="mt-1 font-heading text-2xl font-bold">47.5h</p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Day streak</p>
                  <p className="mt-1 font-heading text-2xl font-bold text-streak">
                    12
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Goal pace</p>
                  <p className="mt-1 font-heading text-2xl font-bold text-success">
                    On track
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              {["Spanish", "Guitar", "TypeScript", "Cooking"].map((skill, index) => (
                <div key={skill} className="surface-card p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        [
                          "bg-accent",
                          "bg-violet-500",
                          "bg-sky-500",
                          "bg-rose-500",
                        ][index]
                      }`}
                    />
                    <p className="text-sm font-medium text-text-primary">{skill}</p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-text-primary">
                    {["32h", "18h", "12h", "9h"][index]}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {["8-day streak", "4-day streak", "3-day streak", "2-day streak"][index]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
