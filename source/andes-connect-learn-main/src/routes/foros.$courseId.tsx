import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  MessageSquarePlus,
  Send,
  User as UserIcon,
  Clock,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { FloatingChat } from "@/components/FloatingChat";
import { AndeanBorder } from "@/components/AndeanBorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCourse } from "@/lib/courses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Thread = {
  id: string;
  course_id: string;
  title: string;
  body: string;
  author_id: string;
  created_at: string;
  profiles?: { display_name: string | null; community: string | null } | null;
};

type Reply = {
  id: string;
  thread_id: string;
  body: string;
  author_id: string;
  created_at: string;
  profiles?: { display_name: string | null; community: string | null } | null;
};

export const Route = createFileRoute("/foros/$courseId")({
  beforeLoad: ({ params }) => {
    if (!getCourse(params.courseId)) throw notFound();
  },
  head: ({ params }) => {
    const c = getCourse(params.courseId);
    const title = c ? `Foro · ${c.title} — Allin Yachay` : "Foro — Allin Yachay";
    const desc = c
      ? `Conversación de la comunidad sobre ${c.title.toLowerCase()}.`
      : "Foros por curso de Allin Yachay.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: CourseForum,
});

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "ahora";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}

function CourseForum() {
  const { courseId } = Route.useParams();
  const course = getCourse(courseId)!;
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forum_threads")
      .select("*, profiles:author_id(display_name, community)")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("No se pudieron cargar los temas");
    } else {
      setThreads((data as unknown as Thread[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [courseId]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="bg-gradient-soft">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-6 py-10">
          <Link
            to="/foros"
            className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Todos los foros
          </Link>
          <div className="flex flex-1 items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-warm ${course.tone}`}
            >
              <course.icon className="h-8 w-8" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-primary">Foro del curso</p>
              <h1 className="text-balance text-3xl font-bold leading-tight md:text-4xl">
                {course.title}
              </h1>
            </div>
          </div>
          <NewThreadDialog
            courseId={courseId}
            open={openNew}
            setOpen={setOpenNew}
            onCreated={load}
            disabled={!user}
          />
        </div>
      </section>
      <AndeanBorder />

      <section className="mx-auto max-w-5xl px-6 py-10">
        {!user && (
          <div className="mb-6 rounded-2xl border-2 border-primary/30 bg-card p-5 text-base">
            Para escribir en el foro,{" "}
            <Link to="/auth" className="font-bold text-primary underline">
              inicia sesión gratis
            </Link>
            . Leer es libre para todos.
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground">Cargando temas…</div>
        ) : threads.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center">
            <p className="font-display text-2xl font-bold">Sé el primero en preguntar</p>
            <p className="mt-2 text-muted-foreground">
              Aún no hay temas en este curso. ¡Comparte tu pregunta o experiencia!
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {threads.map((t) => (
              <li
                key={t.id}
                className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <span className="font-bold text-foreground">
                      {t.profiles?.display_name ?? "Aprendiz"}
                    </span>
                    {t.profiles?.community && <span>· {t.profiles.community}</span>}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {timeAgo(t.created_at)}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold leading-tight">
                  {t.title}
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-foreground/90">{t.body}</p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setOpenThreadId(openThreadId === t.id ? null : t.id)
                    }
                    className="rounded-2xl border-2 font-bold"
                  >
                    {openThreadId === t.id ? "Ocultar respuestas" : "Ver respuestas"}
                  </Button>
                </div>
                {openThreadId === t.id && (
                  <ThreadReplies threadId={t.id} canReply={!!user} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <FloatingChat />
    </div>
  );
}

function NewThreadDialog({
  courseId,
  open,
  setOpen,
  onCreated,
  disabled,
}: {
  courseId: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  onCreated: () => void;
  disabled?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const submit = async () => {
    if (!user) return;
    if (!title.trim() || !body.trim()) {
      toast.error("Pon un título y una pregunta");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("forum_threads").insert({
      course_id: courseId,
      title: title.trim(),
      body: body.trim(),
      author_id: user.id,
    });
    setSubmitting(false);
    if (error) {
      toast.error("No se pudo publicar");
      return;
    }
    setTitle("");
    setBody("");
    setOpen(false);
    toast.success("Tema publicado");
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="ml-auto h-12 rounded-2xl px-5 font-bold shadow-warm"
        >
          <MessageSquarePlus className="mr-1 h-5 w-5" /> Nuevo tema
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Nueva pregunta o tema</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Título corto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 text-base"
          />
          <Textarea
            placeholder="Cuenta tu pregunta o experiencia con detalle…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="text-base"
          />
          <Button
            onClick={submit}
            disabled={submitting}
            className="h-12 w-full rounded-2xl font-bold"
          >
            {submitting ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ThreadReplies({
  threadId,
  canReply,
}: {
  threadId: string;
  canReply: boolean;
}) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forum_replies")
      .select("*, profiles:author_id(display_name, community)")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (error) console.error(error);
    setReplies((data as unknown as Reply[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [threadId]); // eslint-disable-line

  const send = async () => {
    if (!user || !body.trim()) return;
    setSending(true);
    const { error } = await supabase.from("forum_replies").insert({
      thread_id: threadId,
      body: body.trim(),
      author_id: user.id,
    });
    setSending(false);
    if (error) {
      toast.error("No se pudo enviar");
      return;
    }
    setBody("");
    load();
  };

  return (
    <div className="mt-5 space-y-3 border-t-2 border-border pt-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando respuestas…</p>
      ) : replies.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay respuestas. ¡Sé el primero!
        </p>
      ) : (
        <ul className="space-y-3">
          {replies.map((r) => (
            <li key={r.id} className="rounded-2xl bg-muted/60 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="font-bold text-foreground">
                  {r.profiles?.display_name ?? "Aprendiz"}
                </span>
                <span>· {timeAgo(r.created_at)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
      {canReply ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Textarea
            placeholder="Escribe tu respuesta…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            className="flex-1 text-base"
          />
          <Button
            onClick={send}
            disabled={sending || !body.trim()}
            className="h-12 rounded-2xl font-bold sm:self-end"
          >
            <Send className="mr-1 h-4 w-4" /> Responder
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link to="/auth" className="font-bold text-primary underline">
            Inicia sesión
          </Link>{" "}
          para responder.
        </p>
      )}
    </div>
  );
}
