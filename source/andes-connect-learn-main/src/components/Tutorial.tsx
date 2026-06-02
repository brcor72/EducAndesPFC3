import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Languages,
  BookOpen,
  Users,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  Mountain,
} from "lucide-react";
import tutorialImg from "@/assets/tutorial-classroom.jpg";
import { useI18n, type Lang } from "@/lib/i18n";
import { SpeakButton } from "@/components/SpeakButton";

const STORAGE_KEY = "allinyachay.tutorial.done";
const LANG_KEY = "allinyachay.lang";

const LANGS: { code: Lang; native: string; greeting: string }[] = [
  { code: "es", native: "Español", greeting: "¡Hola!" },
  { code: "qu", native: "Runasimi", greeting: "Allillanchu!" },
  { code: "ay", native: "Aymar aru", greeting: "Kamisaraki!" },
  { code: "shp", native: "Shipibo-Konibo", greeting: "Jakon raoma!" },
];

type StepKey =
  | { kind: "tut1" }
  | { kind: "tut2" }
  | { kind: "tut3" }
  | { kind: "tut4" };

const STEPS: { titleKey: string; descKey: string; icon: typeof Languages; bg: string }[] = [
  { titleKey: "tut1Title", descKey: "tut1Desc", icon: Languages, bg: "bg-sun text-sun-foreground" },
  { titleKey: "tut2Title", descKey: "tut2Desc", icon: BookOpen, bg: "bg-primary text-primary-foreground" },
  { titleKey: "tut3Title", descKey: "tut3Desc", icon: Users, bg: "bg-puna text-puna-foreground" },
  { titleKey: "tut4Title", descKey: "tut4Desc", icon: Sparkles, bg: "bg-gradient-sunrise text-primary-foreground" },
];

export function Tutorial({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { lang, setLang, tr } = useI18n();
  // step: -1 = pantalla de elegir idioma; 0..3 = pasos
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (open) {
      // Si ya eligió idioma antes, saltamos directo a los pasos.
      try {
        const saved = localStorage.getItem(LANG_KEY);
        setStep(saved ? 0 : -1);
      } catch {
        setStep(-1);
      }
    }
  }, [open]);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
    onOpenChange(false);
  };

  const isLangStep = step === -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-3xl border-2 p-0">
        <DialogTitle className="sr-only">
          {isLangStep ? "Elige tu idioma" : "Tutorial inicial"}
        </DialogTitle>
        <div className="grid md:grid-cols-2">
          <div className="relative hidden bg-gradient-sunrise md:block">
            <img
              src={tutorialImg}
              alt="Profesora andina enseñando con tableta"
              className="h-full w-full object-cover mix-blend-multiply opacity-90"
              width={1024}
              height={768}
            />
          </div>

          <div className="flex flex-col p-7">
            {isLangStep ? (
              <LanguageStep
                currentLang={lang}
                onPick={(l) => {
                  setLang(l);
                  try {
                    localStorage.setItem(LANG_KEY, l);
                  } catch {
                    /* ignore */
                  }
                }}
                onContinue={() => setStep(0)}
                onSkip={finish}
              />
            ) : (
              <StepsStep
                step={step}
                setStep={setStep}
                onFinish={finish}
                tr={tr}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LanguageStep({
  currentLang,
  onPick,
  onContinue,
  onSkip,
}: {
  currentLang: Lang;
  onPick: (l: Lang) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const { tr } = useI18n();
  return (
    <>
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center self-start rounded-2xl bg-gradient-sunrise text-primary-foreground shadow-warm">
        <Mountain className="h-7 w-7" />
      </div>
      <h2 className="font-display text-2xl font-bold leading-tight">
        {tr("tutLangTitle")}
      </h2>
      <p className="mt-2 text-muted-foreground">{tr("tutLangDesc")}</p>
      <div className="mt-3">
        <SpeakButton
          id="tut-lang"
          size="sm"
          text={`${tr("tutLangTitle")}. ${tr("tutLangDesc")}`}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {LANGS.map((l) => {
          const active = currentLang === l.code;
          return (
            <button
              key={l.code}
              onClick={() => onPick(l.code)}
              aria-pressed={active}
              className={`flex flex-col items-start rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-warm"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span className="text-xs font-bold uppercase opacity-80">
                {l.greeting}
              </span>
              <span className="mt-1 font-display text-lg font-bold leading-tight">
                {l.native}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {tr("tutSkip")}
        </button>
        <Button
          onClick={onContinue}
          size="lg"
          className="gap-1 rounded-2xl px-6 font-bold"
        >
          {tr("tutContinue")} <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}

function StepsStep({
  step,
  setStep,
  onFinish,
  tr,
}: {
  step: number;
  setStep: (v: number) => void;
  onFinish: () => void;
  tr: (k: any) => string;
}) {
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <>
      <div
        className={`mb-4 inline-flex h-14 w-14 items-center justify-center self-start rounded-2xl shadow-warm ${current.bg}`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="font-display text-2xl font-bold leading-tight">
        {tr(current.titleKey as any)}
      </h2>
      <p className="mt-3 text-muted-foreground">{tr(current.descKey as any)}</p>
      <div className="mt-3">
        <SpeakButton
          id={`tut-step-${step}`}
          size="sm"
          text={`${tr(current.titleKey as any)}. ${tr(current.descKey as any)}`}
        />
      </div>

      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(-1, step - 1))}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> {tr("tutBack")}
        </Button>
        {isLast ? (
          <Button onClick={onFinish} size="lg" className="gap-1 rounded-2xl px-6 font-bold">
            <Check className="h-5 w-5" /> {tr("tutStart")}
          </Button>
        ) : (
          <Button
            onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
            size="lg"
            className="gap-1 rounded-2xl px-6 font-bold"
          >
            {tr("tutNext")} <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </div>
      {!isLast && (
        <button
          onClick={onFinish}
          className="mt-3 text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {tr("tutSkip")}
        </button>
      )}
    </>
  );
}

export function useAutoTutorial() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);
  return { open, setOpen };
}

export function resetTutorial() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
