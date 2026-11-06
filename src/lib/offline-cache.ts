/** Every cache owned by the service worker (public/sw.js) starts with this prefix. */
export const OFFLINE_CACHE_PREFIX = "hm-";

/**
 * Deletes the app's offline caches. They hold authenticated habit data, so this runs on logout and before login:
 * the next person to use the device must never see the previous person's habits. Never throws.
 */
export async function clearOfflineCaches(): Promise<void> {
  try {
    if (typeof caches === "undefined") return;
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(OFFLINE_CACHE_PREFIX)).map((name) => caches.delete(name)));
  } catch {
    // Storage can be unavailable or denied; this must never block logout or login.
  }
}
