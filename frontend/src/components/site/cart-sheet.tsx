import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { formatPKR, useApp } from "@/lib/app-context";
import { orderService } from "@/lib/appwrite";

export function CartSheet() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, cartTotal, t, rtl, clearCart, user } = useApp();
  const [checkingOut, setCheckingOut] = useState(false);
  const delivery = cart.length ? 149 : 0;

  const handleCheckout = async () => {
    if (!cart.length) return;
    setCheckingOut(true);
    try {
      await orderService.create({
        name: user?.name || "Guest Order",
        phone: "+920000000000",
        address: "Address not provided",
        city: "Not provided",
        postalCode: "00000",
        items: JSON.stringify(cart),
        total: cartTotal + delivery,
        status: "Pending",
        userId: user?.$id || "guest",
      });
      clearCart();
      setCartOpen(false);
      toast.success("Order placed successfully! A pharmacist will call you to confirm.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to place order.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side={rtl ? "left" : "right"} className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{t("cart")}</SheetTitle>
          <SheetDescription>Delivered in 60 minutes across major cities.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4">
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
        </div>

        <SheetFooter className="gap-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPKR(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>{delivery ? formatPKR(delivery) : "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>{t("total")}</span>
              <span>{formatPKR(cartTotal + delivery)}</span>
            </div>
          </div>
          <Button
            size="lg"
            className="w-full rounded-full transition-transform hover:scale-[1.02]"
            disabled={!cart.length || checkingOut}
            onClick={handleCheckout}
          >
            {checkingOut ? "Processing..." : t("checkout")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
