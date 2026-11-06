import { ImageResponse } from "next/og";
import { PWA_COLORS } from "./pwa";

/**
 * The Logo tile (docs/design/mockup/desktop-dashboards.jsx) as a PNG: violet gradient with the check mark.
 * `rounded` icons (purpose "any") get a rounded tile on a transparent canvas; full-bleed ones (maskable, Apple)
 * fill the square and keep the check inside the safe zone, because the OS applies its own mask.
 */
export function renderPwaIcon(size: number, rounded: boolean) {
  const glyph = Math.round(size * (rounded ? 0.56 : 0.46));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(135deg, ${PWA_COLORS.accent}, ${PWA_COLORS.accentLow})`,
          borderRadius: rounded ? Math.round(size * 0.22) : 0,
        }}
      >
        <svg width={glyph} height={glyph} viewBox="0 0 16 16" fill="none" stroke={PWA_COLORS.onAccent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l3 3 7-8" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
