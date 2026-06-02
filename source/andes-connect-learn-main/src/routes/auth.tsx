import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mountain, Eye, EyeOff, Check, AlertCircle, Sparkles } from "lucide-react";
import { z } from "zod";
import { useI18n, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { SpeakButton } from "@/components/SpeakButton";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Inicio de sesión — Allin Yachay" },
      {
        name: "description",
        content:
          "Entra con tu DNI y tu contraseña para guardar tu progreso y trazar tus metas.",
      },
    ],
  }),
  component: AuthPage,
});

const LANGS: { code: Lang; native: string; greeting: string }[] = [
  { code: "es", native: "Español", greeting: "¡Hola!" },
  { code: "qu", native: "Runasimi", greeting: "Allillanchu!" },
  { code: "ay", native: "Aymar aru", greeting: "Kamisaraki!" },
  { code: "shp", native: "Shipibo-Konibo", greeting: "Jakon raoma!" },
];

// Demo user provided so anyone can try the platform.
const DEMO = { dni: "12345678", password: "andes2025" };

// Convert DNI (8 digits) into an internal email for Supabase auth.
const dniToEmail = (dni: string) => `dni${dni}@allinyachay.local`;

const dniSchema = z
  .string()
  .trim()
  .regex(/^\d{8}$/, "El DNI debe tener 8 números");

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña es demasiado larga")
  .regex(/[A-Za-zÀ-ÿñÑ]/, "Debe incluir al menos una letra")
  .regex(/[0-9]/, "Debe incluir al menos un número");

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(60),
  community: z.string().trim().max(80).optional().or(z.literal("")),
  dni: dniSchema,
  password: passwordSchema,
});

const signInSchema = z.object({
  dni: dniSchema,
  password: z.string().min(1, "Escribe tu contraseña"),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, setLang } = useI18n();
  const [stage, setStage] = useState<"lang" | "form">("lang");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [community, setCommunity] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) navigate({ to: "/metas" });
  }, [user, navigate]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("allinyachay.lang");
      if (saved) setStage("form");
    } catch {
      /* ignore */
    }
  }, []);

  const labels: Record<Lang, Record<string, string>> = {
    es: {
      langTitle: "¿En qué idioma quieres entrar?",
      langDesc: "Elige tu idioma. Lo usaremos en todo el sitio.",
      continue: "Continuar",
      enter: "Inicio de sesión",
      create: "Crear cuenta",
      name: "Tu nombre",
      community: "Tu comunidad o distrito",
      dni: "Tu DNI (8 números)",
      password: "Contraseña",
      hint: "Usa una palabra que recuerdes y agrégale 1 número (ej: chacra2025).",
      submitIn: "Entrar a mi cuenta",
      submitUp: "Crear cuenta gratis",
      footer: "Tu cuenta es personal. Tu progreso solo lo ves tú.",
      back: "← Volver al inicio",
      demo: "Probar con usuario de ejemplo",
      demoHint: `DNI: ${DEMO.dni} · Contraseña: ${DEMO.password}`,
    },
    qu: {
      langTitle: "¿Ima simipi yaykuyta munanki?",
      langDesc: "Akllay simiyta. Tukuy páginapi rikurinqa.",
      continue: "Catiy",
      enter: "Yaykuy",
      create: "Cuenta paqarichiy",
      name: "Sutiyki",
      community: "Ayllu utaq distrito",
      dni: "DNIyki (8 yupaykunam)",
      password: "Contraseña",
      hint: "Yuyasqaykita rimayta churay, hukninwan (ej: chacra2025).",
      submitIn: "Cuentaman yaykuy",
      submitUp: "Cuentata mana qullqipi paqarichiy",
      footer: "Cuentayki sapayki. Yachayniyki qantapuni rikun.",
      back: "← Qallariyman kutiy",
      demo: "Riqsichiy runawan yaykuy",
      demoHint: `DNI: ${DEMO.dni} · Contraseña: ${DEMO.password}`,
    },
    ay: {
      langTitle: "¿Kawkir arumpi mantañ munta?",
      langDesc: "Aruma ajllita. Taqi yänakanjt'arak apnaqasiñani.",
      continue: "Sarantaña",
      enter: "Mantaña",
      create: "Cuenta lurañani",
      name: "Sutima",
      community: "Markama jan ukax distritoma",
      dni: "DNImaxa (8 jakhunaka)",
      password: "Contraseña",
      hint: "Mä aru amtataki, jakhumpi (ej: chacra2025).",
      submitIn: "Cuentar mantaña",
      submitUp: "Inaki cuenta lurañani",
      footer: "Cuentamax sapakimaki. Yatiqäwimax jumamak uñjta.",
      back: "← Qalltawiru kuttʼaña",
      demo: "Yatxatañataki uñacht'awi",
      demoHint: `DNI: ${DEMO.dni} · Contraseña: ${DEMO.password}`,
    },
    shp: {
      langTitle: "¿Jawekirano joi mia yoiti?",
      langDesc: "Akinti mia joi. Westiora jakon onanti.",
      continue: "Riki",
      enter: "Jiska",
      create: "Cuenta bewa",
      name: "Mia janeko",
      community: "Mia jema",
      dni: "Mia DNI (8 yupaykuna)",
      password: "Contraseña",
      hint: "Westiora joi shinai, westiora jakhumpi (ej: chacra2025).",
      submitIn: "Cuenta jiska",
      submitUp: "Yamake cuenta bewa",
      footer: "Mia cuenta sapakike. Mia onanti mia oinai.",
      back: "← Bena onanti",
      demo: "Akinti onanti runa",
      demoHint: `DNI: ${DEMO.dni} · Contraseña: ${DEMO.password}`,
    },
  };
  const L = labels[lang];

  const fillDemo = () => {
    setMode("in");
    setDni(DEMO.dni);
    setPassword(DEMO.password);
    setErrors({});
    toast.info("Datos de ejemplo cargados. Solo presiona Entrar.");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (mode === "up") {
      const parsed = signUpSchema.safeParse({ name, community, dni, password });
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        parsed.error.issues.forEach((i) => {
          errs[i.path[0] as string] = i.message;
        });
        setErrors(errs);
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: dniToEmail(parsed.data.dni),
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/metas`,
          data: {
            display_name: parsed.data.name,
            community: parsed.data.community || null,
            preferred_lang: lang,
            dni: parsed.data.dni,
          },
        },
      });
      setLoading(false);
      if (error) {
        if (/pwned|leaked|compromis/i.test(error.message)) {
          toast.error("Esa contraseña apareció en filtraciones. Elige otra.");
        } else if (/registered|exists/i.test(error.message)) {
          toast.error("Este DNI ya tiene una cuenta. Inicia sesión.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success("¡Cuenta creada! Bienvenida/o");
      navigate({ to: "/metas" });
    } else {
      const parsed = signInSchema.safeParse({ dni, password });
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        parsed.error.issues.forEach((i) => {
          errs[i.path[0] as string] = i.message;
        });
        setErrors(errs);
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: dniToEmail(parsed.data.dni),
        password: parsed.data.password,
      });
      setLoading(false);
      if (error) return toast.error("DNI o contraseña incorrectos");
      navigate({ to: "/metas" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <Link to="/" className="mb-8 flex items-center gap-2.5 self-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-sunrise shadow-warm">
            <Mountain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="font-display text-2xl font-bold">Allin Yachay</div>
        </Link>

        {stage === "lang" ? (
          <div className="rounded-3xl border-2 border-border bg-card p-7 shadow-warm">
            <h1 className="font-display text-2xl font-bold leading-tight">
              {L.langTitle}
            </h1>
            <p className="mt-2 text-muted-foreground">{L.langDesc}</p>
            <div className="mt-3">
              <SpeakButton
                id="auth-lang"
                size="sm"
                text={`${L.langTitle}. ${L.langDesc}`}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {LANGS.map((l) => {
                const active = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    className={`flex flex-col items-start rounded-2xl border-2 px-4 py-3 text-left transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-warm"
                        : "border-border bg-background hover:border-primary/50"
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

            <Button
              onClick={() => setStage("form")}
              className="mt-6 h-12 w-full rounded-2xl text-base font-bold shadow-warm"
            >
              {L.continue}
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-border bg-card p-7 shadow-warm">
            <div className="mb-5 flex gap-2 rounded-2xl bg-muted p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("in");
                  setErrors({});
                }}
                className={`flex-1 rounded-xl py-2.5 text-base font-bold transition ${
                  mode === "in" ? "bg-primary text-primary-foreground shadow-warm" : ""
                }`}
              >
                {L.enter}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("up");
                  setErrors({});
                }}
                className={`flex-1 rounded-xl py-2.5 text-base font-bold transition ${
                  mode === "up" ? "bg-primary text-primary-foreground shadow-warm" : ""
                }`}
              >
                {L.create}
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3" noValidate>
              {mode === "up" && (
                <>
                  <FieldError msg={errors.name}>
                    <Input
                      placeholder={L.name}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={60}
                      className="h-12 text-base"
                    />
                  </FieldError>
                  <Input
                    placeholder={L.community}
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    maxLength={80}
                    className="h-12 text-base"
                  />
                </>
              )}
              <FieldError msg={errors.dni}>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{8}"
                  required
                  placeholder={L.dni}
                  value={dni}
                  onChange={(e) =>
                    setDni(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  maxLength={8}
                  className="h-12 text-base tracking-widest"
                />
              </FieldError>
              <FieldError msg={errors.password}>
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    required
                    placeholder={L.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={72}
                    className="h-12 pr-12 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:bg-muted"
                    aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </FieldError>

              {mode === "up" && (
                <>
                  <p className="text-xs text-muted-foreground">{L.hint}</p>
                  <PasswordChecklist value={password} />
                </>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-2xl text-base font-bold shadow-warm"
              >
                {loading ? "Un momento…" : mode === "up" ? L.submitUp : L.submitIn}
              </Button>
            </form>

            {mode === "in" && (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="flex-1">
                    <div className="font-bold text-primary">Usuario de ejemplo</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {L.demoHint}
                    </div>
                    <Button
                      type="button"
                      onClick={fillDemo}
                      size="sm"
                      variant="outline"
                      className="mt-2 rounded-full border-2 font-bold"
                    >
                      {L.demo}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-5 text-center text-sm text-muted-foreground">{L.footer}</p>
            <button
              type="button"
              onClick={() => setStage("lang")}
              className="mt-3 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Cambiar idioma
            </button>
          </div>
        )}

        <Link
          to="/"
          className="mt-6 self-center text-sm font-bold text-muted-foreground hover:text-primary"
        >
          {L.back}
        </Link>
      </div>
    </div>
  );
}

function FieldError({
  msg,
  children,
}: {
  msg?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {msg && (
        <div className="mt-1 flex items-center gap-1 text-xs font-bold text-destructive">
          <AlertCircle className="h-3.5 w-3.5" /> {msg}
        </div>
      )}
    </div>
  );
}

function PasswordChecklist({ value }: { value: string }) {
  const checks = [
    { ok: value.length >= 8, label: "8 letras o números" },
    { ok: /[A-Za-zÀ-ÿñÑ]/.test(value), label: "una letra" },
    { ok: /[0-9]/.test(value), label: "un número" },
  ];
  return (
    <ul className="grid grid-cols-1 gap-1 rounded-xl bg-muted/60 p-2 text-xs sm:grid-cols-3">
      {checks.map((c) => (
        <li
          key={c.label}
          className={`inline-flex items-center gap-1 ${
            c.ok ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Check className={`h-3.5 w-3.5 ${c.ok ? "opacity-100" : "opacity-30"}`} />
          {c.label}
        </li>
      ))}
    </ul>
  );
}
