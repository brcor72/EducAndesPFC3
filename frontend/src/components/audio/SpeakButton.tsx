import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';

interface Props {
  text: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function SpeakButton({ text, size = 'sm', className = '' }: Props) {
  const { speak, stop, isSupported } = useSpeech();
  const [speaking, setSpeaking] = useState(false);

  if (!isSupported) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speaking) {
      stop();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-PE';
      utter.rate = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const pref = voices.find((v) => v.lang.startsWith('es')) ?? null;
      if (pref) utter.voice = pref;
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  };

  const sizeClass = size === 'sm'
    ? 'h-7 w-7 text-xs'
    : 'h-9 w-9 text-sm';

  return (
    <button
      onClick={handleClick}
      title={speaking ? 'Detener audio' : 'Escuchar en voz alta'}
      className={`inline-flex items-center justify-center rounded-full border-2 transition-colors ${
        speaking
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
      } ${sizeClass} ${className}`}
    >
      {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
    </button>
  );
}
