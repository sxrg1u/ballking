// Entry point: game loop, HUD and wiring between engine, scene and UI.
import * as E from './engine.js';
import { GROUNDS, DEFAULT_BALL_COLORS } from './config.js';
import { Scene, MAX_VISIBLE_BALLS, MAX_VISUAL_RATE } from './scene.js';
import { UI, toast, banner } from './ui.js';
import { fmt, pct, setNotation } from './format.js';
import * as audio from './audio.js';
import { save, load, wipe, exportSave, importSave } from './save.js';
import { COUNTRIES } from './stars.js';
import { icon } from './icons.js';
import { drawPortrait } from './sprites.js';
import { flagImg } from './flags.js';
import { starLook } from './ui.js';


const $ = id => document.getElementById(id);
let state = load() || E.newState();

const scene = new Scene($('scene'), $('overlay'));
const game = {
  get state() { return state; },
  tps: () => E.tpPerSec(state, E.expectedStreak(state), state.highestRating),
  onBuy(id, n) {
    if (E.buyUpgrade(state, id, n)) { audio.buy(); syncScene(); ui.refresh(); ui.flash(id); }
  },
  onBuyOne(id) {
    if (!E.buyOneOff(state, id)) return;
    audio.buy();
    const it = E.findOneOff(id);
    if (E.oneOffKind(id) === 'ground') {
      banner('NEW TRAINING GROUND', it.name, it.desc);
      audio.cheer(false);
      scene.confetti(60);
    } else {
      toast(`<b>${it.name}</b> joined your career. x${it.mult} TP`);
    }
    syncScene();
    ui.render();
  },
  onSettings() { applySettings(); save(state); },
  onExport: () => exportSave(state),
  onImport(text) {
    const s = importSave(text);
    if (!s) return false;
    state = s; resetScene(); applySettings(); ui.render(); save(state);
    toast('Save imported.');
    return true;
  },
  onReset() {
    wipe(); state = E.newState(); resetScene(); applySettings(); ui.render(); save(state);
    toast('New career started. Good luck, Ravi!');
  },
};
const ui = new UI(game);

// ---------- Scene sync ----------
function lookFor(s) {
  const star = E.currentStar(s.highestRating);
  const boots = E.bootsColor(s);
  return {
    skin: star.skin, hair: star.hair, style: star.style, beard: star.beard, kit: star.kit,
    boots, barefoot: !!star.street && !boots, street: !!star.street, aura: s.highestRating >= 99,
  };
}

let portraitKey = '';
function syncScene() {
  scene.look = lookFor(state);
  // Player card: portrait, kit stripe, legend glow
  const key = JSON.stringify(scene.look);
  if (key !== portraitKey) {
    portraitKey = key;
    drawPortrait($('portrait'), scene.look);
    const k = scene.look.kit;
    $('fut-kit').style.background = `linear-gradient(90deg, ${k.shirt} 0 50%, ${k.shorts} 50%)`;
    const st = E.currentStar(state.highestRating);
    $('fut-nation').innerHTML = flagImg(st.nation, 2);
    $('fut-num').textContent = '#' + st.num;
    const nx = E.nextStar(state.highestRating);
    if (nx) drawPortrait($('next-face'), nx.rating === 99 ? { ...starLook(nx), kit: { shirt: '#333333', shorts: '#222222', socks: '#222222' }, hair: '#222222', skin: 1 } : starLook(nx));
    $('next-face').style.display = nx ? '' : 'none';
  }
  $('fut').classList.toggle('legend', state.highestRating >= 99);
  scene.ground = GROUNDS[E.activeGround(state)].id;
  scene.ballColors = E.ballColors(state, DEFAULT_BALL_COLORS);
  scene.setBallCount(E.ballCount(state));
}

function resetScene() {
  scene.balls = [];
  scene.setBallCount(E.ballCount(state), true);
  syncScene();
}

function applySettings() {
  setNotation(state.settings.notation);
  scene.reducedMotion = state.settings.reducedMotion;
  audio.applySettings(state.settings);
}

// ---------- Events ----------
let lastFloat = 0;
function onPass(ok, x, y) {
  const s = state;
  if (ok) {
    s.streak++;
    if (s.streak > s.bestStreak) s.bestStreak = s.streak;
    audio.tock();
    // Show what one visible pass is worth (includes balls that are not drawn).
    const shown = Math.min(E.ballCount(s), MAX_VISIBLE_BALLS) * Math.min(E.passRatePerBall(s), MAX_VISUAL_RATE) * E.successRate(s);
    const now = performance.now();
    if (now - lastFloat > 280) {
      lastFloat = now;
      scene.floatText('+' + fmt(game.tps() / shown, 1), x, y - Math.random() * 30);
    }
  } else {
    s.streak = 0;
    audio.miss();
    scene.floatText('MISS', x, y, 'miss');
  }
}

function handleEvents(events) {
  for (const ev of events) {
    if (ev.type === 'rating') {
      const el = $('rating');
      el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
      if (ev.to > 99) {
        banner('LEGEND STAR', 'Rating ' + ev.to, `${ev.to - 99} stars beyond everyone`);
        audio.cheer(true); scene.confetti(80);
      } else if (!events.some(e => e.type === 'star')) audio.levelUp();
    }
    if (ev.type === 'star') {
      const st = ev.star;
      if (st.rating === 99) banner('THE GREATEST', st.name, 'You made it. Now become even better.');
      else banner('NEW PLAYER', st.name, `#${st.num} &middot; ${flagImg(st.nation, 2)} ${COUNTRIES[st.nation]} &middot; from ${st.from} &middot; Rating ${st.rating}`);
      audio.cheer(true);
      scene.confetti(140);
      syncScene();
      if (ui.view === 'career') ui.render();
    }
    if (ev.type === 'unlock') {
      const kind = E.oneOffKind(ev.item.id);
      toast(`New ${kind} available: <b>${ev.item.name}</b>`);
      if (ui.view === 'upgrades') ui.refresh();
    }
  }
}

// ---------- HUD ----------
function updateHud() {
  const s = state;
  const tps = game.tps();
  $('tp').textContent = fmt(s.tp);
  $('tps').textContent = '+' + fmt(tps, 1) + '/s';
  $('pps').textContent = fmt(E.attemptsPerSec(s), 2);

  const prog = E.ratingProgress(s.xp);
  const star = E.currentStar(s.highestRating);
  const next = E.nextStar(s.highestRating);
  $('rating').textContent = s.highestRating;
  $('player-name').textContent = star.name;
  const meta = `<span class="num">#${star.num}</span><span>${flagImg(star.nation, 2)} ${COUNTRIES[star.nation]}</span><span>from ${star.street ? 'Mumbai streets, age 14' : star.from}</span>` +
    (s.highestRating >= 99 ? `<span class="num">\u2605 x${s.highestRating - 99}</span>` : '');
  if ($('player-meta').dataset.h !== meta) { $('player-meta').innerHTML = meta; $('player-meta').dataset.h = meta; }
  $('xp-bar').style.width = (prog.frac * 100).toFixed(1) + '%';
  $('xp-text').textContent = `${fmt(s.xp - prog.from)} / ${fmt(prog.to - prog.from)}  (${Math.floor(prog.frac * 100)}%)`;
  const nextHtml = next
    ? (next.rating === 99 ? `Next: <b>???</b> at rating 99` : `Next: <b>${next.name}</b> <span class="num">#${next.num}</span> ${flagImg(next.nation, 2)} from ${next.from} &middot; rating ${next.rating}`)
    : `Legend mode: <b>rating ${s.highestRating + 1}</b> next`;
  if ($('next-player').dataset.h !== nextHtml) { $('next-player').innerHTML = nextHtml; $('next-player').dataset.h = nextHtml; }

  $('streak').textContent = fmt(s.streak);
  $('streak-chip').classList.toggle('hot', s.streak >= 20);
  $('tpp').textContent = fmt(E.tpPerPass(s, E.expectedStreak(s), s.highestRating), 1);
  $('streak-mult').textContent = 'AVG x' + E.streakMult(s, E.expectedStreak(s)).toFixed(2);
  const balls = E.ballCount(s);
  $('balls').textContent = balls > MAX_VISIBLE_BALLS ? `${fmt(balls)} (${MAX_VISIBLE_BALLS} shown)` : balls;
  $('success').textContent = pct(E.successRate(s));
  $('ground-name').textContent = GROUNDS[E.activeGround(s)].name;
}

// ---------- Loop ----------
let last = performance.now(), hudTimer = 0, uiTimer = 0, saveTimer = 0;

function frame(now) {
  // Cap the step so switching tabs never gives free progress.
  const dt = Math.min(1, (now - last) / 1000);
  last = now;
  if (!document.hidden) {
    const s = state;
    scene.update(dt, Math.min(E.passRatePerBall(s), MAX_VISUAL_RATE), E.successRate(s), onPass);
    handleEvents(E.tick(s, dt));
    scene.draw();
    hudTimer += dt; uiTimer += dt; saveTimer += dt;
    if (hudTimer > 0.1) { hudTimer = 0; updateHud(); }
    if (uiTimer > 0.25) { uiTimer = 0; ui.refresh(); }
    if (saveTimer > 10) { saveTimer = 0; save(state); }
  }
  requestAnimationFrame(frame);
}

document.addEventListener('visibilitychange', () => {
  audio.setPaused(document.hidden);
  if (document.hidden) save(state);
  last = performance.now();
});
window.addEventListener('beforeunload', () => save(state));

// Browsers only allow sound after the first interaction.
const startAudio = () => { audio.initAudio(); applySettings(); };
window.addEventListener('pointerdown', startAudio, { once: true });
window.addEventListener('keydown', startAudio, { once: true });

// ---------- Start ----------
$('coin').src = icon('coin', 30);
$('fire').src = icon('fire', 20);
document.querySelectorAll('img[data-icon]').forEach(el => { el.src = icon(el.dataset.icon, 20); });
resetScene();
applySettings();
ui.render();
updateHud();
if (state.playTime < 1) toast('Welcome! Ravi, 14, from Mumbai has a ball and a wall. Buy upgrades to make him better.');
requestAnimationFrame(frame);
