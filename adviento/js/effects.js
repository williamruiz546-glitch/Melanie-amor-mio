/* =========================================================
   Efectos: nieve + estrellas (fondo) y destellos / confeti /
   corazones (al abrir). Pensado para ir fluido en el celular.
   ========================================================= */
const FX = (() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sky = document.getElementById("sky"), sctx = sky.getContext("2d");
  const fx = document.getElementById("fx"), fctx = fx.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, flakes = [], stars = [], parts = [], fxRunning = false, last = 0;

  // Copo pre-dibujado (más barato que dibujar círculos con blur cada frame)
  const flakeImg = document.createElement("canvas");
  flakeImg.width = flakeImg.height = 32;
  (() => {
    const c = flakeImg.getContext("2d"), g = c.createRadialGradient(16,16,0,16,16,16);
    g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(.35,"rgba(255,255,255,.8)"); g.addColorStop(1,"rgba(255,255,255,0)");
    c.fillStyle = g; c.fillRect(0,0,32,32);
  })();

  function size(){
    W = innerWidth; H = innerHeight;
    sky.width = W; sky.height = H;                  // el fondo va a 1x: suave y liviano
    fx.width = W * DPR; fx.height = H * DPR; fctx.setTransform(DPR,0,0,DPR,0,0);
    const n = reduce ? 25 : Math.round(Math.min(90, Math.max(40, W*H/9000)));
    while (flakes.length < n) flakes.push(newFlake(true));
    flakes.length = n;
    stars = Array.from({length: Math.round(W*H/16000)}, () => ({
      x: Math.random()*W, y: Math.random()*H*.6, r: Math.random()*1.1+.3, p: Math.random()*Math.PI*2, s: Math.random()*.02+.006 }));
  }
  function newFlake(anyY){
    const z = Math.random();                         // profundidad: más cerca = más grande y rápido
    return { x: Math.random()*W, y: anyY ? Math.random()*H : -10, z,
             r: 1.6 + z*4, vy: .25 + z*.9, sw: Math.random()*Math.PI*2, ss: .006 + Math.random()*.012, a: .35 + z*.55 };
  }

  function drawSky(dt){
    sctx.clearRect(0,0,W,H);
    for (const s of stars){
      s.p += s.s*dt; sctx.globalAlpha = .35 + Math.sin(s.p)*.3;
      sctx.fillStyle = "#fff6dc"; sctx.fillRect(s.x, s.y, s.r, s.r);
    }
    for (const f of flakes){
      f.y += f.vy*dt*(reduce ? .4 : 1); f.sw += f.ss*dt; f.x += Math.sin(f.sw)*.35*dt;
      if (f.y > H + 10){ Object.assign(f, newFlake(false)); }
      sctx.globalAlpha = f.a; sctx.drawImage(flakeImg, f.x - f.r, f.y - f.r, f.r*2, f.r*2);
    }
    sctx.globalAlpha = 1;
  }

  const COLORS = ["#f8e2a6","#e6c26e","#fff3cf","#e35a6e","#c23a54","#ffffff"];
  const HEARTS = ["❤","❤","✦","✧"];

  function burst(x, y, opts = {}){
    const n = reduce ? 14 : (opts.n || 46), power = opts.power || 7;
    for (let i = 0; i < n; i++){
      const a = Math.random()*Math.PI*2, v = power*(.4 + Math.random()*.8);
      const kind = Math.random() < (opts.hearts ?? .35) ? "heart" : (Math.random() < .5 ? "rect" : "dot");
      parts.push({ x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v - power*.55, g: .16 + Math.random()*.08,
        life: 0, max: 70 + Math.random()*50, rot: Math.random()*6, vr: (Math.random()-.5)*.3,
        size: kind === "heart" ? 12 + Math.random()*10 : 4 + Math.random()*5,
        color: COLORS[(Math.random()*COLORS.length)|0], kind, ch: HEARTS[(Math.random()*HEARTS.length)|0] });
    }
    startFx();
  }

  // Lluvia de oro y corazones para el día 24
  function grand(){
    const shots = reduce ? 2 : 7;
    for (let i = 0; i < shots; i++){
      setTimeout(() => burst(W*(.15 + Math.random()*.7), H*(.15 + Math.random()*.35), { n: 60, power: 9, hearts: .45 }), i*380);
    }
    if (!reduce){
      for (let i = 0; i < 70; i++){
        parts.push({ x: Math.random()*W, y: -20 - Math.random()*H*.8, vx: (Math.random()-.5)*.6, vy: 1.4 + Math.random()*1.6, g: .005,
          life: 0, max: 380, rot: Math.random()*6, vr: (Math.random()-.5)*.08, size: 10 + Math.random()*12,
          color: COLORS[(Math.random()*4)|0], kind: Math.random() < .5 ? "heart" : "rect", ch: "❤", fall: true });
      }
      startFx();
    }
  }

  function drawFx(dt){
    fctx.clearRect(0,0,W,H);
    parts = parts.filter(p => p.life < p.max && p.y < H + 40);
    for (const p of parts){
      p.life += dt; p.vy += p.g*dt; p.x += p.vx*dt; p.y += p.vy*dt; p.rot += p.vr*dt;
      if (!p.fall){ p.vx *= .985; }
      const k = 1 - p.life/p.max;
      fctx.globalAlpha = Math.max(0, Math.min(1, k*1.6));
      fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot);
      fctx.fillStyle = p.color;
      if (p.kind === "heart"){ fctx.font = `${p.size}px serif`; fctx.textAlign = "center"; fctx.fillText(p.ch, 0, 0); }
      else if (p.kind === "rect"){ fctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2); }
      else { fctx.beginPath(); fctx.arc(0,0,p.size/2.4,0,6.283); fctx.fill(); }
      fctx.restore();
    }
    fctx.globalAlpha = 1;
    if (!parts.length){ fxRunning = false; fctx.clearRect(0,0,W,H); }
  }

  function startFx(){ fxRunning = true; }

  function loop(t){
    const dt = Math.min(3, last ? (t - last)/16.67 : 1); last = t;
    if (!document.hidden){
      drawSky(dt);
      if (fxRunning) drawFx(dt);
    }
    requestAnimationFrame(loop);
  }

  size();
  let rT; addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(size, 150); });
  requestAnimationFrame(loop);

  return { burst, grand };
})();
