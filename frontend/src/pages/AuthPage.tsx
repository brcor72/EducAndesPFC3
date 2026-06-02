import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain, Eye, EyeOff, Check, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { useI18nStore, type Lang, LANG_NAMES } from '../store/i18n.store';
import { SpeakButton } from '../components/audio/SpeakButton';

const LANG_GREETINGS: Record<Lang, string> = {
  es: '¡Hola!',
  qu: 'Allillanchu!',
  ay: 'Kamisaraki!',
  shp: 'Jakon raoma!',
};

const LANG_FLAGS: Record<Lang, string> = {
  es: '🇵🇪',
  qu: '🌄',
  ay: '🏔️',
  shp: '🌿',
};

const DEMO = { dni: '12345678', password: 'andes2025' };

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, login, register, loading } = useAuthStore();
  const { lang, setLang, tr } = useI18nStore();
  const [stage, setStage] = useState<'lang' | 'form'>(() =>
    localStorage.getItem('educandes-lang') ? 'form' : 'lang'
  );
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [community, setCommunity] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (user) navigate('/metas'); }, [user, navigate]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!/^\d{8}$/.test(dni)) errs.dni = tr('authDni');
    if (mode === 'up') {
      if (displayName.trim().length < 2) errs.displayName = tr('authName');
      if (password.length < 8) errs.password = '8+';
      if (!/[A-Za-z]/.test(password)) errs.password = 'A-Z';
      if (!/[0-9]/.test(password)) errs.password = '0-9';
    } else {
      if (!password) errs.password = tr('authPassword');
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    try {
      if (mode === 'up') {
        await register({ dni, displayName, community: community || undefined, password, preferredLang: lang });
        toast.success(tr('authWelcome'));
      } else {
        await login(dni, password);
        toast.success(tr('authWelcome'));
      }
      navigate('/metas');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) toast.error(msg[0]);
      else toast.error(msg || 'Error al iniciar sesión. Verifica tus datos.');
    }
  };

  const fillDemo = () => { setMode('in'); setDni(DEMO.dni); setPassword(DEMO.password); setErrors({}); toast.info('Demo cargado'); };

  const checks = [
    { ok: password.length >= 8, label: '8+' },
    { ok: /[A-Za-z]/.test(password), label: 'A-Z' },
    { ok: /[0-9]/.test(password), label: '0-9' },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <Link to="/" className="mb-8 flex items-center gap-2.5 self-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-sunrise shadow-warm">
            <Mountain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="font-display text-2xl font-bold">Allin Yachay</div>
        </Link>

        {stage === 'lang' ? (
          <div className="rounded-3xl border-2 border-border bg-card p-7 shadow-warm">
            <div className="flex items-start gap-2">
              <h1 className="font-display text-2xl font-bold flex-1">{tr('authLangTitle')}</h1>
              <SpeakButton text={tr('authLangTitle') + '. ' + tr('authLangDesc')} size="md" />
            </div>
            <p className="mt-2 text-muted-foreground">{tr('authLangDesc')}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {(Object.keys(LANG_NAMES) as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                    lang === l ? 'border-primary bg-primary text-primary-foreground shadow-warm' : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{LANG_FLAGS[l]}</span>
                  <div>
                    <div className="text-xs font-bold opacity-80">{LANG_GREETINGS[l]}</div>
                    <div className="font-display text-base font-bold">{LANG_NAMES[l]}</div>
                  </div>
                  {lang === l && <span className="ml-auto text-sm">✓</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStage('form')}
              className="mt-6 h-12 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
            >
              {tr('authContinue')}
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-border bg-card p-7 shadow-warm">
            <div className="mb-5 flex gap-2 rounded-2xl bg-muted p-1">
              {([['in', tr('authLogin')], ['up', tr('authRegister')]] as const).map(([m, label]) => (
                <button key={m} type="button" onClick={() => { setMode(m); setErrors({}); }}
                  className={`flex-1 rounded-xl py-2.5 text-base font-bold transition ${mode === m ? 'bg-primary text-primary-foreground shadow-warm' : ''}`}>
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {mode === 'up' && (
                <>
                  <div>
                    <input
                      placeholder={tr('authName')}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
                    />
                    {errors.displayName && <FieldError msg={errors.displayName} />}
                  </div>
                  <input
                    placeholder={tr('authCommunity')}
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
                  />
                </>
              )}
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={tr('authDni')}
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-base tracking-widest outline-none focus:border-primary"
                />
                {errors.dni && <FieldError msg={errors.dni} />}
              </div>
              <div>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder={tr('authPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 pr-12 text-base outline-none focus:border-primary"
                  />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <FieldError msg={errors.password} />}
              </div>

              {mode === 'up' && (
                <ul className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-2 text-xs">
                  {checks.map((c) => (
                    <li key={c.label} className={`inline-flex items-center gap-1 ${c.ok ? 'text-primary' : 'text-muted-foreground'}`}>
                      <Check className={`h-3.5 w-3.5 ${c.ok ? 'opacity-100' : 'opacity-30'}`} /> {c.label}
                    </li>
                  ))}
                </ul>
              )}

              <button type="submit" disabled={loading}
                className="h-12 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-warm hover:bg-primary/90 disabled:opacity-60 transition-colors">
                {loading ? '...' : mode === 'up' ? tr('authRegister') : tr('authLogin')}
              </button>
            </form>

            {mode === 'in' && (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <div className="font-bold text-primary">Demo</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">DNI: {DEMO.dni} · {DEMO.password}</div>
                    <button type="button" onClick={fillDemo} className="mt-2 rounded-full border-2 border-primary/40 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                      {tr('ctaStart')} demo
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button type="button" onClick={() => setStage('lang')} className="mt-4 block w-full text-center text-xs text-muted-foreground hover:text-foreground">
              🌐 {tr('navSelectLang')}
            </button>
          </div>
        )}

        <Link to="/" className="mt-6 self-center text-sm font-bold text-muted-foreground hover:text-primary">
          ← {tr('backHome')}
        </Link>
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <div className="mt-1 flex items-center gap-1 text-xs font-bold text-destructive">
      <AlertCircle className="h-3.5 w-3.5" /> {msg}
    </div>
  );
}
