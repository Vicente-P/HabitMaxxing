const PATHS = {
  mail: "M2 4h12v8H2zM2 4l6 5 6-5",
  lock: "M4 7h8v7H4zM5.5 7V5a2.5 2.5 0 0 1 5 0v2",
  user: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2.5 14a5.5 5.5 0 0 1 11 0",
  alert: "M8 1.5 15 14H1zM8 6v3.5M8 11.8h.01",
  arrowRight: "M3 8h10M9 4l4 4-4 4",
  edit: "M11 2l3 3-9 9H2v-3l9-9z",
  trash: "M3 4h10M5 4V2h6v2M6 4v9M10 4v9M4 4l1 10h6l1-10",
  check: "M3 9l3 3 7-8",
  flame: "M8 1.5c.5 2 2.5 3 2.5 5.5a2.5 2.5 0 0 1-5 0c0-1 .5-1.5 1-2-.5 2 1.5 2 1.5 0 0-1.5-1.5-2.5 0-3.5z",
} as const;

export type AuthIconName = keyof typeof PATHS;

/** Line icons from docs/design/mockup/atoms.jsx (Icon), 16px grid. */
export default function AuthIcon({ name, size = 16, className = "" }: { name: AuthIconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className={`shrink-0 fill-none stroke-current ${className}`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
    </svg>
  );
}
