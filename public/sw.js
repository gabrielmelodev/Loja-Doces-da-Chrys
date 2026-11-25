const CACHE_NAME = "doces-da-chrys-static-v1";
const STATIC_ASSETS = [
  "/icons/icon.svg",
  "/images/banner.jpg",
  "/images/mousse-1.jpg",
  "/images/mousse-2.jpg",
  "/images/mousse-3.jpg",
  "/images/cheesecake-1.jpg",
  "/images/cheesecake-2.jpg",
  "/images/cheesecake-3.jpg",
  "/images/pave-1.jpg",
  "/images/pave-2.jpg",
  "/images/pave-3.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("doces-da-chrys-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/images/") && !url.pathname.startsWith("/icons/")) return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});
