const CACHE = 'usterki-v88';
const FILES = ['./', 'index.html', 'app.css', 'app.js', 'guard.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png', 'icons/icon-64.png', 'icons/icon-maskable-512.png',
  'vendor/pdf.min.js', 'vendor/pdf.worker.min.js', 'vendor/jspdf.umd.min.js', 'vendor/jszip.min.js', 'vendor/pdf-lib.min.js',
  'vendor/mozjpeg_enc.js', 'vendor/mozjpeg_enc.wasm', 'vendor/LiberationSans-Regular.ttf', 'vendor/LiberationSans-Bold.ttf'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); // jednorazowo: wersja 1.17.7 nie mogła pokazać paska aktualizacji
});
// Nowa wersja czeka, aż użytkownik kliknie „Zaktualizuj” (albo zamknie aplikację)
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); 
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'usterki-licencja').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Biblioteki: najpierw pamięć podręczna. Pliki aplikacji: najpierw sieć (szybkie aktualizacje), offline z pamięci.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isVendor = new URL(req.url).pathname.includes('/vendor/');
  const save = res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; };
  if (isVendor) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(save)));
  } else {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(save).catch(() => caches.match(req, { ignoreSearch: true }).then(h => h || caches.match('index.html'))));
  }
});
