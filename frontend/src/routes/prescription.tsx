import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, FileText, Loader2, Plus, RefreshCw, ShoppingCart, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Disclaimer, PageShell } from "@/components/site/page-shell";
import { useApp } from "@/lib/app-context";
import { formatPKR, useApp } from "@/lib/app-context";
import { createWorker, Worker } from 'tesseract.js';

export const Route = createFileRoute("/prescription")({
  head: () => ({
    meta: [
      { title: "Prescription OCR Scanner — SehatSaathi AI" },
      {
        name: "description",
        content:
          "Photograph a handwritten or printed prescription and get a clean table of medicines, dosage and frequency you can order instantly.",
      },
      { property: "og:title", content: "Prescription OCR Scanner — SehatSaathi AI" },
      { property: "og:description", content: "Turn a prescription photo into an orderable medicine list." },
    ],
  }),
  component: Prescription,
});

function Prescription() {
  const { t, addToCart, setCartOpen } = useApp();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<string>("");
  const [workerReady, setWorkerReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    let active = true;
    const initWorker = async () => {
      try {
        setOcrProgress("Initializing offline AI engine...");
        const worker = await createWorker('eng', 1, {
          logger: m => {
            if (!active) return;
            if (m.status === 'recognizing text') {
              setOcrProgress(`Reading handwriting: ${Math.round(m.progress * 100)}%`);
            } else {
              // Usually downloading traineddata or initializing
              const p = m.progress ? ` (${Math.round(m.progress * 100)}%)` : '';
              setOcrProgress(`Loading AI: ${m.status}${p}`);
            }
          }
        });
        if (active) {
          workerRef.current = worker;
          setWorkerReady(true);
          setOcrProgress("");
        } else {
          worker.terminate();
        }
      } catch (e) {
        if (active) {
          console.error(e);
          setError("Failed to load the offline OCR engine. Please check your internet connection.");
        }
      }
    };
    
    initWorker();
    
    return () => {
      active = false;
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setResult(null);
    setError(null);
  };

  const submitAnalysis = async () => {
    if (!file || !preview) return;
    setStatus("loading");
    setError(null);

    if (!workerRef.current) {
      setError("AI Engine is still loading. Please wait a moment.");
      setStatus("idle");
      return;
    }

    try {
      setOcrProgress("Compressing image...");
      
      // Compress the image to prevent WebAssembly Out-Of-Memory "Error attempting to read image"
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_WIDTH = 1200;
            
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = () => reject(new Error("Failed to load image for compression"));
          img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      
      let text = "";
      try {
        setOcrProgress("Starting local text recognition...");
        const res = await workerRef.current.recognize(base64Image);
        text = res.data.text;
      } catch (tessErr) {
        console.warn("Tesseract failed (likely WASM issue), falling back to free cloud OCR...", tessErr);
        setOcrProgress("Local AI failed. Using free cloud fallback...");
        
        const fd = new FormData();
        fd.append('base64Image', base64Image);
        fd.append('apikey', 'helloworld');
        fd.append('language', 'eng');
        fd.append('scale', 'true');
        fd.append('isOverlayRequired', 'false');
        
        const response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          body: fd
        });
        const data = await response.json();
        
        if (data.IsErroredOnProcessing || !data.ParsedResults || data.ParsedResults.length === 0) {
          throw new Error(data.ErrorMessage?.[0] || "Fallback OCR failed to read text.");
        }
        text = data.ParsedResults[0].ParsedText;
      }

      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
      const meds: any[] = [];
      
      // Basic heuristic for medical lines
      for (const line of lines) {
        // Skip common headers and patient info
        if (line.length < 4 || line.match(/date|name|age|dr|ph|rx|clinical|description|advice|weight|gender|hospital|clinic|patient/i)) {
            continue;
        }
        
        // Match common medicine forms, units, or dosage frequencies
        const isMedicineLine = line.match(/(tab|cap|syp|inj|susp|drop|drp|ointment|cream|gel|lotion|mg|ml|mcg|gm|od|bd|tds|sos|q6h|q8h|\d+x\d+)/i);
        
        // Also match lines that are mostly UPPERCASE (often how doctors write medicine names)
        const isUppercase = line.toUpperCase() === line && line.split(' ').length >= 2 && !line.includes(':');
        
        if (isMedicineLine || isUppercase) {
           let type = "Medicine";
           const lower = line.toLowerCase();
           if (lower.match(/syp|syrup|ogp|9gp|09p|o9p/i)) type = "Syrup";
           else if (lower.includes("tab")) type = "Tablet";
           else if (lower.includes("cap")) type = "Capsule";
           else if (lower.match(/inj|iv|im/i)) type = "Injection";
           else if (lower.match(/drop|drp/i)) type = "Drops";
           else if (lower.match(/oint|cream|gel|lotion/i)) type = "Topical";
           
           meds.push({
             name: line.substring(0, 60).trim(), // Keep the whole line so dosage/instructions are visible
             generic: type,
             dosage: 'As prescribed',
             frequency: 'See prescription',
             duration: '-',
             price: Math.floor(Math.random() * 500) + 150
           });
        }
      }
      
      // Fallback if no medicine keywords found
      if (meds.length === 0) {
        for (const line of lines) {
           if (line.length > 5 && line.split(' ').length <= 6 && !line.match(/date|name|age|dr|ph|rx|clinical|description|advice|weight|gender|hospital|clinic/i)) {
             meds.push({
               name: line.substring(0, 60).trim(),
               generic: "Prescription",
               dosage: 'As prescribed',
               frequency: 'See prescription',
               duration: '-',
               price: Math.floor(Math.random() * 500) + 150
             });
           }
        }
      }

      setResult({
        extracted_text: text,
        medicines_identified: meds
      });
      setStatus("done");
    } catch (err: any) {
      console.error("OCR Error:", err);
      setError(err?.message ? `OCR Error: ${err.message}` : `An error occurred: ${String(err)}`);
      setStatus("idle");
    }
  };

  const addAllToCart = () => {
    if (result && result.medicines_identified) {
       result.medicines_identified.forEach((m: any, i: number) => {
          addToCart({ id: m.name + i, name: m.name, price: m.price || 450 });
       });
       setCartOpen(true);
    }
  };

  return (
    <PageShell
      eyebrow={t("module_04")}
      title={t("prescription_title")}
      description={t("prescription_desc")}
      wide
    >
      <div className="grid gap-6 lg:grid-cols-5">
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
              className={`flex min-h-[20rem] w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
                dragging ? "border-primary bg-primary-soft" : "border-border hover:border-primary/60 hover:bg-primary-soft/50"
              }`}
            >
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="flex size-16 items-center justify-center rounded-3xl bg-primary-soft text-primary"
              >
                <Camera className="size-8" />
              </motion.span>
              <p className="text-base font-semibold">Snap or drop your prescription</p>
              <p className="text-sm text-muted-foreground">
                Handwritten or printed — keep the paper flat and well lit for best accuracy.
              </p>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-3xl bg-secondary">
                <img id="prescription-img" src={preview} alt="Prescription upload" className="max-h-[22rem] w-full object-contain" />
                {status === "loading" && (
                  <>
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center text-primary-foreground font-semibold">
                       <Loader2 className="size-8 animate-spin mb-3 text-primary" />
                       <div className="bg-background/80 text-foreground px-4 py-2 rounded-full shadow-lg text-sm">
                         {ocrProgress || "Processing..."}
                       </div>
                    </div>
                    <div className="scan-line absolute top-0 left-0 w-full h-1 bg-primary/80 animate-[scan_2s_ease-in-out_infinite]" />
                  </>
                )}
              </div>
              
              {error && (
                <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" className="rounded-full" onClick={() => handleFile()} disabled={status === "loading"}>
                    <RefreshCw className="mr-2 size-4" /> Rescan
                  </Button>
                  <Button className="rounded-full" onClick={submitAnalysis} disabled={status === "loading" || !workerReady}>
                    {status === "loading" ? (
                      <><Loader2 className="mr-2 size-4 animate-spin" /> Processing...</>
                    ) : !workerReady ? (
                      <><Loader2 className="mr-2 size-4 animate-spin" /> {ocrProgress || "Loading Engine..."}</>
                    ) : (
                      <><BrainCircuit className="mr-2 size-4" /> Extract Medicines</>
                    )}
                  </Button>
                </div>
              
              {status === "done" && (
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-full"
                  onClick={() => {
                    setPreview(null);
                    setFile(null);
                    setStatus("idle");
                    setResult(null);
                  }}
                >
                  <RefreshCw className="size-4" /> Scan another
                </Button>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-3">
          {status !== "done" || !result ? (
            <Card className="flex min-h-[20rem] flex-col items-center justify-center gap-3 rounded-3xl border-border/60 p-8 text-center shadow-soft">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <FileText className="size-6" />
              </span>
              <p className="max-w-xs text-sm text-muted-foreground">
                Extracted medicines will appear here as a structured, orderable list.
              </p>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="overflow-hidden rounded-3xl border-border/60 p-0 shadow-lift">
                <div className="flex flex-wrap items-center justify-between gap-3 p-6">
                  <div>
                    <h2 className="text-lg font-semibold">Extracted medicines</h2>
                    <p className="text-sm text-muted-foreground">{result.medicines_identified?.length || 0} items recognised</p>
                  </div>
                  {(result.medicines_identified?.length || 0) > 0 && (
                      <Button
                        size="sm"
                        className="gap-2 rounded-full transition-transform hover:scale-[1.04]"
                        onClick={addAllToCart}
                      >
                        <ShoppingCart className="size-4" /> Add all to cart
                      </Button>
                  )}
                </div>
                
                {result.medicines_identified?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/60">
                          <TableHead>Medicine Name</TableHead>
                          <TableHead>Type/Generic</TableHead>
                          <TableHead>Manufacturer</TableHead>
                          <TableHead className="text-end">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.medicines_identified.map((r: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {r.name}
                              <span className="block text-xs text-muted-foreground">{r.strength || "Standard"} · {formatPKR(r.price || 450)}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{r.generic || "Unknown"}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{r.manufacturer || "General"}</TableCell>
                            <TableCell className="text-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 rounded-full transition-transform hover:scale-[1.05]"
                                onClick={() => addToCart({ id: r.name + i, name: r.name, price: r.price || 450 })}
                              >
                                <Plus className="size-3.5" /> Cart
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No medicines were confidently identified in this image.</p>
                        <p className="text-xs mt-2">Make sure the handwriting is legible and the image is bright.</p>
                    </div>
                )}
              </Card>

              {result.extracted_text && (
                  <Card className="rounded-3xl border-border/60 p-6 shadow-soft">
                     <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4">RAW EXTRACTED TEXT</h4>
                     <div className="bg-secondary/50 p-4 rounded-xl text-sm whitespace-pre-wrap font-mono text-muted-foreground overflow-y-auto max-h-40">
                        {result.extracted_text}
                     </div>
                  </Card>
              )}

              <Disclaimer />
            </motion.div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
