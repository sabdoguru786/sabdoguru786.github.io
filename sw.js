const CACHE_NAME = 'PAS-v7';
const ASSET_CACHE = [
  './',
  './index.html',
  './detail.html',
  './download.html',
  './home.html',
  './register.html',
  './setting.html',
  './hikmah.html',
  './icon.svg',
  './app.webmanifest.json',
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

// Halaman HTML (navigasi) pakai network-first — selalu ambil versi terbaru dari server dulu
// supaya update kode langsung kepakai, baru fallback ke cache kalau memang lagi offline.
// Aset statis (CSS/JS library) tetap cache-first supaya cepat & bisa dipakai offline.
self.addEventListener('fetch', e => {
  // Jangan pernah ikut campur request ke backend Apps Script (Google Sheets API kita).
  // Apps Script Web App selalu redirect 302 lintas-origin (script.google.com ->
  // script.googleusercontent.com) untuk mengembalikan hasilnya — kalau request ini ikut
  // dicegat & di-passthrough lewat Service Worker, redirect-nya bisa gagal dengan error
  // CORS palsu ("Failed to fetch") padahal server aslinya baik-baik saja. Biarkan browser
  // yang menangani langsung, tanpa lewat Service Worker sama sekali.
  if (e.request.url.includes('script.google.com') || e.request.url.includes('script.googleusercontent.com')) {
    return;
  }

  const isHalamanHTML = e.request.mode === 'navigate' ||
    (e.request.method === 'GET' && e.request.headers.get('accept')?.includes('text/html'));

  if (isHalamanHTML) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const salinan = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, salinan));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
