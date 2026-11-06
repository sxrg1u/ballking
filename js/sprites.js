// Pixel sprites drawn with fillRect (no image files).
// The player is drawn into a small offscreen canvas first, then copied to
// the scene with a dark 1px outline so it pops from every background.
import { SKINS } from './stars.js';

const r = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

// Darken / lighten a colour (#hex or rgb()) by factor.
export function shade(col, f) {
  let rgb;
  if (col.startsWith('#')) {
    const n = parseInt(col.slice(1), 16);
    rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  } else {
    rgb = col.match(/\d+/g).slice(0, 3).map(Number);
  }
  const [a, b, c] = rgb.map(v => Math.max(0, Math.min(255, Math.round(v * f))));
  return `rgb(${a},${b},${c})`;
}

const OUTLINE = '#120d14';
const SPR_W = 64, SPR_H = 64, OX = 32, OY = 60; // sprite canvas + feet origin

function makeCanvas(w, h) {
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
  return c;
}
const sprite = makeCanvas(SPR_W, SPR_H), sctx = sprite.getContext('2d');
const sil = makeCanvas(SPR_W, SPR_H), silctx = sil.getContext('2d');

// One leg: 3px wide line from the hip. angle 0 = straight down, + = forward.
function leg(ctx, hx, hy, angle, look, back) {
  const skin = SKINS[look.skin];
  const socks = look.kit.socks || skin;
  const boot = look.boots || (look.barefoot ? shade(skin, 0.8) : '#1c1c22');
  const f = back ? 0.72 : 1;
  const len = 17, sa = Math.sin(angle), ca = Math.cos(angle);
  for (let i = 0; i <= len; i++) {
    const px = hx + sa * i, py = hy + ca * i;
    let c = i < 4 ? look.kit.shorts : i < 8 ? skin : i < 14 ? socks : boot;
    if (look.street && i >= 8 && i < 14) c = skin; // Ravi: no socks
    r(ctx, px - 1, py, 3, 1, shade(c, f));
    r(ctx, px - 1, py, 1, 1, shade(c, f * 0.85)); // shading on the back side
  }
  // Foot / boot pointing forward with a sole line
  const fx = hx + sa * len, fy = hy + ca * len;
  r(ctx, fx - 1, fy - 1, 6, 2, shade(boot, f));
  r(ctx, fx - 1, fy + 1, 6, 1, shade(boot, f * 0.6));
  if (!look.barefoot && look.boots) r(ctx, fx + 1, fy - 1, 2, 1, shade(boot, f * 1.25));
}

function hair(ctx, x, y, look) {
  const c = look.hair, s = look.style, hi = shade(c, 1.6);
  if (s === 'bald') { r(ctx, x + 2, y, 5, 1, shade(SKINS[look.skin], 1.15)); return; }
  if (s === 'buzz') { r(ctx, x, y - 1, 10, 2, c); r(ctx, x, y + 1, 2, 2, c); return; }
  if (s === 'afro' || s === 'curly') {
    const b = s === 'afro' ? 2 : 1;
    r(ctx, x - b, y - 1 - b, 10 + b * 2, 3 + b, c);
    r(ctx, x - b, y + 1, 3 + b, 4, c);
    for (let i = 0; i < 10 + b * 2; i += 3) r(ctx, x - b + i, y - 1 - b, 1, 1, hi);
    return;
  }
  // short / long / bun / headband
  r(ctx, x - 1, y - 2, 11, 3, c);
  r(ctx, x - 1, y + 1, 3, 3, c);
  r(ctx, x + 7, y + 1, 3, 1, c); // fringe
  r(ctx, x + 2, y - 2, 4, 1, hi);
  if (s === 'long' || s === 'headband') r(ctx, x - 1, y + 3, 3, 7, c);
  if (s === 'bun') { r(ctx, x - 4, y - 3, 4, 4, c); r(ctx, x - 3, y - 3, 2, 1, hi); }
  if (s === 'headband') r(ctx, x - 1, y + 1, 11, 2, '#f2f2f2');
}

// Draw the player into ctx with feet at (x, gy), facing right.
function body(ctx, x, gy, look, kick, t) {
  const skin = SKINS[look.skin], skinD = shade(skin, 0.82), skinL = shade(skin, 1.1);
  const bob = kick < 0 && Math.floor(t * 2) % 2 ? 1 : 0;

  // Kick angle from animation progress
  let ang = 0;
  if (kick >= 0) {
    if (kick < 0.35) ang = -0.75 * (kick / 0.35);
    else if (kick < 0.6) ang = -0.75 + 1.85 * ((kick - 0.35) / 0.25);
    else ang = 1.1 * (1 - (kick - 0.6) / 0.4);
  }
  const hipY = gy - 18;
  leg(ctx, x - 2, hipY, -0.1, look, true);
  leg(ctx, x + 3, hipY, ang, look, false);

  const kit = look.kit, shirt = kit.shirt, shirtD = shade(shirt, 0.78), shirtL = shade(shirt, 1.12);
  // Shorts
  r(ctx, x - 5, hipY - 3 + bob, 12, 6, kit.shorts);
  r(ctx, x - 5, hipY - 3 + bob, 3, 6, shade(kit.shorts, 0.8));
  r(ctx, x - 5, hipY - 3 + bob, 12, 1, shade(kit.shorts, 0.7));

  // Torso
  const ty = gy - 35 + bob;
  r(ctx, x - 5, ty, 12, 15, shirt);
  if (kit.pattern === 'stripes') for (let i = 1; i < 12; i += 3) r(ctx, x - 5 + i, ty, 2, 15, kit.pattern2);
  if (kit.pattern === 'checks') {
    for (let yy = 0; yy < 15; yy += 3) for (let xx = (yy / 3) % 2 ? 3 : 0; xx < 12; xx += 6) r(ctx, x - 5 + xx, ty + yy, 3, 3, kit.pattern2);
  }
  r(ctx, x - 5, ty, 3, 15, 'rgba(0,0,0,0.18)');     // back shading
  r(ctx, x + 5, ty + 1, 2, 12, 'rgba(255,255,255,0.12)'); // front light
  r(ctx, x - 1, ty, 6, 2, look.street ? shirtD : shade(kit.shorts, 0.9)); // collar
  if (look.street) { // torn street shirt
    r(ctx, x + 2, ty + 6, 2, 2, skinD); r(ctx, x - 3, ty + 11, 1, 2, skinD);
    r(ctx, x + 4, ty + 14, 3, 1, skinD);
  } else {
    r(ctx, x - 5, ty + 13, 12, 2, shirtD); // hem
  }

  // Back arm (swings opposite to the kick)
  const sw = kick >= 0 ? Math.round(-ang * 3) : 0;
  r(ctx, x - 8, ty + 2, 3, 6, shade(shirt, 0.6));
  r(ctx, x - 8 + Math.min(0, sw), ty + 8, 3, 7, shade(skin, 0.7));
  // Front arm
  r(ctx, x + 7, ty + 2, 3, 6, shirtL);
  r(ctx, x + 7, ty + 7, 3, 1, shirtD);
  r(ctx, x + 7 + Math.max(0, -sw), ty + 8, 3, 7, skin);
  r(ctx, x + 7 + Math.max(0, -sw), ty + 14, 3, 2, skinD);

  // Neck + head (10x10)
  r(ctx, x - 1, ty - 2, 5, 2, skinD);
  const hx = x - 3, hy = ty - 12;
  r(ctx, hx, hy, 10, 10, skin);
  r(ctx, hx, hy, 2, 10, skinD);                // back of head shading
  r(ctx, hx + 8, hy + 2, 2, 5, skinL);          // face light
  r(ctx, hx + 10, hy + 5, 1, 2, skin);          // nose
  r(ctx, hx + 3, hy + 4, 2, 3, skinD);          // ear
  r(ctx, hx + 7, hy + 4, 2, 2, '#ffffff');      // eye white
  r(ctx, hx + 8, hy + 4, 1, 2, '#1a1a1a');      // pupil
  r(ctx, hx + 6, hy + 3, 3, 1, shade(look.hair, 1.1)); // eyebrow
  r(ctx, hx + 7, hy + 8, 2, 1, shade(skin, 0.6)); // mouth
  if (look.beard) {
    r(ctx, hx + 3, hy + 7, 7, 3, look.hair);
    r(ctx, hx + 7, hy + 8, 2, 1, shade(skin, 0.55));
    r(ctx, hx + 9, hy + 6, 1, 1, look.hair);
  }
  hair(ctx, hx, hy, look);
}

// Draw player with outline + shadow + optional legend aura.
export function drawPlayer(ctx, x, gy, look, kick, t) {
  if (look.aura) {
    const a = 0.22 + 0.12 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(255,214,90,${a})`;
    ctx.fillRect(x - 14, gy - 52, 30, 54);
    ctx.fillStyle = `rgba(255,240,170,${a})`;
    ctx.fillRect(x - 10, gy - 49, 22, 49);
    // Rising sparkles
    for (let i = 0; i < 5; i++) {
      const p = (t * 0.6 + i / 5) % 1;
      ctx.fillStyle = `rgba(255,240,170,${1 - p})`;
      ctx.fillRect(Math.round(x - 12 + ((i * 7) % 26)), Math.round(gy - p * 56), 1, 2);
    }
  }
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x - 10, gy + 1, 22, 2);
  ctx.fillRect(x - 7, gy + 3, 16, 1);

  sctx.clearRect(0, 0, SPR_W, SPR_H);
  body(sctx, OX, OY, look, kick, t);
  // Silhouette for the outline
  silctx.globalCompositeOperation = 'source-over';
  silctx.clearRect(0, 0, SPR_W, SPR_H);
  silctx.drawImage(sprite, 0, 0);
  silctx.globalCompositeOperation = 'source-in';
  silctx.fillStyle = OUTLINE;
  silctx.fillRect(0, 0, SPR_W, SPR_H);
  const dx = x - OX, dy = gy - OY;
  for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.drawImage(sil, dx + ox, dy + oy);
  ctx.drawImage(sprite, dx, dy);
}

// Portrait for the player card (head + shoulders), drawn into a canvas.
export function drawPortrait(canvas, look) {
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, canvas.width, canvas.height);
  sctx.clearRect(0, 0, SPR_W, SPR_H);
  body(sctx, OX, OY, look, -1, 0);
  c.imageSmoothingEnabled = false;
  // Crop the upper body: head top is at about OY-48
  const sx = OX - 13, sy = OY - 50, sw = 26, sh = 26;
  c.drawImage(sprite, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
}

// 7x7 football with outline; spin rotates the panel pattern.
const BALL_MASK = ['..###..', '.#####.', '#######', '#######', '#######', '.#####.', '..###..'];
const PANELS = [[[3, 3], [1, 2], [5, 4], [2, 5]], [[3, 2], [5, 2], [1, 4], [4, 5]], [[2, 3], [4, 1], [5, 4], [1, 1]]];
export function drawBall(ctx, x, y, colors, spin) {
  const [a, b] = colors;
  x = Math.round(x) - 3; y = Math.round(y) - 3;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x + 1, y - 1, 5, 9); ctx.fillRect(x - 1, y + 1, 9, 5); ctx.fillRect(x, y, 7, 7);
  ctx.fillStyle = a;
  BALL_MASK.forEach((row, yy) => { for (let xx = 0; xx < 7; xx++) if (row[xx] === '#') ctx.fillRect(x + xx, y + yy, 1, 1); });
  ctx.fillStyle = shade(a, 0.75);
  ctx.fillRect(x + 1, y + 5, 5, 1); ctx.fillRect(x, y + 4, 1, 1); ctx.fillRect(x + 2, y + 6, 3, 1);
  ctx.fillStyle = b;
  const fr = ((Math.floor(spin) || 0) % 3 + 3) % 3;
  for (const [px, py] of PANELS[fr]) ctx.fillRect(x + px, y + py, 1, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(x + 2, y + 1, 1, 1);
}

export function drawBallShadow(ctx, x, gy, height) {
  const w = Math.max(3, 8 - Math.floor(height / 6));
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(Math.round(x - w / 2), gy + 3, w, 2);
}

// Ball machine shown when you own more balls than are drawn.
export function drawMachine(ctx, x, gy) {
  r(ctx, x - 1, gy - 15, 16, 15, OUTLINE);
  r(ctx, x, gy - 14, 14, 12, '#5d6472');
  r(ctx, x + 1, gy - 13, 12, 3, '#8a93a3');
  r(ctx, x + 10, gy - 10, 5, 4, '#2b2f38');
  r(ctx, x + 1, gy - 2, 3, 3, '#1a1a1a'); r(ctx, x + 10, gy - 2, 3, 3, '#1a1a1a');
  r(ctx, x + 3, gy - 19, 8, 5, '#e8e8e8'); r(ctx, x + 4, gy - 18, 2, 1, '#ffffff');
}
