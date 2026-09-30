// Service worker for the ISSTM PWA.
//
// Deliberately conservative: this site's content (news, admin-edited
// banners, préinscription state) changes constantly, and this project has
// already been burned once by a stale-asset caching bug (Inertia's own
// asset-version check serving old JS after a rebuild). To never repeat that:
//
// - Only /build/... is cached. Those filenames are content-hashed by Vite
//   (app-XXXXXX.js) — a new deploy produces new filenames, so caching them
//   aggressively is safe and never serves stale code.
// - Every navigation (the HTML document itself) and every other request
//   (Inertia JSON, API calls, admin-uploaded images) goes network-first, and
//   only falls back to cache when genuinely offline. The published page is
//   what's trusted first, on every load, while the tab is online.
// - Only GET requests are ever cached. POST/PATCH/DELETE always go straight
//   to the network.
const CACHE_NAME = 'isstm-static-v1';
const STATIC_PREFIX = '/build/';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))),
        ),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) {
        return;
    }

    if (url.pathname.startsWith(STATIC_PREFIX)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
    }

    return response;
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        throw error;
    }
}
