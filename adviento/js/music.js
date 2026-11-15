/* =========================================================
   Música: "Noche de paz" (F. X. Gruber, 1818 — dominio público)
   tocada como cajita musical con Web Audio API. Sin archivos.
   ========================================================= */
const Music = (() => {
  const N = { C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
              C5:523.25, D5:587.33, E5:659.25, F5:698.46 };
  // [nota, duración en corcheas] — compás de 6/8
  const MELODY = [
    ["G4",3],["A4",1],["G4",2],["E4",6], ["G4",3],["A4",1],["G4",2],["E4",6],
    ["D5",4],["D5",2],["B4",6], ["C5",4],["C5",2],["G4",6],
    ["A4",4],["A4",2],["C5",3],["B4",1],["A4",2],["G4",3],["A4",1],["G4",2],["E4",6],
    ["A4",4],["A4",2],["C5",3],["B4",1],["A4",2],["G4",3],["A4",1],["G4",2],["E4",6],
    ["D5",4],["D5",2],["F5",3],["D5",1],["B4",2],["C5",6],["E5",6],
    ["C5",2],["G4",2],["E4",2],["G4",3],["F4",1],["D4",2],["C4",12]
  ];
  const CH = { C:[130.81,164.81,196.00], F:[174.61,220.00,261.63], G:[196.00,246.94,293.66], G7:[196.00,246.94,349.23] };
  const BASS = { C:65.41, F:87.31, G:98.00, G7:98.00 };
  const BARS = ["C","C","C","C","G","G","C","C","F","F","C","C","F","F","C","C","G","G7","C","C","C","G7","C","C"];
  const EIGHTH = 0.3;                 // segundos por corchea
  const LOOP = BARS.length * 6 * EIGHTH;

  let ctx, master, wet, timer, startAt = 0, nextLoop = 0, playing = false;

  function impulse(sec){
    const len = ctx.sampleRate * sec, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++){
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 3);
    }
    return buf;
  }

  function setup(){
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    const rev = ctx.createConvolver(); rev.buffer = impulse(2.8);
    wet = ctx.createGain(); wet.gain.value = .45;
    wet.connect(rev).connect(master);
  }

  function out(node, dry = .8){
    const g = ctx.createGain(); g.gain.value = dry;
    node.connect(g).connect(master); node.connect(wet);
  }

  function bell(f, t, vol = .22){
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .006);
    g.gain.exponentialRampToValueAtTime(.0008, t + 2.2);
    [[1,1],[2,.28],[3.01,.08],[5.4,.03]].forEach(([m,a]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = "sine"; o.frequency.value = f*m; og.gain.value = a;
      o.connect(og).connect(g); o.start(t); o.stop(t + 2.3);
    });
    out(g);
  }

  function pad(freqs, t, dur){
    const g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 900;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.035, t + .6);
    g.gain.setValueAtTime(.035, t + dur - .4);
    g.gain.linearRampToValueAtTime(0, t + dur + .3);
    freqs.forEach((f,i) => {
      const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f; o.detune.value = (i-1)*4;
      o.connect(g); o.start(t); o.stop(t + dur + .4);
    });
    g.connect(lp); out(lp, .7);
  }

  function bass(f, t){
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .03);
    g.gain.exponentialRampToValueAtTime(.001, t + 1.6);
    o.connect(g); o.start(t); o.stop(t + 1.7); out(g, .9);
  }

  function scheduleLoop(t0){
    let t = t0;
    MELODY.forEach(([n, d]) => { bell(N[n], t); t += d * EIGHTH; });
    BARS.forEach((c, i) => {
      const bt = t0 + i * 6 * EIGHTH;
      pad(CH[c], bt, 6 * EIGHTH);
      bass(BASS[c], bt);
      // arpegio suave en el segundo tiempo
      bell(CH[c][1]*2, bt + 3*EIGHTH, .05);
    });
  }

  function tick(){
    if (!playing) return;
    if (ctx.currentTime > nextLoop - 2){ scheduleLoop(nextLoop); nextLoop += LOOP + EIGHTH*2; }
  }

  async function play(){
    if (!ctx) setup();
    await ctx.resume();
    playing = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(.55, ctx.currentTime, .6);
    if (nextLoop < ctx.currentTime){ nextLoop = ctx.currentTime + .15; }
    tick(); clearInterval(timer); timer = setInterval(tick, 500);
  }

  function stop(){
    if (!ctx) return;
    playing = false; clearInterval(timer);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, .25);
    setTimeout(() => { if (!playing){ ctx.suspend(); } }, 1200);
  }

  // Si la app pasa a segundo plano, pausamos; al volver, seguimos.
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !playing) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });

  return { play, stop, get on(){ return playing; } };
})();
