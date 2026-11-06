// Pure game logic. No DOM access, so it runs in the browser and in Node
// (tools/calibrate.js uses it for balancing).
import {
  UPGRADES, MILESTONE_EVERY, STREAK_STEP, RATING_BONUS,
  COST_FACTOR, MIN_ONEOFF_COST, GROUNDS, COACHES, GEAR,
} from './config.js';
import { RATING_XP, EXT_GROWTH } from './ratingTable.js';
import { STARS } from './stars.js';

export const SAVE_VERSION = 1;

export function newState() {
  return {
    v: SAVE_VERSION,
    tp: 0,            // spendable Training Points
    xp: 0,            // lifetime TP, drives the rating
    passes: 0,        // successful passes (calculated)
    misses: 0,
    streak: 0,
    bestStreak: 0,
    highestRating: 1,
    playTime: 0,      // active seconds
    startedAt: Date.now(),
    upgradesBought: 0,
    levels: { tempo: 0, tech: 0, control: 0, stamina: 0, balls: 0 },
    owned: { g0: true },  // one-off items (grounds, coaches, gear)
    settings: {
      sfx: true, music: true, volume: 0.6,
      notation: 'short', reducedMotion: false, buyAmount: 1,
    },
  };
}

// ---------- Rating ----------

export function xpForRating(r) {
  if (r <= 1) return 0;
  if (r <= 99) return RATING_XP[r];
  // After 99 every rating gets a bit harder than the last (endless).
  const k = r - 99;
  return RATING_XP[99] * Math.pow(EXT_GROWTH, k + EXT_CURVE * k * k);
}

// Steepness of the endless part after rating 99.
export const EXT_CURVE = 0.04;

export function ratingFromXp(xp) {
  const top = RATING_XP[99];
  if (xp >= top) {
    const L = Math.log(xp / top) / Math.log(EXT_GROWTH);
    return 99 + Math.floor((-1 + Math.sqrt(1 + 4 * EXT_CURVE * L)) / (2 * EXT_CURVE) + 1e-9);
  }
  // Binary search: largest r with RATING_XP[r] <= xp
  let lo = 1, hi = 99;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (RATING_XP[mid] <= xp) lo = mid; else hi = mid - 1;
  }
  return lo;
}

export function ratingProgress(xp) {
  const r = ratingFromXp(xp);
  const a = xpForRating(r), b = xpForRating(r + 1);
  return { rating: r, from: a, to: b, frac: Math.min(1, Math.max(0, (xp - a) / (b - a))) };
}

export function currentStar(rating) {
  let s = STARS[0];
  for (const st of STARS) if (st.rating <= rating) s = st;
  return s;
}

export function nextStar(rating) {
  return STARS.find(st => st.rating > rating) || null;
}

// ---------- Effects ----------

const milestone = L => Math.pow(2, Math.floor(L / MILESTONE_EVERY));

export const passRatePerBall = s => 0.5 * (1 + 0.1 * s.levels.tempo) * milestone(s.levels.tempo);
export const ballCount = s => 1 + s.levels.balls;
export const successRate = s => 0.99 - 0.39 * Math.pow(0.93, s.levels.control);
export const streakCap = s => 10 + 10 * s.levels.stamina;
export const streakMult = (s, streak) => 1 + STREAK_STEP * Math.min(streak, streakCap(s));
export const techBase = s => (1 + s.levels.tech) * milestone(s.levels.tech);

const allOneOffs = () => [...GROUNDS, ...COACHES, ...GEAR];

export function globalMult(s, rating = ratingFromXp(s.xp)) {
  let m = Math.pow(RATING_BONUS, rating - 1);
  for (const it of allOneOffs()) if (s.owned[it.id]) m *= it.mult;
  return m;
}

export const tpPerPass = (s, streak, rating) => techBase(s) * streakMult(s, streak) * globalMult(s, rating);
export const attemptsPerSec = s => ballCount(s) * passRatePerBall(s);
// Long-run mean streak at the moment of a successful pass. A miss resets the
// streak, so the chance of reaching streak k is p^k. Summing those chances
// gives the capped geometric mean and keeps economy independent of frame rate.
export function expectedStreak(s) {
  const p = successRate(s);
  const cap = Math.max(0, Math.floor(streakCap(s)));
  if (!cap) return 0;
  return p * (1 - Math.pow(p, cap)) / (1 - p);
}

export const tpPerSec = (s, streak, rating) => attemptsPerSec(s) * successRate(s) * tpPerPass(s, streak, rating);

// ---------- Costs ----------

export function upgradeCost(id, level, n = 1) {
  const u = UPGRADES[id];
  const first = u.base * Math.pow(u.growth, level);
  if (n === 1) return first;
  return first * (Math.pow(u.growth, n) - 1) / (u.growth - 1);
}

export function maxAffordable(id, level, tp) {
  const u = UPGRADES[id];
  const first = u.base * Math.pow(u.growth, level);
  if (tp < first) return 0;
  return Math.floor(Math.log(tp * (u.growth - 1) / first + 1) / Math.log(u.growth));
}

export function oneOffKind(id) {
  return id[0] === 'g' ? 'ground' : id[0] === 'c' ? 'coach' : 'gear';
}

export function oneOffCost(item) {
  return Math.max(MIN_ONEOFF_COST, COST_FACTOR[oneOffKind(item.id)] * xpForRating(item.rating));
}

export function findOneOff(id) {
  return allOneOffs().find(it => it.id === id);
}

export const isUnlocked = (s, item) => s.highestRating >= item.rating;

// ---------- Actions ----------

// Buy n levels (n = 'max' allowed). Returns number of levels bought.
export function buyUpgrade(s, id, n = 1) {
  const L = s.levels[id];
  if (n === 'max') n = maxAffordable(id, L, s.tp);
  if (n <= 0) return 0;
  const cost = upgradeCost(id, L, n);
  if (cost > s.tp) return 0;
  s.tp -= cost;
  s.levels[id] += n;
  s.upgradesBought += n;
  return n;
}

export function buyOneOff(s, id) {
  const item = findOneOff(id);
  if (!item || s.owned[id] || !isUnlocked(s, item)) return false;
  const cost = oneOffCost(item);
  if (cost > s.tp) return false;
  s.tp -= cost;
  s.owned[id] = true;
  s.upgradesBought += 1;
  return true;
}

// ---------- Tick ----------

// Advance the game by dt seconds. Returns a list of events for the UI.
export function tick(s, dt) {
  const events = [];
  if (!Number.isFinite(dt) || dt <= 0) return events;
  const before = s.highestRating;
  // The visible streak is an animation across a capped number of balls. Use
  // the expected streak for the economy so hidden/fast balls count fairly.
  const gain = tpPerSec(s, expectedStreak(s), before) * dt;
  s.tp += gain;
  s.xp += gain;
  const att = attemptsPerSec(s) * dt, p = successRate(s);
  s.passes += att * p;
  s.misses += att * (1 - p);
  s.playTime += dt;

  const r = ratingFromXp(s.xp);
  if (r > before) {
    s.highestRating = r;
    events.push({ type: 'rating', from: before, to: r });
    const oldStar = currentStar(before), newStar = currentStar(r);
    if (newStar !== oldStar) events.push({ type: 'star', star: newStar });
    for (const it of allOneOffs()) {
      if (it.rating > before && it.rating <= r) events.push({ type: 'unlock', item: it });
    }
  }
  return events;
}

// Index of the best owned ground (used for the background).
export function activeGround(s) {
  let idx = 0;
  GROUNDS.forEach((g, i) => { if (s.owned[g.id]) idx = i; });
  return idx;
}

export function bootsColor(s) {
  let c = null;
  for (const g of GEAR) if (g.type === 'boots' && s.owned[g.id]) c = g.color;
  return c;
}

export function ballColors(s, fallback) {
  let c = fallback;
  for (const g of GEAR) if (g.type === 'ball' && s.owned[g.id]) c = g.colors;
  return c;
}

// Merge a loaded save with defaults so new fields are always present.
export function migrate(loaded) {
  const base = newState();
  if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded)) return base;
  const s = { ...base, ...loaded };
  const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const levels = record(loaded.levels);
  s.levels = { ...base.levels };
  for (const key of Object.keys(base.levels)) {
    const value = Number(levels[key]);
    s.levels[key] = Number.isFinite(value) ? Math.max(0, Math.min(1e9, Math.floor(value))) : 0;
  }
  const owned = record(loaded.owned);
  s.owned = { ...base.owned };
  for (const item of allOneOffs()) s.owned[item.id] = owned[item.id] === true;
  s.owned.g0 = true;
  const settings = record(loaded.settings);
  s.settings = {
    sfx: typeof settings.sfx === 'boolean' ? settings.sfx : base.settings.sfx,
    music: typeof settings.music === 'boolean' ? settings.music : base.settings.music,
    volume: Number.isFinite(Number(settings.volume)) ? Math.max(0, Math.min(1, Number(settings.volume))) : base.settings.volume,
    notation: ['short', 'sci'].includes(settings.notation) ? settings.notation : base.settings.notation,
    reducedMotion: typeof settings.reducedMotion === 'boolean' ? settings.reducedMotion : base.settings.reducedMotion,
    buyAmount: [1, 10, 100, 'max'].includes(settings.buyAmount) ? settings.buyAmount : base.settings.buyAmount,
  };
  s.v = SAVE_VERSION;
  for (const k of ['tp', 'xp', 'passes', 'misses', 'playTime']) {
    const value = Number(s[k]);
    s[k] = Number.isFinite(value) ? Math.max(0, value) : 0;
  }
  const startedAt = Number(s.startedAt);
  s.startedAt = Number.isFinite(startedAt) && startedAt > 0 ? startedAt : base.startedAt;
  s.streak = Number.isFinite(Number(s.streak)) ? Math.max(0, Math.floor(Number(s.streak))) : 0;
  s.bestStreak = Number.isFinite(Number(s.bestStreak)) ? Math.max(s.streak, Math.floor(Number(s.bestStreak))) : s.streak;
  s.upgradesBought = Number.isFinite(Number(s.upgradesBought)) ? Math.max(0, Math.floor(Number(s.upgradesBought))) : 0;
  s.highestRating = Math.max(1, ratingFromXp(s.xp));
  return s;
}
