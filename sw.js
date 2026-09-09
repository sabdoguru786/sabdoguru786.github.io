const CACHE_NAME = 'PAS-v1';
const ASSET_CACHE = [
  './',
  './index.html',
  './detail.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css',
  'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/forge/2.2.1/forge.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
];

// Simpan aset saat pertama kali dibuka
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSET_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Hapus cache lama saat ada pembaruan
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ).then(() => self.clients.claim())
  );
});

// Sajikan dari cache jika tersedia
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
