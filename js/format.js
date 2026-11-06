// Number and time formatting.
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
  'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'];

let notation = 'short';
export const setNotation = n => { notation = n; };

// Big number: 1234 -> "1.23K", or "1.23e3" in scientific mode.
export function fmt(n, smallDecimals = 0) {
  if (!isFinite(n)) return 'Infinity';
  if (n < 0) return '-' + fmt(-n, smallDecimals);
  if (n < 1000) return smallDecimals && n < 100 ? n.toFixed(smallDecimals) : Math.floor(n).toString();
  const exp = Math.floor(Math.log10(n));
  if (notation === 'sci' || exp >= SUFFIXES.length * 3) {
    return (n / Math.pow(10, exp)).toFixed(2) + 'e' + exp;
  }
  const tier = Math.floor(exp / 3);
  const v = n / Math.pow(1000, tier);
  return v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0) + SUFFIXES[tier];
}

export function fmtTime(sec) {
  sec = Math.floor(sec);
  const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600);
  const m = Math.floor(sec % 3600 / 60), s = sec % 60;
  if (d) return `${d}d ${h}h ${m}m`;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

export const pct = x => (x * 100).toFixed(1) + '%';
