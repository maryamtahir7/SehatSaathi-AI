import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApp } from "@/lib/app-context";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M23 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.2A5.4 5.4 0 0 1 12 18.2v3h.1c3.4 0 6.3-1.2 8.2-3.3 1.7-1.6 2.7-4 2.7-6.7Z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7A6.9 6.9 0 0 1 5.4 14H2.2v3.1A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.4 14a6.7 6.7 0 0 1 0-4.2V6.7H2.2a11 11 0 0 0 0 9.9L5.4 14Z" />
      <path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.1-3.1A11 11 0 0 0 2.2 6.7l3.2 3.1A6.6 6.6 0 0 1 12 5.4Z" />
    </svg>
  );
}

export function AuthDialog() {
  const { authOpen, setAuthOpen, signIn, t } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogContent className="glass rounded-3xl sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <span className="gradient-primary mb-2 flex size-11 items-center justify-center rounded-2xl text-primary-foreground shadow-soft">
            <HeartPulse className="size-5" />
          </span>
          <DialogTitle className="font-display text-xl">Welcome to {t("brand")}</DialogTitle>
          <p className="text-sm text-muted-foreground">Your health history, saved securely.</p>
        </DialogHeader>

        <Tabs defaultValue="in">
          <TabsList className="w-full rounded-full">
            <TabsTrigger value="in" className="flex-1 rounded-full">{t("sign_in")}</TabsTrigger>
            <TabsTrigger value="up" className="flex-1 rounded-full">{t("sign_up")}</TabsTrigger>
          </TabsList>

          {(["in", "up"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-5 space-y-4">
              {tab === "up" && (
                <div className="space-y-2">
                  <Label htmlFor={`name-${tab}`}>Full name</Label>
                  <Input id={`name-${tab}`} placeholder="Ayesha Khan" className="rounded-xl" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor={`email-${tab}`}>Email</Label>
                <Input
                  id={`email-${tab}`}
                  type="email"
                  placeholder="you@example.com"
                  className="rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`pass-${tab}`}>Password</Label>
                <Input
                  id={`pass-${tab}`}
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full rounded-full transition-transform hover:scale-[1.02]"
                onClick={() => signIn(email || "guest@sehatsaathi.ai")}
              >
                {tab === "in" ? t("sign_in") : "Create account"}
              </Button>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>
              <Button
                variant="outline"
                className="w-full gap-2 rounded-full"
                onClick={() => signIn("google.user@gmail.com")}
              >
                <GoogleMark /> Continue with Google
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                Demo experience — no real account is created and no medical data is stored.
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
