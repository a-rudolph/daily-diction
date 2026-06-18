/**
 * Daily Diction service worker — hand-rolled, no Serwist/next-pwa.
 * Keeps the default Next.js 16 Turbopack build.
 *
 * Caching strategy:
 *   /_next/static/**  → cache-first (immutable content-hashed assets)
 *   /api/exercises    → stale-while-revalidate (prompts available offline)
 *   everything else   → network-only (auth-protected RSC pages, attempt POSTs)
 *
 * Web Speech API requires a network connection in Chrome/Edge — this SW
 * makes prompts *readable* offline but recognition still needs connectivity.
 */

const STATIC_CACHE = 'dd-static-v2';
const DATA_CACHE = 'dd-data-v1';

// ─── Lifecycle ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  // Skip waiting so updates activate immediately on next navigation.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  // Remove caches from previous versions.
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== DATA_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET — POSTs (attempt logging) always go to network.
  if (request.method !== 'GET') return;

  // Immutable Next.js static assets: cache-first, never expire.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(STATIC_CACHE, request));
    return;
  }

  // Exercises data: stale-while-revalidate so prompts load offline.
  if (url.pathname.startsWith('/api/exercises')) {
    event.respondWith(staleWhileRevalidate(DATA_CACHE, request));
    return;
  }

  // PWA icon: cache-first (rarely changes).
  if (url.pathname.startsWith('/pwa-icon')) {
    event.respondWith(cacheFirst(STATIC_CACHE, request));
    return;
  }

  // Everything else (RSC pages, auth routes) → network only.
});

// ─── Strategies ───────────────────────────────────────────────────────────────

async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached ?? (await fetchPromise);
}
