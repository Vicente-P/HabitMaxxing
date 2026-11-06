import { renderPwaIcon } from "@/lib/pwa-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS rounds the corners itself, so the icon is full-bleed. */
export default function AppleIcon() {
  return renderPwaIcon(180, false);
}
