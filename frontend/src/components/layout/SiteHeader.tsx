import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Menu, X, Bell, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useI18nStore, type Lang, LANG_NAMES } from '../../store/i18n.store';
import { toast } from 'sonner';

const LANGS: { code: Lang }[] = [
  { code: 'es' },
  { code: 'qu' },
  { code: 'ay' },
  { code: 'shp' },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { lang, setLang, tr } = useI18nStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success(tr('navLogout'));
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-sunrise shadow-warm">
            <Sun className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Allin Yachay</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/cursos" className="rounded-xl px-3 py-2 text-sm font-bold hover:bg-muted transition-colors">
            {tr('navCourses')}
          </Link>
          <Link to="/foros" className="rounded-xl px-3 py-2 text-sm font-bold hover:bg-muted transition-colors">
            {tr('navForums')}
          </Link>
          {user && (
            <Link to="/metas" className="rounded-xl px-3 py-2 text-sm font-bold hover:bg-muted transition-colors">
              {tr('navMetas')}
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="hidden items-center gap-0.5 rounded-xl bg-muted p-1 md:flex">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                title={LANG_NAMES[l.code]}
                className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                  lang === l.code ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-background'
                }`}
              >
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm font-bold hover:border-primary/50 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden max-w-[120px] truncate md:block">{user.displayName}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border-2 border-border bg-card p-1.5 shadow-warm z-50">
                  <Link
                    to="/perfil"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4" /> {tr('navProfile')}
                  </Link>
                  <Link
                    to="/metas"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Bell className="h-4 w-4" /> {tr('navMetas')}
                  </Link>
                  {user.role?.name === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" /> {tr('navAdmin')}
                    </Link>
                  )}
                  <hr className="my-1 border-border" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> {tr('navLogout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
            >
              {tr('navEnter')}
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="rounded-xl border-2 border-border p-2 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t-2 border-border bg-card px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link to="/cursos" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 font-bold hover:bg-muted">{tr('navCourses')}</Link>
            <Link to="/foros" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 font-bold hover:bg-muted">{tr('navForums')}</Link>
            {user && <Link to="/metas" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 font-bold hover:bg-muted">{tr('navMetas')}</Link>}
            <div className="mt-2 flex flex-wrap gap-1">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setMenuOpen(false); }}
                  title={LANG_NAMES[l.code]}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${lang === l.code ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  {LANG_NAMES[l.code]}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
