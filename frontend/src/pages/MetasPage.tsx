import { Link } from 'react-router-dom';
import { Trophy, Target, TrendingUp, CheckCircle2, Plus, Minus, Sparkles, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AndeanBorder } from '../components/layout/AndeanBorder';
import { coursesService, progressService } from '../services/courses.service';
import { useAuthStore } from '../store/auth.store';
import { useI18nStore } from '../store/i18n.store';
import { SpeakButton } from '../components/audio/SpeakButton';

function estimateDays(remaining: number, perDay: number) {
  if (perDay <= 0) return Infinity;
  return Math.ceil(remaining / perDay);
}

export default function MetasPage() {
  const { user } = useAuthStore();
  const { tr } = useI18nStore();
  const qc = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesService.getAll(),
  });

  const { data: progressData, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressService.getMyProgress(),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ courseId, lessonsDone, dailyGoal }: { courseId: string; lessonsDone: number; dailyGoal?: number }) =>
      progressService.updateProgress(courseId, lessonsDone, dailyGoal),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progress'] }),
  });

  const rows = progressData?.rows ?? [];
  const totals = progressData?.totals ?? { done: 0, total: 0, completed: 0 };
  const overallPct = progressData?.overallPct ?? 0;

  const getProgress = (courseSlug: string) => rows.find((r: any) => r.course?.slug === courseSlug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">{tr('metasEyebrow')}</p>
          <div className="mt-2 flex items-start gap-3">
            <h1 className="text-balance text-5xl font-bold md:text-6xl flex-1">{tr('metasTitle')}</h1>
            <SpeakButton text={tr('metasTitle') + '. ' + tr('metasDesc')} size="md" className="mt-2 shrink-0" />
          </div>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{tr('metasDesc')}</p>
        </div>
      </section>
      <AndeanBorder />

      {/* Stats overview */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: TrendingUp, label: tr('metasTotalProgress'), value: `${overallPct}%`, tone: 'bg-primary text-primary-foreground' },
            { icon: CheckCircle2, label: tr('metasLessonsDone'), value: `${totals.done}`, tone: 'bg-puna text-puna-foreground' },
            { icon: Trophy, label: tr('metasFinished'), value: `${totals.completed}`, tone: 'bg-sun text-sun-foreground' },
            { icon: Target, label: tr('metasStarted'), value: `${rows.length}`, tone: 'bg-sky text-sky-foreground' },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border-2 border-border bg-card p-5 shadow-soft">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-warm ${s.tone}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div className="mt-3 font-display text-3xl font-bold">{s.value}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {s.label}
                <SpeakButton text={s.value + ' ' + s.label} />
              </div>
            </div>
          ))}
        </div>

        {totals.total > 0 && (
          <div className="mt-6 rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">{tr('metasOverall')}</span>
                <SpeakButton text={tr('metasOverall') + ': ' + totals.done + ' de ' + totals.total} />
              </div>
              <span className="text-sm text-muted-foreground">{totals.done} / {totals.total} {tr('metasLessonsDone')}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        )}
      </section>

      {/* Courses progress */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="font-display text-3xl font-bold">{tr('metasYourCourses')}</h2>
          <SpeakButton text={tr('metasYourCourses')} />
        </div>
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-56 animate-pulse rounded-3xl bg-muted" />)}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {courses.map((c: any) => {
              const p = getProgress(c.slug);
              const total = p?.lessonsTotal ?? 12;
              const done = p?.lessonsDone ?? 0;
              const goal = p?.dailyGoal ?? 1;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const remaining = Math.max(0, total - done);
              const days = estimateDays(remaining, goal);
              const finished = done >= total && total > 0;

              return (
                <article key={c.id} className="flex flex-col gap-4 rounded-3xl border-2 border-border bg-card p-5 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-warm">
                      <BookIcon name={c.iconName} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <h3 className="font-display text-xl font-bold leading-tight flex-1">{c.title}</h3>
                        <SpeakButton text={c.title + '. ' + c.short} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{c.short}</p>
                    </div>
                    {finished && <Trophy className="h-6 w-6 shrink-0 text-sun" />}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-bold">{done} / {total} {tr('metasLessonsDone')}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 p-3">
                    <div className="text-sm">
                      <div className="font-bold">{tr('metasMark')}</div>
                      <div className="text-muted-foreground">{tr('metasMarkSub')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button disabled={done <= 0} onClick={() => updateMutation.mutate({ courseId: c.slug, lessonsDone: done - 1 })}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-border hover:bg-muted disabled:opacity-40 transition-colors">
                        <Minus className="h-4 w-4" />
                      </button>
                      <button disabled={finished} onClick={() => updateMutation.mutate({ courseId: c.slug, lessonsDone: done + 1 })}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-warm hover:bg-primary/90 disabled:opacity-40 transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-border p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-bold">{tr('metasDailyGoal')}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((g) => (
                          <button key={g} onClick={() => updateMutation.mutate({ courseId: c.slug, lessonsDone: done, dailyGoal: g })}
                            className={`rounded-lg px-2.5 py-1 text-sm font-bold transition ${goal === g ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                      <Sparkles className="h-4 w-4" />
                      {finished
                        ? tr('metasFinishedBadge')
                        : `${tr('metasDaysLeft')} ${days} ${tr('metasDaysSuffix')}${days !== 1 ? 's' : ''}`}
                    </div>
                  </div>

                  {/* Fix: "Ir al curso" ahora va al curso, no al foro */}
                  <Link to={`/curso/${c.slug}`} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border py-2.5 font-bold hover:bg-muted transition-colors">
                    {tr('goToCourse')} <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function BookIcon({ name }: { name?: string }) {
  const icons: Record<string, string> = {
    Tractor: '🚜', Sprout: '🌱', MapPin: '📍', Scissors: '✂️',
    Sun: '☀️', CloudRain: '🌧️', Coins: '💰', Monitor: '💻',
    Scissors2: '🧵', Leaf: '🌿', Utensils: '🍽️', Mountain: '⛰️',
    Droplets: '💧', FlaskConical: '🌿',
  };
  return <span className="text-2xl">{icons[name || ''] || '📚'}</span>;
}
