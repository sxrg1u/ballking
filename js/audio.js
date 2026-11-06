// All sounds are generated with the Web Audio API (no audio files).
let ctx = null, master = null, sfxGain = null, musicGain = null;
let settings = { sfx: true, music: true, volume: 0.6 };
let lastTock = 0, musicTimer = null, nextNoteTime = 0, step = 0;

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  sfxGain = ctx.createGain();
  musicGain = ctx.createGain();
  sfxGain.connect(master);
  musicGain.connect(master);
  master.connect(ctx.destination);
  applySettings(settings);
}

export function applySettings(s) {
  settings = s;
  if (!ctx) return;
  master.gain.value = s.volume;
  sfxGain.gain.value = s.sfx ? 1 : 0;
  musicGain.gain.value = 0.18;
  if (s.music) startMusic(); else stopMusic();
}

function tone(freq, start, dur, type = 'square', vol = 0.2, dest = sfxGain, slideTo = null) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g); g.connect(dest);
  o.start(start); o.stop(start + dur + 0.02);
}

function noise(start, dur, vol, filterFreq, dest = sfxGain) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = buf;
  f.type = 'bandpass'; f.frequency.value = filterFreq; f.Q.value = 0.8;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(f); f.connect(g); g.connect(dest);
  src.start(start);
}

// Ball hits the wall. Throttled so many balls don't get noisy.
export function tock() {
  if (!ctx || !settings.sfx) return;
  const now = ctx.currentTime;
  if (now - lastTock < 0.09) return;
  lastTock = now;
  tone(140 + Math.random() * 40, now, 0.08, 'sine', 0.35, sfxGain, 70);
  noise(now, 0.04, 0.08, 2500);
}

export function miss() {
  if (!ctx || !settings.sfx) return;
  const now = ctx.currentTime;
  tone(300, now, 0.25, 'triangle', 0.12, sfxGain, 120);
}

export function buy() {
  if (!ctx || !settings.sfx) return;
  const now = ctx.currentTime;
  tone(660, now, 0.07, 'square', 0.08);
  tone(990, now + 0.06, 0.1, 'square', 0.08);
}

// Crowd cheer + fanfare for a new player / big moment.
export function cheer(big = true) {
  if (!ctx || !settings.sfx) return;
  const now = ctx.currentTime;
  noise(now, big ? 1.8 : 0.9, 0.25, 900);
  noise(now + 0.1, big ? 1.6 : 0.8, 0.15, 1800);
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => tone(f, now + i * 0.11, 0.25, 'square', 0.07));
  if (big) tone(1047, now + 0.45, 0.6, 'triangle', 0.12);
}

export function levelUp() {
  if (!ctx || !settings.sfx) return;
  const now = ctx.currentTime;
  tone(784, now, 0.08, 'square', 0.06);
  tone(1175, now + 0.07, 0.14, 'square', 0.06);
}

// ---- Simple chiptune loop ----
const BPM = 112, STEP = 60 / BPM / 2; // eighth notes
// Chord roots per bar (C, Am, F, G) and a little melody (0 = rest).
const BASS = [131, 110, 87, 98];
const MELODY = [
  523, 0, 659, 0, 784, 659, 0, 523,
  440, 0, 523, 0, 659, 0, 523, 440,
  349, 0, 440, 523, 0, 440, 349, 0,
  392, 0, 494, 0, 587, 494, 392, 0,
];

function scheduleMusic() {
  while (nextNoteTime < ctx.currentTime + 0.2) {
    const bar = Math.floor(step / 8) % 4;
    if (step % 2 === 0) tone(BASS[bar], nextNoteTime, STEP * 1.6, 'triangle', 0.5, musicGain);
    const m = MELODY[step % MELODY.length];
    if (m) tone(m, nextNoteTime, STEP * 0.9, 'square', 0.12, musicGain);
    if (step % 4 === 2) noise(nextNoteTime, 0.05, 0.12, 6000, musicGain);
    nextNoteTime += STEP;
    step++;
  }
}

function startMusic() {
  if (musicTimer || !ctx) return;
  nextNoteTime = ctx.currentTime + 0.1;
  musicTimer = setInterval(scheduleMusic, 50);
}

function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}

// Pause music while the tab is hidden (game is paused then anyway).
export function setPaused(paused) {
  if (!ctx) return;
  if (paused) ctx.suspend(); else ctx.resume();
}
