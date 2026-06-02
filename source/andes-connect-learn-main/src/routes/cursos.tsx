import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Layers, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { FloatingChat } from "@/components/FloatingChat";
import { AndeanBorder } from "@/components/AndeanBorder";
import { COURSES, CATEGORY_META, type CourseCategory } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/SpeakButton";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos — Allin Yachay" },
      {
        name: "description",
        content:
          "Pasarela completa de cursos: ganadería, cultivo, riego, alquiler de tierras, energía solar, textiles, clima andino, finanzas y primeros pasos digitales.",
      },
      { property: "og:title", content: "Cursos · Allin Yachay" },
      {
        property: "og:description",
        content: "Cursos pensados para la vida en la sierra del Perú.",
      },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { tr, trCourse, trCategory, trLevel, trDuration } = useI18n();
  const categories = Object.keys(CATEGORY_META) as CourseCategory[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mb-6 rounded-full border-2 font-bold"
          >
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> {tr("backHome")}
            </Link>
          </Button>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">
            {tr("catalogEyebrow")}
          </p>
          <h1 className="mt-2 text-balance text-5xl font-bold md:text-6xl">
            {tr("catalogTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {tr("coursesDesc")} {tr("catalogDesc")}
          </p>
          <div className="mt-5">
            <SpeakButton
              id="cursos-intro"
              size="lg"
              text={`${tr("catalogTitle")}. ${tr("coursesDesc")} ${tr("catalogDesc")}`}
              className="h-12 rounded-2xl"
            />
          </div>
        </div>
      </section>
      <AndeanBorder />

      <section className="mx-auto max-w-6xl px-6 py-14 space-y-16">
        {categories.map((cat) => {
          const list = COURSES.filter((c) => c.category === cat);
          if (list.length === 0) return null;
          const meta = CATEGORY_META[cat];
          const label = trCategory(cat, "label");
          const desc = trCategory(cat, "desc");
          return (
            <div key={cat}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-warm ${meta.tone}`}
                  >
                    {label}
                  </span>
                  <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
                    {label}
                  </h2>
                  <p className="mt-1 text-muted-foreground">{desc}</p>
                </div>
                <span className="text-sm font-bold text-muted-foreground">
                  {list.length} {list.length === 1 ? tr("coursesCountOne") : tr("coursesCountMany")}
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {list.map((c) => {
                  const title = trCourse(c.id, "title");
                  const short = trCourse(c.id, "short");
                  const level = trLevel(c.level);
                  const duration = trDuration(c.duration);
                  return (
                  <article
                    key={c.id}
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
                        <c.icon className="h-4 w-4" /> {level}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <h3 className="font-display text-2xl font-bold leading-tight">
                        {title}
                      </h3>
                      <p className="flex-1 text-muted-foreground">{short}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-4 w-4" /> {duration}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Layers className="h-4 w-4" /> {level}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          asChild
                          className="h-12 flex-1 rounded-2xl text-base font-bold shadow-warm"
                        >
                          <Link to="/curso/$courseId" params={{ courseId: c.id }}>
                            {tr("enterCourse")} <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                        <SpeakButton
                          id={`course-list-${c.id}`}
                          size="icon"
                          text={`${title}. ${short}. ${duration}. ${level}.`}
                        />
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <FloatingChat />
    </div>
  );
}
