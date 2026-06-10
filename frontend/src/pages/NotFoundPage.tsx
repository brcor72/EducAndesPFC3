import { Link } from 'react-router-dom';
import { useI18nStore } from '../store/i18n.store';
import { SpeakButton } from '../components/audio/SpeakButton';

export default function NotFoundPage() {
  const { tr } = useI18nStore();
  const text = tr('notFoundTitle') + '. ' + tr('notFoundDesc');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-4">
      <div className="text-8xl font-bold text-primary mb-2">404</div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{tr('notFoundTitle')}</h1>
        <SpeakButton text={text} />
      </div>
      <p className="text-muted-foreground mb-4">{tr('notFoundDesc')}</p>
      <Link
        to="/"
        className="rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
      >
        {tr('notFoundBack')}
      </Link>
    </div>
  );
}
