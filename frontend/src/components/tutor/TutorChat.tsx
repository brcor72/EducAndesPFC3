import { useRef, useState, useCallback, useEffect } from 'react';
import { Send, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { useI18nStore } from '../../store/i18n.store';
import { useAuthStore } from '../../store/auth.store';
import { TutorAvatar, type AvatarState } from './TutorAvatar';

interface Message { role: 'user' | 'assistant'; content: string; ts: number; }

export interface TutorChatProps {
  courseTitle: string;
  courseSlug: string;
  lessonTitle: string;
  lessonSummary: string;
  lessonDetail: string;
  lessonIndex: number;
  totalLessons: number;
  lessonsDone: number;
  mode: 'lesson' | 'quiz';
  quizQuestion?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

function makeKey(uid: string, slug: string, idx: number, mode: string) {
  return `tutor_history_${uid}_${slug}_${idx}_${mode}`;
}
function loadHistory(key: string): Message[] {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveHistory(key: string, msgs: Message[]) {
  try { localStorage.setItem(key, JSON.stringify(msgs.slice(-60))); } catch { /* quota */ }
}

// Yachay asks "¿Era eso lo que querías saber?" after reformulating
function isConfirmationQuestion(text: string) {
  return /¿Era eso lo que querías saber\?/i.test(text);
}

export function TutorChat(props: TutorChatProps) {
  const { tr, lang } = useI18nStore();
  const user = useAuthStore((s) => s.user);

  const storageKey = makeKey(user?.id ?? 'guest', props.courseSlug, props.lessonIndex, props.mode);
  const welcome    = props.mode === 'quiz' ? tr('tutorWelcomeQuiz') : tr('tutorWelcome');

  const [history, setHistory]             = useState<Message[]>(() => loadHistory(storageKey));
  const [avatarState, setAvatarState]     = useState<AvatarState>('idle');
  const [playWelcome, setPlayWelcome]     = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [active, setActive]               = useState(false);
  const [isListening, setIsListening]     = useState(false);
  const [isStreaming, setIsStreaming]     = useState(false);
  const [showText, setShowText]           = useState(false);
  const [textInput, setTextInput]         = useState('');
  const [interimText, setInterimText]     = useState('');

  // Preview before sending (so user can cancel bad transcription)
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);
  const [countdown, setCountdown]                 = useState(0);

  // Show Sí/No buttons after Yachay asks for confirmation
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const recognitionRef  = useRef<any>(null);
  const activeRef       = useRef(false);
  const streamingRef    = useRef(false);
  const ttsActiveRef    = useRef(false);   // true while TTS is playing
  const countdownTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef      = useRef<HTMLDivElement>(null);

  const hasSR = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => { saveHistory(storageKey, history); }, [history, storageKey]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, streamingText]);

  // ── TTS ──────────────────────────────────────────────────────
  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!text.trim()) { onEnd?.(); return; }
    if (!('speechSynthesis' in window)) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-PE';
    utter.rate = 0.88;
    const v = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('es')) ?? null;
    if (v) utter.voice = v;
    utter.onstart = () => { ttsActiveRef.current = true; setAvatarState('speaking'); };
    utter.onend   = () => { ttsActiveRef.current = false; setAvatarState('idle'); onEnd?.(); };
    utter.onerror = () => { ttsActiveRef.current = false; setAvatarState('idle'); onEnd?.(); };
    window.speechSynthesis.speak(utter);
  }, []);

  // ── Stop all ─────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    recognitionRef.current?.abort();
    window.speechSynthesis?.cancel();
    ttsActiveRef.current = false;
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setPendingTranscript(null);
    setInterimText('');
    setIsListening(false);
    setAvatarState('idle');
    setPlayWelcome(false);
    setAwaitingConfirm(false);
  }, []);

  // ── Send to Gemini ───────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streamingRef.current) return;

    setAvatarState('thinking');
    setIsListening(false);
    setInterimText('');
    setPendingTranscript(null);
    setStreamingText('');

    const userMsg: Message = { role: 'user', content: text, ts: Date.now() };
    setHistory((prev) => [...prev, userMsg]);

    if (!navigator.onLine) {
      setTimeout(() => {
        setAvatarState('idle');
        const botMsg: Message = { 
          role: 'assistant', 
          content: 'Lo siento, me encuentro sin conexión a internet. Revisa el material de la lección para continuar.', 
          ts: Date.now() 
        };
        setHistory((prev) => [...prev, botMsg]);
      }, 500);
      return;
    }

    const historyForApi = history.slice(-16).map((m) => ({ role: m.role, content: m.content }));

    setIsStreaming(true);
    streamingRef.current = true;
    let full = '';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`${API_BASE}/tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          courseTitle:   props.courseTitle,
          courseSlug:    props.courseSlug,
          lessonTitle:   props.lessonTitle,
          lessonSummary: props.lessonSummary,
          lessonDetail:  props.lessonDetail,
          lessonIndex:   props.lessonIndex,
          totalLessons:  props.totalLessons,
          lessonsDone:   props.lessonsDone,
          lang, mode: props.mode,
          history: historyForApi,
          quizQuestion: props.quizQuestion ?? '',
        }),
      });

      clearTimeout(timeout);
      if (!res.ok || !res.body) throw new Error('network');
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break outer;
          try {
            const p = JSON.parse(payload);
            if (p.error) {
              full = p.error;   // backend already sends a friendly message
              setStreamingText(full);
              break outer;
            }
            full += p.text ?? '';
            setStreamingText(full);
          } catch { /* ignore malformed chunk */ }
        }
      }
    } catch {
      full = 'Tuve un problema de conexión. ¿Podrías intentarlo de nuevo?';
      setStreamingText(full);
    } finally {
      setIsStreaming(false);
      streamingRef.current = false;
      setStreamingText('');

      // Guard: if somehow empty, use fallback
      if (!full.trim()) {
        full = 'No pude procesar esa pregunta. ¿Puedes intentarlo de nuevo?';
      }

      const botMsg: Message = { role: 'assistant', content: full, ts: Date.now() };
      setHistory((prev) => [...prev, botMsg]);

      // Show Sí/No only when Yachay explicitly asks for confirmation
      setAwaitingConfirm(isConfirmationQuestion(full));

      // TTS speaks response; wait 1.5s after it finishes before listening
      // to avoid STT picking up the speaker audio
      speakText(full, () => {
        if (activeRef.current) {
          setTimeout(() => startListeningOnce(sendMessage), 1500);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, lang, props, speakText]);

  // ── Transcript preview: countdown then auto-send ─────────────
  const showPreview = useCallback((text: string, sendFn: (t: string) => void) => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setPendingTranscript(text);
    setInterimText('');
    setCountdown(3);
    let left = 3;
    countdownTimer.current = setInterval(() => {
      left -= 1;
      setCountdown(left);
      if (left <= 0) {
        clearInterval(countdownTimer.current!);
        setPendingTranscript(null);
        sendFn(text);
      }
    }, 1000);
  }, []);

  const cancelPreview = useCallback(() => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setPendingTranscript(null);
    setCountdown(0);
    setInterimText('');
    if (activeRef.current) setTimeout(() => startListeningOnce(sendMessage), 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendPreviewNow = useCallback((text: string) => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setPendingTranscript(null);
    sendMessage(text);
  }, [sendMessage]);

  // ── One-shot STT — does NOT start while TTS is playing ───────
  const startListeningOnce = useCallback((sendFn: (t: string) => void) => {
    if (!hasSR || streamingRef.current) return;
    // Don't capture speaker audio — wait if TTS is still active
    if (ttsActiveRef.current || window.speechSynthesis?.speaking) {
      setTimeout(() => startListeningOnce(sendFn), 400);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'es-PE';
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.continuous = false;

    rec.onstart  = () => { setIsListening(true); setAvatarState('listening'); setInterimText(''); };
    rec.onresult = (e: any) => {
      const results = Array.from(e.results as any[]);
      const finals  = results.filter((r: any) => r.isFinal);

      if (finals.length === 0) {
        // Show interim for feedback
        const interim = results.map((r: any) => r[0].transcript).join('');
        setInterimText(interim);
        return;
      }

      // Pick best alternative by confidence
      let bestText = '';
      let bestConf = -1;
      for (const r of finals) {
        for (let i = 0; i < r.length; i++) {
          if ((r[i].confidence ?? 0) > bestConf) {
            bestConf = r[i].confidence ?? 0;
            bestText = r[i].transcript.trim();
          }
        }
      }
      if (bestText) showPreview(bestText, sendFn);
    };
    rec.onerror = (e: any) => {
      setIsListening(false);
      setAvatarState('idle');
      setInterimText('');
      // On no-speech error, restart listening automatically
      if (e.error === 'no-speech' && activeRef.current && !streamingRef.current) {
        setTimeout(() => startListeningOnce(sendFn), 500);
      }
    };
    rec.onend = () => { setIsListening(false); };

    recognitionRef.current = rec;
    rec.start();
  }, [hasSR, showPreview]);

  // ── Welcome video ended ───────────────────────────────────────
  const handleWelcomeEnd = useCallback(() => {
    setPlayWelcome(false);
    setAvatarState('idle');
    if (activeRef.current) setTimeout(() => startListeningOnce(sendMessage), 800);
  }, [startListeningOnce, sendMessage]);

  // ── Toggle tutor ──────────────────────────────────────────────
  const toggleTutor = useCallback(() => {
    if (active) {
      setActive(false);
      activeRef.current = false;
      stopAll();
    } else {
      setActive(true);
      activeRef.current = true;
      setStreamingText('');
      setAwaitingConfirm(false);
      setPlayWelcome(true);
    }
  }, [active, stopAll]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // ── Handle Sí / No response ───────────────────────────────────
  const handleConfirm = useCallback((answer: 'sí' | 'no') => {
    setAwaitingConfirm(false);
    sendMessage(answer);
  }, [sendMessage]);

  const statusText =
    isStreaming ? 'Yachay está pensando...' :
    isListening ? '🎙 Escuchando...' :
    avatarState === 'speaking' ? '🔊 Yachay está hablando...' : '';

  return (
    <div className="flex flex-col items-center gap-3 py-2">

      {/* ── AVATAR ───────────────────────────────────────────── */}
      <TutorAvatar
        state={avatarState}
        playWelcome={playWelcome}
        onWelcomeEnd={handleWelcomeEnd}
        size={240}
      />

      {/* ── TRANSCRIPT PREVIEW ───────────────────────────────── */}
      {pendingTranscript && (
        <div className="w-full max-w-sm rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
            Escuché — enviando en {countdown}s...
          </p>
          <p className="text-sm text-foreground font-medium mb-3 italic">
            "{pendingTranscript}"
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => sendPreviewNow(pendingTranscript)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-500 text-white text-xs font-bold py-2 hover:bg-green-600 transition-colors"
            >
              <Check className="h-3.5 w-3.5" /> Enviar ya
            </button>
            <button
              onClick={cancelPreview}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-400 text-white text-xs font-bold py-2 hover:bg-red-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Repetir
            </button>
          </div>
        </div>
      )}

      {/* ── CONVERSACIÓN ────────────────────────────────────── */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Conversación
          </span>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        <div
          className="rounded-2xl border-2 border-primary/25 bg-card shadow-soft overflow-y-auto"
          style={{ maxHeight: 300, minHeight: 110 }}
        >
          {history.length === 0 && !streamingText ? (
            <p className="text-sm text-muted-foreground italic p-4 text-center">
              {active
                ? (playWelcome ? 'Reproduciendo saludo...' : 'Esperando tu pregunta...')
                : 'Presiona "Iniciar tutor" para comenzar'}
            </p>
          ) : (
            <div className="flex flex-col gap-2 p-3">
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}>
                    {msg.role === 'assistant' && (
                      <span className="block text-[10px] font-bold text-primary/70 mb-0.5">Yachay</span>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Streaming in progress */}
              {streamingText && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed bg-muted text-foreground">
                    <span className="block text-[10px] font-bold text-primary/70 mb-0.5">Yachay</span>
                    {streamingText}
                    <span className="ml-0.5 animate-pulse text-primary">▌</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── SÍ / NO — solo cuando Yachay pide confirmación ──── */}
      {awaitingConfirm && !isStreaming && !pendingTranscript && (
        <div className="flex gap-3 w-full max-w-sm">
          <button
            onClick={() => handleConfirm('sí')}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-green-500 text-white font-bold py-3 text-sm hover:bg-green-600 transition-colors"
          >
            <Check className="h-4 w-4" /> Sí, correcto
          </button>
          <button
            onClick={() => handleConfirm('no')}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-400 text-white font-bold py-3 text-sm hover:bg-slate-500 transition-colors"
          >
            <X className="h-4 w-4" /> No, otra cosa
          </button>
        </div>
      )}

      {/* ── STATUS + INTERIM ─────────────────────────────────── */}
      <div className="min-h-[44px] flex flex-col items-center justify-center gap-1">
        {statusText && (
          <span className={`text-xs font-bold ${isListening ? 'text-green-600 animate-pulse' : 'text-muted-foreground'}`}>
            {statusText}
          </span>
        )}
        {isListening && interimText && (
          <span className="text-xs text-primary/80 italic max-w-xs text-center">
            "{interimText}"
          </span>
        )}
      </div>

      {/* ── BOTÓN PRINCIPAL ──────────────────────────────────── */}
      {hasSR && (
        <button
          onClick={toggleTutor}
          disabled={isStreaming}
          className={`flex items-center gap-2 rounded-2xl px-7 py-3.5 font-bold text-sm transition-all shadow-warm ${
            active
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          } disabled:opacity-40`}
        >
          {active ? '⏹ Detener tutor' : '🎙 Iniciar tutor'}
        </button>
      )}

      {/* ── TEXTO OPCIONAL ───────────────────────────────────── */}
      <button
        onClick={() => setShowText((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
      >
        {showText ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {showText ? 'Ocultar teclado' : 'Escribir pregunta'}
      </button>

      {showText && (
        <div className="flex w-full max-w-sm items-center gap-2">
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && textInput.trim()) {
                e.preventDefault();
                setAwaitingConfirm(false);
                sendMessage(textInput);
                setTextInput('');
              }
            }}
            placeholder={tr('tutorPlaceholder')}
            disabled={isStreaming || isListening}
            className="flex-1 rounded-2xl border-2 border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => {
              if (textInput.trim()) {
                setAwaitingConfirm(false);
                sendMessage(textInput);
                setTextInput('');
              }
            }}
            disabled={isStreaming || !textInput.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
