import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Loader2, MessageCircle, Plus, Search, Sparkles, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Disclaimer, PageShell } from "@/components/site/page-shell";
import { predictionBank, symptomOptions } from "@/lib/mock-data";

export const Route = createFileRoute("/symptoms")({
  head: () => ({
    meta: [
      { title: "Symptom Checker & Disease Predictor — SehatSaathi AI" },
      {
        name: "description",
        content:
          "Add your symptoms and get the three most likely conditions with recommended precautions and next steps.",
      },
      { property: "og:title", content: "Symptom Checker — SehatSaathi AI" },
      { property: "og:description", content: "Top predicted conditions plus precautions, in seconds." },
    ],
  }),
  component: Symptoms,
});

function Symptoms() {
  const [selected, setSelected] = useState<string[]>(["Fever", "Cough"]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const suggestions = useMemo(
    () =>
      symptomOptions
        .filter((s) => !selected.includes(s) && s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8),
    [query, selected],
  );

  const predictions = useMemo(() => {
    const seed = selected.length;
    return [...predictionBank]
      .sort((a, b) => b.probability - a.probability)
      .slice(seed % 2, (seed % 2) + 3);
  }, [selected]);

  const add = (s: string) => {
    setSelected((prev) => (prev.includes(s) ? prev : [...prev, s]));
    setQuery("");
    setDone(false);
  };

  const predict = () => {
    setLoading(true);
    setDone(false);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1800);
  };

  return (
    <PageShell
      eyebrow="Module 02"
      title="Symptom Checker & Disease Predictor"
      description="Tell us what you're feeling. We compare your symptom pattern against thousands of clinical cases."
      wide
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-border/60 p-7 shadow-soft">
          <h2 className="text-lg font-semibold">Your symptoms</h2>
          <div className="relative mt-4">
            <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) add(suggestions[0] ?? query.trim());
              }}
              placeholder="Type a symptom, e.g. Fever, Headache..."
              className="h-12 rounded-2xl ps-10"
            />
          </div>

          {selected.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.map((s) => (
                <motion.span key={s} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <Badge className="gap-1.5 rounded-full bg-primary-soft py-1.5 pe-1.5 ps-3 text-accent-foreground hover:bg-primary-soft">
                    {s}
                    <button
                      type="button"
                      aria-label={`Remove ${s}`}
                      onClick={() => setSelected((prev) => prev.filter((x) => x !== s))}
                      className="flex size-5 items-center justify-center rounded-full transition-colors hover:bg-foreground/10"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                </motion.span>
              ))}
            </div>
          )}

          <p className="mt-6 text-xs font-semibold tracking-widest text-muted-foreground">SUGGESTIONS</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => add(s)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-sm text-muted-foreground transition-all hover:scale-[1.03] hover:border-primary/50 hover:text-foreground"
              >
                <Plus className="size-3.5" /> {s}
              </button>
            ))}
          </div>

          <Button
            size="lg"
            className="mt-8 w-full rounded-full transition-transform hover:scale-[1.02]"
            disabled={!selected.length || loading}
            onClick={predict}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Analysing symptom pattern...
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Predict Disease
              </>
            )}
          </Button>
        </Card>

        <div className="space-y-6">
          {!done ? (
            <Card className="flex min-h-[20rem] flex-col items-center justify-center gap-3 rounded-3xl border-border/60 p-8 text-center shadow-soft">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <Sparkles className="size-6" />
              </span>
              <p className="max-w-xs text-sm text-muted-foreground">
                Add at least one symptom and run the predictor to see your top three likely conditions.
              </p>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="rounded-3xl border-border/60 p-7 shadow-lift">
                <h2 className="text-lg font-semibold">Top 3 predictions</h2>
                <Accordion type="single" collapsible defaultValue="p-0" className="mt-2">
                  {predictions.map((p, i) => (
                    <AccordionItem key={p.disease} value={`p-${i}`} className="border-border/60">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex w-full items-center gap-4 pe-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xs font-bold text-primary">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1 text-start">
                            <p className="truncate font-semibold">{p.disease}</p>
                            <Progress value={p.probability} className="mt-2 h-1.5" />
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-primary">{p.probability}%</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 ps-12 text-sm">
                        <p className="text-muted-foreground">{p.summary}</p>
                        <p className="text-xs font-semibold tracking-widest text-muted-foreground">PRECAUTIONS</p>
                        <ul className="space-y-1.5">
                          {p.precautions.map((c) => (
                            <li key={c} className="flex gap-2">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <Button variant="outline" className="mt-6 w-full gap-2 rounded-full" asChild>
                  <Link to="/chat">
                    <MessageCircle className="size-4" /> Ask AI Assistant
                  </Link>
                </Button>
              </Card>
              <Disclaimer />
            </motion.div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
