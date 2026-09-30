// Service Worker Uninstaller and Cache Purger
// This script purges any stale Service Worker caches and unregisters itself immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Purging stale cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Unregister itself
      return self.registration.unregister();
    }).then(() => {
      // Notify all open client tabs to reload cleanly without worker
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          client.navigate(client.url);
        }
      });
    })
  );
});

// Pass all fetch requests directly through without intercepting or caching
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
