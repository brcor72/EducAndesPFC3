import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, BookOpen, MessageSquare, Target, Sun, Volume2 } from 'lucide-react';
import { useI18nStore, type Lang, LANG_NAMES } from '../../store/i18n.store';
import { SpeakButton } from '../audio/SpeakButton';

const STORAGE_KEY = 'educandes-tutorial-done';

const STEPS = [
  {
    icon: BookOpen,
    titleKey: 'tutStep1Title',
    descKey: 'tutStep1Desc',
    color: 'bg-puna text-puna-foreground',
    img: '🏔️',
  },
  {
    icon: BookOpen,
    titleKey: 'tutStep2Title',
    descKey: 'tutStep2Desc',
    color: 'bg-primary text-primary-foreground',
    img: '📚',
  },
  {
    icon: MessageSquare,
    titleKey: 'tutStep3Title',
    descKey: 'tutStep3Desc',
    color: 'bg-sky text-sky-foreground',
    img: '💬',
  },
  {
    icon: Target,
    titleKey: 'tutStep4Title',
    descKey: 'tutStep4Desc',
    color: 'bg-sun text-sun-foreground',
    img: '🎯',
  },
  {
    icon: Sun,
    titleKey: 'tutStep5Title',
    descKey: 'tutStep5Desc',
    color: 'bg-earth text-earth-foreground',
    img: '🚀',
  },
];

const LANG_FLAGS: Record<Lang, string> = {
  es: '🇵🇪',
  qu: '🌄',
  ay: '🏔️',
  shp: '🌿',
};

export function OnboardingTutorial() {
  const { lang, setLang, tr } = useI18nStore();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(-1); // -1 = language selection

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  const currentStep = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-border bg-card shadow-warm">
        {/* Close */}
        <button
          onClick={finish}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-border hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Language selection step */}
        {step === -1 && (
          <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-sunrise shadow-warm">
                <Sun className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold">{tr('tutTitle')}</div>
                <div className="text-sm text-muted-foreground">Allin Yachay</div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 font-bold text-lg">
                {tr('tutLangTitle')}
                <SpeakButton text={tr('tutLangTitle') + '. ' + tr('tutLangDesc')} size="sm" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{tr('tutLangDesc')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(LANG_NAMES) as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                    lang === l
                      ? 'border-primary bg-primary/10 font-bold text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-2xl">{LANG_FLAGS[l]}</span>
                  <div>
                    <div className="font-bold text-sm">{LANG_NAMES[l]}</div>
                    <div className="text-xs text-muted-foreground">{l.toUpperCase()}</div>
                  </div>
                  {lang === l && (
                    <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">✓</div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
              >
                {tr('tutNext')} <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={finish}
                className="rounded-2xl border-2 border-border px-4 py-3 text-sm font-bold hover:bg-muted transition-colors"
              >
                {tr('tutSkip')}
              </button>
            </div>
          </div>
        )}

        {/* Content steps */}
        {step >= 0 && currentStep && (
          <div className="flex flex-col">
            {/* Top visual */}
            <div className="relative flex h-48 items-center justify-center bg-gradient-soft">
              <div className="absolute inset-0 bg-andino-pattern opacity-30" />
              <div className="relative flex flex-col items-center gap-3">
                <span className="text-7xl drop-shadow-lg">{currentStep.img}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 p-8">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === step ? 'w-6 bg-primary' : i < step ? 'w-2 bg-primary/40' : 'w-2 bg-muted'
                    }`}
                  />
                ))}
                <span className="ml-auto text-xs text-muted-foreground">
                  {tr('tutProgress')} {step + 1} {tr('tutOf')} {STEPS.length}
                </span>
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <h2 className="font-display text-2xl font-bold leading-tight flex-1">
                    {tr(currentStep.titleKey)}
                  </h2>
                  <SpeakButton
                    text={tr(currentStep.titleKey) + '. ' + tr(currentStep.descKey)}
                    size="md"
                  />
                </div>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {tr(currentStep.descKey)}
                </p>
              </div>

              {/* Audio hint on last step */}
              {step === STEPS.length - 1 && (
                <div className="flex items-center gap-3 rounded-2xl bg-sun/20 border-2 border-sun/40 p-3 text-sm">
                  <Volume2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>Toca el botón <strong>🔊</strong> junto a cualquier texto para escucharlo en voz alta.</span>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 rounded-2xl border-2 border-border px-4 py-3 font-bold hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> {tr('tutPrev')}
                </button>
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
                  >
                    {tr('tutNext')} <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={finish}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
                  >
                    {tr('tutFinish')} <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
