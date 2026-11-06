import type { MetadataRoute } from "next";
import { PWA_COLORS } from "@/lib/pwa";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "HabitMaxxing",
    short_name: "HabitMaxxing",
    description: "Trackeá tus hábitos diarios",
    lang: "es",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: PWA_COLORS.background,
    theme_color: PWA_COLORS.background,
    categories: ["health", "productivity", "lifestyle"],
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
