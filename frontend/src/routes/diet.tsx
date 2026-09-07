import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle, Flame, Loader2, Printer, Salad, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Disclaimer, PageShell } from "@/components/site/page-shell";

export const Route = createFileRoute("/diet")({
  head: () => ({
    meta: [
      { title: "Personalised Diet & Nutrition Planner — SehatSaathi AI" },
      {
        name: "description",
        content:
          "Enter your age, weight, height and goal to generate a calorie-aware daily meal plan tuned to your medical conditions.",
      },
      { property: "og:title", content: "Diet & Nutrition Planner — SehatSaathi AI" },
      { property: "og:description", content: "Calorie-aware meal plans for your goal and conditions." },
    ],
  }),
  component: Diet,
});

const restrictions = ["Diabetes", "Hypertension", "Gluten-Free", "Lactose Intolerant", "Vegetarian", "Low Sodium"];

function Diet() {
  const [form, setForm] = useState({ age: "32", weight: "78", height: "172", gender: "male", goal: "loss" });
  const [picked, setPicked] = useState<string[]>(["Diabetes"]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bmr =
    form.gender === "male"
      ? 10 * Number(form.weight) + 6.25 * Number(form.height) - 5 * Number(form.age) + 5
      : 10 * Number(form.weight) + 6.25 * Number(form.height) - 5 * Number(form.age) - 161;
  const target = Math.round(
    (bmr * 1.35 + (form.goal === "loss" ? -450 : form.goal === "gain" ? 400 : 0)) / 10,
  ) * 10;

  const generate = async () => {
    setLoading(true);
    setDone(false);
    setError(null);
    setAiPlan(null);

    const goalLabel = form.goal === "loss" ? "Weight Loss" : form.goal === "gain" ? "Weight Gain" : "Maintenance";
    const conditions = picked.length > 0 ? picked.join(", ") : "None";
    const prompt = `Create a detailed, practical 1-day meal plan for a patient with these parameters:
- Age: ${form.age} years
- Weight: ${form.weight} kg
- Height: ${form.height} cm
- Gender: ${form.gender}
- Goal: ${goalLabel}
- Target Calories: ${target} kcal/day
- Medical Conditions / Restrictions: ${conditions}

CRITICAL FORMATTING INSTRUCTIONS:
Please provide a highly detailed and visually appealing diet plan. Use emojis for headings.
For each meal (Breakfast, Mid-Morning Snack, Lunch, Afternoon Snack, Dinner), use an H3 heading (###) with an emoji and the calorie count (e.g., "### 🌅 Breakfast (350 kcal)").
Under each meal heading, provide a detailed bulleted list (-) of the food items, exact portions, and ingredients. Add preparation tips if necessary.
At the end, add an H3 heading for "📊 Nutritional Summary" and one for "💡 Diet Tips" with actionable advice.`;

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, language: "en", history: [] }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setAiPlan(data.response ?? "Could not generate a plan.");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate diet plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Module 03"
      title="Diet & Nutrition Planner"
      description="A dietitian-style plan built around your body metrics, goal and medical conditions."
      wide
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="rounded-3xl border-border/60 p-7 shadow-soft no-print lg:col-span-2 h-fit">
          <h2 className="text-lg font-semibold">Your profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" inputMode="numeric" className="rounded-xl" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" inputMode="numeric" className="rounded-xl" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" inputMode="numeric" className="rounded-xl" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className="w-full rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Goal</Label>
              <Select value={form.goal} onValueChange={(v) => setForm({ ...form, goal: v })}>
                <SelectTrigger className="w-full rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="loss">Weight Loss</SelectItem>
                  <SelectItem value="gain">Weight Gain</SelectItem>
                  <SelectItem value="maintain">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold tracking-widest text-muted-foreground">DIETARY RESTRICTIONS</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {restrictions.map((r) => {
              const on = picked.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => setPicked((p) => (on ? p.filter((x) => x !== r) : [...p, r]))}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-all hover:scale-[1.03] ${
                    on
                      ? "border-primary/40 bg-primary-soft text-accent-foreground"
                      : "border-border/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <Button size="lg" className="mt-8 w-full rounded-full transition-transform hover:scale-[1.02]" onClick={generate} disabled={loading}>
            {loading ? (
              <><Loader2 className="size-4 animate-spin mr-2" /> Building your plan...</>
            ) : (
              <><Sparkles className="size-4 mr-2" /> Generate Custom Diet Plan</>
            )}
          </Button>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="flex items-start gap-3 rounded-3xl border-destructive/40 bg-destructive/5 p-6">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Generation Failed</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                </div>
              </Card>
            </motion.div>
          )}

          {!done && !error && (
            <Card className="flex min-h-[22rem] flex-col items-center justify-center gap-3 rounded-3xl border-border/60 p-8 text-center shadow-soft h-full">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <Salad className="size-6" />
              </span>
              <p className="max-w-xs text-sm text-muted-foreground">
                Fill in your details and click <strong>Generate Custom Diet Plan</strong> to get your personalized AI meal plan.
              </p>
            </Card>
          )}

          {done && aiPlan && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="rounded-3xl border-border/60 p-1 shadow-lift overflow-hidden">
                <div className="bg-primary-soft/50 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-display font-semibold">Your AI Diet Plan</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {picked.length ? picked.join(" · ") : "No restrictions"} · {form.goal === "loss" ? "Weight loss" : form.goal === "gain" ? "Weight gain" : "Maintenance"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="gap-1.5 rounded-full bg-primary py-1.5 text-primary-foreground hover:bg-primary px-3 shadow-soft">
                        <Flame className="size-3.5" /> {target} kcal
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-2 rounded-full no-print bg-background" onClick={() => window.print()}>
                        <Printer className="size-4" /> Print
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ ...props }) => <h1 className="hidden" {...props} />, // Hide H1 if AI includes it
                        h2: ({ ...props }) => <h2 className="text-lg font-bold mb-4 mt-8 text-foreground border-b pb-2" {...props} />,
                        h3: ({ ...props }) => (
                          <h3 className="mt-8 mb-4 flex items-center gap-3 rounded-2xl bg-secondary/50 px-5 py-3.5 text-base font-bold text-foreground border border-border/50 shadow-sm first:mt-0" {...props} />
                        ),
                        p: ({ ...props }) => <p className="mb-4 text-sm text-muted-foreground leading-relaxed" {...props} />,
                        ul: ({ ...props }) => (
                          <ul className="mb-6 space-y-3 rounded-2xl border border-border/60 bg-background p-5 shadow-soft" {...props} />
                        ),
                        ol: ({ ...props }) => (
                          <ol className="list-decimal pl-5 mb-6 space-y-2 text-muted-foreground" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="flex items-start gap-3 text-sm text-foreground/80 leading-relaxed group">
                            <span className="mt-1.5 flex size-1.5 shrink-0 rounded-full bg-primary/70 transition-transform group-hover:scale-150" />
                            <span className="flex-1">{props.children}</span>
                          </li>
                        ),
                        strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                        table: ({ ...props }) => <div className="overflow-x-auto mb-6 rounded-2xl border border-border/60"><table className="w-full border-collapse text-sm text-left" {...props} /></div>,
                        th: ({ ...props }) => <th className="bg-secondary px-4 py-3 font-semibold text-foreground border-b border-border/60" {...props} />,
                        td: ({ ...props }) => <td className="px-4 py-3 text-muted-foreground border-b border-border/40 last:border-0" {...props} />,
                      }}
                    >
                      {aiPlan.replace(/<br\s*\/?>/gi, '\n')}
                    </ReactMarkdown>
                  </div>
                </div>
              </Card>
              <Disclaimer />
            </motion.div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
