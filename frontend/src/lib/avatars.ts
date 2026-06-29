export interface AvatarStyle {
  key: string;
  label: string;
  description: string;
}

export const AVATAR_STYLES: AvatarStyle[] = [
  { key: 'adventurer',    label: 'Aventurero',  description: 'Ilustración colorida con rasgos únicos' },
  { key: 'avataaars',     label: 'Caricatura',  description: 'Estilo caricatura personalizable' },
  { key: 'big-smile',     label: 'Amigable',    description: 'Rostro simple y expresivo' },
  { key: 'personas',      label: 'Retrato',     description: 'Ilustración estilo retrato' },
  { key: 'lorelei',       label: 'Artístico',   description: 'Diseño artístico detallado' },
];

export function buildAvatarUrl(seed: string, style = 'adventurer'): string {
  const safeSeed = encodeURIComponent(seed || 'usuario');
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${safeSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function getStyleKey(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) return 'adventurer';
  const match = avatarUrl.match(/\/7\.x\/([^/]+)\//);
  return match?.[1] ?? 'adventurer';
}
