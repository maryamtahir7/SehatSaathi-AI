import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Activity,
  Brain,
  ClipboardCheck,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Salad,
  Store,
  Stethoscope,
  UploadCloud,
  ArrowRight,
} from "lucide-react";
import heroImg from "@/assets/hero-health.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SehatSaathi AI — Your Personal AI Healthcare Companion" },
      {
        name: "description",
        content:
          "Analyse X-rays, MRIs and skin scans, check symptoms, get a personalised diet plan and order medicines — all in one AI health companion.",
      },
      { property: "og:title", content: "SehatSaathi AI — Your Personal AI Healthcare Companion" },
      {
        property: "og:description",
        content: "24/7 AI-powered health monitoring, diagnostics and medicine delivery.",
      },
    ],
  }),
  component: Home,
});

const features: { icon: any; titleKey: DictKey; bodyKey: DictKey; to: string }[] = [
  { icon: Activity, titleKey: "feat_1_title", bodyKey: "feat_1_body", to: "/diagnostics" },
  { icon: Stethoscope, titleKey: "feat_2_title", bodyKey: "feat_2_body", to: "/symptoms" },
  { icon: Salad, titleKey: "feat_3_title", bodyKey: "feat_3_body", to: "/diet" },
  { icon: ScanLine, titleKey: "feat_4_title", bodyKey: "feat_4_body", to: "/prescription" },
  { icon: Store, titleKey: "feat_5_title", bodyKey: "feat_5_body", to: "/pharmacy" },
];

const steps: { icon: any; titleKey: DictKey; bodyKey: DictKey }[] = [
  { icon: UploadCloud, titleKey: "home_step_1", bodyKey: "home_step_1_body" },
  { icon: Brain, titleKey: "home_step_2", bodyKey: "home_step_2_body" },
  { icon: ClipboardCheck, titleKey: "home_step_3", bodyKey: "home_step_3_body" },
];

function Home() {
  const { t, setCartOpen } = useAppContext();

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="surface-hero relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge variant="secondary" className="gap-1.5 rounded-full bg-primary-soft px-3.5 py-1.5 text-accent-foreground">
              <Sparkles className="size-3.5" /> {t("home_badge")}
            </Badge>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              {t("hero_title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{t("hero_sub")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-7 shadow-soft transition-transform hover:scale-[1.03]" asChild>
                <Link to="/diagnostics">{t("cta_diagnosis")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7 transition-transform hover:scale-[1.03]"
                asChild
              >
                <Link to="/pharmacy" onClick={() => setCartOpen(false)}>
                  {t("cta_medicines")}
                </Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> PMC-reviewed content</span>
              <span className="flex items-center gap-2"><Activity className="size-4 text-primary" /> 94% model accuracy</span>
              <span className="flex items-center gap-2"><Stethoscope className="size-4 text-primary" /> Doctors on call 24/7</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="overflow-hidden rounded-4xl shadow-lift">
              <img
                src={heroImg}
                alt="Doctor reviewing an AI health dashboard"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="glass absolute -bottom-6 start-4 rounded-3xl p-4 shadow-lift sm:start-8">
              <p className="text-xs text-muted-foreground">Latest scan</p>
              <p className="font-display text-lg font-semibold">Chest X-Ray · 89%</p>
              <p className="text-xs text-primary">Analysis complete in 3.2s</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">{t("features_title")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {t("home_feature_sub")}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link to={f.to} className="block h-full">
                <Card className="card-hover h-full gap-4 rounded-3xl border-border/60 p-7 shadow-soft">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <f.icon className="size-6" />
                  </span>
                  <h3 className="text-lg font-semibold">{t(f.titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(f.bodyKey)}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {t("home_explore")} <ArrowRight className="size-4 rtl:rotate-180" />
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold sm:text-4xl">{t("how_title")}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Card key={s.titleKey} className="card-hover rounded-3xl border-border/60 p-8 text-center shadow-soft">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <s.icon className="size-6" />
                </span>
                <p className="mt-4 text-xs font-semibold tracking-widest text-primary">STEP {i + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">{t(s.titleKey)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(s.bodyKey)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="gradient-primary overflow-hidden rounded-4xl border-0 p-10 text-center shadow-lift sm:p-16">
          <h2 className="text-3xl font-semibold text-primary-foreground sm:text-4xl">
            {t("home_cta_final")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">
            {t("home_cta_final_sub")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" className="rounded-full px-7 transition-transform hover:scale-[1.03]" asChild>
              <Link to="/diagnostics">{t("cta_diagnosis")}</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-primary-foreground/40 bg-transparent px-7 text-primary-foreground transition-transform hover:scale-[1.03] hover:bg-primary-foreground/10" asChild>
              <Link to="/chat">{t("home_talk_ai")}</Link>
            </Button>
          </div>
        </Card>
      </section>
    </motion.main>
  );
}
