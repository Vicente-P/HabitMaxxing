import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import OfflineBanner from "../offline-status";
import LogoutButton from "./dashboard/logout-button";
import Logo from "./logo";
import { MobileTabBar, SidebarNav } from "./shell-nav";
import ThemeToggle from "./theme-toggle";

function initialsOf(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : label.trim().slice(0, 1);
  return letters.toUpperCase();
}

/**
 * Authenticated app shell (HU-15): mockup sidebar on desktop, compact header + bottom tab bar on mobile.
 * It only reads the session for the user block; every page still authenticates and redirects by itself.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user;
  const label = user?.name?.trim() || user?.email?.trim();
  if (!label) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="sticky top-0 hidden h-screen w-58 shrink-0 flex-col gap-[22px] border-r border-hm-border-lo py-[22px] pr-3.5 pl-5 lg:flex">
        <Logo />
        <div className="mt-1 px-[11px] text-hm-overline text-hm-text-low">NAVEGAR</div>
        <SidebarNav />
        <div className="flex-1" />
        <div className="flex flex-col gap-3 border-t border-hm-border-lo pt-3.5">
          <div className="flex items-center gap-2.5 px-1">
            <div aria-hidden="true" className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-hm-accent to-hm-warn text-[12px] font-bold text-hm-on-accent">{initialsOf(label)}</div>
            <div className="min-w-0 flex-1 truncate text-[13px] font-semibold text-hm-text-hi">{label}</div>
          </div>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <header className="flex items-center justify-between gap-3 border-b border-hm-border-lo px-4 py-2 lg:hidden">
          <Logo />
          <LogoutButton />
        </header>
        <div className="min-w-0 flex-1 pb-28 lg:pb-0">{children}</div>
      </div>
      <MobileTabBar />
    </div>
  );
}
