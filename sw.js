/* FlightBrief service worker — generated. Version 0ec2b498981d.
 * Precaches ONLY the static shell. Never caches uploaded PDFs, extracted text, assessments
 * or any API response. A new version never activates by itself: only after all app windows close, or when the crew taps
 * "Update now" (the page posts SKIP_WAITING). */
const VERSION = "0ec2b498981d";
const CACHE = "fb-shell-0ec2b498981d";
const ASSETS = ["./","./icon-180.png","./icon-192.png","./icon-512.png","./index-BCtHeC9t.js","./index-D0Av_XdD.css","./index.html","./manifest.webmanifest","./pdf.worker.min-DgRcL-GR.js","./pdf.worker.min-yatZIOMy.mjs","./asset-manifest.json"];
const COMPLETE = './__shell_complete__';
const abs = (p) => new URL(p, self.registration.scope).href;
// Some hosts (Cloudflare static assets) answer ./index.html with a redirect to ./ ; Safari refuses a navigation answered
// from the cache with a redirected response ("Response served by service worker has redirections"). Serve a clean copy.
const clean = async (res) => (res && res.redirected ? new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers }) : res);
const SHELL = new Set(ASSETS.map(abs));

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Every file is fetched and checked before it is kept: it must come from this site (a sign-in page on another site,
      // e.g. an expired Cloudflare Access session, must never be stored in place of an app file) and a script, style or
      // data file must not be an HTML page. Any failure: the install fails and the previous version stays in control.
      for (const a of ASSETS) {
        const res = await fetch(new Request(abs(a), { cache: 'reload', credentials: 'same-origin' }));
        if (!res.ok || res.type === 'opaqueredirect' || new URL(res.url).origin !== self.location.origin) throw new Error('blocked ' + a);
        const type = res.headers.get('content-type') || '';
        if (/.(m?js|css|json|webmanifest)$/.test(a) && type.includes('text/html')) throw new Error('html for ' + a);
        await cache.put(abs(a), res);
      }
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
    // The tester copy's server routes (e.g. ./api/signin) go to the network: a sign-in must reach Cloudflare.
    if (url.pathname.includes('/api/')) return;
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await clean((await cache.match(abs('./index.html'))) || (await cache.match(abs('./'))))) || fetch(req);
    })());
    return;
  }
  const key = url.origin + url.pathname;
  if (SHELL.has(key)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await clean(await cache.match(key))) || fetch(req);
    })());
  }
  // Anything else: network only, never cached.
});
