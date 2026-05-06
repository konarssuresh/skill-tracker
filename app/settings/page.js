import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui";
import { validateUser } from "@/middlewares/validate-user";
import { LogoutSection } from "@/app/settings/logout-section";

export default async function SettingsPage() {
  const { isValid, user } = await validateUser();

  if (!isValid) {
    redirect("/auth/login");
  }

  return (
    <main className="page-shell flex min-h-screen flex-col py-8">
      <header className="flex items-center justify-between gap-4">
        <Logo />
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/dashboard"
            className="rounded-full border border-border bg-surface px-4 py-2 text-text-secondary shadow-sm transition-colors hover:bg-bg-secondary"
          >
            Back to dashboard
          </Link>
        </nav>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
            Settings
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight">
            Manage your account
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            Signed in as <span className="font-semibold text-text-primary">{user?.email}</span>.
            This page will grow into the home for account controls, preferences,
            and future product settings.
          </p>
        </div>

        <LogoutSection />
      </section>
    </main>
  );
}
