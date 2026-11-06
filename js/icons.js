// Tiny pixel icons, drawn from text maps and turned into data URLs.
const PAL = {
  k: '#120d14', w: '#ffffff', g: '#f4c430', o: '#e8892a', y: '#fff2b0', r: '#e94b3c',
  b: '#3d8bff', c: '#7fd8ff', e: '#4cc26a', d: '#2e8a46', s: '#9aa3b5', n: '#5d6472',
  p: '#c08bff', m: '#8a5634', l: '#d9a77a',
};

const MAPS = {
  tempo: [ // lightning
    '....kkkk..', '...kggk...', '..kggk....', '.kgggkkk..', 'kggggggk..',
    '.kkkggk...', '...kgk....', '..kgk.....', '.kgk......', '.kk.......'],
  tech: [ // star
    '....kk....', '...kggk...', '...kggk...', 'kkkkggkkkk', 'kgggyygggk',
    '.kgggggk..', '..kgggk...', '.kggkggk..', 'kggk.kggk.', 'kkk...kkk.'],
  control: [ // target
    '..kkkkkk..', '.krrrrrrk.', 'krrwwwwrrk', 'krwwrrwwrk', 'krwrkkrwrk',
    'krwrkkrwrk', 'krwwrrwwrk', 'krrwwwwrrk', '.krrrrrrk.', '..kkkkkk..'],
  stamina: [ // heart
    '.kkk..kkk.', 'krrrkkrrrk', 'krwrrrrrrk', 'krwrrrrrrk', 'krrrrrrrrk',
    '.krrrrrrk.', '..krrrrk..', '...krrk...', '....kk....', '..........'],
  balls: [ // football
    '...kkkk...', '..kwwwwk..', '.kwkkwwwk.', 'kwkkkwwwwk', 'kwwkwwwkwk',
    'kwwwwwkkwk', 'kwkwwwkkwk', '.kkkwwwwk.', '..kwwwwk..', '...kkkk...'],
  boots: [ // boot
    '..........', '..kkkk....', '..kbbk....', '..kbbk....', '..kbbkkk..',
    '.kbbbbbbk.', 'kbbbbbbbbk', 'kcbbbbbbbk', 'kkkkkkkkkk', '.k.k.k.k..'],
  ball: [ // golden ball
    '...kkkk...', '..kggggk..', '.kgkkgggk.', 'kgkkkgyggk', 'kggkgggkgk',
    'kgggggkkgk', 'kgkgggkkgk', '.kkkggggk.', '..kggggk..', '...kkkk...'],
  coach: [ // whistle
    '..........', '.kkkkk....', 'kssssskkk.', 'ksnnsssssk', 'ksnnsssssk',
    'kssssskkk.', '.kkkkk....', '..k.......', '...k......', '....kk....'],
  ground: [ // flag
    'kk........', 'kegggk....', 'keeggggk..', 'keeeeggggk', 'keeeeegggk',
    'keeeeeeek.', 'kkkkkkkk..', 'k.........', 'k.........', 'kk........'],
  upgrades: [ // arrow up
    '....kk....', '...kggk...', '..kggggk..', '.kggggggk.', 'kkkggggkkk',
    '...kggk...', '...kggk...', '...kggk...', '...kggk...', '...kkkk...'],
  career: [ // trophy
    'kkkkkkkkkk', 'kgggyggggk', 'kgggyggggk', '.kgggggk..', '.kgggggk..',
    '..kgggk...', '...kgk....', '...kgk....', '..kkkkk...', '.kgggggk..'],
  stats: [ // bars
    '..........', '.......kk.', '.......kek', '....kk.kek', '....kbkkek',
    '.kk.kbkkek', '.krkkbkkek', '.krkkbkkek', '.krkkbkkek', 'kkkkkkkkkk'],
  settings: [ // cog
    '...kkkk...', '.kkssssk..', '.ksssssskk', 'kssskkssk.', 'kssk..sssk',
    'kssk..sssk', '.kssskkssk', 'kksssssssk', '..kssssk..', '...kkkk...'],
  coin: [
    '..kkkkkk..', '.kggggggk.', 'kggyyyyogk', 'kgyggggogk', 'kgyggggogk',
    'kgyggggogk', 'kgyggggogk', 'kgoooooogk', '.kggggggk.', '..kkkkkk..'],
  fire: [
    '....k.....', '...kok....', '...kok.k..', '..kooookok', '.koooyook.',
    '.kooyyyok.', 'kooyyyyook', 'koyyyyyyok', '.koyyyyok.', '..kkkkkk..'],
};

const cache = {};
export function icon(name, size = 40) {
  const key = name + size;
  if (cache[key]) return cache[key];
  const map = MAPS[name];
  const cv = document.createElement('canvas');
  const px = Math.floor(size / 10);
  cv.width = cv.height = px * 10;
  const c = cv.getContext('2d');
  map.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.') { c.fillStyle = PAL[ch]; c.fillRect(x * px, y * px, px, px); }
  }));
  return (cache[key] = cv.toDataURL());
}

export const img = (name, size = 40, cls = 'ico') => `<img class="${cls}" src="${icon(name, size)}" alt="" width="${size}" height="${size}">`;
