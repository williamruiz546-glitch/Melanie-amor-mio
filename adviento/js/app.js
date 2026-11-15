/* =========================================================
   Adviento para Melancho — lógica de la app
   (los textos están en data.js)
   ========================================================= */

// Modo prueba: abre la página con #prueba al final del link para ver todas las puertitas.
const TEST = location.hash === "#prueba";

// ====== LÓGICA DE FECHAS (igual que la versión original) ======
const ORDER = [7,15,2,22,11,19,4,13,24,9,1,17,20,6,12,3,23,10,16,5,21,14,8,18];
const $ = id => document.getElementById(id);
const grid = $("grid"), overlay = $("overlay"), stage = $("stage"), toast = $("toast");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let opened = {};
try{opened = JSON.parse(localStorage.getItem("adviento-opened")||"{}")}catch(e){}
const saveOpened = ()=>{try{localStorage.setItem("adviento-opened",JSON.stringify(opened))}catch(e){}};
let redeemed = {};
try{redeemed = JSON.parse(localStorage.getItem("adviento-canjeados")||"{}")}catch(e){}
const saveRedeemed = ()=>{try{localStorage.setItem("adviento-canjeados",JSON.stringify(redeemed))}catch(e){}};

let today = new Date(); today.setHours(0,0,0,0);
const unlockDate = d => new Date(YEAR,11,d);
const isUnlocked = d => TEST || today >= unlockDate(d);
const isToday = d => today.getTime() === unlockDate(d).getTime();

function daysTogether(){
  const start = new Date(2023,9,15);
  return Math.floor((today - start)/86400000);
}
const plural = (n, w) => `${n} ${w}${n===1?"":"s"}`;
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}

// ====== GUIRNALDA ======
(function bulbs(){
  const path = document.querySelector(".garland .wire path"), box = $("bulbs");
  const colors = ["#ff6b7f","#f8d27a","#7fe0b0","#8fc8ff","#ffb36b"];
  const n = innerWidth < 560 ? 13 : 19, len = path.getTotalLength();
  for (let i = 0; i < n; i++){
    const p = path.getPointAtLength(len * (i + .5) / n);
    const b = document.createElement("i"); b.className = "bulb";
    b.style.cssText = `left:${p.x/4}%;top:${p.y + 2}px;--c:${colors[i%colors.length]};--dl:${(i*0.37)%2.4}s;--d:${2 + (i%3)*.5}s`;
    box.appendChild(b);
  }
})();

// ====== CONTADOR EN VIVO ======
const pad2 = n => String(n).padStart(2,"0");
function renderCount(){
  const now = new Date();
  const xmas = new Date(YEAR,11,25);
  const first = new Date(YEAR,11,1);
  const el = $("count"), box = $("countdown");
  if (now >= xmas){
    box.classList.add("done");
    el.textContent = "¡Feliz Navidad! 🎄❤️";
  } else {
    let s = Math.floor((xmas - now)/1000);
    const d = Math.floor(s/86400); s -= d*86400;
    const h = Math.floor(s/3600); s -= h*3600;
    const m = Math.floor(s/60); s -= m*60;
    $("cdD").textContent = d; $("cdH").textContent = pad2(h); $("cdM").textContent = pad2(m); $("cdS").textContent = pad2(s);
    if (today < first){
      const f = Math.round((first - today)/86400000);
      el.textContent = `La primera puertita se abre en ${plural(f,"día")} ⏳`;
    } else el.textContent = "";
  }
  // Si pasó la medianoche con la app abierta, se actualizan las puertitas
  const t = new Date(now); t.setHours(0,0,0,0);
  if (t.getTime() !== today.getTime()){ today = t; render(); }
}
if (TEST) $("testBadge").innerHTML = '<span class="test">MODO PRUEBA: todo desbloqueado</span>';

// ====== PUERTITAS ======
const LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1zm2 0h6V7a3 3 0 0 0-6 0v3z"/></svg>';

function render(){
  grid.innerHTML = "";
  ORDER.forEach((d,i)=>{
    const b = document.createElement("button");
    const unlocked = isUnlocked(d), isOpen = !!opened[d] && unlocked, hoy = isToday(d) && !opened[d];
    b.type = "button";
    b.className = `door v${i%4}`;
    b.dataset.day = d;
    if (!unlocked) b.classList.add("locked");
    if (hoy) b.classList.add("today");
    if (isOpen) b.classList.add("opened");
    b.setAttribute("aria-label", `Día ${d}` + (!unlocked ? ", todavía cerrada" : isOpen ? `, ya abierta: ${DAYS[d].titulo}` : hoy ? ", ¡es la de hoy!" : ", lista para abrir"));
    b.innerHTML = `
      <span class="inside" aria-hidden="true"><span class="in-emoji">${DAYS[d].emoji}</span><span class="in-day">${d}</span></span>
      <span class="lid" aria-hidden="true">
        <span class="back"></span>
        <span class="face"><span class="rv"></span><span class="rh"></span><span class="bow"></span><span class="medal">${d}</span>${unlocked?"":`<span class="lock">${LOCK_SVG}</span>`}</span>
      </span>
      ${hoy ? '<span class="sparkle s1"></span><span class="sparkle s2"></span><span class="tag-today">Hoy</span>' : ""}`;
    b.addEventListener("click",()=>openDoor(d,b));
    grid.appendChild(b);
  });
  renderProgress();
}

function renderProgress(){
  const n = Object.keys(DAYS).filter(d => opened[d] && isUnlocked(+d)).length;
  $("progressText").innerHTML = `Has abierto <b>${n}</b> de 24 puertitas`;
  $("progressFill").style.width = `${n/24*100}%`;
  $("progressBar").setAttribute("aria-valuenow", n);
}

// ====== MENSAJITOS ======
function showToast(msg){
  toast.textContent = msg; toast.classList.add("show");
  clearTimeout(showToast.t); showToast.t = setTimeout(()=>toast.classList.remove("show"),2800);
}
const LOCKED_MSGS = [
  f => `Paciencia, mi amor 😌 Esta se abre en ${plural(f,"día")}`,
  f => `Todavía no, curiosa 🙈 Faltan ${plural(f,"día")}`,
  f => `Shhh… es sorpresa 🤫 Vuelve en ${plural(f,"día")}`,
  f => `Ni lo intentes, Melancho 😏 Se abre en ${plural(f,"día")}`,
  f => `Lo bueno se hace esperar 💛 ${f===1?"Mañana":"En "+plural(f,"día")} es su día`
];
let lockedIdx = 0;
const vibrate = p => { try{ navigator.vibrate && navigator.vibrate(p) }catch(e){} };

// ====== ABRIR UNA PUERTITA ======
let lastFocus = null, busy = false;

function openDoor(d,btn){
  if (busy) return;
  if(!isUnlocked(d)){
    btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake");
    const f = Math.round((unlockDate(d)-today)/86400000);
    showToast(LOCKED_MSGS[lockedIdx++ % LOCKED_MSGS.length](f));
    vibrate(20);
    return;
  }
  lastFocus = btn;
  const first = !opened[d];
  const r = btn.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
  vibrate(first ? [18,40,28] : 12);

  if (first){
    busy = true;
    btn.classList.remove("today");
    btn.querySelectorAll(".sparkle,.tag-today").forEach(e=>e.remove());
    btn.classList.add("opening");
    flash(cx, cy);
    setTimeout(()=>FX.burst(cx, cy, {n: 40, power: 6}), 180);
    setTimeout(()=>{
      opened[d] = true; saveOpened();
      btn.classList.add("opened"); btn.classList.remove("opening");
      renderProgress();
      busy = false;
      show(d, true);
    }, reduceMotion ? 50 : 750);
  } else {
    show(d, false);
  }
}

function flash(x, y){
  const f = $("flash");
  f.style.setProperty("--x", x+"px"); f.style.setProperty("--y", y+"px");
  f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
}

// ====== CONTENIDO ======
function photoHTML(d, cls = ""){
  const p = (typeof FOTOS !== "undefined") && FOTOS[d];
  if (!p) return "";
  const wide = /videollamada/.test(p.src) ? " wide" : "";
  return `<figure class="polaroid ${cls}${wide}"><img src="${esc(p.src)}" alt="${esc(p.pie || "Foto de nosotros")}" decoding="async">${p.pie?`<figcaption>${esc(p.pie)}</figcaption>`:""}</figure>`;
}
const textOf = c => esc(c.texto).replace("{DIAS}", daysTogether().toLocaleString("es"));
// Letra capital decorativa solo si el texto empieza con una letra (no con número ni ¿)
const txtClass = c => /^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(c.texto) ? "txt cap" : "txt";
const ribbon = (d,c) => `<div class="ribbon-tag">${d} de diciembre · ${LABEL[c.tipo]}</div>`;
const SIGN_HTML = () => `<div class="sign">${esc(SIGN)} ❤️</div>`;
const HEART_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 82C22 62 12 46 12 33a17 17 0 0 1 38-9 17 17 0 0 1 38 9c0 13-10 29-38 49z"/></svg>';

function letterHTML(d,c){
  // En los recuerdos la foto va grande arriba; en cartas, pequeñita
  const big = c.tipo === "recuerdo";
  return `
    <article class="letter">
      ${ribbon(d,c)}
      <div class="emoji" aria-hidden="true">${c.emoji}</div>
      <h2 id="cardTitle">${esc(c.titulo)}</h2>
      ${photoHTML(d, big ? "" : "small")}
      <p class="${txtClass(c)}">${textOf(c)}</p>
      ${SIGN_HTML()}
      <button class="btn-close" type="button" data-close>Cerrar</button>
    </article>`;
}

function envelopeHTML(){
  return `
    <div class="envelope" aria-hidden="true">
      <div class="env-back"></div>
      <div class="env-paper"><i></i></div>
      <div class="env-front"></div>
      <div class="env-flap"></div>
      <div class="env-seal">${HEART_SVG}</div>
      <div class="env-to">Para Melancho</div>
    </div>`;
}

function ticketHTML(d,c){
  const done = redeemed[d];
  return `
    <article class="ticket">
      ${ribbon(d,c)}
      ${done ? stampHTML(done) : ""}
      <div class="t-main">
        <p class="t-kicker">Cupón de amor</p>
        <h2 class="t-title" id="cardTitle">${esc(c.titulo)}</h2>
        <div class="t-coupon">${c.emoji} ${esc(c.cupon)}</div>
        <p class="txt">${textOf(c)}</p>
      </div>
      <div class="t-stub">
        <div class="t-meta"><span>Válido para Melanie<br>Firmado por su flaquito</span><b>Nº ${pad2(d)}</b></div>
        <button class="btn-redeem" type="button" data-redeem="${d}" ${done?"disabled":""}>${done ? "Canjeado ✓" : "Canjear cupón"}</button>
        <button class="btn-link" type="button" data-close>Guardar para después</button>
      </div>
    </article>`;
}
function stampHTML(iso, pop){
  const f = new Date(iso).toLocaleDateString("es",{day:"numeric",month:"short"});
  return `<div class="stamp${pop?" pop":""}">Canjeado<small>${esc(f)}</small></div>`;
}

function finaleHTML(d,c){
  const fotos = (typeof FOTOS_FINAL !== "undefined" ? FOTOS_FINAL : []);
  return `
    <div class="finale-view" id="finaleView">
      <p class="fin-eyebrow">24 de diciembre · Nochebuena</p>
      <h2 class="fin-title" id="cardTitle">${esc(c.titulo)}</h2>
      <div class="fin-days"><b id="finDays">0</b><span>días siendo novios</span></div>
      ${fotos.length ? `<div class="gallery" aria-label="Nuestras fotos">${fotos.map((src,i)=>`<figure class="polaroid"><img src="${esc(src)}" alt="Foto de nosotros ${i+1}" decoding="async"></figure>`).join("")}</div>` : ""}
      ${fotos.length > 1 ? `<p class="gallery-hint">Desliza para ver más fotos →</p>` : "<span></span>"}
      <article class="letter">
        <div class="emoji" aria-hidden="true">${c.emoji}</div>
        <p class="${txtClass(c)}">${textOf(c)}</p>
        ${SIGN_HTML()}
        <button class="btn-close" type="button" data-close>Cerrar</button>
      </article>
    </div>`;
}

let seqTimers = [];
function runSequence(steps){
  seqTimers.forEach(clearTimeout); seqTimers = [];
  steps.forEach(([cls, t]) => seqTimers.push(setTimeout(()=>stage.classList.add(cls), t)));
}
function skipSequence(){
  if (stage.classList.contains("s4") || stage.classList.contains("instant")) return;
  seqTimers.forEach(clearTimeout); stage.classList.add("s1","s2","s3","s4");
}

function show(d, first){
  const c = DAYS[d];
  stage.className = "stage";
  overlay.classList.remove("finale");

  if (c.tipo === "final"){
    overlay.classList.add("finale");
    stage.innerHTML = finaleHTML(d,c);
    openOverlay();
    requestAnimationFrame(()=>requestAnimationFrame(()=>$("finaleView").classList.add("in")));
    countUp($("finDays"), daysTogether(), 1800);
    FX.grand(); vibrate([30,60,30,60,80]);
  } else if (c.tipo === "cupon"){
    stage.innerHTML = ticketHTML(d,c);
    openOverlay();
    if (reduceMotion) stage.classList.add("instant");
    else runSequence([["s4", 40]]);
  } else {
    if (first && !reduceMotion){
      stage.innerHTML = envelopeHTML() + letterHTML(d,c);
      openOverlay();
      runSequence([["s1",30],["s2",520],["s3",1000],["s4",1500]]);
    } else {
      stage.innerHTML = letterHTML(d,c);
      openOverlay();
      requestAnimationFrame(()=>stage.classList.add("instant"));
    }
  }
}

function countUp(el, to, ms){
  if (reduceMotion){ el.textContent = to.toLocaleString("es"); return; }
  const t0 = performance.now();
  const step = t => {
    const k = Math.min(1, (t - t0)/ms), e = 1 - Math.pow(1-k, 3);
    el.textContent = Math.round(to*e).toLocaleString("es");
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function openOverlay(){
  overlay.classList.add("show"); overlay.setAttribute("aria-hidden","false");
  overlay.scrollTop = 0;
  document.body.classList.add("lock");
  setTimeout(()=>stage.focus({preventScroll:true}), 60);
}
function closeCard(){
  seqTimers.forEach(clearTimeout);
  overlay.classList.remove("show"); overlay.setAttribute("aria-hidden","true");
  document.body.classList.remove("lock");
  if (lastFocus) lastFocus.focus({preventScroll:true});
}

// Clicks dentro de la ventana
stage.addEventListener("click", e => {
  if (e.target.closest("[data-close]")) return closeCard();
  const r = e.target.closest("[data-redeem]");
  if (r) return redeem(r);
  skipSequence();
});
overlay.addEventListener("click", e => { if (e.target === overlay) closeCard(); });
document.addEventListener("keydown", e => {
  if (!overlay.classList.contains("show")) return;
  if (e.key === "Escape") closeCard();
  if (e.key === "Tab"){                      // mantener el foco dentro de la ventana
    const f = [...stage.querySelectorAll("button:not([disabled])")];
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length-1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length-1]){ e.preventDefault(); f[0].focus(); }
  }
});

// Canjear cupón (pide confirmación con un segundo toque)
function redeem(btn){
  const d = btn.dataset.redeem;
  if (redeemed[d]) return;
  if (!btn.classList.contains("confirm")){
    btn.classList.add("confirm"); btn.textContent = "¿Lo canjeas ahora? Toca otra vez";
    clearTimeout(btn._t); btn._t = setTimeout(()=>{ btn.classList.remove("confirm"); btn.textContent = "Canjear cupón"; }, 3500);
    return;
  }
  clearTimeout(btn._t);
  redeemed[d] = new Date().toISOString(); saveRedeemed();
  btn.classList.remove("confirm"); btn.disabled = true; btn.textContent = "Canjeado ✓";
  btn.closest(".ticket").insertAdjacentHTML("beforeend", stampHTML(redeemed[d], true));
  const r = btn.getBoundingClientRect();
  FX.burst(r.left + r.width/2, r.top, {n: 30, power: 5, hearts: .6});
  vibrate([10,30,40]);
  showToast("¡Cupón canjeado! Avísale a tu flaquito 😘");
}

// ====== MÚSICA ======
const musicBtn = $("musicBtn");
function setMusicUI(on){
  musicBtn.setAttribute("aria-pressed", on);
  musicBtn.setAttribute("aria-label", on ? "Apagar música navideña" : "Encender música navideña");
}
musicBtn.addEventListener("click", () => {
  if (Music.on){ Music.stop(); setMusicUI(false); return; }
  setMusicUI(true);
  Music.play().then(
    () => showToast("🎶 Noche de paz, para ti"),
    () => { setMusicUI(false); showToast("No pude poner la música 😢 Sube el volumen y toca otra vez"); }
  );
});

// ====== BIENVENIDA ======
$("enterBtn").addEventListener("click", () => {
  const s = $("splash");
  s.classList.add("gone");
  $("app").setAttribute("aria-hidden","false");
  vibrate(15);
  const b = $("enterBtn").getBoundingClientRect();
  FX.burst(b.left + b.width/2, b.top, {n: 36, power: 6, hearts: .5});
  setTimeout(()=>{ s.remove(); const t = grid.querySelector(".door.today") || grid.querySelector(".door"); t && t.focus({preventScroll:true}); }, 900);
});

window.addEventListener("hashchange",()=>location.reload());

// ====== APP INSTALABLE (sin internet) ======
if ("serviceWorker" in navigator && location.protocol.startsWith("http")){
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

render();
renderCount();
setInterval(renderCount, 1000);
