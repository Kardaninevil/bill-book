const CACHE_NAME = 'bill-book-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Simple pass-through fetch for now to avoid caching issues with dynamic data
    // This is enough to trigger the "Install App" prompt in browsers
    event.respondWith(fetch(event.request));
});
