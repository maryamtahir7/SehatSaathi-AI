import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SendHorizonal, Mic, MicOff, PhoneCall, PhoneOff, Volume2, VolumeX, Globe, HeartPulse, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Disclaimer, PageShell } from "@/components/site/page-shell";
import { useApp } from "@/lib/app-context";
import { suggestedPrompts } from "@/lib/mock-data";
import { productService } from "@/lib/appwrite";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Health Assistant — SehatSaathi AI" },
      { name: "description", content: "Chat with SehatSaathi AI health assistant about symptoms, medicines, nutrition and when to seek emergency care." },
      { property: "og:title", content: "AI Health Assistant — SehatSaathi AI" },
      { property: "og:description", content: "Ask health questions and get clear, calm guidance 24/7." },
    ],
  }),
  component: Chat,
});

type MedProduct = { id: string; name: string; price: number; image_url?: string; emoji?: string };
type Msg = { id: number; role: "user" | "ai" | "system"; text: string; products?: MedProduct[] };

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

function Chat() {
  const { lang, setLang, t, addToCart } = useApp();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      role: "ai",
      text: lang === "ur"
        ? "السلام علیکم! میں آپ کا صحت ساتھی ہوں۔ مجھے بتائیں میں آپ کی کیا مدد کر سکتا ہوں؟"
        : "Assalam-o-Alaikum! I'm your SehatSaathi AI assistant. Ask me about symptoms, medicines, diet, or anything health-related!",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [continuousCall, setContinuousCall] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-scroll: only scroll to bottom, don't jump the whole page
  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typing]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser. Please use Chrome.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ur" ? "ur-PK" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      send(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const toggleCallMode = () => {
    if (continuousCall) {
      setContinuousCall(false);
      if (listening) {
        recognitionRef.current?.stop();
        setListening(false);
      }
      window.speechSynthesis?.cancel();
    } else {
      setTtsEnabled(true);
      setContinuousCall(true);
      startListening();
    }
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setContinuousCall(false);
    } else {
      startListening();
    }
  };

  // TTS: speak AI responses when enabled
  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Strip markdown formatting and br tags so voice doesn't read dashes/asterisks
    const cleanText = text
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/[#*`\-_]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // clean links
      .replace(/\n/g, " ");

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = lang === "ur" ? "ur-PK" : "en-US";
    utter.rate = 0.95;
    
    utter.onend = () => {
      // If continuous call is active, immediately start listening again after AI finishes speaking
      if (continuousCall) {
        startListening();
      }
    };

    window.speechSynthesis.speak(utter);
  }, [ttsEnabled, lang, continuousCall]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    const userMsg: Msg = { id: Date.now(), role: "user", text: clean };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "ai")
        .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));

      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, language: lang, history }),
      });

      if (!res.ok) throw new Error("Failed to connect to the assistant.");

      const data = await res.json();
      const aiText: string = data.response ?? "I couldn't get a response. Please try again.";

      // Check if backend found any medicine products to show
      const products: MedProduct[] = Array.isArray(data.products) ? data.products : [];

      setMessages((m) => [...m, { id: Date.now() + 1, role: "ai", text: aiText, products }]);
      speak(aiText);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: "system", text: "Error: Unable to reach the AI assistant. Please check your connection." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleAddToCart = (product: MedProduct) => {
    addToCart({ id: product.id, name: product.name, price: product.price });
  };

  return (
    <PageShell
      eyebrow={t("module_06")}
      title={t("chat_title")}
      description={t("chat_desc")}
    >
      <Card className="flex flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-lift" style={{ height: "36rem" }}>
        {/* Header */}
        <div className="glass flex items-center gap-3 border-b border-border/60 px-6 py-4">
          <span className="gradient-primary flex size-9 items-center justify-center rounded-xl text-primary-foreground">
            <HeartPulse className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">SehatSaathi Assistant</p>
            <p className="text-xs text-success">Online · replies instantly</p>
          </div>
          {/* Controls: TTS toggle + Language toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => setTtsEnabled((v) => !v)}
              title={ttsEnabled ? "Disable voice output" : "Enable voice output"}
            >
              {ttsEnabled ? <Volume2 className="size-4 text-primary" /> : <VolumeX className="size-4 text-muted-foreground" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
              title={lang === "en" ? "Switch to Urdu" : "Switch to English"}
            >
              <Globe className="size-4" />
            </Button>
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {lang === "ur" ? "اردو" : "EN"}
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
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
                  dir={lang === "ur" && m.role === "ai" ? "rtl" : "ltr"}
                >
                  {m.role === "user" || m.role === "system" ? (
                    <span style={{ whiteSpace: "pre-wrap" }}>{m.text}</span>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ ...props }) => <div className="overflow-x-auto my-3"><table className="w-full border-collapse text-xs md:text-sm" {...props} /></div>,
                        th: ({ ...props }) => <th className="border border-border/50 bg-background/50 px-3 py-2 text-left font-semibold" {...props} />,
                        td: ({ ...props }) => <td className="border border-border/50 px-3 py-2" {...props} />,
                        p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                        ul: ({ ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                        ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                        li: ({ ...props }) => <li className="pl-1" {...props} />,
                        h1: ({ ...props }) => <h1 className="text-lg font-bold mb-3 mt-4" {...props} />,
                        h2: ({ ...props }) => <h2 className="text-base font-bold mb-3 mt-4" {...props} />,
                        h3: ({ ...props }) => <h3 className="text-sm font-bold mb-2 mt-3" {...props} />,
                        strong: ({ ...props }) => <strong className="font-semibold text-primary" {...props} />,
                        a: ({ ...props }) => <a className="text-primary underline hover:text-primary/80" {...props} />,
                      }}
                    >
                      {m.text.replace(/<br\s*\/?>/gi, '\n')}
                    </ReactMarkdown>
                  )}

                  {/* Medicine Product Cards inside the message */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {m.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-3 py-2"
                        >
                          <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-primary-soft/70 text-lg shrink-0">
                            {prod.image_url ? (
                              <img src={productService.getImageUrl(prod.image_url)} alt={prod.name} className="h-full w-full object-cover" />
                            ) : (
                              prod.emoji || "💊"
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{prod.name}</p>
                            <p className="text-xs text-primary font-bold">Rs {prod.price.toLocaleString()}</p>
                          </div>
                          <Button
                            size="sm"
                            className="h-7 rounded-full text-xs px-3 shrink-0"
                            onClick={() => handleAddToCart(prod)}
                          >
                            <ShoppingCart className="size-3 mr-1" /> Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

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

        {/* Input */}
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
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === "ur" ? "اپنا سوال یہاں لکھیں..." : "Ask about symptoms, medicines or nutrition..."}
              className="h-12 rounded-full px-5"
              dir={lang === "ur" ? "rtl" : "ltr"}
            />
            {/* Phone Call Button */}
            <Button
              type="button"
              size="icon"
              variant={continuousCall ? "destructive" : "secondary"}
              onClick={toggleCallMode}
              className={`size-12 shrink-0 rounded-full ${continuousCall ? "animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]" : ""}`}
              title={continuousCall ? "End call" : "Start Voice Call"}
            >
              {continuousCall ? <PhoneOff className="size-4" /> : <PhoneCall className="size-4" />}
            </Button>
            {/* Mic Button */}
            <Button
              type="button"
              size="icon"
              variant={listening && !continuousCall ? "destructive" : "outline"}
              onClick={toggleVoice}
              className="size-12 shrink-0 rounded-full"
              title={listening ? "Stop listening" : "Single Voice input"}
            >
              {listening && !continuousCall ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>
            {/* Send Button */}
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
