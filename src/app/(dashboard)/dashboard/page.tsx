import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import HabitAgenda from "./habit-agenda";

/** "Hoy": the daily agenda only. Navigation and logout live in the shell (`../layout.tsx`). */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || !("id" in session.user) || typeof session.user.id !== "string" || !session.user.id.trim()) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6">
      <h1>Dashboard</h1>
      <HabitAgenda ownerId={session.user.id} />
    </main>
  );
}
