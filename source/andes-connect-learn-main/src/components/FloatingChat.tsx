import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export function FloatingChat() {
  const { lang, tr } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const greetings: Record<string, string> = {
    es: "¡Allillanchu! Soy Yachay, tu asistente. ¿En qué puedo ayudarte hoy? 🌱",
    qu: "Allillanchu! Ñuqaqa Yachaymi kani. ¿Imapi yanapayta atiyman? 🌱",
    ay: "Kamisaraki! Nayax Yachaytwa. ¿Kunsa yanapama? 🌱",
    shp: "¡Jakon raoma! Yachay ea iki. ¿Mia bewa onanti? 🌱",
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: greetings[lang] ?? greetings.es }]);
    }
  }, [open]); // eslint-disable-line

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        setMessages((m) => [
          ...m,
          { role: "assistant", content: err.error ?? tr("chatErrorReply") },
        ]);
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) {
              acc += c;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: tr("chatErrorNet") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-sunrise px-5 py-4 text-primary-foreground shadow-warm transition-transform hover:scale-105"
          aria-label={tr("chatTitle")}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="hidden font-bold sm:inline">{tr("chatTitle")}</span>
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[540px] w-[min(92vw,400px)] flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-warm">
          <div className="flex items-center justify-between bg-gradient-sunrise px-5 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-bold leading-tight">Yachay</div>
                <div className="text-xs opacity-90">{tr("chatSubtitle")}</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 hover:bg-card/20"
              aria-label={tr("chatClose")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-base ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.content || <span className="opacity-60">…</span>}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t-2 border-border bg-card p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tr("chatPlaceholder")}
              disabled={loading}
              className="h-12 rounded-full text-base"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="h-12 w-12 shrink-0 rounded-full"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
