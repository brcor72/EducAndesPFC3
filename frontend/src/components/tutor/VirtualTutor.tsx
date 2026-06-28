import { useState } from 'react';
import { ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { useI18nStore } from '../../store/i18n.store';
import { TutorChat, type TutorChatProps } from './TutorChat';

interface VirtualTutorProps extends TutorChatProps {
  defaultOpen?: boolean;
}

export function VirtualTutor({ defaultOpen = false, ...chatProps }: VirtualTutorProps) {
  const { tr } = useI18nStore();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-amber-50/60 to-emerald-50/40 shadow-soft overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-warm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-display font-bold text-base">{tr('tutorVirtualTitle')}</div>
            <div className="text-xs text-muted-foreground">
              {chatProps.mode === 'quiz' ? tr('tutorQuizBadge') : tr('tutorLessonBadge')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          {open ? tr('tutorClose') : tr('tutorOpen')}
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-primary/20 px-4 pb-6">
          <TutorChat {...chatProps} />
        </div>
      )}
    </div>
  );
}
