import type { VercelRequest, VercelResponse } from '@vercel/node';

const HF_URL =
  'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';

const GENDER_DESC: Record<string, string> = {
  masculino: 'man',
  femenino: 'woman',
  no_especificado: 'person',
};
const ACTIVITY_DESC: Record<string, string> = {
  agricultor: 'farmer wearing a green poncho',
  tejedora: 'weaver wearing colorful traditional clothing',
  ganadero: 'cattle herder wearing a brown poncho',
  pastor: 'shepherd wearing a blue poncho',
  artesana: 'artisan wearing a vibrant manta',
  comerciante: 'merchant wearing traditional Andean attire',
  docente: 'teacher wearing a formal shirt with Andean scarf',
  estudiante: 'student wearing casual clothes with Andean details',
};
const SKIN_DESC: Record<string, string> = {
  claro: 'light skin',
  medio: 'medium brown skin',
  moreno: 'dark brown skin',
  oscuro: 'very dark brown skin',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { gender, activity, skinTone, birthYear } = req.body ?? {};

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) return res.status(500).json({ error: 'HF_TOKEN not configured' });

  const genderStr   = GENDER_DESC[gender ?? ''] ?? 'person';
  const activityStr = ACTIVITY_DESC[activity ?? ''] ?? 'student';
  const skinStr     = SKIN_DESC[skinTone ?? ''] ?? 'medium brown skin';
  const age         = birthYear ? new Date().getFullYear() - Number(birthYear) : 30;
  const ageDesc     = age < 25 ? 'young' : age > 50 ? 'elderly' : 'adult';

  const prompt = `Portrait of an ${ageDesc} Andean ${genderStr}, ${activityStr}, ${skinStr}, wearing a colorful traditional chullo hat with geometric patterns, warm friendly smile, Andean mountains background, vibrant colors, high quality digital illustration, soft lighting`;

  const hfRes = await fetch(HF_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4 } }),
  });

  if (!hfRes.ok) {
    const err = await hfRes.text();
    return res.status(502).json({ error: `HuggingFace error ${hfRes.status}: ${err}` });
  }

  const buffer = await hfRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  return res.status(200).json({ dataUrl });
}
