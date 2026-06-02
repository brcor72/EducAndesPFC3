import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen, MessageSquare, ClipboardList, Play } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AndeanBorder } from '../components/layout/AndeanBorder';
import { coursesService, progressService } from '../services/courses.service';
import { useAuthStore } from '../store/auth.store';
import { useI18nStore } from '../store/i18n.store';
import { SpeakButton } from '../components/audio/SpeakButton';

type LessonView = 'list' | 'topic' | 'quiz';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuthStore();
  const { tr } = useI18nStore();
  const qc = useQueryClient();

  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [lessonView, setLessonView] = useState<LessonView>('list');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesService.getOne(courseId!),
  });

  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressService.getMyProgress(),
    enabled: !!user,
  });

  const progressRow = progress?.rows?.find((r: any) => r.course?.slug === courseId || r.courseId === course?.id);
  const lessonsDone = progressRow?.lessonsDone ?? 0;

  const updateProgressMutation = useMutation({
    mutationFn: (done: number) => progressService.updateProgress(courseId!, done),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['progress'] }); toast.success(tr('lessonDone')); },
  });

  const submitQuizMutation = useMutation({
    mutationFn: ({ questionId, selectedAnswer }: { questionId: string; selectedAnswer: number }) =>
      coursesService.submitQuiz(courseId!, 'lesson', questionId, selectedAnswer),
    onSuccess: (result, { questionId }) => {
      setQuizResults((prev) => ({ ...prev, [questionId]: result.isCorrect }));
      if (result.isCorrect) toast.success(tr('quizCorrect'));
      else toast.error(tr('quizWrong'));
    },
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="text-muted-foreground animate-pulse">Cargando…</div></div>;
  if (!course) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Curso no encontrado</div>;

  const lessons = course.lessons || [];
  const pct = lessons.length > 0 ? Math.round((lessonsDone / lessons.length) * 100) : 0;

  const openLesson = (lesson: any, view: LessonView) => {
    setActiveLesson(lesson);
    setLessonView(view);
    setQuizAnswers({});
    setQuizResults({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToList = () => {
    setActiveLesson(null);
    setLessonView('list');
  };

  // === TOPIC VIEW ===
  if (lessonView === 'topic' && activeLesson) {
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

            <p className="text-muted-foreground text-sm">{activeLesson.summary}</p>

            <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
              {activeLesson.detail}
            </div>

            {activeLesson.isPractice && activeLesson.practiceTitle && (
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <span>💡</span> {activeLesson.practiceTitle}
                  <SpeakButton text={activeLesson.practiceTitle + '. ' + activeLesson.practiceScenario} />
                </div>
                <p className="mt-2 text-sm">{activeLesson.practiceScenario}</p>
                {activeLesson.practiceHint && (
                  <p className="mt-2 text-xs text-muted-foreground">💡 Pista: {activeLesson.practiceHint}</p>
                )}
              </div>
            )}

            {user && (
              <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-4">
                <span className="text-sm font-bold">{tr('lessonComplete')}?</span>
                <button
                  onClick={() => {
                    const isCompleted = activeLesson.index <= lessonsDone;
                    updateProgressMutation.mutate(isCompleted ? activeLesson.index - 1 : activeLesson.index);
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                    activeLesson.index <= lessonsDone
                      ? 'bg-primary/20 text-primary hover:bg-primary/30'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm'
                  }`}>
                  {activeLesson.index <= lessonsDone ? tr('lessonDone') : tr('lessonComplete')}
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={backToList} className="flex items-center gap-2 rounded-2xl border-2 border-border px-4 py-3 font-bold hover:bg-muted transition-colors">
                <ArrowLeft className="h-4 w-4" /> {tr('backToLesson')}
              </button>
              {activeLesson.quizQuestions?.length > 0 && (
                <button
                  onClick={() => setLessonView('quiz')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
                >
                  <ClipboardList className="h-4 w-4" /> {tr('lessonQuiz')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === QUIZ VIEW ===
  if (lessonView === 'quiz' && activeLesson) {
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
                      const selected = quizAnswers[q.id] === idx;
                      const result = quizResults[q.id];
                      const isCorrect = result !== undefined && idx === q.answer;
                      const isWrong = result !== undefined && selected && !result;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: idx }));
                            if (user && result === undefined) {
                              submitQuizMutation.mutate({ questionId: q.id, selectedAnswer: idx });
                            }
                          }}
                          disabled={result !== undefined}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors border-2 ${
                            isCorrect ? 'border-puna bg-puna/20 text-puna' :
                            isWrong ? 'border-destructive bg-destructive/10 text-destructive' :
                            selected ? 'border-primary bg-primary/10' :
                            'border-transparent bg-background hover:border-primary/40'
                          }`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-current text-xs font-bold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && <span className="text-puna">✓</span>}
                          {isWrong && <span className="text-destructive">✗</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={backToList}
              className="flex items-center gap-2 rounded-2xl border-2 border-border px-4 py-3 font-bold hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> {tr('backToLesson')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === LESSON LIST VIEW ===
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
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={`/foros/${courseId}`} className="inline-flex items-center gap-2 rounded-2xl border-2 border-border px-5 py-2.5 font-bold hover:bg-muted transition-colors">
                  <MessageSquare className="h-4 w-4" /> {tr('goForum')}
                </Link>
                {!user && (
                  <Link to="/auth" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors">
                    {tr('loginToSave')} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border-4 border-card shadow-warm">
              <img src={course.imageUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'}
                alt={course.title} className="h-full w-full object-cover aspect-[4/3]" />
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
            return (
              <div key={lesson.id} className="rounded-3xl border-2 border-border bg-card shadow-soft overflow-hidden">
                <div className="flex w-full items-center gap-4 p-5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-display text-lg font-bold truncate">{lesson.title}</div>
                      <SpeakButton text={lesson.title + '. ' + lesson.summary} />
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{lesson.summary}</div>
                  </div>
                  {/* Two action buttons */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => openLesson(lesson, 'topic')}
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" /> {tr('lessonDo')}
                    </button>
                    {lesson.quizQuestions?.length > 0 && (
                      <button
                        onClick={() => openLesson(lesson, 'quiz')}
                        className="flex items-center gap-1.5 rounded-xl border-2 border-border px-3 py-2 text-xs font-bold hover:bg-muted transition-colors"
                      >
                        <ClipboardList className="h-3.5 w-3.5" /> {tr('lessonQuiz')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
