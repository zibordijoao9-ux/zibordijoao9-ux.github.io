// ── SERVICE WORKER — Auto-update ──────────────────────────────────────────
// Mude este número toda vez que fizer deploy (ou deixe o GitHub Actions fazer isso)
const VERSION = "v1";
const CACHE = `jb-manager-${VERSION}`;
const ASSETS = ["/", "/index.html"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  // Sempre tenta buscar versão nova da rede primeiro
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});

// Notifica o app quando uma nova versão está disponível
self.addEventListener("message", e => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
