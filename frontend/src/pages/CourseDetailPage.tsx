import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, BookOpen,
  MessageSquare, ClipboardList, Play, Lock, RotateCcw, Trophy, Award, DownloadCloud, Trash2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AndeanBorder } from '../components/layout/AndeanBorder';
import { coursesService, progressService } from '../services/courses.service';
import { useAuthStore } from '../store/auth.store';
import { useI18nStore } from '../store/i18n.store';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { SpeakButton } from '../components/audio/SpeakButton';
import { VirtualTutor } from '../components/tutor/VirtualTutor';
import { offlineSyncService } from '../services/offlineSync.service';
import { useDownloadsStore } from '../store/downloads.store';

type LessonView = 'list' | 'topic' | 'quiz';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tr, lang } = useI18nStore();
  const { isOnline } = useNetworkStatus();
  const userDownloads = useDownloadsStore((state) => user ? state.userDownloads[user.id] : undefined) || [];
  const { addDownload, removeDownload } = useDownloadsStore();
  const isCourseDownloaded = userDownloads.includes(courseId!);
  const qc = useQueryClient();

  const [activeLesson, setActiveLesson]   = useState<any>(null);
  const [lessonView, setLessonView]       = useState<LessonView>('list');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>(() => {
    try {
      const stored = localStorage.getItem(`quizAnswers_${courseId}`);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`quizResults_${courseId}`);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    if (courseId) {
      localStorage.setItem(`quizAnswers_${courseId}`, JSON.stringify(quizAnswers));
      localStorage.setItem(`quizResults_${courseId}`, JSON.stringify(quizResults));
    }
  }, [quizAnswers, quizResults, courseId]);
  const [isDownloading, setIsDownloading] = useState(false);
  const completionFiredRef                = useRef(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      try {
        if (!isOnline) throw new Error('Offline');
        return await coursesService.getOne(courseId!);
      } catch (err) {
        // Fallback to local storage if available
        const offlineCourse = useDownloadsStore.getState().offlineCourses[courseId!];
        if (offlineCourse) return offlineCourse;
        throw err;
      }
    },
  });

  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressService.getMyProgress(),
    enabled: !!user,
  });

  const progressRow  = progress?.rows?.find((r: any) => r.course?.slug === courseId || r.courseId === course?.id);
  
  // Combine server progress with any pending offline progress to survive page reloads offline
  const offlineQueue = offlineSyncService.getQueue();
  const pendingProgress = offlineQueue.find(
    (a) => a.type === 'updateProgress' && (a.payload.courseId === courseId || a.payload.courseId === course?.id)
  );
  
  const serverLessonsDone = progressRow?.lessonsDone ?? 0;
  const offlineLessonsDone = pendingProgress?.payload.lessonsDone ?? 0;
  const lessonsDone = Math.max(serverLessonsDone, offlineLessonsDone);

  const updateProgressMutation = useMutation({
    mutationFn: async (done: number) => {
      try {
        if (isOnline) {
          await progressService.updateProgress(courseId!, done);
        } else {
          offlineSyncService.enqueueProgressUpdate(courseId!, done);
        }
        return Promise.resolve();
      } catch (err) {
        // Fallback to offline queue if network request fails despite isOnline being true
        offlineSyncService.enqueueProgressUpdate(courseId!, done);
        return Promise.resolve();
      }
    },
    onSuccess: (data, done) => {
      if (isOnline) qc.invalidateQueries({ queryKey: ['progress'] });
      else {
        qc.setQueryData(['progress'], (old: any) => {
          if (!old) return old;
          const newRows = old.rows?.map((r: any) =>
            (r.course?.slug === courseId || r.courseId === course?.id)
              ? { ...r, lessonsDone: Math.max(r.lessonsDone, done) }
              : r
          );
          return { ...old, rows: newRows || [] };
        });
      }
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async ({ questionId, selectedAnswer, isCorrect }: { questionId: string; selectedAnswer: number; isCorrect: boolean }) => {
      try {
        if (isOnline) {
          const res = await coursesService.submitQuiz(courseId!, activeLesson.id, questionId, selectedAnswer);
          return { isCorrect: res.isCorrect };
        } else {
          offlineSyncService.enqueueQuizSubmission(courseId!, activeLesson.id, questionId, selectedAnswer);
          return { isCorrect };
        }
      } catch (err) {
        // Fallback to offline queue if network request fails despite isOnline being true
        offlineSyncService.enqueueQuizSubmission(courseId!, activeLesson.id, questionId, selectedAnswer);
        return { isCorrect };
      }
    },
    onSuccess: (result, { questionId }) => {
      setQuizResults((prev) => ({ ...prev, [questionId]: result.isCorrect }));
    },
  });

  // ── Quiz state computations ────────────────────────────────
  const quizQuestions  = activeLesson?.quizQuestions ?? [];
  const quizAllDone    = quizQuestions.length > 0 &&
    quizQuestions.every((q: any) => quizResults[q.id] !== undefined);
  const quizAllCorrect = quizAllDone &&
    quizQuestions.every((q: any) => quizResults[q.id] === true);
  const quizHasErrors  = quizAllDone && !quizAllCorrect;

  // Auto-mark lesson complete when quiz is fully passed
  useEffect(() => {
    if (
      quizAllCorrect &&
      activeLesson &&
      activeLesson.index > lessonsDone &&
      !completionFiredRef.current &&
      !updateProgressMutation.isPending
    ) {
      completionFiredRef.current = true;
      updateProgressMutation.mutate(activeLesson.index);
    }
  }, [quizAllCorrect, activeLesson?.index, lessonsDone]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="text-muted-foreground animate-pulse">{tr('loading')}</div></div>;
  if (!course)   return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{tr('courseNotFound')}</div>;

  const lessons = course.lessons || [];
  const pct     = lessons.length > 0 ? Math.round((lessonsDone / lessons.length) * 100) : 0;

  const openLesson = (lesson: any, view: LessonView) => {
    setActiveLesson(lesson);
    setLessonView(view);
    setQuizAnswers({});
    setQuizResults({});
    completionFiredRef.current = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToList = () => {
    setActiveLesson(null);
    setLessonView('list');
  };

  // Advance to next lesson after completing current
  const goToNextLesson = () => {
    const next = lessons.find((l: any) => l.index === activeLesson.index + 1);
    if (next) {
      openLesson(next, 'topic');
    } else {
      toast.success('¡Felicitaciones! Completaste todo el curso 🎉');
      backToList();
    }
  };

  // Complete a lesson that has no quiz and go next
  const completeNoQuizLesson = () => {
    if (activeLesson.index > lessonsDone) {
      updateProgressMutation.mutate(activeLesson.index, {
        onSuccess: () => {
          toast.success(tr('lessonDone'));
          goToNextLesson();
        },
      });
    } else {
      goToNextLesson();
    }
  };

  // Retry quiz: reset only wrong answers
  const retryQuiz = () => {
    const resetAnswers: Record<string, number | null> = {};
    const resetResults: Record<string, boolean>       = {};
    quizQuestions.forEach((q: any) => {
      if (quizResults[q.id] === true) {
        // Keep correct answers locked
        resetAnswers[q.id] = quizAnswers[q.id];
        resetResults[q.id] = true;
      }
    });
    setQuizAnswers(resetAnswers);
    setQuizResults(resetResults);
    completionFiredRef.current = false;
  };

  // Download entire course offline
  const handleDownload = async () => {
    if (!isOnline) {
      toast.error('Necesitas conexión a internet para descargar');
      return;
    }
    if (!user) {
      toast.error('Debes iniciar sesión para descargar');
      return;
    }
    setIsDownloading(true);
    try {
      // Fetch all lessons explicitly to construct the full offline course
      const fullLessons = [];
      for (const l of lessons) {
        const lessonData = await coursesService.getLesson(courseId!, l.index);
        fullLessons.push(lessonData);
      }
      
      // Simulate heavy download for 10 seconds as requested
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const completeCourse = { ...course, lessons: fullLessons };
      addDownload(user.id, completeCourse);
      toast.success('¡Curso descargado con éxito!', {
        duration: 5000,
        action: {
          label: 'Ver descargas',
          onClick: () => navigate('/cursos#downloads')
        }
      });
    } catch (err) {
      toast.error('Error al descargar el curso');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemoveDownload = () => {
    if (!user) return;
    removeDownload(user.id, courseId!);
    toast.info('Descarga eliminada');
  };

  // ══════════════════════════════════════════════════════════
  // TOPIC VIEW
  // ══════════════════════════════════════════════════════════
  if (lessonView === 'topic' && activeLesson) {
    const hasQuiz      = (activeLesson.quizQuestions?.length ?? 0) > 0;
    const alreadyDone  = activeLesson.index <= lessonsDone;

    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
          <button onClick={backToList} className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> {tr('backCourses')}
          </button>

          <div className="rounded-3xl border-2 border-border bg-card p-8 shadow-soft space-y-5">
            <div className="flex items-start gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-primary mb-1">
                  {tr('lessonDo')} · Clase {activeLesson.index}
                </div>
                <h1 className="font-display text-3xl font-bold">{activeLesson.title}</h1>
              </div>
              <SpeakButton text={activeLesson.title + '. ' + activeLesson.detail} size="md" className="shrink-0 mt-1" />
            </div>

            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-sm flex-1">{activeLesson.summary}</p>
              <SpeakButton text={activeLesson.summary} size="sm" />
            </div>

            <div className="rounded-2xl bg-muted/40 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed flex-1 whitespace-pre-line">
                  {activeLesson.detail}
                </div>
                <SpeakButton text={activeLesson.detail} size="md" className="shrink-0 mt-1" />
              </div>
            </div>

            {activeLesson.isPractice && activeLesson.practiceTitle && (
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <span>💡</span> {activeLesson.practiceTitle}
                  <SpeakButton text={activeLesson.practiceTitle + '. ' + activeLesson.practiceScenario} />
                </div>
                <p className="mt-2 text-sm">{activeLesson.practiceScenario}</p>
                {activeLesson.practiceHint && (
                  <p className="mt-2 text-xs text-muted-foreground">💡 {tr('practiceHint')}: {activeLesson.practiceHint}</p>
                )}
              </div>
            )}

            {/* ── Lección ya completada ── */}
            {alreadyDone && (
              <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
                <CheckCircle2 className="h-4 w-4" /> Clase completada
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={backToList} className="flex items-center gap-2 rounded-2xl border-2 border-border px-4 py-3 font-bold hover:bg-muted transition-colors">
                <ArrowLeft className="h-4 w-4" /> {tr('backToLesson')}
              </button>

              {hasQuiz ? (
                /* Con cuestionario: ir al quiz (el quiz es lo que completa la lección) */
                <button
                  onClick={() => setLessonView('quiz')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
                >
                  <ClipboardList className="h-4 w-4" />
                  {alreadyDone ? 'Repasar cuestionario' : 'Ir al cuestionario →'}
                </button>
              ) : user ? (
                /* Sin cuestionario: botón completar clase */
                <button
                  onClick={completeNoQuizLesson}
                  disabled={updateProgressMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {alreadyDone
                    ? <><ArrowRight className="h-4 w-4" /> Siguiente clase</>
                    : <><CheckCircle2 className="h-4 w-4" /> Completar y continuar</>
                  }
                </button>
              ) : null}
            </div>
          </div>

          <VirtualTutor
            mode="lesson"
            courseTitle={course.title}
            courseSlug={courseId!}
            lessonTitle={activeLesson.title}
            lessonSummary={activeLesson.summary || ''}
            lessonDetail={activeLesson.detail || ''}
            lessonIndex={activeLesson.index}
            totalLessons={lessons.length}
            lessonsDone={lessonsDone}
          />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // QUIZ VIEW
  // ══════════════════════════════════════════════════════════
  if (lessonView === 'quiz' && activeLesson) {
    const isLastLesson = activeLesson.index === lessons.length;

    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
          <button onClick={() => setLessonView('topic')} className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> {tr('backToLesson')}
          </button>

          <div className="rounded-3xl border-2 border-border bg-card p-8 shadow-soft space-y-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-primary" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-primary">{tr('quizTitle')}</div>
                <h2 className="font-display text-2xl font-bold">{activeLesson.title}</h2>
              </div>
              <SpeakButton text={tr('quizTitle') + ' - ' + activeLesson.title} size="md" className="ml-auto" />
            </div>

            {/* ── Preguntas ── */}
            <div className="space-y-6">
              {activeLesson.quizQuestions?.map((q: any, qi: number) => (
                <div key={q.id} className="rounded-2xl bg-muted/60 p-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{qi + 1}</span>
                    <p className="font-bold flex-1">{q.question}</p>
                    <SpeakButton text={q.question} />
                  </div>
                  <div className="space-y-2 pl-9">
                    {q.options.map((opt: string, idx: number) => {
                      const selected   = quizAnswers[q.id] === idx;
                      const result     = quizResults[q.id];
                      const isCorrect  = result !== undefined && idx === q.answer;
                      const isWrong    = result !== undefined && selected && !result;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: idx }));
                            if (user && result === undefined) {
                              submitQuizMutation.mutate({ questionId: q.id, selectedAnswer: idx, isCorrect: idx === q.answer });
                            }
                          }}
                          disabled={result !== undefined}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors border-2 ${
                            isCorrect ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400' :
                            isWrong   ? 'border-destructive bg-destructive/10 text-destructive' :
                            selected  ? 'border-primary bg-primary/10' :
                            'border-transparent bg-background hover:border-primary/40'
                          }`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-current text-xs font-bold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && <span className="text-green-600">✓</span>}
                          {isWrong   && <span className="text-destructive">✗</span>}
                          <SpeakButton text={opt} size="sm" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Resultado del cuestionario ── */}
            {quizAllCorrect && (
              <div className="rounded-2xl border-2 border-green-500 bg-green-500/10 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-bold text-green-700 dark:text-green-400">
                      ¡Excelente! Respondiste todo correctamente
                    </p>
                    <p className="text-sm text-muted-foreground">
                      La clase ha sido marcada como completada
                    </p>
                  </div>
                </div>
                <button
                  onClick={goToNextLesson}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-6 py-3.5 font-bold text-white shadow-warm hover:bg-green-600 transition-colors"
                >
                  {isLastLesson
                    ? <><Trophy className="h-4 w-4" /> Ver mis logros</>
                    : <><ArrowRight className="h-4 w-4" /> Siguiente clase</>
                  }
                </button>
              </div>
            )}

            {quizHasErrors && (
              <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💪</span>
                  <div>
                    <p className="font-bold text-destructive">
                      Algunas respuestas no son correctas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Las preguntas en rojo necesitan otro intento. Las correctas quedan guardadas.
                    </p>
                  </div>
                </div>
                <button
                  onClick={retryQuiz}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="h-4 w-4" /> Intentar de nuevo
                </button>
              </div>
            )}

            {!quizAllDone && (
              <button
                onClick={() => setLessonView('topic')}
                className="flex items-center gap-2 rounded-2xl border-2 border-border px-4 py-3 font-bold hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> {tr('backToLesson')}
              </button>
            )}
          </div>

          <VirtualTutor
            mode="quiz"
            courseTitle={course.title}
            courseSlug={courseId!}
            lessonTitle={activeLesson.title}
            lessonSummary={activeLesson.summary || ''}
            lessonDetail={activeLesson.detail || ''}
            lessonIndex={activeLesson.index}
            totalLessons={lessons.length}
            lessonsDone={lessonsDone}
          />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // LESSON LIST VIEW
  // ══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Link to="/cursos" className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> {tr('backCourses')}
          </Link>
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {course.level} · {course.durationWeeks} {tr('courseWeeks')}
              </span>
              <div className="mt-3 flex items-start gap-3">
                <h1 className="text-balance text-4xl font-bold md:text-5xl flex-1">{course.title}</h1>
                <SpeakButton text={course.title + '. ' + course.long} size="md" className="mt-1 shrink-0" />
              </div>
              <p className="mt-4 text-lg text-muted-foreground">{course.long}</p>
              {user && (
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold">{lessonsDone} / {lessons.length} {tr('lessonProgress')}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  {pct === 100 && (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-sun/50 bg-sun/10 p-4 animate-in fade-in zoom-in duration-500">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sun text-sun-foreground shadow-warm">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sun-foreground">{tr('badgeTitle')}</p>
                        <p className="text-sm text-sun-foreground/80">{tr('badgeEarned')}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={`/foros/${courseId}`} className="inline-flex items-center gap-2 rounded-2xl border-2 border-border px-5 py-2.5 font-bold hover:bg-muted transition-colors">
                  <MessageSquare className="h-4 w-4" /> {tr('goForum')}
                </Link>
                {user && isCourseDownloaded ? (
                  <button
                    onClick={handleRemoveDownload}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 text-primary px-5 py-2.5 font-bold hover:bg-destructive/10 hover:text-destructive transition-colors group"
                  >
                    <span className="flex items-center gap-2 group-hover:hidden"><CheckCircle2 className="h-4 w-4" /> Descargado</span>
                    <span className="hidden items-center gap-2 group-hover:flex"><Trash2 className="h-4 w-4" /> Eliminar descarga</span>
                  </button>
                ) : user ? (
                  <button
                    disabled={isDownloading || !isOnline}
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-border px-5 py-2.5 font-bold hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <DownloadCloud className="h-4 w-4" /> 
                    {isDownloading ? 'Descargando...' : 'Descargar para ver offline'}
                  </button>
                ) : null}
                {!user && (
                  <Link to="/auth" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors">
                    {tr('loginToSave')} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border-4 border-card shadow-warm">
              <img
                src={course.imageUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'}
                alt={course.title}
                className="h-full w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>
      <AndeanBorder />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="font-display text-3xl font-bold">{tr('lessonsList')}</h2>
          <SpeakButton text={tr('lessonsList')} />
        </div>
        <div className="space-y-3">
          {lessons.map((lesson: any) => {
            const isCompleted = lesson.index <= lessonsDone;
            const isAvailable = lesson.index === 1 || lesson.index <= lessonsDone + 1;
            const isLocked    = !isAvailable;
            const isCurrent   = lesson.index === lessonsDone + 1;

            return (
              <div
                key={lesson.id}
                className={`rounded-3xl border-2 shadow-soft overflow-hidden transition-all ${
                  isLocked    ? 'border-border/40 bg-muted/30 opacity-60' :
                  isCompleted ? 'border-primary/40 bg-card' :
                  isCurrent   ? 'border-primary bg-card ring-2 ring-primary/30' :
                  'border-border bg-card'
                }`}
              >
                <div className="flex w-full items-center gap-4 p-5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    isLocked    ? 'bg-muted text-muted-foreground' :
                    isCompleted ? 'bg-primary text-primary-foreground' :
                    isCurrent   ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isLocked    ? <Lock className="h-5 w-5" /> :
                     isCompleted ? <CheckCircle2 className="h-5 w-5" /> :
                     <BookOpen className="h-5 w-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`font-display text-lg font-bold truncate ${isLocked ? 'text-muted-foreground' : ''}`}>
                        {lesson.index}. {lesson.title}
                      </div>
                      {!isLocked && <SpeakButton text={lesson.title + '. ' + lesson.summary} />}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{lesson.summary}</div>
                    {isLocked && (
                      <div className="mt-1 text-xs font-bold text-muted-foreground">
                        🔒 {tr('lessonLocked')}
                      </div>
                    )}
                    {isCurrent && !isCompleted && (
                      <div className="mt-1 text-xs font-bold text-primary">
                        ▶ Clase actual
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  {!isLocked && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => openLesson(lesson, 'topic')}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                          isCompleted
                            ? 'border-2 border-border hover:bg-muted'
                            : 'bg-primary text-primary-foreground shadow-warm hover:bg-primary/90'
                        }`}
                      >
                        {isCompleted
                          ? <><BookOpen className="h-3.5 w-3.5" /> Repasar</>
                          : <><Play className="h-3.5 w-3.5" /> {tr('lessonDo')}</>
                        }
                      </button>
                      {/* Cuestionario visible para lecciones con quiz (completadas o en curso) */}
                      {lesson.quizQuestions?.length > 0 && (
                        <button
                          onClick={() => openLesson(lesson, 'quiz')}
                          className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-bold transition-colors ${
                            isCompleted
                              ? 'border-primary/40 text-primary hover:bg-primary/10'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          <ClipboardList className="h-3.5 w-3.5" />
                          {isCompleted ? 'Quiz ✓' : tr('lessonQuiz')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
