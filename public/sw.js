/*
 * HabitMaxxing service worker (HU-19, read-only offline).
 *
 * - /_next/static and /icons: cache-first (content-hashed, immutable).
 * - Page navigations and GET /api/habits*: network-first, falling back to the last saved copy.
 * - Next.js RSC requests are NOT cached: when one fails offline, the router falls back to a full navigation,
 *   which the page cache below answers.
 * - Writes, /api/auth and anything cross-origin are never touched.
 * The caches hold authenticated data; the app deletes every "hm-" cache on logout (src/lib/offline-cache.ts).
 */
const CACHE = { static: "hm-static-v1", pages: "hm-pages-v1", api: "hm-api-v1" };
const KNOWN = new Set(Object.values(CACHE));
const MAX_STATIC_ENTRIES = 150;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("hm-") && !KNOWN.has(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;

  if (path.startsWith("/_next/static/") || path.startsWith("/icons/")) {
    event.respondWith(cacheFirst(event, request));
  } else if (path === "/api/habits" || path.startsWith("/api/habits/")) {
    event.respondWith(networkFirst(event, request, CACHE.api, () => Response.error()));
  } else if (request.mode === "navigate") {
    event.respondWith(networkFirst(event, request, CACHE.pages, offlinePage));
  }
});

async function cacheFirst(event, request) {
  const cache = await caches.open(CACHE.static);
  const hit = await cache.match(request.url);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) {
    event.waitUntil(cache.put(request.url, response.clone()).then(() => trim(cache, MAX_STATIC_ENTRIES)));
  }
  return response;
}

async function networkFirst(event, request, cacheName, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && !response.redirected) {
      event.waitUntil(cache.put(request.url, response.clone()));
    } else if (response.status === 401 || response.status === 403) {
      // The session ended: drop the saved copy so it can never be shown again.
      event.waitUntil(cache.delete(request.url));
    }
    return response;
  } catch {
    return (await cache.match(request.url, { ignoreVary: true })) || fallback();
  }
}

async function trim(cache, max) {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)));
}

function offlinePage() {
  const html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><title>HabitMaxxing</title></head>'
    + '<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center">'
    + '<main><h1>Sin conexión</h1><p>Abre HabitMaxxing con internet al menos una vez para poder usarla sin conexión.</p></main></body></html>';
  return new Response(html, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
