/** Mockup `Logo` (desktop-dashboards.jsx): gradient tile with a check, then the wordmark with an accent "Maxxing". */
export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div aria-hidden="true" className="flex size-[22px] items-center justify-center rounded-md bg-linear-to-br from-hm-accent to-hm-accent-lo text-hm-on-accent shadow-hm-glow">
        <svg width="12" height="12" viewBox="0 0 16 16" className="fill-none stroke-current" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l3 3 7-8" />
        </svg>
      </div>
      <span className="text-[15px] font-bold tracking-[-0.02em] text-hm-text-hi">Habit<span className="text-hm-accent">Maxxing</span></span>
    </div>
  );
}
