// Pixel sprites drawn directly with fillRect (no image files).
import { SKINS } from './stars.js';

const r = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

// Darken / lighten a hex colour by factor.
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

// Leg as a 2px wide line from the hip, angle in radians (0 = straight down,
// positive = foot forward / to the right).
function leg(ctx, hx, hy, angle, look, back) {
  const skin = SKINS[look.skin];
  const socks = look.kit.socks || skin;
  const boot = look.boots || (look.barefoot ? shade(skin, 0.85) : '#202020');
  const len = 12, sa = Math.sin(angle), ca = Math.cos(angle);
  const dim = c => (back ? shade(c, 0.78) : c);
  for (let i = 0; i <= len; i++) {
    const px = hx + sa * i, py = hy + ca * i;
    const c = i < 3 ? look.kit.shorts : i < 7 ? skin : i < 10 ? socks : boot;
    r(ctx, px - 1, py, 2, 1, dim(c));
  }
  // Toe pointing forward
  const fx = hx + sa * len, fy = hy + ca * len;
  r(ctx, fx + 1, fy, 1, 1, dim(boot));
  if (!look.barefoot || look.boots) r(ctx, fx + 1, fy - 1, 1, 1, dim(boot));
}

function hair(ctx, x, y, look) {
  const c = look.hair, s = look.style;
  if (s === 'bald') { r(ctx, x + 1, y, 3, 1, shade(SKINS[look.skin], 1.12)); return; }
  if (s === 'buzz') { r(ctx, x, y, 6, 1, c); r(ctx, x, y + 1, 1, 1, c); return; }
  if (s === 'afro' || s === 'curly') {
    const big = s === 'afro' ? 1 : 0;
    r(ctx, x - 1 - big, y - 1 - big, 7 + big * 2, 2 + big, c);
    r(ctx, x - 1 - big, y + 1, 2 + big, 3, c);
    if (big) r(ctx, x + 5, y - 1, 2, 2, c);
    return;
  }
  // short, long, bun, headband
  r(ctx, x, y - 1, 6, 2, c);
  r(ctx, x - 1, y, 2, 3, c);
  if (s === 'long' || s === 'headband') r(ctx, x - 1, y + 2, 2, 5, c);
  if (s === 'bun') r(ctx, x - 3, y - 2, 3, 3, c);
  if (s === 'headband') r(ctx, x - 1, y + 1, 7, 1, '#f2f2f2');
}

// Draw the player standing on the ground at (x, gy) facing right.
// kick: 0..1 animation progress, or -1 for idle. t: time for the idle bob.
export function drawPlayer(ctx, x, gy, look, kick, t) {
  const skin = SKINS[look.skin];
  const bob = kick < 0 && Math.floor(t * 2) % 2 ? 1 : 0;

  // Legend aura
  if (look.aura) {
    const a = 0.25 + 0.15 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(244,196,48,${a})`;
    ctx.fillRect(x - 9, gy - 36, 20, 38);
    ctx.fillStyle = `rgba(255,236,150,${a * 0.8})`;
    ctx.fillRect(x - 6, gy - 33, 14, 33);
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x - 7, gy, 15, 2);

  // Kick angle from animation progress
  let ang = 0;
  if (kick >= 0) {
    if (kick < 0.35) ang = -0.7 * (kick / 0.35);
    else if (kick < 0.6) ang = -0.7 + 1.7 * ((kick - 0.35) / 0.25);
    else ang = 1.0 * (1 - (kick - 0.6) / 0.4);
  }
  const hipY = gy - 13;
  leg(ctx, x - 1, hipY, -0.08, look, true);   // standing (back) leg
  leg(ctx, x + 2, hipY, ang, look, false);    // kicking (front) leg

  const ty = gy - 25 + bob;
  // Shorts
  r(ctx, x - 3, hipY - 2 + bob, 8, 3, look.kit.shorts);
  // Torso / shirt
  const shirt = look.kit.shirt;
  r(ctx, x - 3, ty + 1, 8, 9, shirt);
  if (look.kit.pattern === 'stripes') {
    for (let i = 0; i < 8; i += 2) r(ctx, x - 3 + i, ty + 1, 1, 9, look.kit.pattern2);
  } else if (look.kit.pattern === 'checks') {
    for (let yy = 0; yy < 9; yy += 2) for (let xx = (yy / 2) % 2 ? 1 : 0; xx < 8; xx += 2) r(ctx, x - 3 + xx, ty + 1 + yy, 1, 2, look.kit.pattern2);
  }
  r(ctx, x - 3, ty + 1, 8, 1, shade(shirt, 0.85));
  // Back arm (swings opposite the kick)
  const sw = kick >= 0 ? Math.round(-ang * 2) : 0;
  r(ctx, x - 5, ty + 2, 2, 3, shade(shirt, 0.8));
  r(ctx, x - 5 + Math.min(0, sw), ty + 5, 2, 4, shade(skin, 0.85));
  // Front arm
  r(ctx, x + 5, ty + 2, 2, 3, shirt);
  r(ctx, x + 5 + Math.max(0, -sw), ty + 5, 2, 4, skin);

  // Head
  const hx = x - 2, hy = ty - 6;
  r(ctx, hx, hy, 6, 6, skin);
  r(ctx, hx + 1, hy + 6, 4, 1, shade(skin, 0.85)); // neck
  r(ctx, hx + 4, hy + 2, 1, 1, '#1a1a1a');          // eye
  r(ctx, hx + 6, hy + 3, 1, 1, skin);                // nose
  if (look.beard) {
    r(ctx, hx + 1, hy + 4, 5, 2, look.hair);
    r(ctx, hx + 4, hy + 4, 1, 1, shade(skin, 0.7)); // mouth gap
  }
  hair(ctx, hx, hy, look);
}

// 5x5 football with a simple panel pattern. spin changes the pattern.
export function drawBall(ctx, x, y, colors, spin) {
  const [a, b] = colors;
  x = Math.round(x) - 2; y = Math.round(y) - 2;
  ctx.fillStyle = a;
  ctx.fillRect(x + 1, y, 3, 5);
  ctx.fillRect(x, y + 1, 5, 3);
  ctx.fillStyle = b;
  const f = Math.floor(spin) % 2;
  if (f) { ctx.fillRect(x + 2, y + 2, 1, 1); ctx.fillRect(x, y + 1, 1, 1); ctx.fillRect(x + 4, y + 3, 1, 1); }
  else { ctx.fillRect(x + 1, y + 1, 1, 1); ctx.fillRect(x + 3, y + 3, 1, 1); ctx.fillRect(x + 3, y, 1, 1); }
}

export function drawBallShadow(ctx, x, gy, height) {
  const w = Math.max(2, 5 - Math.floor(height / 8));
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(Math.round(x - w / 2), gy + 2, w, 1);
}

// Small ball machine shown when you own more balls than are drawn.
export function drawMachine(ctx, x, gy) {
  r(ctx, x, gy - 10, 10, 9, '#5d6472');
  r(ctx, x + 1, gy - 9, 8, 2, '#7d8594');
  r(ctx, x + 7, gy - 7, 4, 3, '#2b2f38');
  r(ctx, x + 1, gy - 1, 2, 2, '#1a1a1a');
  r(ctx, x + 7, gy - 1, 2, 2, '#1a1a1a');
  r(ctx, x + 2, gy - 13, 6, 3, '#e8e8e8');
}
