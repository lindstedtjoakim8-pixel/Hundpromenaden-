const CACHE = "tassar-v1";
const ASSETS = [
  "/Hundpromenaden-/",
  "/Hundpromenaden-/index.html",
  "/Hundpromenaden-/manifest.json"
];

// Installera – cacha grundfiler
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Aktivera – rensa gamla cachar
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch – nätverket först, annars cache
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push-notiser
self.addEventListener("push", e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "Fagervikens Tassar", {
      body: data.body || "",
      icon: "/Hundpromenaden-/icon-192.png",
      badge: "/Hundpromenaden-/icon-192.png",
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow("/Hundpromenaden-/"));
});