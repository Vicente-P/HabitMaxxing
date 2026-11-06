import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import HabitCatalog from "../dashboard/habit-catalog";

/** "Hábitos": the create form and Mis hábitos (edit, delete and the detail links). */
export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user || !("id" in session.user) || typeof session.user.id !== "string" || !session.user.id.trim()) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6">
      <h1>Hábitos</h1>
      <HabitCatalog ownerId={session.user.id} />
    </main>
  );
}
