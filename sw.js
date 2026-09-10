const CACHE_NAME = 'PAS-v3';
const ASSET_CACHE = [
  './',
  './index.html',
  './detail.html',
  './home.html',
  './register.html',
  './setting.html',
  // Catatan: cdn.tailwindcss.com sengaja TIDAK dimasukkan — CDN itu tidak mengirim header CORS
  // sehingga selalu gagal diambil oleh Service Worker (beda dari cdnjs/jsdelivr di bawah ini).
  // Dia tetap jalan normal lewat <script> tag biasa, cuma tidak bisa di-precache untuk offline.
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css',
  'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/forge/2.2.1/forge.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
];

// Simpan aset saat pertama kali dibuka — satu-satu, bukan addAll(), supaya satu aset gagal
// (mis. CDN tanpa CORS, sedang offline) tidak menggagalkan seluruh instalasi Service Worker
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async c => {
      await Promise.all(ASSET_CACHE.map(url =>
        c.add(url).catch(err => console.warn('SW: gagal cache', url, err))
      ));
    }).then(() => self.skipWaiting())
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
