// Pixel backgrounds for every training ground (192x108 scene).
// Static parts are pre-rendered once; ambient effects animate per frame.
// The grounds go from a ruined lot to a stadium in space.
export const W = 192, H = 108, HORIZON = 70;
export const WALL_X = 146, WALL_W = 22, WALL_TOP = 12, WALL_BOTTOM = 104;

function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };

// Banded pixel sky with dithered transitions.
function sky(c, cols, bottom = HORIZON) {
  const band = Math.ceil(bottom / cols.length);
  cols.forEach((col, i) => {
    rect(c, 0, i * band, W, band, col);
    if (i > 0) for (let x = (i % 2); x < W; x += 2) rect(c, x, i * band - 1, 1, 1, col);
  });
}

function stripes(c, a, b, w = 16, top = HORIZON) {
  for (let x = 0; x < W; x += w) rect(c, x, top, w, H - top, (x / w) % 2 ? a : b);
  rect(c, 0, top, W, 1, 'rgba(0,0,0,0.2)');
  // Grass texture
  const R = rng(99);
  for (let i = 0; i < 160; i++) rect(c, R() * W, top + 2 + R() * (H - top), 1, 1, 'rgba(0,0,0,0.08)');
}

// The wall: front face + side face for depth + cap.
function wallBase(c, face, side, cap) {
  rect(c, WALL_X, WALL_TOP, WALL_W, WALL_BOTTOM - WALL_TOP, face);
  rect(c, WALL_X + WALL_W, WALL_TOP + 2, 5, WALL_BOTTOM - WALL_TOP - 2, side);
  rect(c, WALL_X - 1, WALL_TOP - 3, WALL_W + 7, 3, cap);
  rect(c, WALL_X - 1, WALL_TOP - 3, WALL_W + 7, 1, 'rgba(255,255,255,0.25)');
  rect(c, WALL_X, WALL_TOP, 2, WALL_BOTTOM - WALL_TOP, 'rgba(255,255,255,0.12)');
  rect(c, WALL_X - 3, WALL_BOTTOM - 1, WALL_W + 12, 3, 'rgba(0,0,0,0.3)'); // contact shadow
}

function bricks(c, x0, y0, w, h, mortar, R, cracked = 0) {
  for (let y = y0; y < y0 + h; y += 5) {
    rect(c, x0, y, w, 1, mortar);
    const off = (y / 5) % 2 ? 0 : 4;
    for (let x = x0 + off; x < x0 + w; x += 8) rect(c, x, y, 1, 5, mortar);
    if (R) for (let x = x0; x < x0 + w; x += 8) if (R() < 0.3) rect(c, x + 2, y + 2, 3, 1, 'rgba(255,255,255,0.08)');
  }
  if (cracked && R) {
    for (let k = 0; k < cracked; k++) {
      let x = x0 + 3 + R() * (w - 6), y = y0 + R() * h * 0.6;
      for (let i = 0; i < 14; i++) { rect(c, x, y, 1, 1, '#2a1a14'); x += R() < 0.5 ? -1 : 1; y += 1; }
    }
  }
}

function clouds(c, R, n, col) {
  for (let i = 0; i < n; i++) {
    const x = R() * W, y = 4 + R() * 26, w = 14 + R() * 20;
    rect(c, x, y, w, 4, col); rect(c, x + 3, y - 3, w * 0.5, 3, col); rect(c, x + w * 0.4, y - 5, w * 0.35, 3, col);
  }
}

function crowd(c, R, top, bottom, base, cols, density = 0.85) {
  rect(c, 0, top, W, bottom - top, base);
  for (let y = top + 2; y < bottom - 2; y += 4) {
    rect(c, 0, y + 3, W, 1, 'rgba(0,0,0,0.25)');
    for (let x = 1; x < W; x += 3) if (R() < density) {
      const col = cols[Math.floor(R() * cols.length)];
      rect(c, x, y, 2, 2, col);
      rect(c, x, y + 2, 2, 1, 'rgba(0,0,0,0.3)');
    }
  }
}

function adBoards(c, y) {
  const ads = ['#e94b3c', '#2a62c9', '#f4c430', '#1d9a5b', '#f2f2f2', '#8e44ad'];
  for (let x = 0; x < W; x += 24) {
    rect(c, x, y, 24, 6, ads[(x / 24) % ads.length]);
    rect(c, x + 4, y + 2, 14, 2, 'rgba(255,255,255,0.55)');
    rect(c, x, y + 5, 24, 1, 'rgba(0,0,0,0.35)');
  }
}

// ---------- Grounds ----------
const BUILDERS = {
  // Ruined Lot: smog, broken buildings, rubble, a wall with holes
  g0: c => {
    const R = rng(11);
    sky(c, ['#6d6a63', '#7a766c', '#878173', '#948c7b', '#9e9480']);
    rect(c, 20, 10, 7, 7, '#c9b98a'); // hazy sun
    // Broken buildings
    for (const [x, w, h] of [[-4, 30, 38], [24, 22, 26], [44, 34, 44], [78, 26, 30], [104, 30, 40]]) {
      rect(c, x, HORIZON - h, w, h, '#57534c');
      for (let k = 0; k < 4; k++) rect(c, x + R() * w, HORIZON - h - 2, 3 + R() * 5, 3, '#6d6a63'); // broken top
      for (let wy = HORIZON - h + 4; wy < HORIZON - 4; wy += 7)
        for (let wx = x + 3; wx < x + w - 3; wx += 6) rect(c, wx, wy, 3, 4, R() < 0.25 ? '#3a3631' : '#24211d');
      rect(c, x + w - 2, HORIZON - h, 2, h, '#4a4640');
      if (R() < 0.6) rect(c, x + 4, HORIZON - h - 6, 1, 6, '#3d2a1c'); // rebar
    }
    // Smog band
    for (let x = 0; x < W; x += 2) rect(c, x, 38 + (x % 4 ? 0 : 1), 1, 1, 'rgba(160,150,130,0.5)');
    // Cracked dirt
    rect(c, 0, HORIZON, W, H - HORIZON, '#6e5a42');
    for (let i = 0; i < 140; i++) rect(c, R() * W, HORIZON + R() * 40, 1 + R() * 4, 1, R() < 0.5 ? '#5a4834' : '#7d6a50');
    for (let k = 0; k < 6; k++) { let x = R() * 140, y = HORIZON + 4 + R() * 28; for (let i = 0; i < 10; i++) { rect(c, x, y, 1, 1, '#3e3124'); x += 1; y += R() < 0.5 ? 0 : (R() < 0.5 ? 1 : -1); } }
    // Rubble piles, tyre, trash bags, puddle
    for (const [x, y] of [[6, 92], [118, 80], [30, 76]]) for (let i = 0; i < 9; i++) rect(c, x + R() * 14, y + R() * 5, 2 + R() * 3, 2, ['#8a857c', '#6b675f', '#a39d92'][i % 3]);
    rect(c, 96, 96, 12, 4, '#1c1c1f'); rect(c, 99, 97, 6, 2, '#3a3a3f');
    rect(c, 10, 74, 8, 6, '#1e2a22'); rect(c, 16, 75, 6, 5, '#243126'); rect(c, 12, 73, 2, 1, '#3a4a3e');
    rect(c, 60, 100, 26, 3, '#7d8a90'); rect(c, 64, 100, 10, 1, '#a7b4ba');
    // Broken street lamp (light is animated)
    rect(c, 128, 26, 2, 44, '#3a3632'); rect(c, 122, 24, 9, 2, '#3a3632'); rect(c, 121, 26, 4, 2, '#5a554e');
    // Wall with holes and cracks
    wallBase(c, '#8c5a44', '#5e3a2b', '#6e4535');
    bricks(c, WALL_X, WALL_TOP, WALL_W, WALL_BOTTOM - WALL_TOP, '#4e3124', R, 4);
    for (const [x, y, w, h] of [[WALL_X + 4, 30, 7, 5], [WALL_X + 12, 58, 6, 7], [WALL_X + 2, 80, 5, 4]]) {
      rect(c, x, y, w, h, '#2a1d16'); rect(c, x + 1, y + 1, w - 2, h - 2, '#948c7b');
    }
    rect(c, WALL_X + 14, WALL_TOP - 3, 13, 6, '#9e9480'); // broken top corner
    rect(c, WALL_X + 6, 44, 9, 3, 'rgba(180,60,60,0.35)'); // faded graffiti
  },

  // Backyard Wall: houses, washing line, solid brick wall
  g9: c => {
    const R = rng(1);
    sky(c, ['#7fb4dc', '#8ec0e4', '#9fcbea', '#b2d6ef']);
    rect(c, 24, 8, 8, 8, '#ffe27a'); rect(c, 22, 10, 12, 4, '#ffe27a');
    const cols = ['#c98b6b', '#d8c39a', '#9fb4c7', '#c7a2a2', '#b7c79f'];
    for (let x = -6; x < WALL_X; x += 22 + Math.floor(R() * 8)) {
      const h = 16 + Math.floor(R() * 14), w = 20 + Math.floor(R() * 6);
      rect(c, x, HORIZON - h, w, h, cols[Math.floor(R() * cols.length)]);
      rect(c, x - 2, HORIZON - h - 3, w + 4, 3, '#8a4a3a');
      for (let wy = HORIZON - h + 4; wy < HORIZON - 5; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 7) { rect(c, wx, wy, 3, 4, '#3d4b5c'); rect(c, wx, wy, 1, 1, '#8fa8c0'); }
    }
    rect(c, 0, HORIZON, W, H - HORIZON, '#7d6a48');
    for (let i = 0; i < 120; i++) rect(c, R() * W, HORIZON + R() * 40, 2 + R() * 4, 1, R() < 0.65 ? '#5a8f3a' : '#6a5838');
    rect(c, 70, 44, 1, 26, '#5a4632'); rect(c, 122, 44, 1, 26, '#5a4632'); rect(c, 70, 45, 53, 1, '#ddd');
    [['#e94b3c', 78], ['#2a62c9', 92], ['#f4c430', 106]].forEach(([col, x]) => { rect(c, x, 46, 7, 8, col); rect(c, x, 53, 7, 1, 'rgba(0,0,0,0.25)'); });
    wallBase(c, '#a4462f', '#6e2b1c', '#7d3624');
    bricks(c, WALL_X, WALL_TOP, WALL_W, WALL_BOTTOM - WALL_TOP, '#6b2d1e', R, 1);
  },

  // Cage Court: city, chain-link fence, turf, graffiti wall
  g1: c => {
    const R = rng(2);
    sky(c, ['#86b9dc', '#94c3e3', '#a6cfe9', '#bad9ef']);
    clouds(c, R, 0, '#fff');
    for (let x = 0; x < W; x += 16) {
      const h = 28 + Math.floor(R() * 32), col = R() < 0.5 ? '#7d8796' : '#97a1ae';
      rect(c, x, HORIZON - h, 15, h, col);
      for (let y = HORIZON - h + 3; y < HORIZON - 3; y += 5) for (let wx = x + 2; wx < x + 13; wx += 4) rect(c, wx, y, 2, 3, R() < 0.4 ? '#f0e6a0' : '#4d5868');
    }
    for (let y = 40; y < HORIZON; y += 3) for (let x = (y / 3) % 2 ? 0 : 1.5; x < W; x += 3) rect(c, x, y, 1, 1, 'rgba(210,216,222,0.8)');
    for (let x = 0; x < W; x += 30) rect(c, x, 36, 2, HORIZON - 36, '#5d6670');
    rect(c, 0, 36, W, 2, '#5d6670');
    stripes(c, '#3f8f4a', '#378043', 16);
    rect(c, 0, 92, WALL_X, 1, '#e8e8e8');
    wallBase(c, '#9a9a9a', '#6e6e6e', '#7a7a7a');
    for (let y = WALL_TOP + 8; y < WALL_BOTTOM; y += 12) rect(c, WALL_X, y, WALL_W, 1, '#838383');
    const g = [['#e94b3c', 22, 10], ['#2ad1c9', 36, 9], ['#f4c430', 52, 7], ['#8e44ad', 66, 11], ['#ff3d8b', 82, 8]];
    g.forEach(([col, y, h], i) => { rect(c, WALL_X + 2 + (i % 2) * 5, y, 13, h, col); rect(c, WALL_X + 4 + (i % 2) * 5, y + 2, 9, 2, '#ffffff'); rect(c, WALL_X + 2 + (i % 2) * 5, y + h, 13, 1, '#1a1a1a'); });
  },

  // Club Ground: trees, clubhouse, wooden rebounder
  g2: c => {
    const R = rng(3);
    sky(c, ['#78b4e0', '#88bfe6', '#9ccbeb', '#b2d8f0']);
    for (let x = -6; x < W; x += 13) {
      const h = 14 + Math.floor(R() * 10);
      rect(c, x, HORIZON - h - 6, 14, h, R() < 0.5 ? '#2f6b34' : '#3a7a3c');
      rect(c, x + 2, HORIZON - h - 6, 6, 3, '#4c8f48');
      rect(c, x + 6, HORIZON - 7, 2, 7, '#5a4030');
    }
    rect(c, 36, 40, 54, 30, '#ece6d8'); rect(c, 32, 34, 62, 6, '#b5402f'); rect(c, 32, 34, 62, 1, '#d4614f');
    for (let x = 42; x < 86; x += 10) { rect(c, x, 46, 5, 7, '#3d5a7a'); rect(c, x, 46, 5, 1, '#9ab8d6'); }
    rect(c, 60, 58, 7, 12, '#6b4a30');
    rect(c, 46, 28, 1, 6, '#888'); rect(c, 47, 28, 8, 4, '#1d7a3a');
    stripes(c, '#4c9a3c', '#448c35', 16);
    wallBase(c, '#9a6634', '#64401c', '#7a4f26');
    for (let y = WALL_TOP + 7; y < WALL_BOTTOM; y += 7) { rect(c, WALL_X, y, WALL_W, 1, '#5e3c1c'); rect(c, WALL_X + 3 + (y % 14 ? 0 : 9), y - 4, 1, 1, '#3a2410'); }
  },

  // Pro Training Center: glass building, target board
  g3: c => {
    const R = rng(4);
    sky(c, ['#8ac4ec', '#9ccff0', '#b0daf4', '#c4e4f7']);
    rect(c, 10, 24, 90, 46, '#5f7d99');
    for (let y = 27; y < 66; y += 6) for (let x = 13; x < 97; x += 7) rect(c, x, y, 5, 4, R() < 0.3 ? '#d7ecfa' : '#8fb3d1');
    rect(c, 104, 46, 38, 24, '#e6e6e6'); rect(c, 102, 43, 42, 3, '#2a62c9');
    rect(c, 0, HORIZON - 4, W, 4, '#2e6b33');
    stripes(c, '#3fa34d', '#379445', 12);
    wallBase(c, '#efefef', '#b5b5b5', '#cfcfcf');
    for (const [cy, rr] of [[40, 8], [74, 6]]) {
      rect(c, WALL_X + 11 - rr, cy - rr, rr * 2, rr * 2, '#2a62c9');
      rect(c, WALL_X + 11 - rr + 2, cy - rr + 2, rr * 2 - 4, rr * 2 - 4, '#f2f2f2');
      rect(c, WALL_X + 9, cy - 2, 4, 4, '#e94b3c');
    }
  },

  // National Academy: big building, flags, net rebounder
  g4: c => {
    sky(c, ['#6fa8d8', '#80b4de', '#94c1e5', '#aacfec']);
    rect(c, 6, 30, 110, 40, '#d8d2c4'); rect(c, 3, 26, 116, 4, '#8a8070');
    for (let x = 12; x < 112; x += 9) { rect(c, x, 36, 5, 22, '#3d5a7a'); rect(c, x, 36, 5, 2, '#9ab8d6'); }
    rect(c, 50, 58, 22, 12, '#6b5a40');
    const flags = [['#d0202f', '#f2f2f2'], ['#1c2f6b', '#f2f2f2'], ['#f7d117', '#1d9a5b'], ['#f36c21', '#f2f2f2']];
    flags.forEach(([a, b], i) => { const x = 122 + i * 6; rect(c, x, 18, 1, 52, '#999'); rect(c, x + 1, 18, 5, 2, a); rect(c, x + 1, 20, 5, 2, b); });
    stripes(c, '#3d9b47', '#358b3f', 14);
    wallBase(c, '#30353d', '#1c1f24', '#454b55');
    for (let y = WALL_TOP + 3; y < WALL_BOTTOM - 2; y += 3) rect(c, WALL_X + 2, y, WALL_W - 3, 1, '#a7b0ba');
    for (let x = WALL_X + 3; x < WALL_X + WALL_W - 1; x += 3) rect(c, x, WALL_TOP + 2, 1, WALL_BOTTOM - WALL_TOP - 4, '#a7b0ba');
    rect(c, WALL_X, WALL_TOP, WALL_W, 2, '#f4c430'); rect(c, WALL_X, WALL_BOTTOM - 2, WALL_W, 2, '#f4c430');
  },

  // Big Stadium
  g5: c => {
    const R = rng(6);
    sky(c, ['#6aa6dc', '#7cb2e0', '#90bfe6'], 24);
    rect(c, 0, 14, W, 6, '#2c323c'); rect(c, 0, 14, W, 1, '#4a5260');
    crowd(c, R, 20, HORIZON - 6, '#4a5260', ['#d0202f', '#f2f2f2', '#2a62c9', '#f4c430', '#e8b48a', '#7a4a2a', '#1d9a5b']);
    adBoards(c, HORIZON - 6);
    stripes(c, '#3fa34d', '#36924a', 14);
    wallBase(c, '#111319', '#2a2e38', '#3a404c');
    for (let y = WALL_TOP + 5; y < WALL_BOTTOM - 4; y += 9) rect(c, WALL_X + 3, y, WALL_W - 6, 3, '#2a62c9');
  },

  // Night Stadium
  g6: c => {
    const R = rng(7);
    sky(c, ['#070b1c', '#0b1128', '#111a38'], 24);
    for (const x of [14, 96]) { rect(c, x, 2, 2, 18, '#555'); rect(c, x - 6, 0, 14, 5, '#fffbe0'); rect(c, x - 5, 1, 12, 1, '#ffffff'); }
    rect(c, 0, 16, W, 6, '#0e1118');
    crowd(c, R, 22, HORIZON - 6, '#1a1e28', ['#5a5f6b', '#3a3f4a', '#7a3a3a', '#3a4a7a', '#6b6040']);
    adBoards(c, HORIZON - 6);
    stripes(c, '#2f8a3e', '#297a37', 14);
    wallBase(c, '#08090d', '#22262e', '#2c323c');
    for (let y = WALL_TOP + 5; y < WALL_BOTTOM - 4; y += 9) rect(c, WALL_X + 3, y, WALL_W - 6, 3, '#ff3d8b');
  },

  // Golden Stadium
  g7: c => {
    const R = rng(8);
    sky(c, ['#f6c565', '#f8b46e', '#fba57a'], 24);
    rect(c, 0, 14, W, 6, '#5e4510'); rect(c, 0, 14, W, 1, '#d9a520');
    crowd(c, R, 20, HORIZON - 6, '#8a6a20', ['#f4c430', '#fff2b0', '#d9a520', '#f2f2f2', '#75aadb']);
    adBoards(c, HORIZON - 6);
    stripes(c, '#5aa83c', '#4f9a33', 14);
    wallBase(c, '#e0ad2a', '#9a6e00', '#f4c430');
    for (let y = WALL_TOP + 6; y < WALL_BOTTOM; y += 8) rect(c, WALL_X + 2, y, WALL_W - 4, 1, '#fff2b0');
  },

  // Star Stadium
  g8: c => {
    const R = rng(9);
    sky(c, ['#12062a', '#1d0b3d', '#2a1255', '#3d1a6b']);
    for (let i = 0; i < 70; i++) rect(c, R() * W, R() * 56, 1, 1, R() < 0.3 ? '#fff2b0' : '#c9c2ff');
    rect(c, 104, 8, 18, 18, '#8e5bd1'); rect(c, 104, 8, 18, 4, '#a97ce6'); rect(c, 96, 16, 34, 2, '#e3c9ff');
    crowd(c, R, 52, HORIZON, '#24123f', ['#f4c430', '#c9c2ff', '#ff3d8b', '#2ad1c9'], 0.6);
    stripes(c, '#2a7d6b', '#236b5c', 14);
    wallBase(c, '#4a1f80', '#2a1050', '#6a35b0');
    for (let y = WALL_TOP + 6; y < WALL_BOTTOM; y += 8) rect(c, WALL_X + 3, y, WALL_W - 6, 1, '#e3c9ff');
  },
};

const cache = {};
export function background(id) {
  if (!cache[id]) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    (BUILDERS[id] || BUILDERS.g0)(cv.getContext('2d'));
    cache[id] = cv;
  }
  return cache[id];
}

// Small preview for the Career list.
export function thumbnail(id) {
  return background(id).toDataURL();
}

const DAY = ['g9', 'g1', 'g2', 'g3', 'g4'];
const STADIUM = ['g5', 'g6', 'g7'];

// Animated extras drawn on top of the static background.
export function drawDynamic(c, id, t) {
  if (DAY.includes(id)) {
    // Slowly drifting clouds
    c.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 3; i++) {
      const x = ((t * (2 + i) + i * 80) % (W + 60)) - 40, y = 6 + i * 7;
      c.fillRect(Math.round(x), y, 22, 4); c.fillRect(Math.round(x) + 4, y - 3, 11, 3);
    }
  }
  if (id === 'g0') {
    // Dust drifting, flickering lamp
    for (let i = 0; i < 14; i++) {
      const x = (i * 37 + t * (4 + (i % 3))) % W, y = 20 + ((i * 23 + Math.sin(t + i) * 6) % 70);
      c.fillStyle = 'rgba(200,190,160,0.45)';
      c.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    const on = Math.sin(t * 13) + Math.sin(t * 3.1) > 0.4;
    c.fillStyle = on ? '#ffe9a0' : '#5a554e';
    c.fillRect(121, 26, 4, 2);
    if (on) { c.fillStyle = 'rgba(255,233,160,0.12)'; c.fillRect(114, 28, 18, 42); }
  }
  if (STADIUM.includes(id)) {
    const R = rng(Math.floor(t * 5));
    for (let i = 0; i < (id === 'g6' ? 16 : 8); i++) {
      c.fillStyle = id === 'g6' ? '#ffffff' : 'rgba(255,255,255,0.75)';
      c.fillRect(Math.floor(R() * W), 22 + Math.floor(R() * 40), 1, 1);
    }
  }
  if (id === 'g6') {
    c.fillStyle = 'rgba(255,250,220,0.07)';
    for (const x of [14, 96]) { c.beginPath(); c.moveTo(x - 6, 4); c.lineTo(x + 8, 4); c.lineTo(x + 44, H); c.lineTo(x - 30, H); c.fill(); }
  }
  if (id === 'g8') {
    const R = rng(Math.floor(t * 2));
    c.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) c.fillRect(Math.floor(R() * W), Math.floor(R() * 56), 1, 1);
  }
}
