import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  MessageSquare,
  BookOpen,
  ClipboardList,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { FloatingChat } from "@/components/FloatingChat";
import { AndeanBorder } from "@/components/AndeanBorder";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SpeakButton } from "@/components/SpeakButton";
import { getCourse } from "@/lib/courses";
import { getLessonsForCourse, LESSONS_PER_COURSE, type Lesson } from "@/lib/lessons";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/curso/$courseId")({
  head: () => ({
    meta: [
      { title: "Detalle del curso — Allin Yachay" },
      {
        name: "description",
        content:
          "Plan de clases del curso, con cuestionarios y casos prácticos para aplicar lo aprendido.",
      },
    ],
  }),
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = useParams({ from: "/curso/$courseId" });
  const course = getCourse(courseId);
  const { user } = useAuth();
  const { getFor, setLessonsDone, loading } = useProgress();

  const lessons = useMemo(
    () => (course ? getLessonsForCourse(course.id, course.title) : []),
    [course],
  );

  if (!course) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-display text-4xl font-bold">Curso no encontrado</h1>
          <p className="mt-3 text-muted-foreground">
            El curso que buscas no existe o fue movido.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/cursos">Ver todos los cursos</Link>
          </Button>
        </div>
      </div>
    );
  }

  const progress = getFor(course.id);
  const lessonsDone = progress?.lessons_done ?? 0;
  const total = LESSONS_PER_COURSE;
  const pct = Math.round((lessonsDone / total) * 100);

  // Una clase está disponible si su índice <= lessonsDone + 1.
  // Las anteriores están "completadas" y las siguientes están "bloqueadas".
  const getStatus = (lesson: Lesson): "done" | "current" | "locked" => {
    if (lesson.index <= lessonsDone) return "done";
    if (lesson.index === lessonsDone + 1) return "current";
    return "locked";
  };

  const completeLesson = async (lessonIndex: number) => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    // Marcamos como completada esta clase (avanzamos al siguiente índice)
    if (lessonIndex === lessonsDone + 1) {
      await setLessonsDone(course.id, lessonIndex);
    }
  };

  const Icon = course.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero del curso */}
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mb-6 rounded-full border-2 font-bold"
          >
            <Link to="/cursos">
              <ArrowLeft className="mr-1 h-4 w-4" /> Regresar a Cursos
            </Link>
          </Button>

          <div className="grid gap-8 md:grid-cols-[1fr_320px] md:items-center">
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-warm ${course.tone}`}
              >
                <Icon className="h-4 w-4" /> {course.level} · {course.duration}
              </span>
              <h1 className="mt-3 text-balance font-display text-4xl font-bold md:text-5xl">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                {course.long}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <SpeakButton
                  id={`detail-${course.id}`}
                  size="lg"
                  text={`${course.title}. ${course.long}. Este curso tiene ${total} clases con cuestionarios y casos prácticos.`}
                  className="h-12 rounded-2xl"
                />
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-2xl border-2"
                >
                  <Link to="/foros/$courseId" params={{ courseId: course.id }}>
                    <MessageSquare className="mr-1 h-4 w-4" /> Ir al foro del curso
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-warm">
              <p className="text-sm font-bold uppercase tracking-wide text-primary">
                Tu avance
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold">{pct}%</span>
                <span className="text-sm text-muted-foreground">
                  {lessonsDone} de {total} clases
                </span>
              </div>
              <Progress value={pct} className="mt-3 h-3" />
              {!user && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Inicia sesión para guardar tu progreso y desbloquear las clases.
                </p>
              )}
              {!user && (
                <Button asChild className="mt-3 h-11 w-full rounded-2xl">
                  <Link to="/auth">Iniciar sesión</Link>
                </Button>
              )}
              {user && lessonsDone >= total && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-sun/20 p-3 text-sm font-bold text-sun-foreground">
                  <Trophy className="h-5 w-5" /> ¡Curso completado!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <AndeanBorder />

      {/* Plan de clases */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">
              Plan del curso
            </p>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              {total} clases paso a paso
            </h2>
            <p className="mt-1 text-muted-foreground">
              Las clases se desbloquean en orden. Termina el cuestionario para pasar a la
              siguiente.
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {lessons.map((lesson) => {
            const status = getStatus(lesson);
            const locked = status === "locked";
            return (
              <AccordionItem
                key={lesson.index}
                value={`l-${lesson.index}`}
                disabled={locked}
                className={`rounded-2xl border-2 bg-card px-4 transition-colors ${
                  status === "done"
                    ? "border-puna/60 bg-puna/5"
                    : status === "current"
                      ? "border-primary shadow-warm"
                      : "border-border opacity-70"
                }`}
              >
                <AccordionTrigger
                  className="hover:no-underline"
                  disabled={locked}
                >
                  <div className="flex flex-1 items-center gap-3 pr-2 text-left">
                    <LessonStatusBadge status={status} />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-bold leading-tight">
                          {lesson.title}
                        </h3>
                        {lesson.practice && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-sun-foreground">
                            <Sparkles className="h-3 w-3" /> Caso práctico
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {locked ? "Termina la clase anterior para desbloquearla." : lesson.summary}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {!locked && (
                    <LessonBody
                      lesson={lesson}
                      status={status}
                      loading={loading}
                      onComplete={() => completeLesson(lesson.index)}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>

      <FloatingChat />
    </div>
  );
}

function LessonStatusBadge({ status }: { status: "done" | "current" | "locked" }) {
  if (status === "done") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-puna text-puna-foreground shadow-warm">
        <CheckCircle2 className="h-5 w-5" />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-warm">
        <PlayCircle className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Lock className="h-5 w-5" />
    </span>
  );
}

function LessonBody({
  lesson,
  status,
  loading,
  onComplete,
}: {
  lesson: Lesson;
  status: "done" | "current" | "locked";
  loading: boolean;
  onComplete: () => void;
}) {
  // view: null = solo botones; "tema" = contenido; "quiz" = cuestionario
  const [view, setView] = useState<null | "tema" | "quiz">(null);
  const [topicRead, setTopicRead] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = lesson.quiz.every((_, i) => answers[i] !== undefined);
  const correctCount = lesson.quiz.reduce(
    (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
    0,
  );
  const passed = correctCount === lesson.quiz.length;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (passed && status === "current") {
      onComplete();
    }
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-4 pb-2">
      {/* Vista por defecto: dos botones grandes */}
      {view === null && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={() => {
              setView("tema");
              setTopicRead(true);
            }}
            className="h-14 rounded-2xl text-base font-bold shadow-warm"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Realizar tema
          </Button>
          <Button
            onClick={() => setView("quiz")}
            variant="outline"
            disabled={!topicRead && status === "current"}
            className="h-14 rounded-2xl border-2 text-base font-bold"
            title={
              !topicRead && status === "current"
                ? "Primero realiza el tema"
                : "Hacer el cuestionario"
            }
          >
            <ClipboardList className="mr-2 h-5 w-5" />
            Cuestionario
          </Button>
          {!topicRead && status === "current" && (
            <p className="sm:col-span-2 text-center text-xs text-muted-foreground">
              Realiza primero el tema, luego responde el cuestionario para avanzar.
            </p>
          )}
        </div>
      )}

      {/* Vista TEMA */}
      {view === "tema" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="flex items-start gap-2">
              <Target className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-sm leading-relaxed">{lesson.detail}</p>
            </div>
            <div className="mt-3">
              <SpeakButton
                id={`lesson-${lesson.index}`}
                size="sm"
                text={`${lesson.title}. ${lesson.detail}`}
              />
            </div>
          </div>

          {lesson.practice && (
            <div className="rounded-2xl border-2 border-sun bg-sun/10 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-sun-foreground">
                Caso práctico
              </p>
              <h4 className="mt-1 font-display text-lg font-bold">
                {lesson.practice.title}
              </h4>
              <p className="mt-2 text-sm">{lesson.practice.scenario}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                <strong>Pista:</strong> {lesson.practice.hint}
              </p>
              <div className="mt-3">
                <SpeakButton
                  id={`case-${lesson.index}`}
                  size="sm"
                  text={`Caso práctico. ${lesson.practice.title}. ${lesson.practice.scenario}. Pista: ${lesson.practice.hint}`}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setView(null)}
              className="h-11 rounded-2xl border-2 px-5 font-bold"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Volver
            </Button>
            <Button
              onClick={() => setView("quiz")}
              className="h-11 rounded-2xl px-5 font-bold shadow-warm"
            >
              <ClipboardList className="mr-1 h-4 w-4" /> Ir al cuestionario
            </Button>
          </div>
        </div>
      )}

      {/* Vista CUESTIONARIO */}
      {view === "quiz" && (
        <div className="rounded-2xl border-2 border-border bg-background p-4">
          <h4 className="font-display text-lg font-bold">Cuestionario corto</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Responde las {lesson.quiz.length} preguntas para terminar la clase.
          </p>
          <ol className="mt-4 space-y-4">
            {lesson.quiz.map((q, qi) => {
              const userAns = answers[qi];
              return (
                <li key={qi} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">
                      {qi + 1}. {q.q}
                    </p>
                    <SpeakButton
                      id={`quiz-${lesson.index}-${qi}`}
                      size="icon"
                      text={`Pregunta ${qi + 1}. ${q.q}. Opciones: ${q.options.join(". ")}`}
                    />
                  </div>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = userAns === oi;
                      const isCorrect = oi === q.answer;
                      const showResult = submitted;
                      let cls =
                        "flex items-start gap-2 rounded-xl border-2 px-3 py-2 text-sm cursor-pointer transition-colors";
                      if (showResult && isCorrect) cls += " border-puna bg-puna/15";
                      else if (showResult && isSelected && !isCorrect)
                        cls += " border-destructive bg-destructive/10";
                      else if (isSelected) cls += " border-primary bg-primary/10";
                      else cls += " border-border hover:bg-muted/40";
                      return (
                        <label key={oi} className={cls}>
                          <input
                            type="radio"
                            name={`lesson-${lesson.index}-q-${qi}`}
                            className="mt-0.5"
                            checked={isSelected}
                            disabled={submitted && passed}
                            onChange={() =>
                              setAnswers((a) => ({ ...a, [qi]: oi }))
                            }
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ol>

          {submitted && (
            <div
              className={`mt-4 rounded-xl p-3 text-sm font-bold ${
                passed
                  ? "bg-puna/20 text-puna-foreground"
                  : "bg-destructive/15 text-destructive"
              }`}
            >
              {passed
                ? `¡Excelente! ${correctCount}/${lesson.quiz.length} correctas. Clase completada.`
                : `Tienes ${correctCount}/${lesson.quiz.length} correctas. Revisa y vuelve a intentarlo.`}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setView(null)}
              className="h-11 rounded-2xl border-2 px-5 font-bold"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Volver
            </Button>
            {!submitted && (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || loading}
                className="h-11 rounded-2xl px-5 font-bold shadow-warm"
              >
                Enviar respuestas
              </Button>
            )}
            {submitted && !passed && (
              <Button
                onClick={reset}
                variant="outline"
                className="h-11 rounded-2xl border-2 px-5 font-bold"
              >
                Volver a intentar
              </Button>
            )}
            {submitted && passed && (
              <span className="inline-flex items-center gap-2 text-sm font-bold text-puna">
                <CheckCircle2 className="h-4 w-4" /> Clase completada
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
