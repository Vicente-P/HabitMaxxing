"use client";

import { useState } from "react";
import type { MonthDay, MonthDayStatus } from "@/features/habits/domain/month-days";

const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
// Mockup mobile frequency row order: Monday first.
const weekdayHeaders = ["L", "M", "X", "J", "V", "S", "D"];

const statusLabel: Record<MonthDayStatus, string> = {
  completed: "Cumplido",
  missed: "No cumplido",
  not_scheduled: "No programado",
  pending: "Pendiente",
};

const statusClass: Record<MonthDayStatus, string> = {
  completed: "bg-hm-success text-hm-on-accent",
  missed: "bg-hm-danger text-hm-on-accent",
  not_scheduled: "bg-hm-heat-0 text-hm-text-low",
  pending: "border border-hm-border-hi bg-transparent text-hm-text-mid",
};

function longDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} de ${monthNames[month - 1]} de ${year}`;
}

/** Mockup HabitDetail "Actividad" card (desktop-flow.jsx), month view: title/subtitle, 7-column Heatmap grid, legend, plus the day detail panel. */
export default function ActivityCard({ days, today, unit }: { days: MonthDay[]; today: string; unit: string | null }) {
  const [selected, setSelected] = useState<string | null>(null);
  const marked = days.filter((day) => day.status === "completed").length;
  const leading = (days[0].dayOfWeek + 6) % 7; // Monday-first offset
  const selectedDay = days.find((day) => day.date === selected) ?? null;

  return (
    <div className="mt-6 rounded-hm-lg border border-hm-border-lo bg-hm-surface px-4 py-[22px] sm:px-6">
      <div className="mb-[18px]">
        <h2 className="text-[15px] leading-normal font-semibold text-hm-text-hi">Actividad del mes</h2>
        <div className="mt-0.5 text-[12px] text-hm-text-low">{marked} {marked === 1 ? "día marcado" : "días marcados"} este mes</div>
      </div>

      <div className="grid max-w-md grid-cols-7 gap-[3px]">
        {weekdayHeaders.map((header) => (
          <div key={header} aria-hidden="true" className="text-center text-[10px] text-hm-text-low">{header}</div>
        ))}
        {Array.from({ length: leading }, (_, index) => <div key={`blank-${index}`} aria-hidden="true" />)}
        {days.map((day) => {
          const name = `${longDate(day.date)}: ${statusLabel[day.status]}`;
          const cell = `flex aspect-square items-center justify-center rounded-hm-xs text-[11px] tabular-nums ${statusClass[day.status]}`;
          const number = Number(day.date.slice(8));
          if (day.date > today) {
            return <div key={day.date} role="img" aria-label={name} className={cell}>{number}</div>;
          }
          return (
            <button
              key={day.date}
              type="button"
              aria-label={name}
              aria-pressed={selected === day.date}
              onClick={() => setSelected(day.date)}
              className={`${cell} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hm-accent aria-pressed:outline-2 aria-pressed:outline-offset-2 aria-pressed:outline-hm-accent`}
            >
              {number}
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <section aria-label="Detalle del día" className="mt-4 rounded-hm-sm border border-hm-border-lo bg-hm-surface-2 px-4 py-3">
          <div className="text-hm-caption font-medium text-hm-text-hi">{longDate(selectedDay.date)}</div>
          <div className="mt-1 text-hm-caption text-hm-text-mid">{statusLabel[selectedDay.status]}</div>
          {unit !== null && selectedDay.log?.value != null && (
            <div className="mt-1 text-hm-caption text-hm-text-mid">Valor: <span className="font-medium text-hm-text-hi">{selectedDay.log.value} {unit}</span></div>
          )}
        </section>
      )}

      <ul aria-label="Leyenda" className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-hm-text-low">
        {(["completed", "missed", "not_scheduled", "pending"] as const).map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-[11px] rounded-hm-xs ${statusClass[status]}`} />
            <span>{status === "not_scheduled" ? "No programado (sin penalización)" : statusLabel[status]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
