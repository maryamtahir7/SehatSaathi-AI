import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HeartPulse, SendHorizonal, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Disclaimer, PageShell } from "@/components/site/page-shell";
import { suggestedPrompts } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Health Assistant — SehatSaathi AI" },
      {
        name: "description",
        content:
          "Chat with the SehatSaathi AI health assistant about symptoms, medicines, nutrition and when to seek emergency care.",
      },
      { property: "og:title", content: "AI Health Assistant — SehatSaathi AI" },
      { property: "og:description", content: "Ask health questions and get clear, calm guidance 24/7." },
    ],
  }),
  component: Chat,
});

type Msg = { id: number; role: "user" | "ai" | "system"; text: string };

function Chat() {
  const { lang, t } = useApp();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      role: "ai",
      text: lang === 'ur' ? "السلام علیکم! میں آپ کا صحت ساتھی ہوں۔ مجھے بتائیں میں آپ کی کیا مدد کر سکتا ہوں؟" : "Assalam-o-Alaikum! I'm your SehatSaathi health assistant. Tell me what's bothering you, or pick one of the suggestions below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    
    const userMsg: Msg = { id: Date.now(), role: "user", text: clean };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'ai')
        .map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.text
        }));

      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          language: lang,
          history: history
        })
      });

      if (!res.ok) {
        throw new Error("Failed to connect to the assistant.");
      }

      const data = await res.json();
      setMessages((m) => [...m, { id: Date.now() + 1, role: "ai", text: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { id: Date.now() + 1, role: "system", text: "Error: Unable to reach the AI assistant. Please try again." }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <PageShell
      eyebrow="Module 06"
      title="AI Health Assistant"
      description="Available round the clock in English and Urdu — for the questions you'd rather not Google."
    >
      <Card className="flex h-[34rem] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-lift">
        <div className="glass flex items-center gap-3 border-b border-border/60 px-6 py-4">
          <span className="gradient-primary flex size-9 items-center justify-center rounded-xl text-primary-foreground">
            <HeartPulse className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">SehatSaathi Assistant</p>
            <p className="text-xs text-success">Online · replies instantly</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-6">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : m.role === "system" ? "justify-center" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-soft sm:max-w-[75%] ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : m.role === "system"
                    ? "bg-destructive/10 text-destructive border border-destructive/20 text-xs"
                    : "bg-secondary text-secondary-foreground markdown-content"
                }`}
              >
                {m.role === "user" || m.role === "system" ? (
                   <span style={{ whiteSpace: 'pre-wrap' }}>{m.text}</span>
                ) : (
                   <ReactMarkdown 
                     remarkPlugins={[remarkGfm]}
                     components={{
                       table: ({node, ...props}) => <div className="overflow-x-auto my-3"><table className="w-full border-collapse text-xs md:text-sm" {...props} /></div>,
                       th: ({node, ...props}) => <th className="border border-border/50 bg-background/50 px-3 py-2 text-left font-semibold" {...props} />,
                       td: ({node, ...props}) => <td className="border border-border/50 px-3 py-2" {...props} />,
                       p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                       ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                       ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                       li: ({node, ...props}) => <li className="pl-1" {...props} />,
                       h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 mt-4" {...props} />,
                       h2: ({node, ...props}) => <h2 className="text-base font-bold mb-3 mt-4" {...props} />,
                       h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2 mt-3" {...props} />,
                       strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                       a: ({node, ...props}) => <a className="text-primary underline hover:text-primary/80" {...props} />
                     }}
                   >
                     {m.text}
                   </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-3xl bg-secondary px-4 py-4">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                    className="size-2 rounded-full bg-muted-foreground"
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border/60 px-5 pb-5 pt-4 sm:px-6">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="shrink-0 rounded-full border border-border/70 px-3.5 py-1.5 text-xs text-muted-foreground transition-all hover:scale-[1.03] hover:border-primary/50 hover:text-foreground whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about symptoms, medicines or nutrition..."
              className="h-12 rounded-full px-5"
            />
            <Button
              type="submit"
              size="icon"
              disabled={typing || !input.trim()}
              className="size-12 shrink-0 rounded-full transition-transform hover:scale-[1.05]"
              aria-label="Send message"
            >
              <SendHorizonal className="size-4 rtl:rotate-180" />
            </Button>
          </form>
        </div>
      </Card>
      <div className="mt-6">
        <Disclaimer />
      </div>
    </PageShell>
  );
}
