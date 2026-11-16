/* =========================================================
   Extras: avisos para mí (ntfy), recordatorio en el calendario
   de ella (.ics) y respuestas por WhatsApp.
   La configuración está en data.js.
   ========================================================= */

// ====== AVISOS (ntfy) ======
const Avisos = (() => {
  const KEY = "adviento-avisos-pendientes";
  const MODO_PRUEBA = location.hash === "#prueba";
  let queue = [], sending = false;
  try { queue = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch(e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(queue)); } catch(e) {} };

  // Los encabezados HTTP no aceptan emojis tal cual: se codifican (RFC 2047), ntfy los entiende.
  function header(s){
    const bytes = new TextEncoder().encode(s);
    let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b));
    return "=?UTF-8?B?" + btoa(bin) + "?=";
  }

  async function post(a){
    const res = await fetch("https://ntfy.sh/" + encodeURIComponent(NTFY_TOPIC), {
      method: "POST",
      body: a.text,
      headers: { "Title": header(a.title || "Adviento 🎄"), "Tags": a.tags || "gift" }
    });
    if (!res.ok) throw new Error("ntfy " + res.status);
  }

  // Envía todo lo pendiente; lo que falle se queda guardado para la próxima vez.
  async function flush(){
    if (sending || !queue.length || typeof NTFY_TOPIC === "undefined" || !NTFY_TOPIC) return;
    sending = true;
    try {
      while (queue.length){
        try { await post(queue[0]); } catch(e) { break; }
        queue.shift(); save();
      }
    } finally { sending = false; }
  }

  // Avisos de verdad: nunca en modo prueba.
  function send(text){
    if (MODO_PRUEBA) return;
    queue.push({ text, title: "Adviento 🎄", tags: "gift", at: Date.now() });
    save(); flush();
  }

  // Aviso de prueba (#avisos): se manda al instante y dice si llegó.
  async function test(){
    const hora = new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", hour12: false });
    await post({ text: `🔔 Aviso de prueba (${hora}). ¡Los avisos del adviento te van a llegar aquí!`, title: "Adviento 🎄", tags: "gift" });
    flush();
  }

  addEventListener("online", flush);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) flush(); });
  setTimeout(flush, 1500);

  return { send, test, flush, get pending(){ return queue.length; } };
})();

const horaAhora = () => new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", hour12: false });

// ====== RECORDATORIO DIARIO (.ics) ======
const Recordatorio = (() => {
  const [HH, MM] = RECORDATORIO_HORA.split(":").map(Number);
  const p2 = n => String(n).padStart(2, "0");
  const local = (d, h, m) => `${YEAR}12${p2(d)}T${p2(h)}${p2(m)}00`;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const esc = s => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  // Las líneas de un .ics no pueden pasar de 75 bytes: se doblan.
  function fold(line){
    const enc = new TextEncoder(); let out = "", cur = "", len = 0;
    for (const ch of line){
      const n = enc.encode(ch).length;
      if (len + n > 74){ out += cur + "\r\n "; cur = ""; len = 1; }
      cur += ch; len += n;
    }
    return out + cur;
  }

  function build(){
    const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    const endH = HH + Math.floor((MM + 15) / 60), endM = (MM + 15) % 60;
    const L = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Adviento para Melancho//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "X-WR-CALNAME:Adviento 🎄", `X-WR-TIMEZONE:${RECORDATORIO_ZONA}`,
      "BEGIN:VTIMEZONE", `TZID:${RECORDATORIO_ZONA}`,
      "BEGIN:STANDARD", "DTSTART:19700101T000000", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0500", "TZNAME:-05", "END:STANDARD",
      "END:VTIMEZONE"
    ];
    for (let d = 1; d <= 24; d++){
      L.push(
        "BEGIN:VEVENT",
        `UID:adviento-${YEAR}-12-${p2(d)}@adviento-melancho`,
        `DTSTAMP:${now}`,
        `DTSTART;TZID=${RECORDATORIO_ZONA}:${local(d, HH, MM)}`,
        `DTEND;TZID=${RECORDATORIO_ZONA}:${local(d, endH, endM)}`,
        "SUMMARY:Tu puertita de hoy 🎁",
        `DESCRIPTION:${esc(`Ya puedes abrir la puertita del día ${d} ❤️\n${LINK_APP}`)}`,
        `URL:${LINK_APP}`,
        "TRANSP:TRANSPARENT",
        "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Tu puertita de hoy 🎁", "TRIGGER:PT0S", "END:VALARM",
        "END:VEVENT"
      );
    }
    L.push("END:VCALENDAR");
    return L.map(fold).join("\r\n") + "\r\n";
  }

  // Enlace de Google Calendar con el evento repetido 24 días (respaldo para Android)
  function googleURL(){
    const endH = HH + Math.floor((MM + 15) / 60), endM = (MM + 15) % 60;
    const q = new URLSearchParams({
      action: "TEMPLATE", text: "Tu puertita de hoy 🎁",
      dates: `${local(1, HH, MM)}/${local(1, endH, endM)}`, ctz: RECORDATORIO_ZONA,
      details: `Ya puedes abrir la puertita de hoy ❤️\n${LINK_APP}`,
      recur: "RRULE:FREQ=DAILY;COUNT=24"
    });
    return "https://calendar.google.com/calendar/render?" + q.toString();
  }

  function download(){
    const blob = new Blob([build()], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    if (isIOS && !standalone){
      location.href = url;                      // Safari abre directo "Agregar todo al calendario"
    } else {
      const a = document.createElement("a");
      a.href = url; a.download = "adviento-melancho.ics";
      document.body.appendChild(a); a.click(); a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  return { build, download, googleURL, isAndroid };
})();

// ====== WHATSAPP ======
function whatsappURL(tipo, d, c){
  const plantilla = (WHATSAPP_MENSAJES && WHATSAPP_MENSAJES[tipo]) || "";
  const pregunta = (c.texto.match(/^[^?]*\?/) || [c.titulo])[0];
  const msg = plantilla.replace("{DIA}", d).replace("{PREGUNTA}", pregunta).replace("{CUPON}", c.cupon || c.titulo);
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}
const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3z"/></svg>';
function whatsappBtn(tipo, d, c){
  return `<a class="btn-wa" href="${whatsappURL(tipo, d, c)}" target="_blank" rel="noopener">${WA_ICON}<span>Responderle a mi flaquito 💬</span></a>`;
}
