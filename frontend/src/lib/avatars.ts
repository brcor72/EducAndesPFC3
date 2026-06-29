export interface AvatarProfile {
  displayName?: string;
  gender?: string;
  skinTone?: string;
  birthYear?: number;
  activity?: string;
}

const HF_MODEL = 'black-forest-labs/FLUX.1-schnell';
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

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
  const hfToken = import.meta.env.VITE_HF_TOKEN as string;
  if (!hfToken) throw new Error('Falta VITE_HF_TOKEN en el entorno del frontend');

  const gender   = GENDER_DESC[profile.gender ?? ''] ?? 'person';
  const activity = ACTIVITY_AI_DESC[profile.activity ?? ''] ?? 'student';
  const skin     = SKIN_AI_DESC[profile.skinTone ?? ''] ?? 'medium brown skin';
  const age      = profile.birthYear ? new Date().getFullYear() - profile.birthYear : 30;
  const ageDesc  = age < 25 ? 'young' : age > 50 ? 'elderly' : 'adult';

  const prompt = `Portrait of an ${ageDesc} Andean ${gender}, ${activity}, ${skin}, wearing a colorful traditional chullo hat with geometric patterns, warm friendly smile, Andean mountains background, vibrant colors, high quality digital illustration, soft lighting`;

  const response = await fetch(HF_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4 } }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace error ${response.status}: ${err}`);
  }

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
