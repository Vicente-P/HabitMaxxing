import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || !("id" in session.user) || typeof session.user.id !== "string" || !session.user.id.trim()) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
