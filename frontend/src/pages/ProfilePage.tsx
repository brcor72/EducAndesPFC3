import { useState, useMemo } from 'react';
import { User, Save, Bell, Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AndeanBorder } from '../components/layout/AndeanBorder';
import { useAuthStore } from '../store/auth.store';
import { usersService, notificationsService } from '../services/courses.service';
import { ACTIVITY_OPTIONS } from '../lib/avatars';
import { AndeanAvatar } from '../components/avatar/AndeanAvatar';

const SKIN_OPTIONS = [
  { value: 'claro',   label: 'Claro',   color: '#f5d5b0' },
  { value: 'medio',   label: 'Medio',   color: '#c8894e' },
  { value: 'moreno',  label: 'Moreno',  color: '#9b6234' },
  { value: 'oscuro',  label: 'Oscuro',  color: '#6b3d1e' },
];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();

  const [aiAvatarUrl, setAiAvatarUrl] = useState<string | null>((user as any)?.avatarUrl?.startsWith('data:') ? (user as any).avatarUrl : null);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [community,   setCommunity]   = useState(user?.community ?? '');
  const [gender,      setGender]      = useState((user as any)?.gender ?? 'no_especificado');
  const [skinTone,    setSkinTone]    = useState((user as any)?.skinTone ?? 'medio');
  const [birthYear,   setBirthYear]   = useState<number | ''>((user as any)?.birthYear ?? '');
  const [activity,    setActivity]    = useState((user as any)?.activity ?? 'estudiante');

  const profile = useMemo(() => ({
    displayName: displayName || user?.displayName,
    gender, skinTone, birthYear: birthYear || undefined, activity,
  }), [displayName, gender, skinTone, birthYear, activity, user]);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getAll(),
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersService.getStats(),
  });

  const notifications = notifData?.data ?? notifData ?? [];

  const updateMutation = useMutation({
    mutationFn: () => usersService.update(user!.id, {
      displayName,
      community,
      gender,
      skinTone,
      birthYear: birthYear !== '' ? Number(birthYear) : undefined,
      activity,
    }),
    onSuccess: (updated) => {
      setUser({ ...user!, ...updated });
      toast.success('Perfil actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const generateAvatarMutation = useMutation({
    mutationFn: () => usersService.generateAvatar(),
    onSuccess: (url) => {
      setAiAvatarUrl(url);
      setUser({ ...user!, avatarUrl: url } as any);
      toast.success('¡Avatar generado con IA!');
    },
    onError: () => toast.error('Error al generar avatar. Intenta de nuevo.'),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Todas leídas'); },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-balance text-4xl font-bold">Mi perfil</h1>
          <p className="mt-2 text-muted-foreground">Personaliza tu identidad y avatar en EducAndes.</p>
        </div>
      </section>
      <AndeanBorder />

      <div className="mx-auto max-w-4xl grid gap-8 px-6 py-12 md:grid-cols-2">
        {/* Profile form */}
        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <h2 className="mb-5 font-display text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" /> Información personal
          </h2>
          <div className="space-y-4">

            {/* Avatar preview */}
            <div className="rounded-2xl bg-muted/40 p-4 flex items-center gap-4">
              {aiAvatarUrl ? (
                <img src={aiAvatarUrl} alt="avatar IA" width={80} height={80}
                  className="rounded-full border-4 border-primary/30 shadow-warm object-cover"
                  style={{ width: 80, height: 80 }} />
              ) : (
                <AndeanAvatar profile={profile} size={80}
                  className="border-4 border-primary/30 shadow-warm" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                  <Sparkles className="h-4 w-4" />
                  {aiAvatarUrl ? 'Avatar generado con IA' : 'Avatar andino'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {aiAvatarUrl ? 'Imagen única generada por IA para ti' : 'Completa tu perfil y genera con IA'}
                </p>
                <button
                  onClick={() => generateAvatarMutation.mutate()}
                  disabled={generateAvatarMutation.isPending}
                  className="mt-2 flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 disabled:opacity-60 transition-colors"
                >
                  {generateAvatarMutation.isPending
                    ? <><RefreshCw className="h-3 w-3 animate-spin" /> Generando (~30 seg)…</>
                    : <><Wand2 className="h-3 w-3" /> Generar con IA</>}
                </button>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="mb-1.5 block text-sm font-bold">Nombre completo</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary" />
            </div>

            {/* Género */}
            <div>
              <label className="mb-1.5 block text-sm font-bold">Género</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'masculino',      label: '👨 Masculino' },
                  { value: 'femenino',       label: '👩 Femenino' },
                  { value: 'no_especificado', label: '🧑 No especificar' },
                ].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setGender(opt.value)}
                    className={`rounded-xl border-2 py-2 px-2 text-xs font-bold transition-all ${
                      gender === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tono de piel */}
            <div>
              <label className="mb-1.5 block text-sm font-bold">Tono de piel</label>
              <div className="flex gap-3">
                {SKIN_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setSkinTone(opt.value)}
                    title={opt.label}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${
                      skinTone === opt.value ? 'border-primary scale-110' : 'border-border hover:border-primary/40'
                    }`}>
                    <span className="block h-8 w-8 rounded-full border border-black/10"
                      style={{ background: opt.color }} />
                    <span className="text-[10px] text-muted-foreground">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Año de nacimiento */}
            <div>
              <label className="mb-1.5 block text-sm font-bold">Año de nacimiento</label>
              <input
                type="number" min={1940} max={2015}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 1990"
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary" />
            </div>

            {/* Actividad principal */}
            <div>
              <label className="mb-1.5 block text-sm font-bold">Actividad principal</label>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITY_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setActivity(opt.value)}
                    className={`rounded-xl border-2 py-2 px-3 text-xs font-bold text-left transition-all ${
                      activity === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comunidad */}
            <div>
              <label className="mb-1.5 block text-sm font-bold">Comunidad o distrito</label>
              <input value={community} onChange={(e) => setCommunity(e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary" />
            </div>

            {/* DNI y Rol (solo lectura) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-bold">DNI</label>
                <input value={user?.dni} disabled
                  className="h-12 w-full rounded-xl border-2 border-border bg-muted px-4 text-sm text-muted-foreground cursor-not-allowed" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold">Rol</label>
                <input value={user?.role?.name ?? 'estudiante'} disabled
                  className="h-12 w-full rounded-xl border-2 border-border bg-muted px-4 text-sm text-muted-foreground cursor-not-allowed capitalize" />
              </div>
            </div>

            <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-primary-foreground shadow-warm hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {updateMutation.isPending
                ? <><RefreshCw className="h-4 w-4 animate-spin" /> Guardando…</>
                : <><Save className="h-4 w-4" /> Guardar cambios</>}
            </button>
          </div>

          {stats && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: 'Cursos terminados', value: stats.completedCourses },
                { label: 'Clases hechas',     value: stats.totalLessonsDone },
                { label: 'Temas creados',     value: stats.threadsCount },
                { label: 'Respuestas dadas',  value: stats.repliesCount },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-muted/60 p-3 text-center">
                  <div className="font-display text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" /> Notificaciones
            </h2>
            {notifications.some((n: any) => !n.isRead) && (
              <button onClick={() => markAllReadMutation.mutate()} className="text-sm font-bold text-primary hover:underline">
                Marcar todas como leídas
              </button>
            )}
          </div>
          {!notifications.length ? (
            <p className="text-muted-foreground">No tienes notificaciones aún.</p>
          ) : (
            <ul className="space-y-3 max-h-[600px] overflow-y-auto">
              {notifications.map((n: any) => (
                <li key={n.id} className={`rounded-2xl p-4 transition-colors ${n.isRead ? 'bg-muted/40' : 'bg-primary/5 border-2 border-primary/20'}`}>
                  <div className="font-bold text-sm">{n.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString('es-PE')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
