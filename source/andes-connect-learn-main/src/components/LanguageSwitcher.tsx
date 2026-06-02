import { Languages } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "es", label: "Español", native: "Español" },
  { code: "qu", label: "Quechua", native: "Runasimi" },
  { code: "ay", label: "Aymara", native: "Aymar aru" },
  { code: "shp", label: "Shipibo", native: "Shipibo-Konibo" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-2 py-1.5 shadow-soft">
      <Languages className="ml-1 h-5 w-5 text-primary" aria-hidden="true" />
      <div className="flex flex-wrap gap-1">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            className={`rounded-full px-3 py-1 text-sm font-bold transition-all ${
              lang === l.code
                ? "bg-primary text-primary-foreground shadow-warm"
                : "text-foreground hover:bg-muted"
            }`}
          >
            {l.native}
          </button>
        ))}
      </div>
    </div>
  );
}
