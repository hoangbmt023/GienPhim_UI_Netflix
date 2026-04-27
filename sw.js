const CACHE_NAME = 'gienphim-pwa-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Pass through fetch requests to allow the browser to consider this a valid PWA.
  // We can add advanced caching here later if needed.
  event.respondWith(
    fetch(event.request).catch(() => {
      // Return a basic offline response if the network fails
      return new Response("Bạn đang offline. Hãy kiểm tra lại kết nối mạng.", {
        status: 503,
        statusText: "Service Unavailable",
        headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" })
      });
    })
  );
});
