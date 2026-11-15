/* =========================================================
   Música: "Noche de paz" (F. X. Gruber, 1818 — dominio público)
   en versión cajita musical, en el archivo musica.mp3.
   Se usa un <audio> normal (y no Web Audio) porque así suena
   también en iPhone con el modo silencio activado.
   ========================================================= */
const Music = (() => {
  const audio = new Audio("musica.mp3");
  audio.loop = true;
  audio.preload = "none";              // no gasta datos hasta que ella toque el botón
  audio.setAttribute("playsinline", "");
  let playing = false, fadeT;

  function fade(to, ms, done){
    clearInterval(fadeT);
    const from = audio.volume, t0 = performance.now();
    fadeT = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      try { audio.volume = from + (to - from) * k; } catch(e) {}   // en iPhone el volumen es fijo: no pasa nada
      if (k >= 1){ clearInterval(fadeT); done && done(); }
    }, 40);
  }

  // Debe llamarse directo desde el toque del botón (los celulares lo exigen)
  function play(){
    playing = true;
    try { audio.volume = 0; } catch(e) {}
    const p = audio.play();
    fade(.8, 1200);
    return Promise.resolve(p).catch(err => { playing = false; throw err; });
  }

  function stop(){
    playing = false;
    fade(0, 500, () => { if (!playing) audio.pause(); });
  }

  // Si la app pasa a segundo plano, se pausa; al volver, sigue.
  document.addEventListener("visibilitychange", () => {
    if (!playing) return;
    if (document.hidden) audio.pause(); else audio.play().catch(() => {});
  });

  return { play, stop, get on(){ return playing; } };
})();
