// Pixel backgrounds for each training ground. Static parts are pre-rendered
// once into an offscreen canvas; a few effects are animated every frame.
export const W = 320, H = 180, HORIZON = 128, WALL_X = 290, WALL_W = 14, WALL_TOP = 62;

function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

function sky(c, cols) {
  const band = Math.ceil(HORIZON / cols.length);
  cols.forEach((col, i) => rect(c, 0, i * band, W, band, col));
}

function grass(c, a, b, stripe = 20) {
  for (let x = 0; x < W; x += stripe) rect(c, x, HORIZON, stripe, H - HORIZON, (x / stripe) % 2 ? a : b);
  rect(c, 0, HORIZON, W, 1, 'rgba(0,0,0,0.15)');
}

function houses(c, R) {
  const cols = ['#c98b6b', '#d8c39a', '#9fb4c7', '#c7a2a2', '#b7c79f'];
  for (let x = -10; x < WALL_X; x += 28 + Math.floor(R() * 12)) {
    const h = 22 + Math.floor(R() * 20), w = 24 + Math.floor(R() * 10);
    const col = cols[Math.floor(R() * cols.length)];
    rect(c, x, HORIZON - h, w, h, col);
    rect(c, x - 2, HORIZON - h - 3, w + 4, 3, '#7a4a3a');
    for (let wy = HORIZON - h + 5; wy < HORIZON - 6; wy += 8)
      for (let wx = x + 4; wx < x + w - 4; wx += 8) rect(c, wx, wy, 3, 4, '#3d4b5c');
  }
}

function crowdStands(c, R, standCol, roofCol, crowdCols, top = 40) {
  rect(c, 0, top, W, HORIZON - top, standCol);
  rect(c, 0, top - 6, W, 6, roofCol);
  for (let y = top + 4; y < HORIZON - 12; y += 4) {
    rect(c, 0, y + 3, W, 1, 'rgba(0,0,0,0.18)');
    for (let x = 1; x < W; x += 3) {
      if (R() < 0.85) rect(c, x, y, 2, 2, crowdCols[Math.floor(R() * crowdCols.length)]);
    }
  }
  // Advertising boards
  const ads = ['#e94b3c', '#2a62c9', '#f4c430', '#1d9a5b', '#f2f2f2', '#8e44ad'];
  for (let x = 0; x < W; x += 32) {
    rect(c, x, HORIZON - 9, 32, 9, ads[(x / 32) % ads.length]);
    rect(c, x + 6, HORIZON - 6, 20, 2, 'rgba(255,255,255,0.6)');
  }
}

// ---- Walls ----
function brickWall(c, base, mortar) {
  rect(c, WALL_X, WALL_TOP, WALL_W, 160 - WALL_TOP, base);
  for (let y = WALL_TOP; y < 160; y += 4) {
    rect(c, WALL_X, y, WALL_W, 1, mortar);
    const off = (y / 4) % 2 ? 0 : 3;
    for (let x = WALL_X + off; x < WALL_X + WALL_W; x += 6) rect(c, x, y, 1, 4, mortar);
  }
  rect(c, WALL_X - 1, WALL_TOP - 2, WALL_W + 2, 2, mortar);
}

function plainWall(c, base, edge, deco) {
  rect(c, WALL_X, WALL_TOP, WALL_W, 160 - WALL_TOP, base);
  rect(c, WALL_X, WALL_TOP, 2, 160 - WALL_TOP, edge);
  rect(c, WALL_X - 1, WALL_TOP - 2, WALL_W + 2, 2, edge);
  if (deco) deco(c);
}

// ---- Grounds ----
const BUILDERS = [
  // 0 Backyard Wall
  c => {
    const R = rng(1);
    sky(c, ['#7fb8e0', '#8ec4e8', '#a0cfee', '#b5dbf2']);
    rect(c, 40, 18, 10, 10, '#ffe27a'); rect(c, 38, 20, 14, 6, '#ffe27a');
    houses(c, R);
    rect(c, 0, HORIZON, W, H - HORIZON, '#8b6b43');
    for (let i = 0; i < 90; i++) rect(c, Math.floor(R() * W), HORIZON + Math.floor(R() * 50), 3 + Math.floor(R() * 6), 2, R() < 0.6 ? '#5a8f3a' : '#7a5c38');
    // Washing line
    rect(c, 120, 92, 1, 36, '#5a4632'); rect(c, 200, 92, 1, 36, '#5a4632'); rect(c, 120, 93, 81, 1, '#ddd');
    [['#e94b3c', 132], ['#2a62c9', 150], ['#f4c430', 170]].forEach(([col, x]) => rect(c, x, 94, 8, 9, col));
    brickWall(c, '#a4462f', '#6b2d1e');
  },
  // 1 Cage Court
  c => {
    const R = rng(2);
    sky(c, ['#86b9dc', '#94c3e3', '#a6cfe9', '#bad9ef']);
    for (let x = 0; x < W; x += 22) { const h = 40 + Math.floor(R() * 45); rect(c, x, HORIZON - h, 20, h, R() < 0.5 ? '#8a94a3' : '#a2abb8'); for (let y = HORIZON - h + 4; y < HORIZON - 4; y += 6) for (let wx = x + 3; wx < x + 18; wx += 5) rect(c, wx, y, 2, 3, '#e8e0a0'); }
    // Fence
    for (let y = 84; y < HORIZON; y += 4) for (let x = (y / 4) % 2 ? 0 : 2; x < W; x += 4) rect(c, x, y, 1, 1, '#c3cad1');
    for (let x = 0; x < W; x += 40) rect(c, x, 80, 2, HORIZON - 80, '#6d7680');
    rect(c, 0, 80, W, 2, '#6d7680');
    grass(c, '#3f8f4a', '#378043', 24);
    rect(c, 0, 166, W, 1, '#e8e8e8');
    plainWall(c, '#9a9a9a', '#7a7a7a', cc => {
      rect(cc, WALL_X + 3, 80, 9, 12, '#e94b3c'); rect(cc, WALL_X + 5, 98, 8, 9, '#2ad1c9');
      rect(cc, WALL_X + 2, 112, 10, 6, '#f4c430'); rect(cc, WALL_X + 4, 126, 9, 10, '#8e44ad');
    });
  },
  // 2 Club Ground
  c => {
    const R = rng(3);
    sky(c, ['#78b4e0', '#88bfe6', '#9ccbeb', '#b2d8f0']);
    for (let x = -8; x < W; x += 18) { const h = 18 + Math.floor(R() * 14); rect(c, x, HORIZON - h - 8, 18, h, R() < 0.5 ? '#2f6b34' : '#3a7a3c'); rect(c, x + 7, HORIZON - 10, 3, 10, '#5a4030'); }
    rect(c, 60, 92, 70, 36, '#ece6d8'); rect(c, 56, 86, 78, 7, '#b5402f');
    for (let x = 66; x < 126; x += 12) rect(c, x, 100, 6, 8, '#3d5a7a');
    rect(c, 90, 112, 10, 16, '#6b4a30');
    grass(c, '#4c9a3c', '#448c35', 20);
    plainWall(c, '#8a5a2b', '#5e3c1c', cc => { for (let y = WALL_TOP + 6; y < 160; y += 7) rect(cc, WALL_X, y, WALL_W, 1, '#5e3c1c'); });
  },
  // 3 Pro Training Center
  c => {
    const R = rng(4);
    sky(c, ['#8ac4ec', '#9ccff0', '#b0daf4', '#c4e4f7']);
    rect(c, 30, 60, 140, 68, '#5f7d99');
    for (let y = 64; y < 124; y += 8) for (let x = 34; x < 166; x += 10) rect(c, x, y, 8, 6, R() < 0.3 ? '#cfe6f7' : '#8fb3d1');
    rect(c, 190, 88, 80, 40, '#e6e6e6'); rect(c, 186, 84, 88, 4, '#2a62c9');
    rect(c, 0, HORIZON - 6, W, 6, '#2e6b33');
    grass(c, '#3fa34d', '#379445', 16);
    plainWall(c, '#ececec', '#bdbdbd', cc => {
      rect(cc, WALL_X + 3, 120, 9, 14, '#2a62c9'); rect(cc, WALL_X + 5, 123, 5, 8, '#f2f2f2'); rect(cc, WALL_X + 6, 125, 3, 4, '#e94b3c');
    });
  },
  // 4 National Academy
  c => {
    sky(c, ['#6fa8d8', '#80b4de', '#94c1e5', '#aacfec']);
    rect(c, 20, 70, 200, 58, '#d8d2c4'); rect(c, 16, 64, 208, 7, '#8a8070');
    for (let x = 30; x < 210; x += 14) rect(c, x, 80, 8, 30, '#3d5a7a');
    const flags = [['#d0202f', '#f2f2f2'], ['#1c2f6b', '#f2f2f2'], ['#f7d117', '#1d9a5b'], ['#f36c21', '#f2f2f2'], ['#1d7a3a', '#f2f2f2']];
    flags.forEach(([a, b], i) => { const x = 232 + i * 11; rect(c, x, 60, 1, 68, '#888'); rect(c, x + 1, 60, 8, 3, a); rect(c, x + 1, 63, 8, 3, b); });
    grass(c, '#3d9b47', '#358b3f', 18);
    plainWall(c, '#3a3f48', '#22262c', cc => {
      for (let y = WALL_TOP + 4; y < 156; y += 4) rect(cc, WALL_X + 2, y, WALL_W - 3, 1, '#9aa3ad');
      for (let x = WALL_X + 3; x < WALL_X + WALL_W; x += 4) rect(cc, x, WALL_TOP + 2, 1, 156 - WALL_TOP, '#9aa3ad');
    });
  },
  // 5 Big Stadium
  c => {
    const R = rng(6);
    sky(c, ['#6aa6dc', '#7cb2e0', '#90bfe6']);
    crowdStands(c, R, '#4a5260', '#2c323c', ['#d0202f', '#f2f2f2', '#2a62c9', '#f4c430', '#e8b48a', '#7a4a2a', '#1d9a5b']);
    grass(c, '#3fa34d', '#36924a', 22);
    plainWall(c, '#14161c', '#2c323c', cc => { for (let y = WALL_TOP + 6; y < 158; y += 10) rect(cc, WALL_X + 3, y, WALL_W - 5, 2, '#2a62c9'); });
  },
  // 6 Night Stadium
  c => {
    const R = rng(7);
    sky(c, ['#070b1c', '#0b1128', '#111a38', '#1a2550']);
    crowdStands(c, R, '#1d222c', '#0e1118', ['#5a5f6b', '#3a3f4a', '#7a3a3a', '#3a4a7a', '#6b6040']);
    for (const x of [20, 150, 260]) { rect(c, x, 4, 2, 40, '#555'); rect(c, x - 8, 2, 18, 6, '#fffbe0'); }
    grass(c, '#2f8a3e', '#297a37', 22);
    plainWall(c, '#0c0e14', '#2c323c', cc => { for (let y = WALL_TOP + 6; y < 158; y += 10) rect(cc, WALL_X + 3, y, WALL_W - 5, 2, '#ff3d8b'); });
  },
  // 7 Golden Stadium
  c => {
    const R = rng(8);
    sky(c, ['#f6c565', '#f8b46e', '#fba57a', '#fd9a82']);
    crowdStands(c, R, '#8a6a20', '#5e4510', ['#f4c430', '#fff2b0', '#d9a520', '#f2f2f2', '#75aadb']);
    grass(c, '#5aa83c', '#4f9a33', 22);
    plainWall(c, '#d9a520', '#a07400', cc => { for (let y = WALL_TOP + 5; y < 158; y += 9) rect(cc, WALL_X + 3, y, WALL_W - 5, 1, '#fff2b0'); });
  },
  // 8 Star Stadium
  c => {
    const R = rng(9);
    sky(c, ['#12062a', '#1d0b3d', '#2a1255', '#3d1a6b']);
    for (let i = 0; i < 80; i++) rect(c, Math.floor(R() * W), Math.floor(R() * 100), 1, 1, R() < 0.3 ? '#fff2b0' : '#c9c2ff');
    rect(c, 210, 20, 24, 24, '#8e5bd1'); rect(c, 206, 26, 32, 12, '#8e5bd1'); rect(c, 200, 31, 44, 2, '#e3c9ff');
    rect(c, 0, 110, W, HORIZON - 110, '#24123f');
    for (let x = 1; x < W; x += 3) if (R() < 0.7) rect(c, x, 114 + Math.floor(R() * 8), 2, 2, ['#f4c430', '#c9c2ff', '#ff3d8b'][Math.floor(R() * 3)]);
    grass(c, '#2a7d6b', '#236b5c', 22);
    plainWall(c, '#4a1f80', '#2a1050', cc => { for (let y = WALL_TOP + 6; y < 158; y += 8) rect(cc, WALL_X + 3, y, WALL_W - 5, 1, '#e3c9ff'); });
  },
];

const cache = [];
export function background(idx) {
  if (!cache[idx]) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    BUILDERS[idx](cv.getContext('2d'));
    cache[idx] = cv;
  }
  return cache[idx];
}

// Animated extras drawn on top of the static background.
export function drawDynamic(c, idx, t) {
  if (idx === 5 || idx === 6 || idx === 7) {
    // Crowd bounce / phone flashes
    const R = rng(Math.floor(t * 4));
    for (let i = 0; i < (idx === 6 ? 14 : 8); i++) {
      const x = Math.floor(R() * W), y = 44 + Math.floor(R() * 70);
      c.fillStyle = idx === 6 ? '#ffffff' : 'rgba(255,255,255,0.7)';
      c.fillRect(x, y, 1, 1);
    }
  }
  if (idx === 6) {
    c.fillStyle = 'rgba(255,250,220,0.06)';
    for (const x of [20, 150, 260]) { c.beginPath(); c.moveTo(x - 8, 6); c.lineTo(x + 10, 6); c.lineTo(x + 60, HORIZON + 30); c.lineTo(x - 50, HORIZON + 30); c.fill(); }
  }
  if (idx === 8) {
    const R = rng(Math.floor(t * 2));
    for (let i = 0; i < 6; i++) { c.fillStyle = '#ffffff'; c.fillRect(Math.floor(R() * W), Math.floor(R() * 100), 1, 1); }
  }
}
