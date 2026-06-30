import { Link } from 'react-router-dom';
import { ArrowRight, Sun, Volume2, Sprout, Coins, GraduationCap, Users, PlayCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AndeanBorder } from '../components/layout/AndeanBorder';
import { useI18nStore } from '../store/i18n.store';
import { coursesService } from '../services/courses.service';
import { SpeakButton } from '../components/audio/SpeakButton';

export default function HomePage() {
  const { tr, lang } = useI18nStore();
  const { data: courses = [] } = useQuery({
    queryKey: ['courses', lang],
    queryFn: () => coursesService.getAll(),
  });

  const featured = courses.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-soft">
        <div className="absolute inset-0 bg-andino-pattern opacity-40" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-card px-4 py-1.5 text-sm font-bold text-primary shadow-soft">
              <Sun className="h-4 w-4" /> {tr('heroEyebrow')}
            </span>
            <div className="flex items-start gap-3">
              <h1 className="text-balance text-5xl font-bold leading-tight md:text-6xl flex-1">
                {tr('heroTitle')}
              </h1>
              <SpeakButton text={tr('heroTitle') + '. ' + tr('heroDesc')} size="md" className="mt-2 shrink-0" />
            </div>
            <p className="text-balance text-lg text-muted-foreground md:text-xl">
              {tr('heroDesc')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/cursos"
                className="inline-flex h-14 items-center gap-2 rounded-2xl bg-primary px-7 text-lg font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
              >
                {tr('ctaStart')} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex h-14 items-center gap-2 rounded-2xl border-2 border-border px-7 text-lg font-bold hover:bg-muted transition-colors"
              >
                <PlayCircle className="h-5 w-5" /> {tr('ctaWatch')}
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { icon: Coins, label: tr('freeTag'), cls: 'bg-puna text-puna-foreground' },
                { icon: Volume2, label: tr('audioTag'), cls: 'bg-sun text-sun-foreground' },
                { icon: Sprout, label: tr('visualTag'), cls: 'bg-sky text-sky-foreground' },
              ].map((b) => (
                <span key={b.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${b.cls}`}>
                  <b.icon className="h-4 w-4" /> {b.label}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-sunrise opacity-30 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-card shadow-warm">
              <video
                src="/video_portada.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      <AndeanBorder />

      {/* Featured Courses */}
      {featured.length > 0 && (
        <section id="cursos" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <h2 className="text-balance text-4xl font-bold md:text-5xl">{tr('coursesTitle')}</h2>
                <SpeakButton text={tr('coursesTitle') + '. ' + tr('coursesDesc')} />
              </div>
              <p className="mt-4 text-lg text-muted-foreground">{tr('coursesDesc')}</p>
            </div>
            <Link to="/cursos" className="inline-flex items-center gap-2 rounded-2xl border-2 border-border px-5 py-2.5 font-bold hover:bg-muted transition-colors">
              {tr('seeAllCourses')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {featured.map((c: any) => (
              <Link
                key={c.id}
                to={`/curso/${c.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-soft transition-transform hover:-translate-y-1 hover:shadow-warm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img src={c.imageUrl || `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400`}
                    alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-warm">
                    {tr('courseTag')}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="font-display text-2xl font-bold">{c.title}</h3>
                  <p className="flex-1 text-muted-foreground">{c.short}</p>
                  <span className="inline-flex items-center gap-1 text-base font-bold text-primary">
                    {tr('startLabel')} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Course carousel — all courses */}
      {courses.length > 3 && (
        <section className="bg-muted/40 py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-6 flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold">{tr('catalogTitle')}</h2>
              <SpeakButton text={tr('catalogTitle')} />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
              {courses.map((c: any) => (
                <Link
                  key={c.id}
                  to={`/curso/${c.slug}`}
                  className="group flex min-w-[220px] flex-col overflow-hidden rounded-2xl border-2 border-border bg-card shadow-soft snap-start hover:border-primary/50 hover:-translate-y-1 transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={c.imageUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300'}
                      alt={c.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-sm leading-tight">{c.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.durationWeeks} {tr('courseWeeks')}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why section */}
      <section className="bg-card">
        <AndeanBorder />
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="max-w-2xl text-balance text-4xl font-bold md:text-5xl">{tr('whyTitle')}</h2>
            <SpeakButton text={tr('whyTitle')} />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Volume2, title: tr('why1'), desc: tr('why1d'), bg: 'bg-primary text-primary-foreground' },
              { icon: GraduationCap, title: tr('why2'), desc: tr('why2d'), bg: 'bg-puna text-puna-foreground' },
              { icon: Coins, title: tr('why3'), desc: tr('why3d'), bg: 'bg-earth text-earth-foreground' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border-2 border-border bg-background p-7 shadow-soft">
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} shadow-warm`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="flex items-start gap-2">
                  <h3 className="font-display text-2xl font-bold flex-1">{item.title}</h3>
                  <SpeakButton text={item.title + '. ' + item.desc} />
                </div>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-balance text-4xl font-bold md:text-5xl">{tr('testTitle')}</h2>
          <SpeakButton text={tr('testTitle')} />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { quote: tr('test1'), name: tr('test1n'), color: 'bg-sun' },
            { quote: tr('test2'), name: tr('test2n'), color: 'bg-sky' },
          ].map((t, i) => (
            <figure key={i} className="relative overflow-hidden rounded-3xl border-2 border-border bg-card p-8 shadow-soft">
              <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${t.color} opacity-50 blur-2xl`} />
              <div className="relative flex items-start gap-2">
                <blockquote className="font-display text-2xl leading-snug flex-1">{t.quote}</blockquote>
                <SpeakButton text={t.quote + ' ' + t.name} />
              </div>
              <figcaption className="relative mt-5 text-base font-bold text-primary">{t.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-sunrise p-10 text-primary-foreground shadow-warm md:p-16">
          <div className="absolute inset-0 bg-andino-pattern opacity-20" />
          <div className="relative flex flex-col items-start gap-6">
            <div className="flex items-center gap-3">
              <h2 className="text-balance font-display text-4xl font-bold md:text-5xl">{tr('ctaTitle')}</h2>
              <SpeakButton text={tr('ctaTitle') + '. ' + tr('ctaDesc')} className="text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/20" />
            </div>
            <p className="max-w-2xl text-lg opacity-95">{tr('ctaDesc')}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth" className="inline-flex h-14 items-center gap-2 rounded-2xl bg-card px-8 text-lg font-bold text-primary shadow-warm hover:bg-card/90 transition-colors">
                {tr('ctaButton')} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/foros" className="inline-flex h-14 items-center gap-2 rounded-2xl border-2 border-primary-foreground/40 bg-transparent px-7 text-lg font-bold text-primary-foreground hover:bg-card/10 transition-colors">
                <Users className="h-5 w-5" /> {tr('ctaForums')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-border bg-card">
        <AndeanBorder />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-display text-base text-foreground">
            <Sun className="h-5 w-5 text-primary" /> EducAndes — EducAndes
          </div>
          <div className="flex items-center gap-2">
            <p>{tr('footerNote')}</p>
            <SpeakButton text={tr('footerNote')} />
          </div>
        </div>
      </footer>
    </div>
  );
}
