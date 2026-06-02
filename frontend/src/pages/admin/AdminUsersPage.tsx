import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2, LayoutDashboard } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { usersService } from '../../services/courses.service';
import api from '../../services/api';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: () => usersService.getAll(page, 20, search || undefined, roleFilter || undefined),
  });

  const users = data?.data?.data ?? [];
  const meta = data?.data?.meta ?? data?.meta ?? {};

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Usuario desactivado'); },
    onError: () => toast.error('Error al desactivar'),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <nav className="mb-8 flex gap-3">
          <Link to="/admin" className="rounded-xl border-2 border-border px-4 py-2 font-bold hover:bg-muted transition-colors">Dashboard</Link>
          <Link to="/admin/usuarios" className="rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground">Usuarios</Link>
          <Link to="/admin/cursos" className="rounded-xl border-2 border-border px-4 py-2 font-bold hover:bg-muted transition-colors">Cursos</Link>
        </nav>

        <h1 className="mb-6 font-display text-4xl font-bold">Gestión de Usuarios</h1>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar por nombre, DNI o comunidad…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-12 w-full rounded-xl border-2 border-border bg-background pl-10 pr-4 text-base outline-none focus:border-primary" />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="h-12 rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary">
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="docente">Docente</option>
            <option value="estudiante">Estudiante</option>
          </select>
        </div>

        <div className="rounded-3xl border-2 border-border bg-card shadow-soft overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando usuarios…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-border bg-muted/50">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold">Nombre</th>
                    <th className="px-5 py-4 text-left font-bold">DNI</th>
                    <th className="px-5 py-4 text-left font-bold hidden md:table-cell">Comunidad</th>
                    <th className="px-5 py-4 text-left font-bold">Rol</th>
                    <th className="px-5 py-4 text-left font-bold hidden lg:table-cell">Idioma</th>
                    <th className="px-5 py-4 text-left font-bold hidden lg:table-cell">Registro</th>
                    <th className="px-5 py-4 text-right font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-medium">{u.displayName}</td>
                      <td className="px-5 py-4 font-mono">{u.dni}</td>
                      <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">{u.community || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                          u.role?.name === 'admin' ? 'bg-destructive/20 text-destructive' :
                          u.role?.name === 'docente' ? 'bg-primary/20 text-primary' :
                          'bg-puna/20 text-puna'}`}>
                          {u.role?.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-muted-foreground uppercase">{u.preferredLang}</td>
                      <td className="px-5 py-4 hidden lg:table-cell text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('es-PE')}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => { if (confirm('¿Desactivar este usuario?')) deleteMutation.mutate(u.id); }}
                          className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {meta.total} usuarios · Página {meta.page} de {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border-2 border-border px-4 py-2 font-bold disabled:opacity-40 hover:bg-muted transition-colors">
                Anterior
              </button>
              <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border-2 border-border px-4 py-2 font-bold disabled:opacity-40 hover:bg-muted transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
