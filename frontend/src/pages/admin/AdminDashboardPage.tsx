import { Link } from 'react-router-dom';
import { Users, BookOpen, MessageSquare, TrendingUp, LayoutDashboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { dashboardService } from '../../services/courses.service';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => dashboardService.getAdminStats(),
  });

  const totals = stats?.totals;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl font-bold">Panel de Administración</h1>
        </div>

        {/* Admin Nav */}
        <nav className="mb-8 flex gap-3">
          <Link to="/admin" className="rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground">Dashboard</Link>
          <Link to="/admin/usuarios" className="rounded-xl border-2 border-border px-4 py-2 font-bold hover:bg-muted transition-colors">Usuarios</Link>
          <Link to="/admin/cursos" className="rounded-xl border-2 border-border px-4 py-2 font-bold hover:bg-muted transition-colors">Cursos</Link>
        </nav>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-muted" />)}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { icon: Users, label: 'Total usuarios', value: totals?.totalUsers, tone: 'bg-primary text-primary-foreground' },
                { icon: Users, label: 'Estudiantes', value: totals?.totalStudents, tone: 'bg-puna text-puna-foreground' },
                { icon: BookOpen, label: 'Cursos publicados', value: totals?.totalCourses, tone: 'bg-sun text-sun-foreground' },
                { icon: TrendingUp, label: 'Usuarios activos hoy', value: totals?.activeUsersToday, tone: 'bg-sky text-sky-foreground' },
                { icon: MessageSquare, label: 'Hilos en foros', value: totals?.totalForumThreads, tone: 'bg-earth text-earth-foreground' },
                { icon: MessageSquare, label: 'Respuestas', value: totals?.totalForumReplies, tone: 'bg-accent text-accent-foreground' },
                { icon: BookOpen, label: 'Docentes', value: totals?.totalTeachers, tone: 'bg-primary text-primary-foreground' },
                { icon: TrendingUp, label: 'Cursos en progreso', value: totals?.coursesCompletions, tone: 'bg-puna text-puna-foreground' },
              ].map((s) => (
                <div key={s.label} className="rounded-3xl border-2 border-border bg-card p-5 shadow-soft">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl shadow-warm ${s.tone}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-display text-3xl font-bold">{s.value ?? '—'}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Course stats table */}
            {stats?.courseStats && (
              <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft mb-8">
                <h2 className="mb-4 font-display text-2xl font-bold">Estadísticas por curso</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="pb-3 text-left font-bold">Curso</th>
                        <th className="pb-3 text-right font-bold">Estudiantes</th>
                        <th className="pb-3 text-right font-bold">Hilos en foro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.courseStats.map((c: any) => (
                        <tr key={c.id} className="border-b border-border/50">
                          <td className="py-3 font-medium">{c.title}</td>
                          <td className="py-3 text-right">{c._count?.progress ?? 0}</td>
                          <td className="py-3 text-right">{c._count?.forumThreads ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent registrations */}
            {stats?.recentRegistrations && (
              <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 font-display text-2xl font-bold">Registros recientes</h2>
                <ul className="space-y-3">
                  {stats.recentRegistrations.map((u: any) => (
                    <li key={u.id} className="flex items-center justify-between rounded-2xl bg-muted/60 p-3">
                      <div>
                        <div className="font-bold">{u.displayName}</div>
                        {u.community && <div className="text-xs text-muted-foreground">{u.community}</div>}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-primary capitalize">{u.role?.name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('es-PE')}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
