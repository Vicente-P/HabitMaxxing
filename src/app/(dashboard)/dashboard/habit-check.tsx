type Props = { checked: boolean; label: string; disabled?: boolean; onToggle: () => void };

/** Round completion check from docs/design/mockup/atoms.jsx (HabitCheck), inside a 44px touch target. */
export default function HabitCheck({ checked, label, disabled = false, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      disabled={disabled}
      onClick={onToggle}
      className="group flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-hm-accent disabled:opacity-50"
    >
      <span
        className={`flex size-7 items-center justify-center rounded-full border-[1.5px] transition-all duration-150 ${
          checked
            ? "border-hm-accent bg-hm-accent text-hm-on-accent shadow-[0_0_0_4px_var(--hm-accent-soft)]"
            : "border-hm-border group-hover:border-hm-border-hi"
        }`}
      >
        {checked && (
          <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" className="fill-none stroke-current" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8l3 3 5-7" />
          </svg>
        )}
      </span>
    </button>
  );
}
