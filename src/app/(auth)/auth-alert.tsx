import AuthIcon from "./auth-icons";

/** Live region for form feedback. Renders the mockup's rose banner only for errors with text. */
export default function AuthAlert({ tone = "error", children }: { tone?: "error" | "info"; children: string }) {
  const banner = Boolean(children) && tone === "error";
  return (
    <div role="alert" aria-live="polite" className={banner ? "flex items-start gap-2.5 rounded-hm-md bg-hm-danger-soft px-3.5 py-3 text-hm-caption text-hm-danger" : children ? "text-hm-caption text-hm-text-mid" : undefined}>
      {banner && <AuthIcon name="alert" size={15} className="mt-0.5" />}
      {children && <span>{children}</span>}
    </div>
  );
}
