// The player ladder. You start as Ravi and become the next player
// automatically whenever your rating reaches theirs.
// Ratings are game values only. Looks are generic pixel figures in
// national team colours (no logos, no portraits).

// National kits: shirt, shorts, socks, optional pattern + second colour.
const KITS = {
  STREET: { shirt: '#cfc7b0', shorts: '#6b5a3e', socks: null },
  IND: { shirt: '#2a62c9', shorts: '#1d3f86', socks: '#2a62c9' },
  UAE: { shirt: '#f2f2f2', shorts: '#f2f2f2', socks: '#d23b3b' },
  QAT: { shirt: '#7a1534', shorts: '#f2f2f2', socks: '#7a1534' },
  KSA: { shirt: '#1d7a3a', shorts: '#f2f2f2', socks: '#1d7a3a' },
  IRN: { shirt: '#f2f2f2', shorts: '#f2f2f2', socks: '#d23b3b' },
  JPN: { shirt: '#1a2f7a', shorts: '#f2f2f2', socks: '#1a2f7a' },
  KOR: { shirt: '#d0202f', shorts: '#1a1a1a', socks: '#d0202f' },
  USA: { shirt: '#f2f2f2', shorts: '#1b2a5c', socks: '#f2f2f2' },
  CAN: { shirt: '#d0202f', shorts: '#d0202f', socks: '#d0202f' },
  MAR: { shirt: '#c1272d', shorts: '#0f6b3a', socks: '#c1272d' },
  ALG: { shirt: '#f2f2f2', shorts: '#f2f2f2', socks: '#0f7a3a' },
  SEN: { shirt: '#f2f2f2', shorts: '#f2f2f2', socks: '#0f7a3a' },
  URU: { shirt: '#6cb4e4', shorts: '#1a1a1a', socks: '#1a1a1a' },
  GER: { shirt: '#f2f2f2', shorts: '#1a1a1a', socks: '#f2f2f2' },
  POR: { shirt: '#b4122a', shorts: '#0f6b3a', socks: '#b4122a' },
  ENG: { shirt: '#f2f2f2', shorts: '#1b2a5c', socks: '#f2f2f2' },
  ESP: { shirt: '#c8102e', shorts: '#1b2a5c', socks: '#1b2a5c' },
  FRA: { shirt: '#1c2f6b', shorts: '#f2f2f2', socks: '#c8102e' },
  NED: { shirt: '#f36c21', shorts: '#f36c21', socks: '#f36c21' },
  BRA: { shirt: '#f7d117', shorts: '#1f4fb3', socks: '#f2f2f2' },
  POL: { shirt: '#f2f2f2', shorts: '#d0202f', socks: '#f2f2f2' },
  EGY: { shirt: '#c8102e', shorts: '#f2f2f2', socks: '#1a1a1a' },
  CRO: { shirt: '#e0202f', shorts: '#f2f2f2', socks: '#1b2a5c', pattern: 'checks', pattern2: '#f2f2f2' },
  BEL: { shirt: '#c8102e', shorts: '#c8102e', socks: '#c8102e' },
  NOR: { shirt: '#c8102e', shorts: '#f2f2f2', socks: '#1b2a5c' },
  ARG: { shirt: '#f2f2f2', shorts: '#1a1a1a', socks: '#f2f2f2', pattern: 'stripes', pattern2: '#75aadb' },
};

// Skin tones 1 (light) to 5 (dark).
export const SKINS = [null, '#f2c9a0', '#d9a77a', '#b97c4e', '#8a5634', '#5a3420'];

const BLACK = '#1a1a1a', DARK = '#3a2516', BROWN = '#6b4423', BLOND = '#d9b25f', GINGER = '#c46a2b';

// p(name, nation, rating, skin, hairColour, hairStyle, beard)
function p(name, nation, rating, skin, hair, style = 'short', beard = false) {
  return { name, nation, rating, skin, hair, style, beard, kit: KITS[nation] };
}

export const STARS = [
  { ...p('Ravi', 'IND', 1, 3, BLACK, 'short'), kit: KITS.STREET, street: true, origin: 'Mumbai street kid, 14' },

  // India
  p('Udanta Singh', 'IND', 5, 3, BLACK),
  p('Sahal Abdul Samad', 'IND', 7, 3, BLACK, 'short', true),
  p('Lallianzuala Chhangte', 'IND', 9, 2, BLACK),
  p('Anirudh Thapa', 'IND', 11, 2, BLACK),
  p('Liston Colaco', 'IND', 13, 3, BLACK, 'curly'),
  p('Sandesh Jhingan', 'IND', 15, 3, BLACK, 'short', true),
  p('Bhaichung Bhutia', 'IND', 17, 2, BLACK),
  p('Sunil Chhetri', 'IND', 19, 3, BLACK, 'buzz', true),

  // Asia
  p('Omar Abdulrahman', 'UAE', 21, 3, BLACK, 'afro'),
  p('Ali Mabkhout', 'UAE', 23, 3, BLACK, 'short', true),
  p('Almoez Ali', 'QAT', 25, 4, BLACK, 'short', true),
  p('Salem Al-Dawsari', 'KSA', 27, 3, BLACK, 'short', true),
  p('Akram Afif', 'QAT', 29, 3, BLACK, 'curly'),
  p('Mehdi Taremi', 'IRN', 31, 2, BLACK, 'short', true),
  p('Takumi Minamino', 'JPN', 33, 1, DARK),
  p('Kaoru Mitoma', 'JPN', 35, 1, BLACK),
  p('Takefusa Kubo', 'JPN', 37, 1, BLACK),
  p('Kim Min-jae', 'KOR', 39, 1, BLACK, 'buzz'),

  // Rising stars
  p('Christian Pulisic', 'USA', 41, 1, BROWN),
  p('Alphonso Davies', 'CAN', 43, 5, BLACK, 'buzz'),
  p('Hakim Ziyech', 'MAR', 45, 2, BLACK, 'short', true),
  p('Achraf Hakimi', 'MAR', 47, 3, BLACK, 'curly'),
  p('Riyad Mahrez', 'ALG', 49, 3, BLACK, 'short', true),
  p('Sadio Mane', 'SEN', 51, 5, BLACK, 'buzz', true),
  p('Federico Valverde', 'URU', 53, 1, DARK, 'short', true),
  p('Son Heung-min', 'KOR', 55, 1, BLACK),

  // World class
  p('Thomas Muller', 'GER', 57, 1, BROWN),
  p('Bernardo Silva', 'POR', 59, 1, DARK, 'short', true),
  p('Phil Foden', 'ENG', 61, 1, BLOND, 'buzz'),
  p('Bukayo Saka', 'ENG', 63, 5, BLACK, 'buzz'),
  p('Florian Wirtz', 'GER', 65, 1, BROWN),
  p('Jamal Musiala', 'GER', 67, 4, BLACK, 'curly'),
  p('Pedri', 'ESP', 69, 1, DARK),
  p('Antoine Griezmann', 'FRA', 71, 1, BROWN, 'short', true),
  p('Rodri', 'ESP', 73, 1, DARK, 'short', true),
  p('Virgil van Dijk', 'NED', 75, 4, BLACK, 'short', true),
  p('Toni Kroos', 'GER', 77, 1, BROWN),
  p('Lamine Yamal', 'ESP', 79, 3, BLACK, 'curly'),
  p('Jude Bellingham', 'ENG', 81, 4, BLACK, 'buzz'),
  p('Vinicius Junior', 'BRA', 83, 5, BLACK, 'curly'),
  p('Harry Kane', 'ENG', 85, 1, BROWN),
  p('Robert Lewandowski', 'POL', 86, 1, BROWN),
  p('Karim Benzema', 'FRA', 87, 2, BLACK, 'buzz', true),
  p('Mohamed Salah', 'EGY', 88, 3, BLACK, 'afro', true),
  p('Luka Modric', 'CRO', 89, 1, BROWN, 'long'),
  p('Kevin De Bruyne', 'BEL', 90, 1, GINGER),
  p('Erling Haaland', 'NOR', 91, 1, BLOND, 'bun'),
  p('Xavi', 'ESP', 92, 1, DARK, 'short', true),
  p('Andres Iniesta', 'ESP', 93, 1, DARK, 'bald'),

  // Legends
  p('Neymar', 'BRA', 94, 2, DARK),
  p('Kylian Mbappe', 'FRA', 95, 4, BLACK, 'bald'),
  p('Zinedine Zidane', 'FRA', 96, 2, DARK, 'bald'),
  p('Ronaldinho', 'BRA', 97, 4, BLACK, 'headband'),
  p('Cristiano Ronaldo', 'POR', 98, 2, BLACK),
  p('Lionel Messi', 'ARG', 99, 1, BROWN, 'short', true),
];

// Shirt number and home town for every player (number = the one most
// associated with them; game data only).
const INFO = {
  'Ravi': [17, 'Mumbai'],
  'Udanta Singh': [15, 'Manipur'], 'Sahal Abdul Samad': [18, 'Al Ain, UAE'],
  'Lallianzuala Chhangte': [7, 'Mizoram'], 'Anirudh Thapa': [7, 'Dehradun'],
  'Liston Colaco': [17, 'Goa'], 'Sandesh Jhingan': [5, 'Chandigarh'],
  'Bhaichung Bhutia': [15, 'Sikkim'], 'Sunil Chhetri': [11, 'Secunderabad'],
  'Omar Abdulrahman': [10, 'Riyadh, Saudi Arabia'], 'Ali Mabkhout': [7, 'Abu Dhabi'],
  'Almoez Ali': [19, 'Khartoum, Sudan'], 'Salem Al-Dawsari': [10, 'Riyadh'],
  'Akram Afif': [11, 'Doha'], 'Mehdi Taremi': [9, 'Bushehr'],
  'Takumi Minamino': [10, 'Osaka'], 'Kaoru Mitoma': [7, 'Kawasaki'],
  'Takefusa Kubo': [20, 'Kawasaki'], 'Kim Min-jae': [4, 'Tongyeong'],
  'Christian Pulisic': [10, 'Hershey, Pennsylvania'], 'Alphonso Davies': [19, 'Buduburam, Ghana'],
  'Hakim Ziyech': [7, 'Dronten, Netherlands'], 'Achraf Hakimi': [2, 'Madrid, Spain'],
  'Riyad Mahrez': [7, 'Sarcelles, France'], 'Sadio Mane': [10, 'Bambali'],
  'Federico Valverde': [15, 'Montevideo'], 'Son Heung-min': [7, 'Chuncheon'],
  'Thomas Muller': [25, 'Weilheim'], 'Bernardo Silva': [10, 'Lisbon'],
  'Phil Foden': [47, 'Stockport'], 'Bukayo Saka': [7, 'London'],
  'Florian Wirtz': [10, 'Pulheim'], 'Jamal Musiala': [10, 'Stuttgart'],
  'Pedri': [8, 'Tenerife'], 'Antoine Griezmann': [7, 'Macon'],
  'Rodri': [16, 'Madrid'], 'Virgil van Dijk': [4, 'Breda'],
  'Toni Kroos': [8, 'Greifswald'], 'Lamine Yamal': [19, 'Esplugues de Llobregat'],
  'Jude Bellingham': [5, 'Stourbridge'], 'Vinicius Junior': [7, 'Sao Goncalo'],
  'Harry Kane': [9, 'London'], 'Robert Lewandowski': [9, 'Warsaw'],
  'Karim Benzema': [9, 'Lyon'], 'Mohamed Salah': [11, 'Nagrig'],
  'Luka Modric': [10, 'Zadar'], 'Kevin De Bruyne': [17, 'Ghent'],
  'Erling Haaland': [9, 'Leeds, England'], 'Xavi': [6, 'Terrassa'],
  'Andres Iniesta': [8, 'Fuentealbilla'], 'Neymar': [10, 'Mogi das Cruzes'],
  'Kylian Mbappe': [10, 'Paris'], 'Zinedine Zidane': [10, 'Marseille'],
  'Ronaldinho': [10, 'Porto Alegre'], 'Cristiano Ronaldo': [7, 'Funchal, Madeira'],
  'Lionel Messi': [10, 'Rosario'],
};
for (const st of STARS) { const [num, from] = INFO[st.name] || [10, '']; st.num = num; st.from = from; }

export const MESSI_RATING = 99;

export const COUNTRIES = {
  IND: 'India', UAE: 'United Arab Emirates', QAT: 'Qatar', KSA: 'Saudi Arabia', IRN: 'Iran',
  JPN: 'Japan', KOR: 'South Korea', USA: 'USA', CAN: 'Canada', MAR: 'Morocco', ALG: 'Algeria',
  SEN: 'Senegal', URU: 'Uruguay', GER: 'Germany', POR: 'Portugal', ENG: 'England', ESP: 'Spain',
  FRA: 'France', NED: 'Netherlands', BRA: 'Brazil', POL: 'Poland', EGY: 'Egypt', CRO: 'Croatia',
  BEL: 'Belgium', NOR: 'Norway', ARG: 'Argentina',
};
