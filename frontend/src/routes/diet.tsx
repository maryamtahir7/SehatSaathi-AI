import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Flame, Loader2, Printer, Salad, Sparkles } from "lucide-react";
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
import { mealPlan } from "@/lib/mock-data";

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

  const bmr =
    form.gender === "male"
      ? 10 * Number(form.weight) + 6.25 * Number(form.height) - 5 * Number(form.age) + 5
      : 10 * Number(form.weight) + 6.25 * Number(form.height) - 5 * Number(form.age) - 161;
  const target = Math.round(
    (bmr * 1.35 + (form.goal === "loss" ? -450 : form.goal === "gain" ? 400 : 0)) / 10,
  ) * 10;

  const generate = () => {
    setLoading(true);
    setDone(false);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1600);
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
          {!done ? (
            <Card className="flex min-h-[22rem] flex-col items-center justify-center gap-3 rounded-3xl border-border/60 p-8 text-center shadow-soft">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <Salad className="size-6" />
              </span>
              <p className="max-w-xs text-sm text-muted-foreground">
                Fill in your details to generate a personalised daily meal plan.
              </p>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="rounded-3xl border-border/60 p-7 shadow-lift">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Your daily plan</h2>
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

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {mealPlan.map((m, i) => (
                    <motion.div
                      key={m.slot}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="card-hover rounded-2xl border border-border/60 bg-secondary/40 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold tracking-widest text-primary">{m.slot.toUpperCase()}</p>
                        <span className="text-xl">{m.emoji}</span>
                      </div>
                      <p className="mt-2 font-semibold">{m.title}</p>
                      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                        {m.items.map((it) => (
                          <li key={it} className="flex gap-2">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
                            {it}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-sm font-semibold">{m.calories} kcal</p>
                    </motion.div>
                  ))}
                  <div className="flex flex-col justify-center rounded-2xl border border-primary/25 bg-primary-soft/60 p-5">
                    <p className="text-xs font-semibold tracking-widest text-accent-foreground">DAILY TOTAL</p>
                    <p className="mt-1 font-display text-3xl font-semibold">
                      {mealPlan.reduce((n, m) => n + m.calories, 0)} kcal
                    </p>
                    <p className="mt-2 text-sm text-accent-foreground/80">
                      Protein 32% · Carbs 44% · Fats 24% · Water 3L
                    </p>
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
