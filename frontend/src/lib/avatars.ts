export interface AvatarProfile {
  displayName?: string;
  gender?: string;
  skinTone?: string;
  birthYear?: number;
  activity?: string;
}

const GENDER_DESC: Record<string, string> = {
  masculino:       'man',
  femenino:        'woman',
  no_especificado: 'person',
};
const ACTIVITY_AI_DESC: Record<string, string> = {
  agricultor:  'farmer wearing a green poncho',
  tejedora:    'weaver wearing colorful traditional clothing',
  ganadero:    'cattle herder wearing a brown poncho',
  pastor:      'shepherd wearing a blue poncho',
  artesana:    'artisan wearing a vibrant manta',
  comerciante: 'merchant wearing traditional Andean attire',
  docente:     'teacher wearing a formal shirt with Andean scarf',
  estudiante:  'student wearing casual clothes with Andean details',
};
const SKIN_AI_DESC: Record<string, string> = {
  claro:  'light skin',
  medio:  'medium brown skin',
  moreno: 'dark brown skin',
  oscuro: 'very dark brown skin',
};

export async function generateAiAvatar(profile: AvatarProfile): Promise<string> {
  const gender   = GENDER_DESC[profile.gender ?? ''] ?? 'person';
  const activity = ACTIVITY_AI_DESC[profile.activity ?? ''] ?? 'student';
  const skin     = SKIN_AI_DESC[profile.skinTone ?? ''] ?? 'medium brown skin';
  const age      = profile.birthYear ? new Date().getFullYear() - profile.birthYear : 30;
  const ageDesc  = age < 25 ? 'young' : age > 50 ? 'elderly' : 'adult';

  const prompt = `Portrait of an ${ageDesc} Andean ${gender}, ${activity}, ${skin}, wearing a colorful traditional chullo hat with geometric patterns, warm friendly smile, Andean mountains background, vibrant colors, high quality digital illustration, soft lighting`;

  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=512&height=512&model=flux&nologo=true&seed=${Date.now()}`;

  // Pollinations returns the image directly — convert to data URL for storage
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pollinations error ${response.status}`);

  const blob = await response.blob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

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
