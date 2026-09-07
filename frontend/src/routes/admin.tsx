import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogIn,
  Plus, Trash2, Edit2, Loader2, Tag, AlertTriangle, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-context";
import { productService, orderService, databases, DB, COL, ID, Query } from "@/lib/appwrite";
import { formatPKR } from "@/lib/app-context";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Portal — SehatSaathi AI" }] }),
  component: AdminPortal,
});

type Product = { $id: string; name: string; brand?: string; price: number; category?: string; description?: string; image_url?: string; imageUrl?: string; emoji?: string };
type Order   = { $id: string; $createdAt: string; userId?: string; items?: string; total?: number; status?: string };
type User    = { $id: string; name?: string; email?: string; $createdAt?: string };
type Category = { $id: string; name: string; imageUrl?: string; $createdAt?: string };

function AdminPortal() {
  const { user, authLoading } = useApp();
  const isAdmin = user?.labels?.includes("admin") || true; // allow all for hackathon

  if (authLoading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );

  if (!user) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <AlertTriangle className="size-12 text-amber-500" />
      <h1 className="text-2xl font-bold">Admin Access Required</h1>
      <p className="text-muted-foreground">Please sign in to access the admin portal.</p>
      <Button asChild className="rounded-full gap-2">
        <Link to="/"><LogIn className="size-4" /> Go to Home & Sign In</Link>
      </Button>
    </div>
  );

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [users, setUsers]         = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("dashboard");

  // Product form
  const [pName, setPName]         = useState("");
  const [pBrand, setPBrand]       = useState("");
  const [pPrice, setPPrice]       = useState("");
  const [pCategory, setPCategory] = useState("General");
  const [pDesc, setPDesc]         = useState("");
  const [pImage, setPImage]       = useState("");
  const [saving, setSaving]       = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await databases.updateDocument(DB, COL.orders, orderId, { status });
      setOrders(prev => prev.map(o => o.$id === orderId ? { ...o, status } : o));
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes, uRes, cRes] = await Promise.all([
        databases.listDocuments(DB, COL.products, [Query.limit(100)]).catch(e => { console.error("Products error", e); return { documents: [] }; }),
        databases.listDocuments(DB, COL.orders, [Query.limit(100)]).catch(e => { console.error("Orders error", e); return { documents: [] }; }),
        databases.listDocuments(DB, COL.users, [Query.limit(100)]).catch(e => { console.error("Patients error", e); return { documents: [] }; }),
        databases.listDocuments(DB, COL.categories, [Query.limit(100)]).catch(e => { console.error("Categories error", e); return { documents: [] }; }),
      ]);
      setProducts(pRes.documents as any);
      setOrders(oRes.documents as any);
      setUsers(uRes.documents as any);
      setCategories(cRes.documents as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => { setPName(""); setPBrand(""); setPPrice(""); setPCategory("General"); setPDesc(""); setPImage(""); setEditId(null); };

  const saveProduct = async () => {
    if (!pName || !pPrice) return;
    setSaving(true);
    const data = { name: pName, brand: pBrand, price: parseFloat(pPrice), category: pCategory, description: pDesc, imageUrl: pImage };
    try {
      if (editId) {
        await productService.update(editId, data);
      } else {
        await productService.create(data);
      }
      await loadData();
      resetForm();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await productService.remove(id);
    setProducts(p => p.filter(x => x.$id !== id));
  };

  const startEdit = (p: Product) => {
    setEditId(p.$id); setPName(p.name); setPBrand(p.brand || "");
    setPPrice(String(p.price)); setPCategory(p.category || "General"); setPDesc(p.description || ""); setPImage(p.imageUrl || p.image_url || "");
    setTab("products");
  };

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-blue-500" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-green-500" },
    { label: "Categories", value: categories.length, icon: Tag, color: "text-purple-500" },
    { label: "Revenue (est.)", value: formatPKR(orders.reduce((s, o) => s + (o.total || 0), 0)), icon: Tag, color: "text-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="gradient-primary flex size-9 items-center justify-center rounded-xl text-primary-foreground">
              <LayoutDashboard className="size-4" />
            </span>
            <div>
              <p className="font-semibold">SehatSaathi Admin</p>
              <p className="text-xs text-muted-foreground">Management Portal</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="rounded-full gap-2">
            <Link to="/"><ChevronRight className="size-3 rotate-180" /> Back to App</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-8 rounded-full">
            <TabsTrigger value="dashboard" className="gap-2 rounded-full"><LayoutDashboard className="size-3.5" />Dashboard</TabsTrigger>
            <TabsTrigger value="products"  className="gap-2 rounded-full"><Package className="size-3.5" />Products</TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 rounded-full"><Tag className="size-3.5" />Categories</TabsTrigger>
            <TabsTrigger value="orders"    className="gap-2 rounded-full"><ShoppingBag className="size-3.5" />Orders</TabsTrigger>
            <TabsTrigger value="users"     className="gap-2 rounded-full"><Users className="size-3.5" />Users</TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}>
                    <Card className="rounded-3xl border-border/60 p-6 shadow-soft">
                      <s.icon className={`size-7 mb-3 ${s.color}`} />
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PRODUCTS */}
          <TabsContent value="products">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Add/Edit Form */}
              <Card className="rounded-3xl border-border/60 p-6 shadow-soft h-fit">
                <h2 className="text-lg font-semibold mb-4">{editId ? "Edit Product" : "Add Product"}</h2>
                <div className="space-y-3">
                  <div><Label>Name *</Label><Input value={pName} onChange={e=>setPName(e.target.value)} placeholder="Paracetamol 500mg" className="mt-1 rounded-xl" /></div>
                  <div><Label>Brand</Label><Input value={pBrand} onChange={e=>setPBrand(e.target.value)} placeholder="GSK" className="mt-1 rounded-xl" /></div>
                  <div><Label>Price (PKR) *</Label><Input value={pPrice} onChange={e=>setPPrice(e.target.value)} type="number" placeholder="150" className="mt-1 rounded-xl" /></div>
                  <div><Label>Category</Label>
                    <select value={pCategory} onChange={e=>setPCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select a Category</option>
                      {categories.map(c=><option key={c.$id} value={c.name}>{c.name}</option>)}
                      {categories.length === 0 && ["General","Prescription","Vitamins","Supplements","First Aid","Devices"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><Label>Description</Label><Input value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="Short description" className="mt-1 rounded-xl" /></div>
                  <div><Label>Image URL</Label><Input value={pImage} onChange={e=>setPImage(e.target.value)} placeholder="https://..." className="mt-1 rounded-xl" /></div>
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 rounded-full" onClick={saveProduct} disabled={saving}>
                      {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4 mr-1" />}
                      {editId ? "Update" : "Add Product"}
                    </Button>
                    {editId && <Button variant="outline" className="rounded-full" onClick={resetForm}>Cancel</Button>}
                  </div>
                </div>
              </Card>

              {/* Product List */}
              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-lg font-semibold">All Products ({products.length})</h2>
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-primary" /></div>
                ) : products.length === 0 ? (
                  <Card className="rounded-3xl border-border/60 p-8 text-center text-muted-foreground">
                    No products yet. Add your first product!
                  </Card>
                ) : (
                  products.map(p => (
                    <motion.div key={p.$id} initial={{ opacity:0 }} animate={{ opacity:1 }}>
                      <Card className="rounded-2xl border-border/60 p-4 shadow-soft flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-primary-soft/70 text-2xl shrink-0">
                          {(p.imageUrl || p.image_url) ? <img src={productService.getImageUrl(p.imageUrl || p.image_url)} alt={p.name} className="h-full w-full object-cover" /> : (p.emoji || "💊")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand} · {p.category}</p>
                        </div>
                        <p className="font-bold text-primary shrink-0">{formatPKR(p.price)}</p>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => startEdit(p)}><Edit2 className="size-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="size-8 rounded-full text-destructive hover:text-destructive" onClick={() => deleteProduct(p.$id)}><Trash2 className="size-3.5" /></Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* CATEGORIES */}
          <TabsContent value="categories">
            <h2 className="text-lg font-semibold mb-4">All Categories ({categories.length})</h2>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : categories.length === 0 ? (
              <Card className="rounded-3xl border-border/60 p-8 text-center text-muted-foreground">No categories found in database.</Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {categories.map(c => (
                  <Card key={c.$id} className="rounded-2xl border-border/60 p-4 shadow-soft flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-primary-soft/70 text-2xl shrink-0">
                      {c.imageUrl ? <img src={productService.getImageUrl(c.imageUrl)} alt={c.name} className="h-full w-full object-cover" /> : <Tag className="size-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{c.name}</p>
                      {c.$createdAt && <p className="text-xs text-muted-foreground">{new Date(c.$createdAt).toLocaleDateString()}</p>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ORDERS */}
          <TabsContent value="orders">
            <h2 className="text-lg font-semibold mb-4">All Orders ({orders.length})</h2>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : orders.length === 0 ? (
              <Card className="rounded-3xl border-border/60 p-8 text-center text-muted-foreground">No orders yet.</Card>
            ) : (
              <div className="space-y-4">
                {orders.map(o => {
                  let parsedItems: any[] = [];
                  try { if (o.items) parsedItems = JSON.parse(o.items); } catch {}
                  return (
                    <Card key={o.$id} className="rounded-2xl border-border/60 p-5 shadow-soft flex flex-col md:flex-row gap-5">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold font-mono text-sm text-foreground/80">Order #{o.$id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">{new Date(o.$createdAt).toLocaleString("en-PK")}</p>
                          </div>
                          <div className="text-right block md:hidden">
                            <p className="font-bold text-primary">{formatPKR(o.total || 0)}</p>
                          </div>
                        </div>
                        
                        {parsedItems.length > 0 ? (
                          <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 space-y-2">
                            {parsedItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-foreground/80">{item.qty}x {item.name}</span>
                                <span className="text-muted-foreground">{formatPKR(item.price * item.qty)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{o.items}</p>
                        )}
                      </div>
                      
                      <div className="w-full md:w-48 shrink-0 flex flex-col gap-3 justify-between md:border-l md:border-border/40 md:pl-5">
                        <div className="hidden md:block">
                          <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                          <p className="font-bold text-primary text-lg">{formatPKR(o.total || 0)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <Select value={o.status || "Pending"} onValueChange={(v) => updateOrderStatus(o.$id, v)}>
                            <SelectTrigger className="h-8 text-xs rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <h2 className="text-lg font-semibold mb-4">Registered Users ({users.length})</h2>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : users.length === 0 ? (
              <Card className="rounded-3xl border-border/60 p-8 text-center text-muted-foreground">No users found in database.</Card>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <Card key={u.$id} className="rounded-2xl border-border/60 p-4 shadow-soft flex items-center gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {(u.name || u.email || "U")[0].toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{u.name || "Unnamed User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email || u.$id}</p>
                    </div>
                    {u.$createdAt && <p className="text-xs text-muted-foreground shrink-0">{new Date(u.$createdAt).toLocaleDateString()}</p>}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
