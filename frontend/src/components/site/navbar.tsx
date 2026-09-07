import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { HeartPulse, Menu, Moon, ShoppingCart, Sun, Languages, X, ChevronDown, Activity, Sparkles, FileText, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import type { DictKey } from "@/lib/i18n";

const mainLinks: { to: string; key: DictKey }[] = [
  { to: "/", key: "nav_home" },
  { to: "/pharmacy", key: "nav_pharmacy" },
  { to: "/hospitals", key: "nav_hospitals" },
  { to: "/chat", key: "nav_chat" },
];

const serviceLinks: { to: string; key: DictKey; icon: any }[] = [
  { to: "/diagnostics", key: "nav_diagnostics", icon: Activity },
  { to: "/symptoms", key: "nav_symptoms", icon: Sparkles },
  { to: "/diet", key: "nav_diet", icon: Utensils },
  { to: "/prescription", key: "nav_scan", icon: FileText },
];

export function Navbar() {
  const { t, lang, setLang, dark, toggleDark, cartCount, setCartOpen, setAuthOpen, user, signOut } =
    useApp();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50">
      <div className="glass border-b border-border/60">
        <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="gradient-primary flex size-9 items-center justify-center rounded-xl text-primary-foreground shadow-soft">
              <HeartPulse className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">{t("brand")}</span>
          </Link>

          <div className="mx-auto hidden items-center gap-1.5 lg:flex">
            {mainLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "relative rounded-full px-3 py-2 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap",
                  pathname === l.to && "text-foreground font-semibold",
                )}
              >
                {pathname === l.to && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{t(l.key)}</span>
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full px-3 py-2 text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-transparent h-auto gap-1">
                  {t("nav_services")}
                  <ChevronDown className="size-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 rounded-2xl p-2 border-border/60 shadow-xl bg-card/95 backdrop-blur-xl">
                {serviceLinks.map((sl) => {
                  const Icon = sl.icon;
                  return (
                    <DropdownMenuItem key={sl.to} asChild className="rounded-xl cursor-pointer p-2 focus:bg-primary/10">
                      <Link to={sl.to} className="flex items-center gap-3 w-full">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Icon className="size-4" />
                        </div>
                        <span className="font-medium text-sm">{t(sl.key)}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="ms-auto flex items-center gap-1.5 lg:ms-0">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-full"
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
              aria-label="Toggle language"
            >
              <Languages className="size-4" />
              <span className="text-xs font-semibold">{lang === "en" ? "اردو" : "EN"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleDark}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCart className="size-4" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -end-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
                >
                  {cartCount}
                </motion.span>
              )}
            </Button>
            {user ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="rounded-full gap-1.5" onClick={() => setProfileOpen(true)}>
                  {user.name?.split(" ")[0] ?? user.email?.split("@")[0]}
                </Button>
                <Button variant="outline" size="sm" className="rounded-full gap-1.5" asChild>
                  <Link to="/admin">Admin</Link>
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="hidden rounded-full px-5 transition-transform hover:scale-[1.03] sm:inline-flex"
                onClick={() => setAuthOpen(true)}
              >
                {t("sign_in")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </nav>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border-b border-border/60 lg:hidden"
        >
          <div className="mx-auto grid max-w-7xl gap-1 px-4 py-4 sm:px-6">
            {[...mainLinks, ...serviceLinks].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10",
                  pathname === l.to && "bg-primary/10 text-primary font-semibold",
                )}
              >
                {t(l.key)}
              </Link>
            ))}
            {!user && (
              <Button
                className="mt-2 rounded-full"
                onClick={() => {
                  setOpen(false);
                  setAuthOpen(true);
                }}
              >
                {t("sign_in")}
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {user && (
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
              <DialogDescription>Your account details</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user.name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-2 mt-2">
                <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Account Status</span>
                   <span className="font-medium text-emerald-500">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Member Since</span>
                   <span className="font-medium">{new Date().toLocaleDateString("en-PK")}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="destructive" className="w-full rounded-full gap-2" onClick={() => { setProfileOpen(false); signOut(); }}>
                Sign Out
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
}
