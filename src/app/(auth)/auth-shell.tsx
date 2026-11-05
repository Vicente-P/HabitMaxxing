import type { ReactNode } from "react";
import AuthIcon from "./auth-icons";

type Mode = "login" | "register";

const HEAT_DAYS = 182;
const HEAT_CLASSES = ["bg-hm-heat-0", "bg-hm-heat-1", "bg-hm-heat-2", "bg-hm-heat-3", "bg-hm-heat-4"] as const;

const COPY: Record<Mode, { overline: string; title: string; body: string; seed: number }> = {
  login: { overline: "Tu racha te espera", title: "Cada día marcado suma. No rompas la cadena.", body: "Vuelve a tu tablero, marca lo de hoy y mira cómo crece tu historial.", seed: 7 },
  register: { overline: "Empieza hoy", title: "Pequeños hábitos, todos los días, durante un año.", body: "Crea tus hábitos, márcalos con un toque y sigue tu progreso con rachas y estadísticas.", seed: 3 },
};

/** Deterministic illustrative data, ported from genHeatData in docs/design/mockup/atoms.jsx. */
function heatData(seed: number, days: number, density = 0.7) {
  let state = seed * 9301 + 49297;
  const random = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  return Array.from({ length: days }, () => {
    const r = random();
    if (r < 1 - density) return 0;
    if (r < 1 - density + 0.1) return 1;
    if (r < 1 - density + 0.25) return 2;
    if (r < 1 - density + 0.45) return 3;
    return 4;
  });
}

const HEAT = { login: heatData(COPY.login.seed, HEAT_DAYS), register: heatData(COPY.register.seed, HEAT_DAYS) };

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-[22px] items-center justify-center rounded-md bg-linear-to-br from-hm-accent to-hm-accent-lo text-hm-on-accent shadow-hm-glow">
        <AuthIcon name="check" size={12} className="stroke-[2.4]" />
      </div>
      <span className="text-hm-body font-bold tracking-tight text-hm-text-hi">Habit<span className="text-hm-accent">Maxxing</span></span>
    </div>
  );
}

function BrandPanel({ mode }: { mode: Mode }) {
  const copy = COPY[mode];
  return (
    <aside data-testid="auth-brand-panel" aria-hidden="true" className="relative hidden flex-col justify-center overflow-hidden border-l border-hm-border-lo bg-hm-surface px-16 lg:flex">
      <div className="pointer-events-none absolute -top-40 -right-40 size-130 rounded-full bg-[radial-gradient(circle,var(--hm-accent-glow),transparent_70%)] opacity-60" />
      <div className="relative max-w-110">
        <p className="mb-3.5 text-hm-overline uppercase text-hm-accent">{copy.overline}</p>
        <p className="mb-3.5 text-[34px] leading-[1.12] font-bold tracking-tight text-hm-text-hi text-pretty">{copy.title}</p>
        <p className="mb-9 text-hm-body text-hm-text-mid text-pretty">{copy.body}</p>
        <div className="rounded-hm-xl border border-hm-border bg-hm-bg p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-hm-body font-semibold leading-tight text-hm-text-hi">Meditar 10 min</p>
              <p className="text-hm-caption text-hm-text-low">Últimos 6 meses</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-hm-warn-soft px-2 py-1 text-hm-caption font-semibold text-hm-warn tabular-nums">
              <AuthIcon name="flame" size={11} className="fill-current stroke-0" />47
            </span>
          </div>
          <div className="grid grid-cols-[repeat(26,12px)] gap-[3px]">
            {HEAT[mode].map((level, index) => (
              <span key={index} data-heat={level} className={`size-3 rounded-hm-xs ${HEAT_CLASSES[level]}`} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Two-column auth layout from docs/design/mockup/auth-screens.jsx: form on the left, brand panel on the right (lg+). */
export default function AuthShell({ mode, children }: { mode: Mode; children: ReactNode }) {
  return (
    <div className="relative grid min-h-screen flex-1 overflow-hidden bg-hm-bg lg:grid-cols-2">
      <div className="pointer-events-none absolute -top-30 -right-30 size-80 rounded-full bg-[radial-gradient(circle,var(--hm-accent-glow),transparent_70%)] opacity-50 lg:hidden" />
      <div className="relative flex flex-col px-6 py-7 sm:px-12">
        <Logo />
        <main className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
      <BrandPanel mode={mode} />
    </div>
  );
}

