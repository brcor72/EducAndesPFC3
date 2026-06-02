import { Link } from "@tanstack/react-router";
import { Mountain, PlayCircle, Trophy, LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader({ onOpenTutorial }: { onOpenTutorial?: () => void }) {
  const { tr } = useI18n();
  const { user } = useAuth();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-sunrise shadow-warm">
            <Mountain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl font-bold">Allin Yachay</div>
            <div className="text-xs text-muted-foreground">{tr("ongLine")}</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-base font-semibold md:flex">
          <Link to="/cursos" className="hover:text-primary" activeProps={{ className: "text-primary" }}>
            {tr("navCourses")}
          </Link>
          <Link to="/foros" className="hover:text-primary" activeProps={{ className: "text-primary" }}>
            {tr("navForums")}
          </Link>
          <Link
            to="/metas"
            className="inline-flex items-center gap-1 hover:text-primary"
            activeProps={{ className: "text-primary" }}
          >
            <Trophy className="h-4 w-4" /> {tr("navGoals")}
          </Link>
          {onOpenTutorial && (
            <button
              type="button"
              onClick={onOpenTutorial}
              className="inline-flex items-center gap-1 hover:text-primary"
            >
              <PlayCircle className="h-4 w-4" /> {tr("navTutorial")}
            </button>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <Button
              size="sm"
              variant="default"
              onClick={logout}
              className="rounded-full bg-destructive text-destructive-foreground shadow-warm hover:bg-destructive/90"
            >
              <LogOut className="mr-1 h-4 w-4" /> {tr("navLogout")}
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="rounded-full bg-primary text-primary-foreground shadow-warm hover:bg-primary/90"
            >
              <Link to="/auth">{tr("navLogin")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
