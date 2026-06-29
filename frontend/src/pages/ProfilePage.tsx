import { useState } from 'react';
import { User, Save, Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AndeanBorder } from '../components/layout/AndeanBorder';
import { useAuthStore } from '../store/auth.store';
import { usersService, notificationsService } from '../services/courses.service';
import { AVATAR_OPTIONS } from '../lib/avatars';
import { UserAvatar } from '../components/avatar/UserAvatar';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [community, setCommunity] = useState(user?.community ?? '');
  const [avatarKey, setAvatarKey] = useState(user?.avatarUrl ?? 'estudiante');

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
    mutationFn: () => usersService.update(user!.id, { displayName, community, avatarUrl: avatarKey }),
    onSuccess: (updated) => {
      setUser({ ...user!, ...updated });
      toast.success('Perfil actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
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
          <p className="mt-2 text-muted-foreground">Administra tu información personal y notificaciones.</p>
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
            {/* Avatar picker */}
            <div>
              <label className="mb-2 block text-sm font-bold">Tu avatar</label>
              <div className="flex items-center gap-3 mb-3">
                <UserAvatar avatarKey={avatarKey} size={56} />
                <span className="text-sm text-muted-foreground">
                  {AVATAR_OPTIONS.find(a => a.key === avatarKey)?.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setAvatarKey(a.key)}
                    title={a.label}
                    className={`flex flex-col items-center gap-1 rounded-xl p-2 border-2 transition-all ${
                      avatarKey === a.key
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <UserAvatar avatarKey={a.key} size={40} />
                    <span className="text-[10px] text-muted-foreground leading-tight text-center">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold">DNI</label>
              <input value={user?.dni} disabled
                className="h-12 w-full rounded-xl border-2 border-border bg-muted px-4 text-base text-muted-foreground cursor-not-allowed" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold">Nombre completo</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold">Comunidad o distrito</label>
              <input value={community} onChange={(e) => setCommunity(e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold">Rol</label>
              <input value={user?.role?.name ?? 'estudiante'} disabled
                className="h-12 w-full rounded-xl border-2 border-border bg-muted px-4 text-base text-muted-foreground cursor-not-allowed capitalize" />
            </div>
            <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-primary-foreground shadow-warm hover:bg-primary/90 disabled:opacity-60 transition-colors">
              <Save className="h-4 w-4" /> {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>

          {stats && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: 'Cursos terminados', value: stats.completedCourses },
                { label: 'Clases hechas', value: stats.totalLessonsDone },
                { label: 'Temas creados', value: stats.threadsCount },
                { label: 'Respuestas dadas', value: stats.repliesCount },
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
            <ul className="space-y-3 max-h-96 overflow-y-auto">
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
