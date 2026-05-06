"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import Link from "next/link";
import { Button, Logo } from "@/components/ui";
import { CreateSkillDialog } from "@/app/dashboard/create-skill-dialog";
import { LogSessionDialog } from "@/app/dashboard/log-session-dialog";
import { useUiStore } from "@/stores/ui-store";
import { apiRequest } from "@/utils/api";

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (remainder === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
}

function AnimatedSkillCard({ skill, index }) {
  const goalLabel =
    skill.goal?.type === "weekly"
      ? `${formatMinutes(skill.goal.targetMinutes)}/week`
      : skill.goal?.type === "total"
        ? `${formatMinutes(skill.goal.targetMinutes)} goal`
        : "No goal yet";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.32, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="surface-card group relative overflow-hidden p-5"
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-1.5 origin-left"
        style={{ backgroundColor: skill.color }}
        initial={{ scaleX: 0.2, opacity: 0.4 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.12 + index * 0.05, duration: 0.45 }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: skill.color }}
            />
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-text-tertiary">
              Skill
            </p>
          </div>
          <h3 className="mt-3 text-2xl font-bold text-text-primary">
            {skill.name}
          </h3>
        </div>

        <motion.div
          whileHover={{ rotate: 6 }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle text-lg font-bold text-accent"
        >
          {skill.name.slice(0, 1).toUpperCase()}
        </motion.div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-text-tertiary">Total time</p>
          <p className="mt-1 font-heading text-2xl font-bold">
            {formatMinutes(skill.totalMinutes)}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-tertiary">Sessions</p>
          <p className="mt-1 font-heading text-2xl font-bold">
            {skill.sessionCount}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-tertiary">Current streak</p>
          <p className="mt-1 font-heading text-2xl font-bold text-streak">
            {skill.currentStreakDays}d
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-loose text-text-secondary">
        {goalLabel}
      </p>
    </motion.article>
  );
}

function RecentSessionCard({ session, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.28 }}
      className="rounded-[1.25rem] border border-border-subtle bg-surface p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: session.skill?.color || "#059669" }}
            />
            <p className="text-sm font-medium text-text-primary">
              {session.skill?.name || "Unknown skill"}
            </p>
          </div>
          <p className="mt-2 text-sm leading-loose text-text-secondary">
            {session.notes || "No notes added for this session."}
          </p>
        </div>

        <div className="text-right">
          <p className="font-heading text-xl font-bold text-text-primary">
            {formatMinutes(session.durationMinutes)}
          </p>
          <p className="mt-1 text-sm text-text-tertiary">{session.sessionDate}</p>
        </div>
      </div>
    </motion.article>
  );
}

function EmptyState({ onCreateSkill }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card relative overflow-hidden p-8 sm:p-10"
    >
      <motion.div
        className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-accent/10"
        animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-streak/10"
        animate={{ scale: [1, 1.1, 1], y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
          First skill
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold leading-tight text-text-primary sm:text-4xl">
          Start by creating the skill you want to practice consistently.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
          Once your first skill exists, we can log sessions against it, grow a
          streak, and turn this dashboard into something that feels alive.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button onClick={onCreateSkill}>Create your first skill</Button>
          <div className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary shadow-sm">
            Curated colors, optional goals, animated workflow
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardShell({ user }) {
  const openCreateSkillDialog = useUiStore((state) => state.openCreateSkillDialog);
  const openLogSessionDialog = useUiStore((state) => state.openLogSessionDialog);

  const skillsQuery = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const response = await apiRequest("/api/skills");
      return response.data ?? [];
    },
  });

  const sessionsQuery = useQuery({
    queryKey: ["sessions", { limit: 5 }],
    enabled: Boolean(skillsQuery.data?.length),
    queryFn: async () => {
      const response = await apiRequest("/api/sessions?limit=5");
      return response.data ?? [];
    },
  });

  const summary = useMemo(() => {
    const skills = skillsQuery.data ?? [];
    const totalMinutes = skills.reduce((sum, skill) => sum + skill.totalMinutes, 0);
    const totalSessions = skills.reduce((sum, skill) => sum + skill.sessionCount, 0);

    return {
      count: skills.length,
      totalMinutes,
      totalSessions,
    };
  }, [skillsQuery.data]);

  return (
    <>
      <main className="page-shell flex min-h-screen flex-col py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={openLogSessionDialog}
              disabled={!skillsQuery.data?.length}
            >
              + Log session
            </Button>
            <Button onClick={openCreateSkillDialog}>+ Create skill</Button>
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

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-card relative overflow-hidden p-8"
          >
            <motion.div
              className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,var(--color-accent),#34d399,var(--color-streak))]"
              initial={{ scaleX: 0.3, opacity: 0.4 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.55 }}
            />

            <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight">
              Good to see you, {user?.fullName?.split(" ")[0] || "there"}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
              {skillsQuery.data?.length
                ? "Your skill layer is live. Now you can start capturing actual practice sessions and watch the dashboard begin to mean something."
                : "Let&apos;s start the product with the cleanest useful workflow: create a skill, then we&apos;ll build session logging on top of it."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-[1.25rem] border border-border-subtle bg-surface px-5 py-5 shadow-sm"
              >
                <p className="text-sm font-medium text-text-tertiary">Tracked skills</p>
                <p className="mt-2 font-heading text-4xl font-bold text-text-primary">
                  {summary.count}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-[1.25rem] border border-border-subtle bg-surface px-5 py-5 shadow-sm"
              >
                <p className="text-sm font-medium text-text-tertiary">Invested time</p>
                <p className="mt-2 font-heading text-4xl font-bold text-text-primary">
                  {formatMinutes(summary.totalMinutes)}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-[1.25rem] border border-border-subtle bg-surface px-5 py-5 shadow-sm"
              >
                <p className="text-sm font-medium text-text-tertiary">Logged sessions</p>
                <p className="mt-2 font-heading text-4xl font-bold text-text-primary">
                  {summary.totalSessions}
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="surface-card p-8"
          >
            <p className="text-sm font-medium text-text-tertiary">Current focus</p>
            <p className="mt-3 font-heading text-4xl font-bold text-text-primary">
              {skillsQuery.data?.length ? "Log session" : "Create skill"}
            </p>
            <p className="mt-3 text-sm leading-loose text-text-secondary">
              {skillsQuery.data?.length
                ? "The next high-value loop is live now too: pick a skill, enter a flexible duration, add notes if you want, and save the practice immediately."
                : "This first UI slice is intentionally polished: motion-rich CTA, animated dialog, and a real API-backed create flow."}
            </p>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="mt-6 flex h-20 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,var(--color-accent-subtle),rgba(245,158,11,0.12))] text-sm font-medium text-text-secondary"
            >
              {skillsQuery.data?.length
                ? "Quick presets, flexible duration parsing, and animated session capture."
                : "Motion-powered micro-interactions are active here."}
            </motion.div>
          </motion.div>
        </section>

        <section className="mt-8">
          {skillsQuery.isLoading ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {[0, 1].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.45, 0.8, 0.45] }}
                  transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
                  className="surface-card h-64 p-6"
                />
              ))}
            </div>
          ) : skillsQuery.data?.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {skillsQuery.data.map((skill, index) => (
                <AnimatedSkillCard key={skill.id} skill={skill} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState onCreateSkill={openCreateSkillDialog} />
          )}
        </section>

        {skillsQuery.data?.length ? (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
                  Recent sessions
                </p>
                <h2 className="mt-2 text-2xl font-bold text-text-primary">
                  Practice you logged recently
                </h2>
              </div>
              <Button variant="ghost" onClick={openLogSessionDialog}>
                Log another
              </Button>
            </div>

            {sessionsQuery.isLoading ? (
              <div className="grid gap-4">
                {[0, 1, 2].map((item) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0.45 }}
                    animate={{ opacity: [0.45, 0.8, 0.45] }}
                    transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
                    className="surface-card h-28 p-6"
                  />
                ))}
              </div>
            ) : sessionsQuery.data?.length ? (
              <div className="grid gap-4">
                {sessionsQuery.data.map((session, index) => (
                  <RecentSessionCard key={session.id} session={session} index={index} />
                ))}
              </div>
            ) : (
              <div className="surface-card p-6 text-sm text-text-secondary">
                No sessions logged yet. Your first saved session will show up here.
              </div>
            )}
          </section>
        ) : null}
      </main>

      <CreateSkillDialog />
      <LogSessionDialog skills={skillsQuery.data ?? []} />
    </>
  );
}
