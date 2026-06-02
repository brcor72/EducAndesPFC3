import { Link } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SiteHeader } from '../../components/layout/SiteHeader';
import api from '../../services/api';
import { coursesService } from '../../services/courses.service';

const LEVEL_COLOR: Record<string, string> = {
  INICIAL: 'bg-puna/20 text-puna',
  INTERMEDIO: 'bg-sun/20 text-sun-foreground',
  AVANZADO: 'bg-destructive/20 text-destructive',
};

export default function AdminCoursesPage() {
  const qc = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data } = await api.get('/courses?published=false');
      return data.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (course: any) => api.put(`/courses/${course.id}`, { isPublished: !course.isPublished }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-courses'] }); toast.success('Curso actualizado'); },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <nav className="mb-8 flex gap-3">
          <Link to="/admin" className="rounded-xl border-2 border-border px-4 py-2 font-bold hover:bg-muted transition-colors">Dashboard</Link>
          <Link to="/admin/usuarios" className="rounded-xl border-2 border-border px-4 py-2 font-bold hover:bg-muted transition-colors">Usuarios</Link>
          <Link to="/admin/cursos" className="rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground">Cursos</Link>
        </nav>

        <h1 className="mb-6 font-display text-4xl font-bold">Gestión de Cursos</h1>

        <div className="rounded-3xl border-2 border-border bg-card shadow-soft overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center animate-pulse text-muted-foreground">Cargando cursos…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-border bg-muted/50">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold">Curso</th>
                    <th className="px-5 py-4 text-left font-bold hidden md:table-cell">Categoría</th>
                    <th className="px-5 py-4 text-left font-bold">Nivel</th>
                    <th className="px-5 py-4 text-left font-bold hidden lg:table-cell">Duración</th>
                    <th className="px-5 py-4 text-left font-bold hidden lg:table-cell">Lecciones</th>
                    <th className="px-5 py-4 text-left font-bold">Estado</th>
                    <th className="px-5 py-4 text-right font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c: any) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium">{c.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">{c.slug}</div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-muted-foreground capitalize">{c.category?.toLowerCase()}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${LEVEL_COLOR[c.level] || 'bg-muted'}`}>
                          {c.level}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-muted-foreground">{c.durationWeeks} semanas</td>
                      <td className="px-5 py-4 hidden lg:table-cell text-muted-foreground">{c._count?.lessons ?? 0}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${c.isPublished ? 'bg-puna/20 text-puna' : 'bg-muted text-muted-foreground'}`}>
                          {c.isPublished ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                        <Link to={`/curso/${c.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                          <BookOpen className="h-4 w-4" />
                        </Link>
                        <button onClick={() => toggleMutation.mutate(c)} className="text-muted-foreground hover:text-primary transition-colors">
                          {c.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
