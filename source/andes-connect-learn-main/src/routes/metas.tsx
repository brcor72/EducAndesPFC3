import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Trophy,
  Target,
  Sparkles,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { FloatingChat } from "@/components/FloatingChat";
import { AndeanBorder } from "@/components/AndeanBorder";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useProgress, estimateDays } from "@/hooks/useProgress";
import { COURSES } from "@/lib/courses";
import { SpeakButton } from "@/components/SpeakButton";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas alcanzadas — Allin Yachay" },
      {
        name: "description",
        content:
          "Mira tu avance en cada curso, traza tus metas diarias y descubre cuántos días te faltan para terminar.",
      },
    ],
  }),
  component: MetasPage,
});

function MetasPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (!authLoading && !user) {
    // Redirect unauthenticated users to /auth
    if (typeof window !== "undefined") navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <AndeanBorder />
      {user ? <Body /> : <LoginPrompt />}
      <FloatingChat />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-soft">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Tu camino de aprendizaje
        </p>
        <h1 className="mt-2 text-balance text-5xl font-bold md:text-6xl">
          Metas alcanzadas
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Aquí ves cuánto has avanzado y cuántos días te faltan para terminar
          según las clases que hagas cada día.
        </p>
        <div className="mt-4">
          <SpeakButton
            id="metas-intro"
            size="lg"
            text="Metas alcanzadas. Aquí ves cuánto has avanzado y cuántos días te faltan para terminar según las clases que hagas cada día."
            className="h-12 rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}

function LoginPrompt() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="rounded-3xl border-2 border-border bg-card p-10 shadow-soft">
        <Trophy className="mx-auto h-14 w-14 text-primary" />
        <h2 className="mt-4 font-display text-3xl font-bold">Entra a tu cuenta</h2>
        <p className="mt-3 text-muted-foreground">
          Para guardar tu progreso y trazar tus metas, necesitas tener tu cuenta abierta.
        </p>
        <Button asChild className="mt-6 h-12 rounded-2xl px-7 font-bold shadow-warm">
          <Link to="/auth">Entrar o crear cuenta</Link>
        </Button>
      </div>
    </section>
  );
}

function Body() {
  const {
    rows,
    loading,
    setLessonsDone,
    setDailyGoal,
    getFor,
    totals,
    startedCourses,
    overallPct,
    DEFAULT_TOTAL,
  } = useProgress();

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-muted-foreground">Cargando tu progreso…</p>
      </section>
    );
  }

  return (
    <>
      <Overview totals={totals} startedCourses={startedCourses} overallPct={overallPct} />
      <Mascot rows={rows} />
      <CoursesProgress
        getFor={getFor}
        setLessonsDone={setLessonsDone}
        setDailyGoal={setDailyGoal}
        defaultTotal={DEFAULT_TOTAL}
      />
    </>
  );
}

function Overview({
  totals,
  startedCourses,
  overallPct,
}: {
  totals: { done: number; total: number; completed: number };
  startedCourses: number;
  overallPct: number;
}) {
  const stats = [
    {
      icon: TrendingUp,
      label: "Avance total",
      value: `${overallPct}%`,
      tone: "bg-primary text-primary-foreground",
    },
    {
      icon: CheckCircle2,
      label: "Clases hechas",
      value: `${totals.done}`,
      tone: "bg-puna text-puna-foreground",
    },
    {
      icon: Trophy,
      label: "Cursos terminados",
      value: `${totals.completed}`,
      tone: "bg-sun text-sun-foreground",
    },
    {
      icon: Target,
      label: "Cursos empezados",
      value: `${startedCourses}`,
      tone: "bg-sky text-sky-foreground",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border-2 border-border bg-card p-5 shadow-soft"
          >
            <div
              className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-warm ${s.tone}`}
            >
              <s.icon className="h-6 w-6" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-bold">Tu avance general</span>
          <span className="text-sm text-muted-foreground">
            {totals.done} / {totals.total} clases
          </span>
        </div>
        <Progress value={overallPct} className="h-3" />
      </div>
    </section>
  );
}

function Mascot({ rows }: { rows: ReturnType<typeof useProgress>["rows"] }) {
  const [pace, setPace] = useState(1);
  const remaining = useMemo(
    () => rows.reduce((s, r) => s + Math.max(0, r.lessons_total - r.lessons_done), 0),
    [rows],
  );
  const totalToStart = useMemo(() => {
    // Include not-yet-started catalog courses (assume DEFAULT_TOTAL each)
    const startedIds = new Set(rows.map((r) => r.course_id));
    const notStarted = COURSES.filter((c) => !startedIds.has(c.id)).length;
    return remaining + notStarted * 12;
  }, [rows, remaining]);

  const days = estimateDays(totalToStart, pace);
  const weeks = Math.ceil(days / 7);

  const tips = [
    "¡Excelente! Si haces 1 clase al día, mantienes el ritmo del campo.",
    "Con 2 clases al día avanzas el doble. Aprovecha los descansos del trabajo.",
    "3 clases al día es un ritmo fuerte. Ideal para días de lluvia.",
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 pb-12">
      <div className="overflow-hidden rounded-[2.5rem] border-2 border-border bg-gradient-sunrise p-8 text-primary-foreground shadow-warm md:p-12">
        <div className="grid gap-8 md:grid-cols-[auto,1fr] md:items-center">
          {/* Mascota: Yachay, el zorrito andino */}
          <div className="flex justify-center">
            <FoxMascot />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide opacity-90">
              Yachay, tu guía
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold leading-tight md:text-4xl">
              {totalToStart === 0
                ? "¡Felicidades! Has terminado todos los cursos."
                : `Te faltan ${totalToStart} clases para terminar todo.`}
            </h2>

            {totalToStart > 0 && (
              <>
                <p className="mt-3 text-lg opacity-95">
                  Si haces <strong>{pace} clase{pace > 1 ? "s" : ""} al día</strong>,
                  terminarás en aproximadamente <strong>{days} días</strong>{" "}
                  ({weeks} semana{weeks > 1 ? "s" : ""}).
                </p>
                <p className="mt-2 text-base opacity-90">{tips[pace - 1]}</p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold uppercase opacity-90">
                    Mi ritmo:
                  </span>
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPace(p)}
                      className={`rounded-2xl px-4 py-2 text-base font-bold transition ${
                        pace === p
                          ? "bg-card text-primary shadow-warm"
                          : "bg-card/20 text-primary-foreground hover:bg-card/30"
                      }`}
                    >
                      {p} / día
                    </button>
                  ))}
                  <SpeakButton
                    id={`mascot-${pace}`}
                    size="sm"
                    className="bg-card/20 hover:bg-card/30"
                    text={`Te faltan ${totalToStart} clases. Si haces ${pace} clase${
                      pace > 1 ? "s" : ""
                    } al día, terminarás en aproximadamente ${days} días, o sea ${weeks} semana${
                      weeks > 1 ? "s" : ""
                    }. ${tips[pace - 1]}`}
                  />
                </div>
              </>
            )}

            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-card/20 px-4 py-2 text-sm">
              <Calendar className="h-4 w-4" />
              Meta sugerida: traza objetivos pequeños cada semana.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FoxMascot() {
  // Friendly andean fox illustration in SVG. Themed via design tokens.
  return (
    <svg
      viewBox="0 0 200 200"
      width="170"
      height="170"
      role="img"
      aria-label="Yachay, el zorrito andino que te guía"
      className="drop-shadow-xl"
    >
      <defs>
        <radialGradient id="sky" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(0 0% 100% / 0.9)" />
          <stop offset="100%" stopColor="hsl(0 0% 100% / 0.4)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#sky)" />
      {/* Mountains backdrop */}
      <path d="M20 140 L60 90 L90 130 L120 80 L160 140 Z" fill="hsl(220 30% 35%)" opacity="0.35" />
      {/* Body */}
      <ellipse cx="100" cy="135" rx="48" ry="32" fill="#C2410C" />
      <ellipse cx="100" cy="138" rx="36" ry="22" fill="#FED7AA" />
      {/* Head */}
      <circle cx="100" cy="92" r="40" fill="#EA580C" />
      {/* Ears */}
      <polygon points="68,68 78,40 92,72" fill="#EA580C" />
      <polygon points="132,68 122,40 108,72" fill="#EA580C" />
      <polygon points="74,66 80,52 88,70" fill="#1F2937" />
      <polygon points="126,66 120,52 112,70" fill="#1F2937" />
      {/* Snout */}
      <ellipse cx="100" cy="108" rx="20" ry="14" fill="#FFEDD5" />
      <circle cx="100" cy="100" r="4" fill="#1F2937" />
      {/* Eyes */}
      <circle cx="86" cy="88" r="6" fill="#1F2937" />
      <circle cx="114" cy="88" r="6" fill="#1F2937" />
      <circle cx="88" cy="86" r="2" fill="#FFFFFF" />
      <circle cx="116" cy="86" r="2" fill="#FFFFFF" />
      {/* Smile */}
      <path d="M90 116 Q100 124 110 116" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Chullo (gorro andino) */}
      <path d="M64 70 Q100 28 136 70 L132 78 Q100 50 68 78 Z" fill="#7C2D12" />
      <circle cx="100" cy="38" r="6" fill="#FBBF24" />
      <rect x="64" y="74" width="72" height="6" fill="#FBBF24" />
      <rect x="64" y="80" width="72" height="3" fill="#16A34A" />
    </svg>
  );
}

function CoursesProgress({
  getFor,
  setLessonsDone,
  setDailyGoal,
  defaultTotal,
}: {
  getFor: ReturnType<typeof useProgress>["getFor"];
  setLessonsDone: ReturnType<typeof useProgress>["setLessonsDone"];
  setDailyGoal: ReturnType<typeof useProgress>["setDailyGoal"];
  defaultTotal: number;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <h2 className="mb-6 font-display text-3xl font-bold">Tus cursos</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {COURSES.map((c) => {
          const p = getFor(c.id);
          const total = p?.lessons_total ?? defaultTotal;
          const done = p?.lessons_done ?? 0;
          const goal = p?.daily_goal ?? 1;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const remaining = Math.max(0, total - done);
          const days = estimateDays(remaining, goal);
          const finished = done >= total && total > 0;

          return (
            <article
              key={c.id}
              className="flex flex-col gap-4 rounded-3xl border-2 border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-warm ${c.tone}`}
                >
                  <c.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold leading-tight">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.short}</p>
                </div>
                {finished && (
                  <Trophy className="h-6 w-6 shrink-0 text-sun" aria-label="Curso terminado" />
                )}
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-bold">{done} / {total} clases</span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2.5" />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 p-3">
                <div className="text-sm">
                  <div className="font-bold">Marca tu clase</div>
                  <div className="text-muted-foreground">Suma cuando termines una</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                    onClick={() => setLessonsDone(c.id, done - 1)}
                    aria-label="Quitar una clase"
                    disabled={done <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-xl shadow-warm"
                    onClick={() => setLessonsDone(c.id, done + 1)}
                    aria-label="Sumar una clase"
                    disabled={finished}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-bold">Mi meta diaria:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((g) => (
                      <button
                        key={g}
                        onClick={() => setDailyGoal(c.id, g)}
                        className={`rounded-lg px-2.5 py-1 text-sm font-bold transition ${
                          goal === g
                            ? "bg-primary text-primary-foreground"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  <Sparkles className="h-4 w-4" />
                  {finished
                    ? "¡Curso terminado!"
                    : `Listo en ${days} día${days === 1 ? "" : "s"}`}
                </div>
              </div>

              <Button asChild variant="outline" className="rounded-2xl font-bold">
                <Link to="/curso/$courseId" params={{ courseId: c.id }}>
                  Ir al curso <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
