import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Bone, Brain, Loader2, RefreshCw, ScanFace, UploadCloud, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Disclaimer, PageShell } from "@/components/site/page-shell";

export const Route = createFileRoute("/diagnostics")({
  head: () => ({
    meta: [
      { title: "AI Medical Imaging — SehatSaathi AI" },
      {
        name: "description",
        content:
          "Upload a chest X-ray, brain MRI or skin photo and get an AI reading with confidence score and clinical notes.",
      },
      { property: "og:title", content: "AI Medical Imaging — SehatSaathi AI" },
      { property: "og:description", content: "X-ray, MRI and skin analysis with confidence scoring." },
    ],
  }),
  component: Diagnostics,
});

const tabs = [
  { id: "xray", label: "X-Ray (Pneumonia)", icon: Bone },
  { id: "mri", label: "MRI (Brain Tumor)", icon: Brain },
  { id: "skin", label: "Skin Analysis", icon: ScanFace },
];

function Diagnostics() {
  const [tab, setTab] = useState("xray");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setResult(null);
    setError(null);
  };

  const submitAnalysis = async () => {
    if (!file) return;
    setStatus("loading");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      let endpoint = "";
      if (tab === "skin") {
        endpoint = `/api/medical/skin/analyze`; // Matches the Vercel rewrite proxy
      } else {
        endpoint = `/analyze-medical-image`;
        formData.append("modality", tab);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errMsg = "Analysis failed. Please try again.";
        try {
          const errData = await response.json();
          if (errData.detail) errMsg = errData.detail;
          else if (errData.error) errMsg = errData.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setResult(data);
      setStatus("done");
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
      setStatus("idle");
    }
  };

  const reset = () => {
    setPreview(null);
    setFile(null);
    setResult(null);
    setStatus("idle");
    setError(null);
  };

  return (
    <PageShell
      eyebrow="Module 01"
      title="AI Medical Imaging Dashboard"
      description="Pick a scan type, upload your image, and read a structured AI interpretation in seconds."
      wide
    >
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          reset();
        }}
      >
        <TabsList className="mx-auto h-auto w-full max-w-2xl gap-1 rounded-full p-1.5">
          {tabs.map((tb) => (
            <TabsTrigger key={tb.id} value={tb.id} className="flex-1 gap-2 rounded-full py-2.5 text-xs sm:text-sm">
              <tb.icon className="size-4" />
              <span className="hidden sm:inline">{tb.label}</span>
              <span className="sm:hidden">{tb.label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <Card className="rounded-3xl border-border/60 p-6 shadow-soft lg:col-span-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {!preview ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-[22rem] w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
                dragging ? "border-primary bg-primary-soft" : "border-border hover:border-primary/60 hover:bg-primary-soft/50"
              }`}
            >
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex size-16 items-center justify-center rounded-3xl bg-primary-soft text-primary"
              >
                <UploadCloud className="size-8" />
              </motion.span>
              <p className="text-base font-semibold">Drag &amp; drop your medical scan here</p>
              <p className="text-sm text-muted-foreground">or click to browse — JPG, PNG or DICOM export, up to 20MB</p>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-3xl bg-secondary">
                <img src={preview} alt="Uploaded scan" className="max-h-[24rem] w-full object-contain" />
                {status === "loading" && (
                  <>
                    <div className="absolute inset-0 bg-primary/10" />
                    <div className="scan-line absolute top-0 left-0 w-full h-1 bg-primary/80 animate-[scan_2s_ease-in-out_infinite]" />
                  </>
                )}
              </div>
              
              {error && (
                <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              {status === "idle" && (
                <Button className="w-full gap-2 rounded-full font-semibold" size="lg" onClick={submitAnalysis}>
                  <Brain className="size-4" /> Run AI Analysis
                </Button>
              )}

              {status === "loading" && (
                <div className="flex items-center justify-center gap-3 text-sm font-medium text-primary py-3">
                  <Loader2 className="size-4 animate-spin" />
                  SehatSaathi AI is analyzing your scan...
                </div>
              )}

              {status === "done" && (
                <Button variant="outline" className="w-full gap-2 rounded-full" onClick={reset}>
                  <RefreshCw className="size-4" /> Upload another scan
                </Button>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-3">
          {status !== "done" || !result ? (
            <Card className="flex min-h-[22rem] flex-col items-center justify-center gap-3 rounded-3xl border-border/60 p-8 text-center shadow-soft">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <Brain className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                Your AI report will appear here once a scan is analysed.
              </p>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* PRIMARY DIAGNOSIS CARD */}
              <Card className="rounded-3xl border-border/60 p-7 shadow-lift overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-xs font-bold tracking-widest text-primary uppercase">PRIMARY FINDING</p>
                  <Badge
                    className="rounded-full font-semibold px-3 py-1"
                    variant={((result.confidence || result.probability || 0) * 100) > 80 ? "default" : "secondary"}
                  >
                    AI MATCH
                  </Badge>
                </div>
                
                <h2 className="mt-4 text-4xl font-display font-semibold tracking-tight relative z-10 text-foreground">
                  {result.finding || result.primary_concern || result.condition || result.prediction || "Unknown"}
                  {result.skin_type && <span className="block text-xl text-muted-foreground mt-2">Type: {result.skin_type}</span>}
                </h2>

                <div className="mt-8 relative z-10">
                  <div className="flex items-end justify-between mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Model Confidence</p>
                    <p className="font-display text-2xl font-bold text-primary">{((result.confidence || result.probability || 0) * 100).toFixed(1)}%</p>
                  </div>
                  <Progress value={(result.confidence || result.probability || 0) * 100} className="h-3" />
                </div>
              </Card>

              {/* TWO COLUMN LAYOUT FOR DETAILS */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* LEFT COL: Predictions & Notes */}
                <div className="space-y-6">
                  {result.top_predictions && result.top_predictions.length > 0 ? (
                     <Card className="rounded-3xl border-border/60 p-6 shadow-soft">
                        <div className="flex items-center gap-2 mb-5">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">TOP PREDICTIONS</h4>
                        </div>
                        <div className="space-y-5">
                          {result.top_predictions.map((pred: any, idx: number) => (
                             <div key={idx} className="space-y-2">
                               <div className="flex justify-between text-sm font-medium">
                                 <span className="capitalize">{pred.label.replace(/_/g, ' ')}</span>
                                 <span className={pred.confidence > 0.5 ? 'text-primary' : 'text-muted-foreground'}>
                                   {(pred.confidence * 100).toFixed(1)}%
                                 </span>
                               </div>
                               <Progress value={pred.confidence * 100} className="h-2 opacity-70" />
                             </div>
                          ))}
                        </div>
                     </Card>
                  ) : result.conditions_detected && result.conditions_detected.length > 0 ? (
                    <Card className="rounded-3xl border-border/60 p-6 shadow-soft">
                        <div className="flex items-center gap-2 mb-5">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">CONDITIONS DETECTED</h4>
                        </div>
                        <div className="space-y-5">
                          {result.conditions_detected.map((cond: any, idx: number) => (
                             <div key={idx} className="space-y-2">
                               <div className="flex justify-between text-sm font-medium">
                                 <span className="capitalize">{cond.condition}</span>
                                 <span className={cond.confidence > 0.5 ? 'text-primary' : 'text-muted-foreground'}>
                                   {(cond.confidence * 100).toFixed(0)}%
                                 </span>
                               </div>
                               <Progress value={cond.confidence * 100} className="h-2 opacity-70" />
                             </div>
                          ))}
                        </div>
                     </Card>
                  ) : null}

                  <Card className="rounded-3xl border-border/60 p-6 shadow-soft">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">CLINICAL NOTES</h4>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {result.detail_summary || result.notes || result.recommendation || "Please consult a specialist for a definitive diagnosis."}
                    </p>
                  </Card>
                  
                  {/* Skin Actives */}
                  {result.ingredient_recommendations && result.ingredient_recommendations.length > 0 && (
                     <Card className="rounded-3xl border-border/60 p-6 shadow-soft">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">FORMULATED ACTIVES</h4>
                        </div>
                        <div className="space-y-4">
                          {result.ingredient_recommendations.map((ing: any, idx: number) => (
                            <div key={idx} className="flex gap-3 p-3 rounded-2xl bg-secondary/50">
                              <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                {ing.name.substring(0,2).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm">{ing.name}</h5>
                                <p className="text-xs text-muted-foreground mt-1 leading-snug">{ing.benefit || ing.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                     </Card>
                  )}
                </div>

                {/* RIGHT COL: Pharmacy, Precautions, Diet */}
                <div className="space-y-6">
                  
                  {/* Medicines / Protocol */}
                  {result.full_clinical_report?.medicines?.length > 0 ? (
                    <Card className="rounded-3xl border-border/60 p-6 shadow-soft bg-primary/5 border-primary/20">
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="text-sm font-bold tracking-widest text-primary uppercase">RECOMMENDED PROTOCOL</h4>
                        <Pill className="size-4 text-primary" />
                      </div>
                      <div className="space-y-3">
                        {result.full_clinical_report.medicines.map((m: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 bg-background p-3 rounded-2xl border border-border/50">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">💊</div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-semibold truncate">{typeof m === 'string' ? m : (m.name || "Medicine")}</h5>
                              <p className="text-xs text-muted-foreground truncate">{typeof m === 'string' ? "Pharmacy" : (m.manufacturer || "Pharmacy")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ) : null}

                  {/* Precautions */}
                  {result.full_clinical_report?.precautions?.length > 0 && (
                    <Card className="rounded-3xl border-border/60 p-6 shadow-soft border-l-4 border-l-amber-500">
                      <h4 className="text-sm font-bold tracking-widest text-amber-600 uppercase mb-4">PRECAUTIONS</h4>
                      <ul className="space-y-2 text-sm text-foreground/80">
                        {result.full_clinical_report.precautions.map((p: string, idx: number) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Diet */}
                  {result.full_clinical_report?.diet_plan?.length > 0 && (
                    <Card className="rounded-3xl border-border/60 p-6 shadow-soft border-l-4 border-l-green-500">
                      <h4 className="text-sm font-bold tracking-widest text-green-600 uppercase mb-4">DIET PLAN</h4>
                      <ul className="space-y-2 text-sm text-foreground/80">
                        {result.full_clinical_report.diet_plan.map((d: string, idx: number) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-green-500 font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  
                </div>
              </div>

              <Disclaimer />
            </motion.div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
