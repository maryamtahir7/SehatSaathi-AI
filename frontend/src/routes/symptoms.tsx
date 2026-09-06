import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Loader2, MessageCircle, Plus, Search, Sparkles, X } from "lucide-react";
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
import { symptomOptions } from "@/lib/mock-data";

interface PredictionResult {
  disease: string;
  description: string;
  precautions: string[];
  medications: { name: string }[];
  diets: string[];
  workout: string[];
  confidence: number;
}

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
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(
    () =>
      symptomOptions
        .filter((s) => !selected.includes(s) && s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8),
    [query, selected],
  );

  const add = (s: string) => {
    setSelected((prev) => (prev.includes(s) ? prev : [...prev, s]));
    setQuery("");
    setDone(false);
    setResult(null);
    setError(null);
  };

  const predict = async () => {
    if (!selected.length) return;
    setLoading(true);
    setDone(false);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/predict-disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selected }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult({
        disease: data.disease ?? "Unknown",
        description: data.description ?? "No description available.",
        precautions: Array.isArray(data.precautions) ? data.precautions : [],
        medications: Array.isArray(data.medications) ? data.medications : [],
        diets: Array.isArray(data.diets) ? data.diets : [],
        workout: Array.isArray(data.workout) ? data.workout : [],
        confidence: typeof data.confidence === "number" ? Math.round(data.confidence * 100) : 85,
      });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Prediction failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Module 02"
      title="Symptom Checker & Disease Predictor"
      description="Tell us what you're feeling. Our ML model compares your symptom pattern against thousands of clinical cases."
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
              <><Loader2 className="size-4 animate-spin" /> Analysing symptom pattern...</>
            ) : (
              <><Sparkles className="size-4" /> Predict Disease</>
            )}
          </Button>
        </Card>

        <div className="space-y-6">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="flex items-start gap-3 rounded-3xl border-destructive/40 bg-destructive/5 p-6">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Prediction Failed</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                </div>
              </Card>
            </motion.div>
          )}

          {!done && !error && (
            <Card className="flex min-h-[20rem] flex-col items-center justify-center gap-3 rounded-3xl border-border/60 p-8 text-center shadow-soft">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <Sparkles className="size-6" />
              </span>
              <p className="max-w-xs text-sm text-muted-foreground">
                Add at least one symptom and click <strong>Predict Disease</strong> to get your AI-powered diagnosis.
              </p>
            </Card>
          )}

          {done && result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="rounded-3xl border-border/60 p-7 shadow-lift">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">AI Prediction</h2>
                  <Badge className="rounded-full bg-primary/10 text-primary px-3 py-1">
                    {result.confidence}% match
                  </Badge>
                </div>
                <Accordion type="multiple" defaultValue={["disease","precautions"]} className="mt-2">
                  <AccordionItem value="disease" className="border-border/60">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex w-full items-center gap-4 pe-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xs font-bold text-primary">Dx</span>
                        <div className="min-w-0 flex-1 text-start">
                          <p className="truncate font-semibold">{result.disease}</p>
                          <Progress value={result.confidence} className="mt-2 h-1.5" />
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-primary">{result.confidence}%</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="ps-12 text-sm text-muted-foreground">
                      {result.description}
                    </AccordionContent>
                  </AccordionItem>

                  {result.precautions.length > 0 && (
                    <AccordionItem value="precautions" className="border-border/60">
                      <AccordionTrigger className="hover:no-underline font-semibold">Precautions</AccordionTrigger>
                      <AccordionContent className="ps-4 text-sm">
                        <ul className="space-y-1.5">
                          {result.precautions.map((c) => (
                            <li key={c} className="flex gap-2">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />{c}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {result.medications.length > 0 && (
                    <AccordionItem value="meds" className="border-border/60">
                      <AccordionTrigger className="hover:no-underline font-semibold">Medications</AccordionTrigger>
                      <AccordionContent className="ps-4 text-sm">
                        <ul className="space-y-1.5">
                          {result.medications.map((m) => (
                            <li key={m.name} className="flex gap-2">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-green-500" />{m.name}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {result.diets.length > 0 && (
                    <AccordionItem value="diet" className="border-border/60">
                      <AccordionTrigger className="hover:no-underline font-semibold">Diet Recommendations</AccordionTrigger>
                      <AccordionContent className="ps-4 text-sm">
                        <ul className="space-y-1.5">
                          {result.diets.map((d) => (
                            <li key={d} className="flex gap-2">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />{d}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>

                <Button variant="outline" className="mt-6 w-full gap-2 rounded-full" asChild>
                  <Link to="/chat"><MessageCircle className="size-4" /> Ask AI About This Condition</Link>
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
