import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { FloatingChat } from "@/components/FloatingChat";
import { AndeanBorder } from "@/components/AndeanBorder";
import { SpeakButton } from "@/components/SpeakButton";
import { COURSES } from "@/lib/courses";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/foros")({
  head: () => ({
    meta: [
      { title: "Foros por curso — Allin Yachay" },
      {
        name: "description",
        content:
          "Cada curso tiene su propio foro para que aprendices y profesores conversen sin mezclar temas.",
      },
      { property: "og:title", content: "Foros de Allin Yachay" },
      {
        property: "og:description",
        content: "Pregunta y comparte experiencias por curso, a tu ritmo.",
      },
    ],
  }),
  component: ForosIndex,
});

function ForosIndex() {
  const { tr, trCourse } = useI18n();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">{tr("forosEyebrow")}</p>
          <h1 className="mt-2 text-balance text-5xl font-bold md:text-6xl">
            {tr("forosTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {tr("forosDesc")}
          </p>
          <div className="mt-5">
            <SpeakButton
              id="foros-intro"
              size="lg"
              className="h-12 rounded-2xl"
              text={`${tr("forosTitle")}. ${tr("forosDesc")}`}
            />
          </div>
        </div>
      </section>
      <AndeanBorder />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <ul className="grid gap-4 md:grid-cols-2">
          {COURSES.map((c) => (
            <li key={c.id}>
              <Link
                to="/foros/$courseId"
                params={{ courseId: c.id }}
                className="group flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-warm"
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-warm ${c.tone}`}
                >
                  <c.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-xl font-bold leading-tight">
                    {trCourse(c.id, "title")}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" /> {tr("courseForumLabel")}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FloatingChat />
    </div>
  );
}
