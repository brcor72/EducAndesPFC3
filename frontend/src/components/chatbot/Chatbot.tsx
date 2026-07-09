import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Volume2 } from 'lucide-react';
import { useI18nStore } from '../../store/i18n.store';
import { SpeakButton } from '../audio/SpeakButton';

interface Message {
  id: number;
  text: string;
  from: 'user' | 'bot';
}

const SUGGESTION_KEYS = [
  'chatSuggestion1',
  'chatSuggestion2',
  'chatSuggestion3',
  'chatSuggestion4',
  'chatSuggestion5',
] as const;

const ANSWER_MAP: Record<string, string> = {
  chatSuggestion1: 'chatAnswer1',
  chatSuggestion2: 'chatAnswer2',
  chatSuggestion3: 'chatAnswer3',
  chatSuggestion4: 'chatAnswer4',
  chatSuggestion5: 'chatAnswer5',
};

const KEYWORDS: Record<string, string> = {
  registr: 'chatAnswer1',
  cuenta: 'chatAnswer1',
  inscri: 'chatAnswer1',
  yaikuy: 'chatAnswer1',
  mantaña: 'chatAnswer1',
  curso: 'chatAnswer2',
  clase: 'chatAnswer2',
  kurso: 'chatAnswer2',
  klase: 'chatAnswer2',
  foro: 'chatAnswer3',
  pregunta: 'chatAnswer3',
  audio: 'chatAnswer4',
  sonido: 'chatAnswer4',
  escuch: 'chatAnswer4',
  uyar: 'chatAnswer4',
  grat: 'chatAnswer5',
  gratis: 'chatAnswer5',
  costo: 'chatAnswer5',
  pago: 'chatAnswer5',
  yamake: 'chatAnswer5',
  inaki: 'chatAnswer5',
};

function findAnswer(input: string, tr: (k: string) => string): string {
  const lower = input.toLowerCase();
  for (const [kw, answerKey] of Object.entries(KEYWORDS)) {
    if (lower.includes(kw)) return tr(answerKey);
  }
  return tr('chatUnknown');
}

let msgId = 0;

export function Chatbot() {
  const { tr } = useI18nStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: ++msgId, text: tr('chatWelcome'), from: 'bot' }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text: string, from: 'user' | 'bot') => {
    setMessages((prev) => [...prev, { id: ++msgId, text, from }]);
  };

  const [showBackButton, setShowBackButton] = useState(false);

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    setShowSuggestions(false);
    setShowBackButton(false);
    addMessage(msg, 'user');
    setTimeout(() => {
      addMessage(findAnswer(msg, tr), 'bot');
      setShowBackButton(true);
    }, 400);
  };

  const handleSuggestion = (key: string) => {
    const question = tr(key);
    const answerKey = ANSWER_MAP[key] ?? 'chatUnknown';
    setShowSuggestions(false);
    setShowBackButton(false);
    addMessage(question, 'user');
    setTimeout(() => {
      addMessage(tr(answerKey), 'bot');
      setShowBackButton(true);
    }, 400);
  };

  const handleBack = () => {
    setShowSuggestions(true);
    setShowBackButton(false);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title={tr('chatOpen')}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-warm hover:bg-primary/90 transition-all hover:scale-110 active:scale-95"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sun text-xs font-bold text-sun-foreground">?</span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[340px] flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-warm">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b-2 border-border bg-gradient-soft px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-warm">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-sm">{tr('chatTitle')}</div>
                <div className="text-xs text-muted-foreground">{tr('chatSubtitle')}</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-border hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`group relative max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}>
                  {msg.text}
                  {msg.from === 'bot' && (
                    <SpeakButton text={msg.text} size="sm" className="absolute -bottom-3 right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            ))}

            {/* Suggestions */}
            {showSuggestions && (
              <div className="space-y-2 pt-2">
                {SUGGESTION_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSuggestion(key)}
                    className="flex w-full items-center gap-2 rounded-xl border-2 border-border px-3 py-2 text-left text-xs font-bold hover:border-primary/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-primary">→</span> {tr(key)}
                  </button>
                ))}
              </div>
            )}

            {/* Back button after each answer */}
            {showBackButton && !showSuggestions && (
              <div className="flex justify-center pt-1">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-primary/40 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  ← Volver a preguntar
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t-2 border-border p-3">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={tr('chatPlaceholder')}
                className="flex-1 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
