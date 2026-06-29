import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquarePlus, Send, Clock, Trash2 } from 'lucide-react';
import { UserAvatar } from '../components/avatar/UserAvatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AndeanBorder } from '../components/layout/AndeanBorder';
import { coursesService, forumsService } from '../services/courses.service';
import { useAuthStore } from '../store/auth.store';
import { useI18nStore } from '../store/i18n.store';
import { SpeakButton } from '../components/audio/SpeakButton';

const ICON_MAP: Record<string, string> = {
  Tractor: '🚜', Sprout: '🌱', MapPin: '📍', Scissors: '✂️',
  Sun: '☀️', CloudRain: '🌧️', Coins: '💰', Monitor: '💻',
  Scissors2: '🧵', Leaf: '🌿', Utensils: '🍽️', Mountain: '⛰️',
  Droplets: '💧',
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}

export default function ForoCursoPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuthStore();
  const { tr } = useI18nStore();
  const qc = useQueryClient();
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesService.getOne(courseId!),
  });

  const { data: threadsData, isLoading } = useQuery({
    queryKey: ['threads', courseId],
    queryFn: () => forumsService.getThreads(courseId!),
  });

  const threads = threadsData?.data ?? threadsData ?? [];

  const createThreadMutation = useMutation({
    mutationFn: () => forumsService.createThread(courseId!, newTitle.trim(), newBody.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['threads', courseId] });
      setNewTitle(''); setNewBody(''); setShowNew(false);
      toast.success(tr('forumSend'));
    },
    onError: () => toast.error('No se pudo publicar'),
  });

  const deleteThreadMutation = useMutation({
    mutationFn: (id: string) => forumsService.deleteThread(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['threads', courseId] }); toast.success(tr('forumDelete')); },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="bg-gradient-soft">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-6 py-10">
          <Link to="/foros" className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> {tr('forumBack')}
          </Link>
          <div className="flex flex-1 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-3xl shadow-warm">
              {ICON_MAP[course?.iconName] ?? '📚'}
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-primary">{tr('forumsTitle')}</p>
              <div className="flex items-center gap-2">
                <h1 className="text-balance text-3xl font-bold leading-tight md:text-4xl">{course?.title ?? courseId}</h1>
                <SpeakButton text={course?.title ?? ''} size="md" />
              </div>
            </div>
          </div>
          {user && (
            <button onClick={() => setShowNew((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors">
              <MessageSquarePlus className="h-5 w-5" /> {tr('forumNew')}
            </button>
          )}
        </div>
      </section>
      <AndeanBorder />

      <section className="mx-auto max-w-5xl px-6 py-10">
        {!user && (
          <div className="mb-6 rounded-2xl border-2 border-primary/30 bg-card p-5">
            {tr('loginToSave')}, <Link to="/auth" className="font-bold text-primary underline">{tr('navEnter')}</Link>.
          </div>
        )}

        {showNew && (
          <div className="mb-6 rounded-3xl border-2 border-border bg-card p-6 shadow-warm">
            <h3 className="mb-4 font-display text-xl font-bold">{tr('forumNew')}</h3>
            <input
              placeholder={tr('forumNewTitle')}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mb-3 h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
            />
            <textarea
              placeholder={tr('forumNewBody')}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={5}
              className="mb-3 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => createThreadMutation.mutate()}
                disabled={!newTitle.trim() || !newBody.trim() || createThreadMutation.isPending}
                className="flex-1 rounded-2xl bg-primary py-2.5 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {createThreadMutation.isPending ? '...' : tr('forumSend')}
              </button>
              <button onClick={() => setShowNew(false)} className="rounded-2xl border-2 border-border px-5 font-bold hover:bg-muted transition-colors">
                ✕
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted" />)}
          </div>
        ) : !threads.length ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center">
            <p className="font-display text-2xl font-bold">{tr('forumNoThreads')}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {threads.map((t: any) => (
              <li key={t.id} className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <UserAvatar profile={t.author} size={32} />
                      <span className="font-bold text-foreground">{t.author?.displayName ?? 'Aprendiz'}</span>
                      {t.author?.community && <span>· {t.author.community}</span>}
                    </span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {timeAgo(t.createdAt)}</span>
                    {t._count?.replies > 0 && (
                      <span className="text-primary font-bold">{t._count.replies} {tr('forumReplies')}</span>
                    )}
                  </div>
                  {user && (user.id === t.authorId || user.role?.name === 'admin') && (
                    <button onClick={() => deleteThreadMutation.mutate(t.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-start gap-2">
                  <h2 className="font-display text-2xl font-bold leading-tight flex-1">{t.title}</h2>
                  <SpeakButton text={t.title + '. ' + t.body} />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-foreground/90">{t.body}</p>
                <div className="mt-4">
                  <button
                    onClick={() => setOpenThreadId(openThreadId === t.id ? null : t.id)}
                    className="rounded-2xl border-2 border-border px-4 py-2 font-bold hover:bg-muted transition-colors text-sm"
                  >
                    {openThreadId === t.id ? '▲' : '▼'} {tr('forumReplies')} {t._count?.replies > 0 ? `(${t._count.replies})` : ''}
                  </button>
                </div>
                {openThreadId === t.id && <ThreadReplies threadId={t.id} canReply={!!user} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ThreadReplies({ threadId, canReply }: { threadId: string; canReply: boolean }) {
  const { tr } = useI18nStore();
  const qc = useQueryClient();
  const [body, setBody] = useState('');

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ['replies', threadId],
    queryFn: () => forumsService.getReplies(threadId),
  });

  const replyMutation = useMutation({
    mutationFn: () => forumsService.createReply(threadId, body.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['replies', threadId] });
      qc.invalidateQueries({ queryKey: ['threads'] });
      setBody('');
      toast.success(tr('forumReply'));
    },
    onError: () => toast.error('No se pudo enviar'),
  });

  return (
    <div className="mt-5 space-y-3 border-t-2 border-border pt-4">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">...</p>
      ) : !replies.length ? (
        <p className="text-sm text-muted-foreground">{tr('forumNoThreads')}</p>
      ) : (
        <ul className="space-y-3">
          {(replies as any[]).map((r: any) => (
            <li key={r.id} className="rounded-2xl bg-muted/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserAvatar profile={r.author} size={28} />
                  <span className="font-bold text-foreground">{r.author?.displayName ?? 'Aprendiz'}</span>
                  <span>· {timeAgo(r.createdAt)}</span>
                </div>
                <SpeakButton text={r.body} />
              </div>
              <p className="mt-1 whitespace-pre-wrap">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
      {canReply ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <textarea
            placeholder={tr('forumWriteReply')}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            className="flex-1 rounded-xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary resize-none"
          />
          <button
            onClick={() => replyMutation.mutate()}
            disabled={replyMutation.isPending || !body.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 disabled:opacity-60 transition-colors sm:self-end"
          >
            <Send className="h-4 w-4" /> {tr('forumReply')}
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link to="/auth" className="font-bold text-primary underline">{tr('navEnter')}</Link> {tr('loginToSave')}.
        </p>
      )}
    </div>
  );
}
