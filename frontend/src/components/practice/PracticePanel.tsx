import { useState, useEffect, useRef } from 'react';
import { X, Send, Mic, MicOff, Volume2, HelpCircle, ArrowRight, Play, Calculator, Award } from 'lucide-react';
import { aiService, ChatMessage } from '../../services/ai.service';
import { useI18nStore } from '../../store/i18n.store';
import { toast } from 'sonner';

interface Props {
  lesson: any;
  onClose: () => void;
  onComplete: () => void;
}

export function PracticePanel({ lesson, onClose, onComplete }: Props) {
  const { lang, tr } = useI18nStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [costs, setCosts] = useState<Record<string, number>>({});
  const [isDone, setIsDone] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial welcome message
  useEffect(() => {
    const defaultWelcome: Record<string, string> = {
      es: `¡Hola! Soy tu tutor "Yachaq". Vamos a trabajar juntos en el caso práctico: "${lesson.practiceTitle}".\n\nEl problema es el siguiente:\n"${lesson.practiceScenario}"\n\nCuéntame, ¿cuál es tu propuesta o qué decisión tomarías para resolver esta situación?`,
      qu: `¡Allillanchu! Ñuqaqa "Yachaq" yanapakuqmi kani. Kay ruraymanta llamk'asunchik: "${lesson.practiceTitle}".\n\nSasachakuymi kay:\n"${lesson.practiceScenario}"\n\nWillaway, ¿imata ruwawaq kay sasachakuypi?`,
      ay: `¡Kamisaraki! Nayax "Yachaq" yanapirïtwa. Uka lurawit aruskipasunchik: "${lesson.practiceTitle}".\n\nJan walt'awix akawa:\n"${lesson.practiceScenario}"\n\nYatiyita, ¿kuna amta lurasma uka jan walt'awi p'akjañataki?`,
      shp: `¡Jakon! Noa riki "Yachaq" yoitirï. Nato yoitibireson rabarakanon:\n"${lesson.practiceTitle}".\n\nSasachakuy riki nato:\n"${lesson.practiceScenario}"\n\nNoa yoita, ¿jawera mia plan nato sasachakuy kupí?`,
    };
    
    setMessages([
      {
        role: 'model',
        parts: [defaultWelcome[lang] || defaultWelcome['es']],
      },
    ]);
  }, [lesson, lang]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speech Recognition setup
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('El reconocimiento de voz no está soportado en este navegador.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'es' ? 'es-PE' : lang === 'qu' ? 'es-PE' : 'es-PE'; // Google Speech handles Quechua via Spanish-PE accent rules well
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Escuchando... habla ahora.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Tu navegador no soporta lectura de texto.');
      return;
    }
    window.speechSynthesis.cancel();
    // Filter out JSON tag from speech
    const cleanText = text.replace(/\[COSTS_DATA:.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'es' ? 'es-PE' : 'es-PE';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    const updatedHistory: ChatMessage[] = [
      ...messages,
      { role: 'user', parts: [userMsg] },
    ];

    setMessages(updatedHistory);

    try {
      const res = await aiService.runPractice(lesson.id, updatedHistory);
      
      // Try to extract COSTS_DATA json from AI text response
      const match = res.message.match(/\[COSTS_DATA:\s*({.*?})\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          setCosts(parsed);
        } catch (e) {
          console.error('Failed to parse cost sandbox JSON', e);
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: [res.message] },
      ]);

      if (res.isCompleted) {
        setIsDone(true);
        toast.success('¡Caso completado con éxito! Has ganado una insignia.', { duration: 5000 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error al enviar tu propuesta.');
    } finally {
      setLoading(false);
    }
  };

  // Cost calculator calculations
  const costEntries = Object.entries(costs);
  const totalCost = costEntries.reduce((sum, [_, val]) => sum + Number(val), 0);
  const productionKg = 150; // Standard case default
  const costPerUnit = totalCost / productionKg;
  const breakEvenPrice = costPerUnit * 1.25; // 25% margin floor

  const isFinancialPractice = lesson.practiceTitle?.toLowerCase().includes('costo') ||
                              lesson.practiceTitle?.toLowerCase().includes('precio') ||
                              lesson.practiceScenario?.toLowerCase().includes('soles') ||
                              lesson.practiceScenario?.toLowerCase().includes('precio');

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md md:flex-row">
      {/* HEADER MOBILE */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4 md:hidden">
        <h2 className="font-display font-bold text-lg text-primary">Taller Práctico</h2>
        <button onClick={onClose} className="rounded-full p-2 hover:bg-muted">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* LEFT PANE: CHAT STREAM */}
      <div className="flex flex-1 flex-col h-[60vh] md:h-full border-r border-border">
        {/* Header Desktop */}
        <div className="hidden items-center justify-between border-b border-border bg-card px-8 py-5 md:flex">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary">EducAndes Inteligente</div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              🤖 Conversando con Yachaq
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full border-2 border-border p-2 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            // Clean metadata tag from rendering to user
            const renderedText = m.parts[0].replace(/\[COSTS_DATA:.*?\]/g, '').trim();

            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`group relative max-w-[85%] rounded-3xl p-5 shadow-soft border ${
                  isUser
                    ? 'bg-primary text-primary-foreground border-primary/20 rounded-tr-none'
                    : 'bg-card text-foreground border-border rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{renderedText}</p>
                  
                  {!isUser && (
                    <button
                      onClick={() => speakText(renderedText)}
                      className="absolute -right-3 -bottom-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Escuchar audio"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-3xl border border-border bg-card p-5 rounded-tl-none shadow-soft flex items-center gap-2">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-card p-4">
          {isDone ? (
            <div className="rounded-2xl bg-puna/10 border-2 border-puna/30 p-4 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 font-bold text-puna">
                <Award className="h-6 w-6" /> ¡Felicidades! Has superado esta práctica.
              </div>
              <p className="text-sm text-muted-foreground">Tu respuesta fue aprobada por el tutor. Pulsa el botón para guardar tu avance.</p>
              <button
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="w-full rounded-xl bg-puna px-5 py-3 font-bold text-white shadow-warm hover:bg-puna/90 transition-colors"
              >
                Completar y Guardar Clase
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition-all ${
                  isListening
                    ? 'border-destructive bg-destructive text-destructive-foreground animate-pulse'
                    : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
                }`}
                title={isListening ? 'Detener micrófono' : 'Hablar por micrófono'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu propuesta o decisión aquí..."
                disabled={loading}
                className="h-12 flex-1 rounded-2xl border-2 border-border bg-background px-4 text-sm font-medium focus:border-primary focus:outline-none"
              />

              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-warm hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT PANE: CALCULATOR / INFO PANEL */}
      <div className="flex flex-col bg-muted/30 px-8 py-6 md:w-96 md:h-full overflow-y-auto">
        {isFinancialPractice ? (
          // VISUAL SANDBOX CALCULATOR CARD
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Calculator className="h-5 w-5" />
              <h3 className="font-display text-lg">Mi Taller de Costos</h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mientras conversas con Yachaq sobre el caso, este panel se actualizará con los valores calculados en tiempo real.
            </p>

            <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft space-y-5">
              <h4 className="font-display font-bold text-sm text-foreground/80 uppercase tracking-wide">
                Plantilla de Costos
              </h4>
              
              {costEntries.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground/60 italic space-y-2">
                  <div>📊 No hay datos aún.</div>
                  <div className="text-xs">Menciona tus gastos a Yachaq (ej. semilla, abono) para verlos aquí.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="divide-y divide-border">
                    {costEntries.map(([cat, val]) => (
                      <div key={cat} className="flex justify-between py-2 text-sm">
                        <span className="font-medium text-muted-foreground">{cat}</span>
                        <span className="font-bold text-foreground">S/ {Number(val).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t-2 border-dashed border-border flex justify-between font-bold text-base">
                    <span>Costo Total:</span>
                    <span className="text-primary">S/ {totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {costEntries.length > 0 && (
              <div className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-primary uppercase tracking-wide">Fórmula de Estabilidad</div>
                  <div className="text-xl font-display font-black text-foreground">
                    S/ {breakEvenPrice.toFixed(2)} <span className="text-xs font-bold text-muted-foreground">/ Kg</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Precio Piso sugerido para obtener al menos un 25% de rentabilidad limpia (calculado sobre {productionKg} Kg de cosecha).
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // STANDARD INFORMATION PANE
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold">
              <HelpCircle className="h-5 w-5" />
              <h3 className="font-display text-lg">Detalle de Práctica</h3>
            </div>

            <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft space-y-4">
              <div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {lesson.practiceTitle || 'Caso Práctico'}
                </span>
              </div>
              <h4 className="font-display font-bold text-base">{lesson.practiceTitle}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {lesson.practiceScenario}
              </p>
            </div>

            {lesson.practiceHint && (
              <div className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-6 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-primary text-sm">
                  <span>💡</span> Pistas de Yachaq:
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lesson.practiceHint}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
