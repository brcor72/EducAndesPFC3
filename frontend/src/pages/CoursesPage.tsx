import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Layers, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AndeanBorder } from '../components/layout/AndeanBorder';
import { coursesService } from '../services/courses.service';
import { useI18nStore } from '../store/i18n.store';
import { useDownloadsStore } from '../store/downloads.store';
import { SpeakButton } from '../components/audio/SpeakButton';

const CATEGORY_FILTER_KEYS: Record<string, string> = {
  ALL: 'filterAll',
  CAMPO: 'filterCampo',
  NEGOCIO: 'filterNegocio',
  TECNOLOGIA: 'filterTech',
  ENERGIA: 'filterEnergia',
};

const CATEGORY_TONE: Record<string, string> = {
  CAMPO: 'bg-puna text-puna-foreground',
  NEGOCIO: 'bg-sun text-sun-foreground',
  TECNOLOGIA: 'bg-primary text-primary-foreground',
  ENERGIA: 'bg-earth text-earth-foreground',
};

import { useAuthStore } from '../store/auth.store';

export default function CoursesPage() {
  const { user } = useAuthStore();
  const { tr, lang } = useI18nStore();
  const userDownloads = useDownloadsStore((state) => user ? state.userDownloads[user.id] : undefined) || [];
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    if (window.location.hash === '#downloads') {
      setActiveCategory('DOWNLOADS');
      // Limpiar hash para no estancar la URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        if (!navigator.onLine) throw new Error('Offline');
        return await coursesService.getAll();
      } catch (err) {
        // Fallback to locally downloaded courses when offline
        const offlineCourses = useDownloadsStore.getState().offlineCourses;
        return Object.values(offlineCourses || {});
      }
    },
  });

  const filtered = courses.filter((c: any) => {
    if (activeCategory === 'DOWNLOADS' && !userDownloads.includes(c.id) && !userDownloads.includes(c.slug)) return false;
    const matchCat = activeCategory === 'ALL' || activeCategory === 'DOWNLOADS' || c.category === activeCategory;
    const courseTitle = c.title.toLowerCase();
    const courseShort = c.short.toLowerCase();
    const matchSearch = !search || courseTitle.includes(search.toLowerCase()) || courseShort.includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const categories = ['ALL', 'DOWNLOADS', 'CAMPO', 'NEGOCIO', 'TECNOLOGIA', 'ENERGIA'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">{tr('catalogEyebrow')}</p>
          <div className="mt-2 flex items-start gap-3">
            <h1 className="text-balance text-5xl font-bold md:text-6xl flex-1">{tr('catalogTitle')}</h1>
            <SpeakButton text={tr('catalogTitle') + '. ' + tr('catalogDesc')} size="md" className="mt-2 shrink-0" />
          </div>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{tr('catalogDesc')}</p>
        </div>
      </section>
      <AndeanBorder />

      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Search + filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr('searchCourses')}
              className="w-full rounded-2xl border-2 border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-warm'
                    : 'border-2 border-border hover:bg-muted'
                }`}
              >
                {cat === 'DOWNLOADS' ? 'Mis descargas' : tr(CATEGORY_FILTER_KEYS[cat])}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="mb-6 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? tr('coursesCountOne') : tr('coursesCountMany')}
        </p>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-muted" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center text-muted-foreground">
            <span className="text-5xl">🔍</span>
            <p className="text-lg font-bold">{tr('noCoursesFound')}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c: any) => (
              <Link
                key={c.id}
                to={`/curso/${c.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-warm hover:border-primary/50"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={c.imageUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-warm ${CATEGORY_TONE[c.category] ?? 'bg-muted text-foreground'}`}>
                    {tr(CATEGORY_FILTER_KEYS[c.category] ?? 'filterAll')}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-start gap-2">
                    <h3 className="font-display text-xl font-bold leading-tight flex-1">{c.title}</h3>
                    <SpeakButton text={c.title + '. ' + c.short} />
                  </div>
                  <p className="flex-1 text-sm text-muted-foreground">{c.short}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {c.durationWeeks} {tr('courseWeeks')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> {c.level}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                    {tr('enterCourse')} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
