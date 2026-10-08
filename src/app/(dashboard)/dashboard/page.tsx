import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LogoutButton from "./logout-button";
import HabitCatalog from "./habit-catalog";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || !("id" in session.user) || typeof session.user.id !== "string" || !session.user.id.trim()) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1>Dashboard</h1>
        <LogoutButton />
      </header>
      <HabitCatalog key={session.user.id} ownerId={session.user.id} />
    </div>
  );
}
