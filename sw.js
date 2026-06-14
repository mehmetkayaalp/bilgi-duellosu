// Bilgi Düellosu — Service Worker
// Strateji: önce ağ, başarısız olursa önbellek (geliştirme sırasında
// dosyalar bayatlamaz, internet yokken oyun yine de açılır).

const CACHE = 'bilgi-duellosu-v11';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'data.js',
  'engine.js',
  'game.js',
  'net.js',
  'online.js',
  'firebase-config.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
];

// HTML/JS/CSS için "önce ağ" (taze sürüm gelsin); diğerleri için cache yeterli.

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Başarılı yanıtı önbelleğe yaz (sadece kendi dosyalarımızı)
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request, { ignoreSearch: true })
          .then((hit) => hit || caches.match('index.html'))
      )
  );
});
