# Adviento para Melancho 🎄

Calendario de adviento: 24 puertitas que se abren solo el día que les toca (diciembre 2026).

## Cambiar los mensajes
Todo el contenido está en **`data.js`**:
- `DAYS`: el texto de cada día (`titulo`, `texto`, `emoji` y, en los cupones, `cupon`).
- `FOTOS`: qué foto sale en cada día (archivo dentro de `fotos/` + `pie` de foto).
- `FOTOS_FINAL`: las fotos de la pantalla final del día 24.
- `SIGN`: la firma de las cartas.
- `NTFY_TOPIC`: tema de ntfy donde te llegan los avisos (cuando abre una puertita o canjea un cupón).
- `RECORDATORIO_HORA`: hora del recordatorio diario en su calendario (ej. `"08:00"`).
- `WHATSAPP` y `WHATSAPP_MENSAJES`: tu número y los mensajes que ya salen escritos.

Edita solo lo que está entre comillas. Para comillas dentro de un texto usa « ».

## Agregar una foto
1. Pon la foto en `fotos/` (ideal: .webp o .jpg de máximo ~1000 px de alto).
2. Úsala en `FOTOS` o `FOTOS_FINAL` dentro de `data.js`.
3. En `sw.js` agrégala a la lista y cambia `VERSION` (por ejemplo `adviento-v1` → `adviento-v2`).

## Cambiar la canción
Reemplaza `musica.mp3` por otra canción (mismo nombre) y en `sw.js` sube `VERSION`.

## Modo prueba
Agrega `#prueba` al final del link para ver todas las puertitas desbloqueadas (y el álbum). En este modo no se envía ningún aviso.

## Avisos (ntfy)
1. Instala la app **ntfy** y suscríbete al tema de `NTFY_TOPIC`.
2. Abre el link con `#avisos` al final y toca "Enviar aviso de prueba".
Si ella no tiene internet, el aviso queda guardado y se envía la próxima vez que abra la página.

## Estructura
- `index.html` — estructura de la página
- `css/styles.css` — diseño
- `js/app.js` — lógica (fechas, puertitas, cupones, contador, álbum)
- `js/avisos.js` — avisos ntfy, recordatorio .ics y WhatsApp
- `og.jpg` — imagen de vista previa al compartir el link
- `js/effects.js` — nieve, destellos y confeti
- `js/music.js` + `musica.mp3` — "Noche de paz" en cajita musical (dominio público)
- `sw.js` + `manifest.webmanifest` + `icons/` — app instalable y sin internet

## Publicar en Render (Static Site)
1. New → Static Site → repo `Melanie-amor-mio`.
2. Root Directory: `adviento`
3. Build Command: vacío.
4. Publish Directory: `.`
