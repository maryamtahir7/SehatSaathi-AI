import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Search, Star, Truck, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/site/page-shell";
import { formatPKR, useApp } from "@/lib/app-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { productService, databases, DB, COL } from "@/lib/appwrite";

export const Route = createFileRoute("/pharmacy")({
  head: () => ({
    meta: [
      { title: "Online Pharmacy — SehatSaathi AI" },
      {
        name: "description",
        content:
          "Order authentic medicines, vitamins, supplements and medical devices with 60-minute delivery in major cities.",
      },
      { property: "og:title", content: "Online Pharmacy — SehatSaathi AI" },
      { property: "og:description", content: "Medicines and devices delivered in 60 minutes." },
    ],
  }),
  component: Pharmacy,
});

const FALLBACK_PRODUCTS = [
  { $id: "m1", name: "Paracetamol 500mg", brand: "GSK", price: 150, category: "First Aid", emoji: "💊", rating: 4.8 },
  { $id: "m2", name: "Vitamin C 1000mg", brand: "Abbott", price: 450, category: "Vitamins", emoji: "🍊", rating: 4.9 },
  { $id: "m3", name: "Aspirin 75mg", brand: "Bayer", price: 200, category: "Prescription", emoji: "🩺", rating: 4.7 },
  { $id: "m4", name: "Omega 3 Fish Oil", brand: "Nature's Bounty", price: 1250, category: "Supplements", emoji: "🐟", rating: 4.6 },
  { $id: "m5", name: "Amoxicillin 500mg", brand: "GSK", price: 320, category: "Prescription", emoji: "💉", rating: 4.5 },
  { $id: "m6", name: "Ibuprofen 400mg", brand: "Reckitt", price: 180, category: "First Aid", emoji: "💊", rating: 4.7 },
];

function Pharmacy() {
  const { addToCart, t } = useApp();
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [appwriteCategories, setAppwriteCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Prescription", "Vitamins", "Supplements", "First Aid", "Devices"];

  useEffect(() => {
    // Try to fetch custom categories from Appwrite
    databases.listDocuments(DB, COL.categories)
      .then(res => {
        if (res.documents && res.documents.length > 0) {
          setAppwriteCategories(res.documents);
        }
      })
      .catch(() => console.log("No custom categories found in Appwrite"));

    productService.list(100)
      .then((res) => {
        if (res.documents && res.documents.length > 0) {
          setProducts(res.documents);
        } else {
          // Fallback to Python API
          return fetch("/medicines/all?limit=50").then(r => r.json()).then(data => {
            setProducts(Array.isArray(data) && data.length > 0 ? data : FALLBACK_PRODUCTS);
          });
        }
      })
      .catch(() => {
        // Try Python API fallback
        fetch("/medicines/all?limit=50")
          .then(r => r.json())
          .then(data => setProducts(Array.isArray(data) && data.length > 0 ? data : FALLBACK_PRODUCTS))
          .catch(() => setProducts(FALLBACK_PRODUCTS));
      })
      .finally(() => setLoading(false));
  }, []);

  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          (p.name + p.brand).toLowerCase().includes(q.toLowerCase()),
      ),
    [cat, q, products],
  );

  return (
    <PageShell
      eyebrow="Module 05"
      title="SehatSaathi Pharmacy"
      description="Verified medicines and devices sourced from licensed distributors, at your door in 60 minutes."
      wide
    >
      <Card className="rounded-3xl border-border/60 p-6 shadow-soft">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search medicines, vitamins, devices..."
            className="h-13 rounded-2xl ps-11 text-base"
          />
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {appwriteCategories.length > 0 ? (
            <button
              onClick={() => setCat("All")}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all hover:scale-[1.03] ${
                cat === "All"
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border/70 bg-background/50 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              All Products
            </button>
          ) : null}
          {appwriteCategories.length > 0 ? (
            appwriteCategories.map((c) => (
              <button
                key={c.$id}
                onClick={() => setCat(c.name)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-all hover:scale-[1.03] ${
                  cat === c.name
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border/70 bg-background/50 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {(c.image || c.imageUrl || c.image_url) && (
                  <img src={productService.getImageUrl(c.image || c.imageUrl || c.image_url)} alt={c.name} className="size-6 rounded-full object-cover" />
                )}
                {c.name}
              </button>
            ))
          ) : (
            categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-4 py-2 text-sm transition-all hover:scale-[1.03] ${
                  cat === c
                    ? "border-primary/40 bg-primary-soft text-accent-foreground"
                    : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))
          )}
        </div>
        <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <Truck className="size-4 text-primary" /> Free delivery on orders above Rs 2,000 · Cash on delivery available
        </p>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary mb-4" />
          <p>Loading pharmacy inventory from database...</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((p, i) => (
              <motion.div
                key={p.id || i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <Card 
                  className="card-hover h-full gap-3 flex flex-col rounded-3xl border-border/60 p-5 shadow-soft cursor-pointer"
                  onClick={() => setSelectedProduct(p)}
                >
                  <div className="flex h-32 items-center justify-center rounded-2xl bg-primary-soft/70 text-5xl overflow-hidden">
                    {(p.imageUrl || p.image_url) ? (
                      <img src={productService.getImageUrl(p.imageUrl || p.image_url)} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      p.emoji || "💊"
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2 mt-3">
                    <p className="text-xs text-muted-foreground truncate">{p.brand}</p>
                    {p.tag && <Badge variant="secondary" className="rounded-full text-[10px]">{p.tag}</Badge>}
                  </div>
                  <h3 className="text-base font-semibold leading-snug line-clamp-2">{p.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Star className="size-3.5 fill-warning text-warning" /> {p.rating} · {p.category}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="font-display text-lg font-semibold">{formatPKR(p.price)}</span>
                    <Button
                      size="sm"
                      className="gap-1.5 rounded-full transition-transform hover:scale-[1.05]"
                      onClick={(e) => { e.stopPropagation(); addToCart({ id: p.$id || p.id, name: p.name, price: p.price, image: p.imageUrl || p.image_url }); }}
                    >
                      <Plus className="size-4" /> {t("add_to_cart")}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {list.length === 0 && (
            <p className="mt-16 text-center text-sm text-muted-foreground">
              No products matched your search. Try another keyword.
            </p>
          )}
        </>
      )}

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>{selectedProduct?.brand} · {selectedProduct?.category}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
             <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-secondary overflow-hidden text-7xl">
                {(selectedProduct?.imageUrl || selectedProduct?.image_url) ? (
                   <img src={productService.getImageUrl(selectedProduct.imageUrl || selectedProduct.image_url)} alt={selectedProduct?.name} className="h-full w-full object-cover" />
                ) : (
                   selectedProduct?.emoji || "💊"
                )}
             </div>
             <div className="space-y-2">
                <p className="font-semibold text-xl text-primary">{formatPKR(selectedProduct?.price || 0)}</p>
                <p className="text-sm text-muted-foreground">{selectedProduct?.description || "No detailed description available for this product."}</p>
             </div>
          </div>
          <div className="flex gap-3">
             <Button className="w-full rounded-full gap-2" onClick={() => { addToCart({ id: selectedProduct.$id || selectedProduct.id, name: selectedProduct.name, price: selectedProduct.price, image: selectedProduct.imageUrl || selectedProduct.image_url }); setSelectedProduct(null); }}>
                <Plus className="size-4" /> Add to Cart
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
