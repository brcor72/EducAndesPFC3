import { useCallback, useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

// Mapa de idioma a locale BCP-47 para Web Speech API.
// Quechua, Aymara y Shipibo no están soportados por los motores TTS de los
// navegadores, así que los leemos con voz en español de Perú: las vocales y
// muchas consonantes coinciden y el resultado es comprensible para la
// mayoría de hablantes andinos. Es la mejor aproximación sin internet
// adicional ni servicios externos.
const LANG_TO_LOCALE: Record<Lang, string> = {
  es: "es-PE",
  qu: "es-PE",
  ay: "es-PE",
  shp: "es-PE",
};

function pickVoice(locale: string): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !window.speechSynthesis) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;
  // Preferencia: locale exacto -> mismo idioma -> cualquier español -> primera
  return (
    voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(locale.split("-")[0])) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("es")) ||
    voices[0]
  );
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function useSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isSpeechSupported());
    if (!isSpeechSupported()) return;
    // Cargar voces (algunas plataformas las cargan async)
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", load);
    };
  }, []);

  const stop = useCallback(() => {
    if (!isSpeechSupported()) return;
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (text: string, lang: Lang = "es", id: string = "default") => {
      if (!isSpeechSupported() || !text?.trim()) return;
      // Si ya está hablando este mismo bloque, lo detenemos (toggle)
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const locale = LANG_TO_LOCALE[lang] ?? "es-PE";
      utter.lang = locale;
      const voice = pickVoice(locale);
      if (voice) utter.voice = voice;
      utter.rate = 0.92; // un poco más lento para mejor comprensión
      utter.pitch = 1;
      utter.volume = 1;
      utter.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
      utter.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      setSpeakingId(id);
      window.speechSynthesis.speak(utter);
    },
    [speakingId]
  );

  // Detener al desmontar
  useEffect(() => {
    return () => {
      if (isSpeechSupported()) window.speechSynthesis.cancel();
    };
  }, []);

  return { speak, stop, speakingId, supported };
}
