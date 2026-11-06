/**
 * Literal colors for the places that cannot read CSS variables: the web app manifest and generated PNG icons.
 * They mirror the dark (default) theme in src/app/globals.css; src/lib/pwa.test.ts fails if they drift.
 */
/* eslint-disable no-restricted-syntax -- The manifest and PNG icons need literal colors; this file is the single documented exception to the no-hex rule. */
export const PWA_COLORS = {
  background: "#0F0F11", // --hm-bg
  accent: "#7C3AED", // --hm-accent
  accentLow: "#5B21B6", // --hm-accent-lo
  onAccent: "#FFFFFF", // --hm-on-accent
} as const;
