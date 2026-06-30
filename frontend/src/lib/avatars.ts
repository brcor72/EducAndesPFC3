export interface AvatarProfile {
  displayName?: string;
  gender?: string;
  skinTone?: string;
  birthYear?: number;
  activity?: string;
}

export async function generateAiAvatar(profile: AvatarProfile): Promise<string> {
  const response = await fetch('/api/generate-avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gender:    profile.gender,
      activity:  profile.activity,
      skinTone:  profile.skinTone,
      birthYear: profile.birthYear,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error ?? 'Error generando avatar');
  }

  const { dataUrl } = await response.json();
  return dataUrl;
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
