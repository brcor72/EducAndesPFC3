import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AndeanBorder } from '../components/layout/AndeanBorder';
import { useI18nStore } from '../store/i18n.store';
import { SpeakButton } from '../components/audio/SpeakButton';

export default function FaqPage() {
  const { tr } = useI18nStore();
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: tr('faqQ1'), a: tr('faqA1') },
    { q: tr('faqQ2'), a: tr('faqA2') },
    { q: tr('faqQ3'), a: tr('faqA3') },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">
              {tr('navHelp')}
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <h1 className="font-display text-4xl font-bold md:text-5xl">{tr('faqTitle')}</h1>
              <SpeakButton text={tr('faqTitle')} size="md" />
            </div>
            
            <div className="mt-8 relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr('faqSearch')}
                className="w-full rounded-2xl border-2 border-border bg-card py-4 pl-12 pr-4 text-base outline-none focus:border-primary transition-colors shadow-soft"
              />
            </div>
          </div>
        </div>
      </section>
      
      <AndeanBorder />

      <section className="flex-1 mx-auto max-w-3xl w-full px-6 py-12">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-lg">{tr('noCoursesFound')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className={`rounded-2xl border-2 transition-colors overflow-hidden ${
                    isOpen ? 'border-primary shadow-warm' : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <span className="font-bold text-lg">{faq.q}</span>
                    <div className="flex items-center gap-2">
                      <div onClick={(e) => e.stopPropagation()}>
                        <SpeakButton text={faq.q} />
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-primary" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t-2 border-border/50 bg-muted/20 flex items-start gap-3">
                      <p className="text-foreground/90 flex-1">{faq.a}</p>
                      <SpeakButton text={faq.a} className="shrink-0" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
