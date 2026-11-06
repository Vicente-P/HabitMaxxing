import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AuthIcon from "../../../(auth)/auth-icons";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFrequency } from "@/features/habits";
import { getHabitStreak } from "@/features/habits/application/get-habit-streak";
import { createPrismaHabitRepository } from "@/features/habits/infrastructure/prisma-habit-repository";

const habitRepository = createPrismaHabitRepository(prisma);

const days = (count: number) => `${count} ${count === 1 ? "día" : "días"}`;

/** Habit detail (HU-12): top bar, hero with the current streak. Edit/delete/mark-today and stats arrive with later stories. */
export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !("id" in session.user) || typeof session.user.id !== "string" || !session.user.id.trim()) {
    redirect("/login");
  }

  const { id } = await params;
  const result = await getHabitStreak({ ownerId: session.user.id, habitId: id }, habitRepository, new Date());
  if (!result.ok) notFound();

  const { habit, streak } = result;
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
      </div>
    </main>
  );
}
