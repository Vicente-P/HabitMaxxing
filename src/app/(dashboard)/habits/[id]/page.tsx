import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ActivityCard from "./activity-card";
import AuthIcon, { type AuthIconName } from "../../../(auth)/auth-icons";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFrequency } from "@/features/habits";
import { getHabitStats } from "@/features/habits/application/get-habit-stats";
import { getHabitMonthDays } from "@/features/habits/application/get-habit-month-days";
import { utcToday } from "@/features/habits/domain/calendar-date";
import { createPrismaHabitRepository } from "@/features/habits/infrastructure/prisma-habit-repository";

const habitRepository = createPrismaHabitRepository(prisma);

const days = (count: number) => `${count} ${count === 1 ? "día" : "días"}`;

/** Habit detail (HU-12, HU-14): top bar, hero with the streak, stat grid, month activity card (HU-13). Edit/delete/mark-today and more stats arrive with later stories. */
export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !("id" in session.user) || typeof session.user.id !== "string" || !session.user.id.trim()) {
    redirect("/login");
  }

  const { id } = await params;
  const now = new Date();
  const result = await getHabitStats({ ownerId: session.user.id, habitId: id }, habitRepository, now);
  if (!result.ok) notFound();
  const month = await getHabitMonthDays({ ownerId: session.user.id, habitId: id, month: result.month }, habitRepository, now);
  if (!month.ok) notFound();

  const { habit, streak, completion } = result;
  const typeText = habit.type === "BINARY" ? "Binario" : `Numérico · ${habit.unit}`;

  return (
    <main>
      <div className="flex flex-wrap items-center gap-3 border-b border-hm-border-lo px-4 py-5 sm:px-12">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-hm-caption font-medium text-hm-text-mid hover:text-hm-text">
          <AuthIcon name="arrowLeft" size={14} />
          Volver
        </Link>
        <span aria-hidden="true" className="text-hm-caption text-hm-text-dim">/</span>
        <span className="text-hm-caption text-hm-text-mid">Hábitos</span>
        <span aria-hidden="true" className="text-hm-caption text-hm-text-dim">/</span>
        <span className="min-w-0 break-words text-hm-caption font-medium text-hm-text-hi">{habit.name}</span>
      </div>

      <div className="max-w-5xl px-4 pb-12 pt-8 sm:px-12">
        <h1 className="mb-3 break-words">{habit.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-hm-body">
          <div className="flex items-center gap-1.5 font-semibold text-hm-accent">
            <AuthIcon name="flame" size={14} className="fill-current stroke-0" />
            <span>Racha actual: {days(streak.current)}</span>
          </div>
          <span aria-hidden="true" className="text-hm-text-dim">·</span>
          <span className="text-hm-text-mid">{typeText} · {formatFrequency(habit.frequency)}</span>
        </div>
        {streak.current === 0 && streak.previous > 0 && (
          <p className="mt-3 text-hm-caption text-hm-text-mid">Racha anterior: {days(streak.previous)}</p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard label="Racha actual" value={String(streak.current)} suffix={streak.current === 1 ? "día" : "días"} icon="flame" accent />
          <StatCard label="Cumplimiento mensual" value={`${completion.percentage}%`} icon="target" />
        </div>
        <p className="mt-4 text-hm-caption text-hm-text-mid">{completion.message ?? `Cumplimiento: ${completion.percentage}% este mes`}</p>

        <ActivityCard days={month.days} today={utcToday(now)} unit={habit.unit} />
      </div>
    </main>
  );
}

/** Mockup `BigStat` (desktop-flow.jsx): label + icon row, then the big value with an optional suffix. */
function StatCard({ label, value, suffix, icon, accent = false }: { label: string; value: string; suffix?: string; icon: AuthIconName; accent?: boolean }) {
  return (
    <div className="relative rounded-hm-lg border border-hm-border-lo bg-hm-surface px-5 py-[18px]">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="text-hm-caption font-medium text-hm-text-mid">{label}</div>
        <AuthIcon name={icon} size={14} className="text-hm-text-low" />
      </div>
      <div className="flex items-baseline gap-1.5">
        <div className={`text-[30px] leading-none font-bold tracking-[-0.02em] tabular-nums ${accent ? "text-hm-accent" : "text-hm-text-hi"}`}>{value}</div>
        {suffix && <div className="text-hm-caption text-hm-text-low">{suffix}</div>}
      </div>
    </div>
  );
}
