/* Service worker: guarda todo para que funcione sin internet.
   Si cambias o agregas fotos, sube el número de VERSION (v1 → v2) y agrega la foto a la lista. */
const VERSION = "adviento-v2";
const ASSETS = [
  "./",
  "index.html",
  "data.js",
  "css/styles.css",
  "js/app.js",
  "js/effects.js",
  "js/music.js",
  "manifest.webmanifest",
  "musica.mp3",
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
  if (req.headers.get("range")){ e.respondWith(rangeResponse(req)); return; }   // audio en iPhone
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

// Safari pide el audio por pedazos ("Range"). Respondemos ese pedazo desde la caché.
async function rangeResponse(req){
  let res = await caches.match(req.url, {ignoreSearch: true});
  if (!res){
    try {
      res = await fetch(req.url);
      if (res.ok){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(req.url, copy)); }
    } catch(e){ return fetch(req); }
  }
  const buf = await res.arrayBuffer(), size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range")) || [];
  let start = m[1] ? +m[1] : 0, end = m[2] ? +m[2] : size - 1;
  if (!m[1] && m[2]){ start = size - +m[2]; end = size - 1; }
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    "Content-Type": res.headers.get("Content-Type") || "audio/mpeg",
    "Content-Range": `bytes ${start}-${end}/${size}`,
    "Content-Length": String(end - start + 1),
    "Accept-Ranges": "bytes"
  }});
}
