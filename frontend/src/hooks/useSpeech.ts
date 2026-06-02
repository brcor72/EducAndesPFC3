import { useCallback, useRef } from 'react';
import { useI18nStore, type Lang } from '../store/i18n.store';

const LANG_VOICE_MAP: Record<Lang, string> = {
  es: 'es-PE',
  qu: 'es-PE',
  ay: 'es-PE',
  shp: 'es-PE',
};

export function useSpeech() {
  const { lang } = useI18nStore();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_VOICE_MAP[lang] ?? 'es-PE';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to pick a Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith('es') && (v.name.includes('Peru') || v.name.includes('Latin') || v.name.includes('Español'))
    ) ?? voices.find((v) => v.lang.startsWith('es')) ?? null;
    if (preferred) utterance.voice = preferred;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return { speak, stop, isSupported };
}
