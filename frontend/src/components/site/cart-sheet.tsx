import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { formatPKR, useAppContext } from "@/lib/app-context";
import { orderService } from "@/lib/appwrite";

export function CartSheet() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, cartTotal, t, rtl, clearCart, user } = useAppContext();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(false);
  const [formData, setFormData] = useState({ 
    name: user?.name || "", 
    phone: "", 
    address: "", 
    city: "", 
    postalCode: "" 
  });
  const delivery = cart.length ? 149 : 0;

  const handleCheckout = async () => {
    if (!cart.length) return;
    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setCheckingOut(true);
    try {
      await orderService.create({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode || "00000",
        paymentMethod: "Cash on Delivery",
        items: JSON.stringify(cart),
        total: cartTotal + delivery,
        status: "Pending",
        userId: user?.$id || "guest",
      });
      clearCart();
      setCheckoutStep(false);
      setCartOpen(false);
      toast.success("Order placed successfully! A pharmacist will call you to confirm.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to place order.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Sheet open={cartOpen} onOpenChange={(open) => { setCartOpen(open); if(!open) setCheckoutStep(false); }}>
      <SheetContent side={rtl ? "left" : "right"} className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            {checkoutStep && (
              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setCheckoutStep(false)}>
                <ArrowLeft className="size-4" />
              </Button>
            )}
            {checkoutStep ? "Checkout Details" : t("cart")}
          </SheetTitle>
          <SheetDescription>Delivered in 60 minutes across major cities.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 hide-scrollbar">
          {!checkoutStep ? (
            <>
              {cart.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <ShoppingBag className="size-6" />
                  </span>
                  <p className="text-sm text-muted-foreground">{t("empty_cart")}</p>
                </div>
              )}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-soft"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPKR(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-border/70 p-1">
                    <Button variant="ghost" size="icon" className="size-7 rounded-full" onClick={() => setQty(item.id, item.qty - 1)}>
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <Button variant="ghost" size="icon" className="size-7 rounded-full" onClick={() => setQty(item.id, item.qty + 1)}>
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input className="mt-1 rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ali Khan" />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input className="mt-1 rounded-xl" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0300 1234567" />
              </div>
              <div>
                <Label>Delivery Address *</Label>
                <Input className="mt-1 rounded-xl" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="House 123, Street 4, Phase 5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input className="mt-1 rounded-xl" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Lahore" />
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input className="mt-1 rounded-xl" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} placeholder="54000" />
                </div>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary-soft p-4 text-sm font-medium text-primary flex justify-between">
                <span>Payment Method</span>
                <span>Cash on Delivery</span>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="gap-3">
          <div className="space-y-2 text-sm w-full">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPKR(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>{delivery ? formatPKR(delivery) : "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg pt-1">
              <span>Total</span>
              <span className="text-primary">{formatPKR(cartTotal + delivery)}</span>
            </div>
            {!checkoutStep ? (
              <Button
                className="w-full rounded-full h-12 text-base mt-2"
                disabled={cart.length === 0}
                onClick={() => setCheckoutStep(true)}
              >
                Proceed to Checkout
              </Button>
            ) : (
              <Button
                className="w-full rounded-full h-12 text-base mt-2"
                disabled={checkingOut || cart.length === 0}
                onClick={handleCheckout}
              >
                {checkingOut ? "Processing..." : "Confirm Order"}
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
