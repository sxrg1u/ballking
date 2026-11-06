// Simple pixel flags (12x8) for every nation in the ladder.
const H = (...c) => ({ h: c });          // horizontal stripes
const V = (...c) => ({ v: c });          // vertical stripes
const FLAGS = {
  IND: { ...H('#ff9933', '#ffffff', '#138808'), dot: '#000080' },
  UAE: { ...H('#00732f', '#ffffff', '#000000'), left: '#ff0000' },
  QAT: { ...V('#ffffff', '#8a1538', '#8a1538', '#8a1538') },
  KSA: { ...H('#006c35'), bar: '#ffffff' },
  IRN: { ...H('#239f40', '#ffffff', '#da0000'), dot: '#da0000' },
  JPN: { ...H('#ffffff'), dot: '#bc002d', big: true },
  KOR: { ...H('#ffffff'), dot: '#cd2e3a', dot2: '#0047a0', big: true },
  USA: { ...H('#b22234', '#ffffff', '#b22234', '#ffffff'), canton: '#3c3b6e' },
  CAN: { ...V('#d80621', '#ffffff', '#ffffff', '#d80621'), dot: '#d80621' },
  MAR: { ...H('#c1272d'), dot: '#006233' },
  ALG: { ...V('#006633', '#ffffff'), dot: '#d21034' },
  SEN: { ...V('#00853f', '#fdef42', '#e31b23'), dot: '#00853f' },
  URU: { ...H('#ffffff', '#0038a8', '#ffffff', '#0038a8'), canton: '#ffffff', sun: '#fcd116' },
  GER: H('#000000', '#dd0000', '#ffce00'),
  POR: { ...V('#006600', '#006600', '#ff0000', '#ff0000', '#ff0000'), dot: '#ffcc00' },
  ENG: { ...H('#ffffff'), cross: '#ce1124' },
  ESP: H('#aa151b', '#f1bf00', '#f1bf00', '#aa151b'),
  FRA: V('#0055a4', '#ffffff', '#ef4135'),
  NED: H('#ae1c28', '#ffffff', '#21468b'),
  BRA: { ...H('#009c3b'), diamond: '#ffdf00', dot: '#002776' },
  POL: H('#ffffff', '#dc143c'),
  EGY: { ...H('#ce1126', '#ffffff', '#000000'), dot: '#c09300' },
  CRO: { ...H('#ff0000', '#ffffff', '#171796'), dot: '#ff0000' },
  BEL: V('#000000', '#fdda24', '#ef3340'),
  NOR: { ...H('#ba0c2f'), cross: '#00205b', crossEdge: '#ffffff', nordic: true },
  ARG: { ...H('#74acdf', '#ffffff', '#74acdf'), dot: '#f6b40e' },
};

const cache = {};
export function flag(nation, scale = 3) {
  const key = nation + scale;
  if (cache[key]) return cache[key];
  const f = FLAGS[nation] || H('#888888');
  const W = 12, Hh = 8;
  const cv = document.createElement('canvas');
  cv.width = W * scale; cv.height = Hh * scale;
  const c = cv.getContext('2d');
  const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x * scale, y * scale, w * scale, h * scale); };
  if (f.h) f.h.forEach((col, i) => { const a = Math.round(i * Hh / f.h.length), b = Math.round((i + 1) * Hh / f.h.length); R(0, a, W, b - a, col); });
  if (f.v) f.v.forEach((col, i) => { const a = Math.round(i * W / f.v.length), b = Math.round((i + 1) * W / f.v.length); R(a, 0, b - a, Hh, col); });
  if (f.left) R(0, 0, 3, Hh, f.left);
  if (f.bar) R(3, 5, 6, 1, f.bar);
  if (f.canton) R(0, 0, 5, 4, f.canton);
  if (f.sun) R(1, 1, 2, 2, f.sun);
  if (f.diamond) { R(2, 2, 8, 4, f.diamond); R(4, 1, 4, 6, f.diamond); }
  if (f.cross) {
    if (f.nordic) { R(3, 0, 3, Hh, f.crossEdge); R(0, 2.5, W, 3, f.crossEdge); R(3.5, 0, 2, Hh, f.cross); R(0, 3, W, 2, f.cross); }
    else { R(5, 0, 2, Hh, f.cross); R(0, 3, W, 2, f.cross); }
  }
  if (f.dot) f.big ? R(4, 2, 4, 4, f.dot) : R(5, 3, 2, 2, f.dot);
  if (f.dot2) R(4, 4, 4, 2, f.dot2);
  // Pixel frame
  c.fillStyle = 'rgba(0,0,0,0.35)';
  c.fillRect(0, (Hh - 1) * scale, W * scale, scale);
  return (cache[key] = cv.toDataURL());
}

export const flagImg = (nation, scale = 2, cls = 'flag') =>
  `<img class="${cls}" src="${flag(nation, scale)}" alt="${nation}" width="${12 * scale}" height="${8 * scale}">`;
