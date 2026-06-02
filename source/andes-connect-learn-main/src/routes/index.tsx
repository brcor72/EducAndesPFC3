import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mountain,
  Sprout,
  Volume2,
  Coins,
  PlayCircle,
  ArrowRight,
  Sun,
  Users,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { AndeanBorder } from "@/components/AndeanBorder";
import { SiteHeader } from "@/components/SiteHeader";
import { FloatingChat } from "@/components/FloatingChat";
import { Tutorial, useAutoTutorial } from "@/components/Tutorial";
import { SpeakButton } from "@/components/SpeakButton";
import heroImg from "@/assets/hero-andes.jpg";
import { COURSES } from "@/lib/courses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Allin Yachay — Cursos de tecnología para la sierra del Perú" },
      {
        name: "description",
        content:
          "ONG que enseña tecnología y automatización a comunidades andinas en quechua, aymara, shipibo y español. Ganadería, cultivo y alquiler de tierras.",
      },
      { property: "og:title", content: "Allin Yachay — Tecnología para la sierra" },
      {
        property: "og:description",
        content: "Aprende automatización para tu chacra en tu idioma.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { tr } = useI18n();
  const tut = useAutoTutorial();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader onOpenTutorial={() => tut.setOpen(true)} />
      <main>
        <Hero onOpenTutorial={() => tut.setOpen(true)} />
        <AndeanBorder />
        <CoursesPreview />
        <Why />
        <Testimonials />
        <CTA />
      </main>
      <footer className="border-t-2 border-border bg-card">
        <AndeanBorder />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-display text-base text-foreground">
            <Sun className="h-5 w-5 text-primary" /> Allin Yachay
          </div>
          <p>{tr("footerNote")}</p>
          <SpeakButton id="footer" size="sm" text={tr("footerNote")} />
        </div>
      </footer>

      <Tutorial open={tut.open} onOpenChange={tut.setOpen} />
      <FloatingChat />
    </div>
  );
}

function Hero({ onOpenTutorial }: { onOpenTutorial: () => void }) {
  const { tr } = useI18n();
  return (
    <section className="relative overflow-hidden bg-gradient-soft">
      <div className="absolute inset-0 bg-andino-pattern opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-card px-4 py-1.5 text-sm font-bold text-primary shadow-soft">
            <Sun className="h-4 w-4" /> {tr("heroEyebrow")}
          </span>
          <h1 className="text-balance text-5xl font-bold leading-[1.05] md:text-6xl">
            {tr("heroTitle")}
          </h1>
          <p className="text-balance text-lg text-muted-foreground md:text-xl">
            {tr("heroDesc")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              asChild
              className="h-14 rounded-2xl bg-primary px-7 text-lg font-bold shadow-warm hover:bg-primary/90"
            >
              <Link to="/cursos">
                {tr("ctaStart")} <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenTutorial}
              className="h-14 rounded-2xl border-2 px-7 text-lg font-bold"
            >
              <PlayCircle className="mr-1 h-5 w-5" /> {tr("ctaWatch")}
            </Button>
            <SpeakButton
              id="hero"
              size="lg"
              text={`${tr("heroTitle")}. ${tr("heroDesc")}`}
              className="h-14 rounded-2xl border-2 px-6 text-base font-bold"
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { icon: Coins, label: tr("freeTag"), cls: "bg-puna text-puna-foreground" },
              { icon: Volume2, label: tr("audioTag"), cls: "bg-sun text-sun-foreground" },
              { icon: Sprout, label: tr("visualTag"), cls: "bg-sky text-sky-foreground" },
            ].map((b) => (
              <span
                key={b.label}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${b.cls}`}
              >
                <b.icon className="h-4 w-4" /> {b.label}
              </span>
            ))}
          </div>
        </div>
        <div className="relative">
          <div
            className="absolute -inset-4 rounded-[2rem] bg-gradient-sunrise opacity-30 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-card shadow-warm">
            <img
              src={heroImg}
              alt="Mujer andina con tableta junto a llamas en paisaje serrano"
              width={1536}
              height={1152}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CoursesPreview() {
  const { tr, trCourse } = useI18n();
  const featured = COURSES.slice(0, 3);
  return (
    <section id="cursos" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-balance text-4xl font-bold md:text-5xl">{tr("coursesTitle")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{tr("coursesDesc")}</p>
        </div>
        <Button asChild variant="outline" className="rounded-2xl border-2 font-bold">
          <Link to="/cursos">
            {tr("seeAllCourses")} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-7 md:grid-cols-3">
        {featured.map((c) => {
          const title = trCourse(c.id, "title");
          const short = trCourse(c.id, "short");
          return (
          <Link
            key={c.id}
            to="/curso/$courseId"
            params={{ courseId: c.id }}
            className="group flex flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-soft transition-transform hover:-translate-y-1 hover:shadow-warm"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={c.image}
                alt={title}
                loading="lazy"
                width={1024}
                height={768}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div
                className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold shadow-warm ${c.tone}`}
              >
                <c.icon className="h-4 w-4" /> {tr("courseTag")}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6">
              <h3 className="font-display text-2xl font-bold">{title}</h3>
              <p className="flex-1 text-muted-foreground">{short}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-base font-bold text-primary">
                  {tr("startLabel")} <ArrowRight className="h-4 w-4" />
                </span>
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <SpeakButton
                    id={`course-${c.id}`}
                    size="sm"
                    text={`${title}. ${short}`}
                  />
                </span>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}

function Why() {
  const { tr } = useI18n();
  const items = [
    { icon: Volume2, title: tr("why1"), desc: tr("why1d"), bg: "bg-primary text-primary-foreground" },
    {
      icon: GraduationCap,
      title: tr("why2"),
      desc: tr("why2d"),
      bg: "bg-puna text-puna-foreground",
    },
    { icon: Coins, title: tr("why3"), desc: tr("why3d"), bg: "bg-earth text-earth-foreground" },
  ];
  return (
    <section id="nosotros" className="bg-card">
      <AndeanBorder />
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="max-w-2xl text-balance text-4xl font-bold md:text-5xl">
            {tr("whyTitle")}
          </h2>
          <SpeakButton
            id="why-title"
            size="md"
            text={`${tr("whyTitle")}. ${items.map((i) => `${i.title}. ${i.desc}`).join(" ")}`}
          />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((i, idx) => (
            <div
              key={i.title}
              className="rounded-3xl border-2 border-border bg-background p-7 shadow-soft"
            >
              <div
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${i.bg} shadow-warm`}
              >
                <i.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl font-bold">{i.title}</h3>
              <p className="mt-2 text-muted-foreground">{i.desc}</p>
              <div className="mt-3">
                <SpeakButton
                  id={`why-${idx}`}
                  size="sm"
                  text={`${i.title}. ${i.desc}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { tr } = useI18n();
  const items = [
    { quote: tr("test1"), name: tr("test1n"), color: "bg-sun" },
    { quote: tr("test2"), name: tr("test2n"), color: "bg-sky" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-balance text-4xl font-bold md:text-5xl">{tr("testTitle")}</h2>
        <SpeakButton
          id="test-title"
          size="md"
          text={`${tr("testTitle")}. ${items.map((t) => `${t.quote} ${t.name}`).join(". ")}`}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((t, i) => (
          <figure
            key={i}
            className="relative overflow-hidden rounded-3xl border-2 border-border bg-card p-8 shadow-soft"
          >
            <div
              className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${t.color} opacity-50 blur-2xl`}
              aria-hidden="true"
            />
            <blockquote className="relative font-display text-2xl leading-snug">
              {t.quote}
            </blockquote>
            <figcaption className="relative mt-5 text-base font-bold text-primary">
              {t.name}
            </figcaption>
            <div className="relative mt-4">
              <SpeakButton
                id={`test-${i}`}
                size="sm"
                text={`${t.quote} ${t.name}`}
              />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  const { tr } = useI18n();
  return (
    <section id="contacto" className="px-6 pb-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-sunrise p-10 text-primary-foreground shadow-warm md:p-16">
        <div className="absolute inset-0 bg-andino-pattern opacity-20" aria-hidden="true" />
        <div className="relative flex flex-col items-start gap-6">
          <h2 className="text-balance font-display text-4xl font-bold md:text-5xl">
            {tr("ctaTitle")}
          </h2>
          <p className="max-w-2xl text-lg opacity-95">{tr("ctaDesc")}</p>
          <SpeakButton
            id="cta"
            size="md"
            text={`${tr("ctaTitle")}. ${tr("ctaDesc")}`}
            className="bg-card/20 text-primary-foreground hover:bg-card/30"
          />
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              asChild
              className="h-14 rounded-2xl bg-card px-8 text-lg font-bold text-primary shadow-warm hover:bg-card/90"
            >
              <Link to="/auth">
                {tr("ctaButton")} <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-14 rounded-2xl border-2 border-primary-foreground/40 bg-transparent px-7 text-lg font-bold text-primary-foreground hover:bg-card/10"
            >
              <Link to="/foros">
                <Users className="mr-1 h-5 w-5" /> {tr("ctaForums")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Mountain unused fix
void Mountain;
