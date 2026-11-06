"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthIcon, { type AuthIconName } from "../(auth)/auth-icons";

/** Only real destinations: the mockup's Estadísticas, Calendario, Configuración and Perfil have no page yet. */
const items: { href: string; label: string; icon: AuthIconName; isActive: (path: string) => boolean }[] = [
  { href: "/dashboard", label: "Hoy", icon: "home", isActive: (path) => path === "/dashboard" },
  { href: "/habits", label: "Hábitos", icon: "list", isActive: (path) => path === "/habits" || path.startsWith("/habits/") },
];

export const createHabitHref = "/habits#crear-habito";

/** Mockup `SidebarNav`: icon + label rows, active row on surface-2 with a 2 px accent bar. */
export function SidebarNav() {
  const path = usePathname() ?? "";
  return (
    <nav aria-label="Navegación principal" className="flex flex-col gap-0.5">
      {items.map((item) => {
        const on = item.isActive(path);
        return (
          <Link
            key={item.href} href={item.href} aria-current={on ? "page" : undefined}
            className={`relative flex min-h-11 items-center gap-[11px] rounded-hm-sm px-[11px] py-[9px] text-[14px] ${on ? "bg-hm-surface-2 font-semibold text-hm-text-hi hover:text-hm-text-hi" : "font-medium text-hm-text-mid hover:bg-hm-surface-2 hover:text-hm-text"}`}
          >
            {on && <span aria-hidden="true" className="absolute inset-y-[9px] -left-3.5 w-0.5 rounded-sm bg-hm-accent" />}
            <AuthIcon name={item.icon} size={16} strokeWidth={on ? 2 : 1.6} />
            <span className="flex-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Focuses the "Nombre" field of the create form, waiting for it when the destination page is still mounting. */
function focusNameField() {
  const deadline = Date.now() + 3000;
  const attempt = () => {
    const field = document.getElementById("habit-name");
    if (field) field.focus();
    else if (Date.now() < deadline) requestAnimationFrame(attempt);
  };
  requestAnimationFrame(attempt);
}

/** Mockup `MobileTabBar`: Hoy, the round accent "+", Hábitos. */
export function MobileTabBar() {
  const path = usePathname() ?? "";
  const [today, habits] = items;
  const tab = (item: (typeof items)[number]) => {
    const on = item.isActive(path);
    return (
      <Link
        key={item.href} href={item.href} aria-current={on ? "page" : undefined}
        className={`flex min-h-11 flex-1 flex-col items-center gap-1 px-2 py-1.5 ${on ? "text-hm-accent hover:text-hm-accent" : "text-hm-text-low hover:text-hm-text"}`}
      >
        <AuthIcon name={item.icon} size={20} strokeWidth={on ? 2 : 1.6} />
        <span className={`text-[10px] ${on ? "font-semibold" : "font-medium"}`}>{item.label}</span>
      </Link>
    );
  };
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-hm-border-lo bg-linear-to-b from-transparent to-hm-bg to-30% pt-1.5 pb-7 lg:hidden"
    >
      {tab(today)}
      <Link
        href={createHabitHref} aria-label="Crear hábito" onClick={focusNameField}
        className="-mt-4 flex size-[50px] items-center justify-center rounded-full bg-hm-accent text-hm-on-accent shadow-hm-glow hover:bg-hm-accent-hi hover:text-hm-on-accent"
      >
        <AuthIcon name="plus" size={20} strokeWidth={2.6} />
      </Link>
      {tab(habits)}
    </nav>
  );
}
