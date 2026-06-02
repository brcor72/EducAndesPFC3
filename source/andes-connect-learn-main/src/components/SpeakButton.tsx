import { Volume2, Square, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/useSpeech";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  /** Texto a leer en voz alta */
  text: string;
  /** ID único para diferenciar varios botones a la vez */
  id?: string;
  /** Variante visual */
  size?: "sm" | "md" | "lg" | "icon";
  /** Clase extra */
  className?: string;
  /** Etiqueta opcional. Si no se pasa, sólo muestra el icono */
  label?: string;
};

const labels = {
  es: { play: "Escuchar", stop: "Detener", off: "Sin audio" },
  qu: { play: "Uyariy", stop: "Sayachiy", off: "Mana rimay" },
  ay: { play: "Istʼaña", stop: "Sayt'ayaña", off: "Janiw aru" },
  shp: { play: "Ninkati", stop: "Bestebi", off: "Joimabi" },
};

export function SpeakButton({ text, id = "speak", size = "md", className, label }: Props) {
  const { speak, speakingId, supported } = useSpeech();
  const { lang } = useI18n();
  const isSpeaking = speakingId === id;
  const L = labels[lang] ?? labels.es;

  if (!supported) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className={cn("gap-2", className)}
        title={L.off}
      >
        <VolumeX className="h-4 w-4" />
        {label ?? L.off}
      </Button>
    );
  }

  const sizeCls =
    size === "icon"
      ? "h-10 w-10 rounded-full p-0"
      : size === "lg"
        ? "h-12 px-5 text-base"
        : size === "sm"
          ? "h-8 px-3 text-xs"
          : "h-10 px-4";

  return (
    <Button
      type="button"
      variant={isSpeaking ? "default" : "secondary"}
      onClick={() => speak(text, lang, id)}
      className={cn(
        "gap-2 shadow-sm",
        isSpeaking && "bg-sun text-sun-foreground hover:bg-sun/90 animate-pulse",
        sizeCls,
        className
      )}
      aria-pressed={isSpeaking}
      aria-label={isSpeaking ? L.stop : L.play}
      title={isSpeaking ? L.stop : L.play}
    >
      {isSpeaking ? <Square className="h-4 w-4 fill-current" /> : <Volume2 className="h-4 w-4" />}
      {size !== "icon" && <span>{label ?? (isSpeaking ? L.stop : L.play)}</span>}
    </Button>
  );
}
