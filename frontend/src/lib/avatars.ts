export interface AvatarOption {
  key: string;
  emoji: string;
  label: string;
  bg: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { key: 'agricultor',  emoji: '🌾', label: 'Agricultor',       bg: '#78a85a' },
  { key: 'tejedora',    emoji: '🧶', label: 'Tejedora',         bg: '#c4614a' },
  { key: 'ganadero',    emoji: '🐄', label: 'Ganadero',         bg: '#8b6914' },
  { key: 'pastor',      emoji: '🐑', label: 'Pastor',           bg: '#5a8fa8' },
  { key: 'medica',      emoji: '🌿', label: 'Médica comunal',   bg: '#3d8a6e' },
  { key: 'estudiante',  emoji: '📚', label: 'Estudiante',       bg: '#7057a8' },
  { key: 'artesana',    emoji: '🎨', label: 'Artesana',         bg: '#c4824a' },
  { key: 'lider',       emoji: '🌟', label: 'Líder comunal',    bg: '#a85a85' },
];

export function getAvatar(key: string | null | undefined): AvatarOption {
  return AVATAR_OPTIONS.find((a) => a.key === key) ?? AVATAR_OPTIONS[5];
}
