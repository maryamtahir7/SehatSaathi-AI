import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { productService, orderService, databases, DB, COL, ID, Query } from "@/lib/appwrite";
import { formatPKR } from "@/lib/app-context";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Portal — SehatSaathi AI" }] }),
  component: AdminPortal,
});

type Product = { $id: string; name: string; brand?: string; price: number; category?: string; description?: string; image_url?: string; imageUrl?: string; emoji?: string };
type Order   = { $id: string; $createdAt: string; userId?: string; items?: string; total?: number; status?: string; name?: string; phone?: string; address?: string; city?: string; postalCode?: string; paymentMethod?: string };
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Product form
  const [pName, setPName]         = useState("");
  const [pBrand, setPBrand]       = useState("");
  const [pPrice, setPPrice]       = useState("");
  const [pCategory, setPCategory] = useState("General");
  const [pDesc, setPDesc]         = useState("");
  const [pImage, setPImage]       = useState("");
  const [saving, setSaving]       = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);

  // Category form
  const [cName, setCName]         = useState("");
  const [cImage, setCImage]       = useState("");
  const [cSaving, setCSaving]     = useState(false);
  const [cEditId, setCEditId]     = useState<string | null>(null);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await databases.updateDocument(DB, COL.orders, orderId, { status });
      setOrders(prev => prev.map(o => o.$id === orderId ? { ...o, status } : o));
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    try {
      await databases.deleteDocument(DB, COL.orders, orderId);
      setOrders(prev => prev.filter(o => o.$id !== orderId));
      if (selectedOrder?.$id === orderId) setSelectedOrder(null);
    } catch (e) {
      console.error("Failed to delete order", e);
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

  const resetCategoryForm = () => { setCName(""); setCImage(""); setCEditId(null); };

  const saveCategory = async () => {
    if (!cName) return;
    setCSaving(true);
    try {
      if (cEditId) {
        await databases.updateDocument(DB, COL.categories, cEditId, { name: cName, imageUrl: cImage });
      } else {
        await databases.createDocument(DB, COL.categories, ID.unique(), { name: cName, imageUrl: cImage });
      }
      await loadData();
      resetCategoryForm();
    } catch (e) { console.error(e); }
    finally { setCSaving(false); }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await databases.deleteDocument(DB, COL.categories, id);
    setCategories(c => c.filter(x => x.$id !== id));
  };

  const startCategoryEdit = (c: Category) => {
    setCEditId(c.$id);
    setCName(c.name);
    setCImage(c.imageUrl || "");
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

  const ordersByDate = useMemo(() => {
    const map = new Map<string, number>();
    [...orders].reverse().forEach(o => {
      if(!o.$createdAt) return;
      const date = new Date(o.$createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric" });
      map.set(date, (map.get(date) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count })).slice(-14);
  }, [orders]);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => {
      const cat = p.category || "General";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [products]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ef4444'];

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
          <TabsContent value="dashboard" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
            ) : (
              <>
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

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="rounded-3xl border-border/60 p-6 shadow-soft">
                    <h3 className="font-semibold mb-6">Orders Over Time (Last 14 Days)</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ordersByDate} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="rounded-3xl border-border/60 p-6 shadow-soft">
                    <h3 className="font-semibold mb-6">Products by Category</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={productsByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {productsByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </>
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
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Add Category Form */}
              <Card className="rounded-3xl border-border/60 p-6 shadow-soft h-fit">
                <h2 className="text-lg font-semibold mb-4">{cEditId ? "Edit Category" : "Add Category"}</h2>
                <div className="space-y-3">
                  <div><Label>Category Name *</Label><Input value={cName} onChange={e=>setCName(e.target.value)} placeholder="Baby Care" className="mt-1 rounded-xl" /></div>
                  <div><Label>Image URL</Label><Input value={cImage} onChange={e=>setCImage(e.target.value)} placeholder="https://..." className="mt-1 rounded-xl" /></div>
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 rounded-full" onClick={saveCategory} disabled={cSaving}>
                      {cSaving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4 mr-1" />} {cEditId ? "Update" : "Add"}
                    </Button>
                    {cEditId && <Button variant="outline" className="rounded-full" onClick={resetCategoryForm}>Cancel</Button>}
                  </div>
                </div>
              </Card>

              {/* Category List */}
              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-lg font-semibold">All Categories ({categories.length})</h2>
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-primary" /></div>
                ) : categories.length === 0 ? (
                  <Card className="rounded-3xl border-border/60 p-8 text-center text-muted-foreground">No categories found in database.</Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {categories.map(c => (
                      <Card key={c.$id} className="rounded-2xl border-border/60 p-4 shadow-soft flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-primary-soft/70 text-2xl shrink-0">
                          {c.imageUrl ? <img src={productService.getImageUrl(c.imageUrl)} alt={c.name} className="h-full w-full object-cover" /> : <Tag className="size-5 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{c.name}</p>
                          {c.$createdAt && <p className="text-xs text-muted-foreground">{new Date(c.$createdAt).toLocaleDateString()}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => startCategoryEdit(c)}>
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 rounded-full text-destructive" onClick={() => deleteCategory(c.$id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="flex-1 rounded-xl h-8 text-xs" onClick={() => setSelectedOrder(o)}>View Details</Button>
                          <Button variant="ghost" size="icon" className="size-8 rounded-xl text-destructive" onClick={() => deleteOrder(o.$id)}><Trash2 className="size-3.5" /></Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {/* Order Details Modal */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
              <DialogContent className="sm:max-w-2xl rounded-3xl">
                <DialogHeader>
                  <DialogTitle>Order #{selectedOrder?.$id.slice(-8).toUpperCase()}</DialogTitle>
                  <DialogDescription>Placed on {selectedOrder && new Date(selectedOrder.$createdAt).toLocaleString("en-PK")}</DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm border-b pb-2">Customer Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedOrder?.name || "N/A"}</span></p>
                      <p><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{selectedOrder?.phone || "N/A"}</span></p>
                      <p><span className="text-muted-foreground">Address:</span> <span className="font-medium">{selectedOrder?.address || "N/A"}</span></p>
                      <p><span className="text-muted-foreground">City:</span> <span className="font-medium">{selectedOrder?.city || "N/A"}</span></p>
                      <p><span className="text-muted-foreground">Postal Code:</span> <span className="font-medium">{selectedOrder?.postalCode || "N/A"}</span></p>
                      <p><span className="text-muted-foreground">Payment:</span> <span className="font-medium">{selectedOrder?.paymentMethod || "Cash on Delivery"}</span></p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm border-b pb-2">Order Items</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {selectedOrder?.items ? (() => {
                        try {
                          const items = JSON.parse(selectedOrder.items);
                          return items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.qty}x {item.name}</span>
                              <span className="font-medium">{formatPKR(item.price * item.qty)}</span>
                            </div>
                          ));
                        } catch {
                          return <p className="text-sm">{selectedOrder.items}</p>;
                        }
                      })() : <p className="text-sm">No items found</p>}
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span className="text-primary">{formatPKR(selectedOrder?.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
