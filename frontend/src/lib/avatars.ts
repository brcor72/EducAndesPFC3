export interface AvatarProfile {
  displayName?: string;
  gender?: string;
  skinTone?: string;
  birthYear?: number;
  activity?: string;
}

const SKIN_MAP: Record<string, string> = {
  claro:   'light',
  medio:   'tanned',
  moreno:  'brown',
  oscuro:  'darkBrown',
};

const TOP_MALE   = ['shortHairShortCurly', 'shortHairShortFlat', 'shortHairShortWaved', 'shortHairSides'];
const TOP_FEMALE = ['longHairBraids', 'longHairBob', 'longHairStraight', 'longHairCurly'];

const CLOTHING_MAP: Record<string, string> = {
  agricultor:  'hoodie',
  tejedora:    'collarSweater',
  ganadero:    'hoodie',
  pastor:      'overall',
  artesana:    'collarSweater',
  comerciante: 'blazerAndShirt',
  docente:     'blazerAndShirt',
  estudiante:  'graphicShirt',
};

const CLOTHING_COLOR_MAP: Record<string, string> = {
  agricultor:  '65c9ff',
  tejedora:    'ff488e',
  ganadero:    'a7ffc4',
  pastor:      'ffafb9',
  artesana:    'ff488e',
  comerciante: 'ffffb1',
  docente:     'b1e2ff',
  estudiante:  'e6e6e6',
};

function pickByHash(arr: string[], seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

export function buildAvatarUrl(profile: AvatarProfile): string {
  // Seed compuesto: nombre + género + actividad → avatar único por perfil
  const seedStr = [
    profile.displayName ?? 'usuario',
    profile.gender ?? '',
    profile.activity ?? '',
    profile.birthYear ?? '',
  ].join('-');
  const seed = encodeURIComponent(seedStr);
  const skin = SKIN_MAP[profile.skinTone ?? ''] ?? 'tanned';

  return (
    `https://api.dicebear.com/7.x/avataaars/svg` +
    `?seed=${seed}` +
    `&skinColor=${skin}` +
    `&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
  );
}

export const ACTIVITY_OPTIONS = [
  { value: 'agricultor',  label: '🌾 Agricultor' },
  { value: 'tejedora',    label: '🧶 Tejedora' },
  { value: 'ganadero',    label: '🐄 Ganadero' },
  { value: 'pastor',      label: '🐑 Pastor' },
  { value: 'artesana',    label: '🎨 Artesana' },
  { value: 'comerciante', label: '🏪 Comerciante' },
  { value: 'docente',     label: '📖 Docente' },
  { value: 'estudiante',  label: '📚 Estudiante' },
];
