/* Service worker: guarda todo para que funcione sin internet.
   Si cambias o agregas fotos, sube el número de VERSION (v1 → v2) y agrega la foto a la lista. */
const VERSION = "adviento-v1";
const ASSETS = [
  "./",
  "index.html",
  "data.js",
  "css/styles.css",
  "js/app.js",
  "js/effects.js",
  "js/music.js",
  "manifest.webmanifest",
  "fonts/great-vibes.woff2",
  "fonts/nunito-sans.woff2",
  "icons/apple-touch-icon.png",
  "icons/favicon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "fotos/abrazo.webp",
  "fotos/cumple.webp",
  "fotos/en-casa.webp",
  "fotos/hermosa.webp",
  "fotos/juntitos.webp",
  "fotos/la-estacion.webp",
  "fotos/la-u.webp",
  "fotos/navidad-arbol.webp",
  "fotos/navidad-luces.webp",
  "fotos/navidad-reno.webp",
  "fotos/recuerdo-anillo.webp",
  "fotos/recuerdo-nuestro-dia.webp",
  "fotos/recuerdo-videollamada.webp",
  "fotos/risa.webp",
  "fotos/tus-19.webp"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Red primero para HTML, CSS y JS (así los cambios llegan solos); caché primero para fotos, fuentes e íconos.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const url = new URL(req.url);
  const fresh = req.mode === "navigate" || /\.(js|css|webmanifest)$/.test(url.pathname);
  if (fresh){
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});
