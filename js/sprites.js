// Pixel sprites drawn with fillRect (no image files).
// The player is drawn at HALF resolution into a tiny canvas, outlined,
// and then scaled up 2x so every pixel is a chunky 2x2 block.
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
const SCALE = 2;
const SPR = 36, OX = 18, OY = 32; // low-res sprite canvas + feet origin

function makeCanvas(w, h) {
  return typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(w, h)
    : Object.assign(document.createElement('canvas'), { width: w, height: h });
}
const sprite = makeCanvas(SPR, SPR), sctx = sprite.getContext('2d');
const outl = makeCanvas(SPR, SPR), octx = outl.getContext('2d');

// One leg, 2px wide. angle 0 = straight down, + = foot forward.
function leg(ctx, hx, hy, angle, look, back) {
  const skin = SKINS[look.skin];
  const socks = look.street ? skin : (look.kit.socks || skin);
  const boot = look.boots || (look.barefoot ? shade(skin, 0.8) : '#1c1c22');
  const f = back ? 0.7 : 1;
  const len = 8, sa = Math.sin(angle), ca = Math.cos(angle);
  for (let i = 0; i <= len; i++) {
    const c = i < 2 ? look.kit.shorts : i < 4 ? skin : i < 7 ? socks : boot;
    r(ctx, hx + sa * i - 1, hy + ca * i, 2, 1, shade(c, f));
  }
  r(ctx, hx + sa * len + 1, hy + ca * len, 1, 1, shade(boot, f)); // toe
}

function hair(ctx, x, y, look) {
  const c = look.hair, s = look.style;
  if (s === 'bald') { r(ctx, x + 1, y, 3, 1, shade(SKINS[look.skin], 1.15)); return; }
  if (s === 'buzz') { r(ctx, x, y, 6, 1, c); r(ctx, x, y + 1, 1, 1, c); return; }
  if (s === 'afro' || s === 'curly') {
    const b = s === 'afro' ? 1 : 0;
    r(ctx, x - 1 - b, y - 1 - b, 7 + b * 2, 2 + b, c);
    r(ctx, x - 1 - b, y + 1, 2 + b, 3, c);
    return;
  }
  r(ctx, x, y - 1, 6, 2, c);   // short / long / bun / headband
  r(ctx, x - 1, y, 2, 3, c);
  if (s === 'long' || s === 'headband') r(ctx, x - 1, y + 2, 2, 4, c);
  if (s === 'bun') r(ctx, x - 3, y - 2, 3, 3, c);
  if (s === 'headband') r(ctx, x - 1, y + 1, 7, 1, '#f2f2f2');
}

// The figure in low-res pixels, feet at (x, gy), facing right.
function body(ctx, x, gy, look, kick, t) {
  const skin = SKINS[look.skin], skinD = shade(skin, 0.8);
  const bob = kick < 0 && Math.floor(t * 2) % 2 ? 1 : 0;
  let ang = 0;
  if (kick >= 0) {
    if (kick < 0.35) ang = -0.8 * (kick / 0.35);
    else if (kick < 0.6) ang = -0.8 + 1.9 * ((kick - 0.35) / 0.25);
    else ang = 1.1 * (1 - (kick - 0.6) / 0.4);
  }
  const hipY = gy - 9;
  leg(ctx, x - 1, hipY, -0.1, look, true);
  leg(ctx, x + 2, hipY, ang, look, false);

  const kit = look.kit, shirt = kit.shirt;
  r(ctx, x - 2, hipY - 2 + bob, 6, 3, kit.shorts);           // shorts
  r(ctx, x - 2, hipY - 2 + bob, 1, 3, shade(kit.shorts, 0.75));

  const ty = gy - 17 + bob;
  r(ctx, x - 2, ty, 6, 7, shirt);                             // torso
  if (kit.pattern === 'stripes') { r(ctx, x - 1, ty, 1, 7, kit.pattern2); r(ctx, x + 1, ty, 1, 7, kit.pattern2); r(ctx, x + 3, ty, 1, 7, kit.pattern2); }
  if (kit.pattern === 'checks') for (let yy = 0; yy < 7; yy++) for (let xx = yy % 2; xx < 6; xx += 2) r(ctx, x - 2 + xx, ty + yy, 1, 1, kit.pattern2);
  r(ctx, x - 2, ty, 1, 7, 'rgba(0,0,0,0.25)');                // back shading
  if (look.street) { r(ctx, x + 1, ty + 3, 1, 1, skinD); r(ctx, x + 2, ty + 6, 2, 1, skinD); } // torn shirt
  else r(ctx, x, ty, 2, 1, shade(kit.shorts, 0.9));           // collar

  const sw = kick >= 0 ? Math.round(-ang * 1.5) : 0;
  r(ctx, x - 3, ty + 1, 1, 3, shade(shirt, 0.65));            // back arm
  r(ctx, x - 3 + Math.min(0, sw), ty + 4, 1, 3, shade(skin, 0.7));
  r(ctx, x + 4, ty + 1, 1, 3, shirt);                         // front arm
  r(ctx, x + 4 + Math.max(0, -sw), ty + 4, 1, 3, skin);

  const hx = x - 2, hy = ty - 6;                              // head 6x6
  r(ctx, hx, hy, 6, 6, skin);
  r(ctx, hx, hy, 1, 6, skinD);
  r(ctx, hx + 6, hy + 3, 1, 1, skin);                         // nose
  r(ctx, hx + 4, hy + 2, 1, 1, '#1a1a1a');                    // eye
  if (look.beard) { r(ctx, hx + 1, hy + 4, 5, 2, look.hair); r(ctx, hx + 4, hy + 4, 1, 1, skinD); }
  hair(ctx, hx, hy, look);
}

// Render the low-res figure and its 1px outline into the sprite canvas.
function renderSprite(look, kick, t) {
  octx.clearRect(0, 0, SPR, SPR);
  sctx.clearRect(0, 0, SPR, SPR);
  body(sctx, OX, OY, look, kick, t);
  // Outline: silhouette shifted in 4 directions, then the figure on top.
  octx.globalCompositeOperation = 'source-over';
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) octx.drawImage(sprite, dx, dy);
  octx.globalCompositeOperation = 'source-in';
  octx.fillStyle = OUTLINE;
  octx.fillRect(0, 0, SPR, SPR);
  octx.globalCompositeOperation = 'source-over';
  octx.drawImage(sprite, 0, 0);
  return outl;
}

// Draw the player into the scene with feet at (x, gy).
export function drawPlayer(ctx, x, gy, look, kick, t) {
  if (look.aura) {
    const a = 0.22 + 0.12 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(255,214,90,${a})`;
    ctx.fillRect(x - 14, gy - 52, 30, 54);
    ctx.fillStyle = `rgba(255,240,170,${a})`;
    ctx.fillRect(x - 10, gy - 49, 22, 49);
    for (let i = 0; i < 5; i++) {
      const p = (t * 0.6 + i / 5) % 1;
      ctx.fillStyle = `rgba(255,240,170,${1 - p})`;
      ctx.fillRect(Math.round(x - 12 + ((i * 7) % 26)), Math.round(gy - p * 56), 2, 2);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)';                          // shadow
  ctx.fillRect(x - 10, gy + 1, 22, 2);
  ctx.fillRect(x - 6, gy + 3, 14, 2);
  const img = renderSprite(look, kick, t);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, x - OX * SCALE, gy - OY * SCALE, SPR * SCALE, SPR * SCALE);
}

// Portrait for cards and lists (head + shoulders).
export function drawPortrait(canvas, look) {
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, canvas.width, canvas.height);
  const img = renderSprite(look, -1, 0);
  c.imageSmoothingEnabled = false;
  c.drawImage(img, OX - 6, OY - 25, 13, 13, 0, 0, canvas.width, canvas.height);
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
