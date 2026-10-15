/* FlightBrief service worker — generated. Version e57e0851603c.
 * Precaches ONLY the static shell. Never caches uploaded PDFs, extracted text, assessments
 * or any API response. No skipWaiting: a new version activates only after all app windows close. */
const VERSION = "e57e0851603c";
const CACHE = "fb-shell-e57e0851603c";
const ASSETS = ["./","./icon-180.png","./icon-192.png","./icon-512.png","./index-CP3p0ing.js","./index-D0Zolh1c.css","./index.html","./manifest.webmanifest","./pdf.worker.min-DgRcL-GR.js","./pdf.worker.min-yatZIOMy.mjs","./asset-manifest.json"];
const COMPLETE = './__shell_complete__';
const abs = (p) => new URL(p, self.registration.scope).href;
const SHELL = new Set(ASSETS.map(abs));

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      // addAll is all-or-nothing; then verify every entry and write a completion marker last.
      await cache.addAll(ASSETS.map((a) => new Request(abs(a), { cache: 'reload' })));
      for (const a of ASSETS) if (!(await cache.match(abs(a)))) throw new Error('missing ' + a);
      await cache.put(abs(COMPLETE), new Response(VERSION));
    } catch (err) {
      await caches.delete(CACHE);
      throw err; // install fails; previous version (if any) stays in control
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('fb-shell-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(abs('./index.html'))) || (await cache.match(abs('./'))) || fetch(req);
    })());
    return;
  }
  const key = url.origin + url.pathname;
  if (SHELL.has(key)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(key)) || fetch(req);
    })());
  }
  // Anything else: network only, never cached.
});
