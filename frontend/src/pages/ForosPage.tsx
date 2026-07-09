import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AndeanBorder } from '../components/layout/AndeanBorder';
import { coursesService } from '../services/courses.service';
import { useI18nStore } from '../store/i18n.store';
import { SpeakButton } from '../components/audio/SpeakButton';

const ICON_MAP: Record<string, string> = {
  Tractor: '🚜', Sprout: '🌱', MapPin: '📍', Scissors: '✂️',
  Sun: '☀️', CloudRain: '🌧️', Coins: '💰', Monitor: '💻',
  Scissors2: '🧵', Leaf: '🌿', Utensils: '🍽️', Mountain: '⛰️',
  Droplets: '💧',
};

export default function ForosPage() {
  const { tr, lang } = useI18nStore();
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', lang],
    queryFn: () => coursesService.getAll(),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">{tr('forumsEyebrow')}</p>
          <div className="mt-2 flex items-start gap-3">
            <h1 className="text-balance text-5xl font-bold md:text-6xl flex-1">{tr('forumsTitle')}</h1>
            <SpeakButton text={tr('forumsTitle') + '. ' + tr('forumsDesc')} size="md" className="mt-2 shrink-0" />
          </div>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{tr('forumsDesc')}</p>
        </div>
      </section>
      <AndeanBorder />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="mb-6 text-muted-foreground">{tr('forumsSelectCourse')}</p>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-3xl bg-muted" />)}
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {courses.map((c: any) => (
              <li key={c.id}>
                <Link to={`/foros/${c.slug}`}
                  className="group flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-warm hover:border-primary/50">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-warm text-2xl">
                    {ICON_MAP[c.iconName] ?? '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-display text-xl font-bold leading-tight truncate">{c.title}</div>
                      <SpeakButton text={c.title + '. ' + tr('courseForumLabel')} />
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" /> {tr('courseForumLabel')}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
