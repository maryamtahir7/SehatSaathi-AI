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

Format the plan clearly with Breakfast, Lunch, Dinner, and Snacks. For each meal, list the foods, approximate portions, and calorie estimates. At the end, add a brief nutritional summary and 3 key diet tips for the patient's conditions. Use Markdown formatting.`;

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
        <Card className="rounded-3xl border-border/60 p-7 shadow-soft no-print lg:col-span-2">
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
              <><Loader2 className="size-4 animate-spin" /> Building your plan...</>
            ) : (
              <><Sparkles className="size-4" /> Generate Custom Diet Plan</>
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
            <Card className="flex min-h-[22rem] flex-col items-center justify-center gap-3 rounded-3xl border-border/60 p-8 text-center shadow-soft">
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
              <Card className="rounded-3xl border-border/60 p-7 shadow-lift">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Your AI Diet Plan</h2>
                    <p className="text-sm text-muted-foreground">
                      {picked.length ? picked.join(" · ") : "No restrictions"} · {form.goal === "loss" ? "Weight loss" : form.goal === "gain" ? "Weight gain" : "Maintenance"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="gap-1.5 rounded-full bg-primary-soft py-1.5 text-accent-foreground hover:bg-primary-soft">
                      <Flame className="size-3.5" /> {target} kcal target
                    </Badge>
                    <Button variant="outline" size="sm" className="gap-2 rounded-full no-print" onClick={() => window.print()}>
                      <Printer className="size-4" /> Print Plan
                    </Button>
                  </div>
                </div>

                <div className="mt-6 prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ ...props }) => <h1 className="text-lg font-bold mb-3 mt-5 text-foreground" {...props} />,
                      h2: ({ ...props }) => <h2 className="text-base font-bold mb-2 mt-4 text-foreground" {...props} />,
                      h3: ({ ...props }) => <h3 className="text-sm font-bold mb-2 mt-3 text-foreground" {...props} />,
                      p: ({ ...props }) => <p className="mb-3 text-muted-foreground last:mb-0" {...props} />,
                      ul: ({ ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-muted-foreground" {...props} />,
                      ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-muted-foreground" {...props} />,
                      li: ({ ...props }) => <li className="pl-1" {...props} />,
                      strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                      table: ({ ...props }) => <div className="overflow-x-auto my-3"><table className="w-full border-collapse text-xs" {...props} /></div>,
                      th: ({ ...props }) => <th className="border border-border/50 bg-secondary px-3 py-2 text-left font-semibold text-foreground" {...props} />,
                      td: ({ ...props }) => <td className="border border-border/50 px-3 py-2 text-muted-foreground" {...props} />,
                    }}
                  >
                    {aiPlan}
                  </ReactMarkdown>
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
