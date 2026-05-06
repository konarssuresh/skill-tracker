import Link from "next/link";
import { Logo } from "@/components/ui";
import { validateUser } from "@/middlewares/validate-user";

export default async function DashboardPage() {
  const { user } = await validateUser();

  return (
    <main className="page-shell flex min-h-screen flex-col py-8">
      <header className="flex items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary shadow-sm transition-colors hover:bg-bg-secondary"
          >
            Settings
          </Link>
          <div className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary shadow-sm">
            {user?.email}
          </div>
        </div>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight">
            Good to see you, {user?.fullName?.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
            Your auth flow is connected now. Next we can replace this shell with
            the real featured-skill dashboard and session logging experience.
          </p>
        </div>

        <div className="surface-card p-8">
          <p className="text-sm font-medium text-text-tertiary">
            Session status
          </p>
          <p className="mt-3 font-heading text-4xl font-bold text-text-primary">
            Active
          </p>
          <p className="mt-3 text-sm leading-loose text-text-secondary">
            Signed in with a JWT session stored in an httpOnly cookie.
          </p>
        </div>
      </section>
    </main>
  );
}
