import { useState } from "react";
import { HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppContext } from "@/lib/app-context";

export function AuthDialog() {
  const { authOpen, setAuthOpen, signIn, signUp, t } = useAppContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError(null);
    try { await signIn(email, password); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Login failed. Check your credentials."); }
    finally { setLoading(false); }
  };

  const handleSignUp = async () => {
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError(null);
    try { await signUp(name, email, password); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Registration failed. Email may already exist."); }
    finally { setLoading(false); }
  };

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

        <Tabs defaultValue="in" onValueChange={() => setError(null)}>
          <TabsList className="w-full rounded-full">
            <TabsTrigger value="in" className="flex-1 rounded-full">{t("sign_in")}</TabsTrigger>
            <TabsTrigger value="up" className="flex-1 rounded-full">{t("sign_up")}</TabsTrigger>
          </TabsList>

          <TabsContent value="in" className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-in">Email</Label>
              <Input id="email-in" type="email" placeholder="you@example.com" className="rounded-xl"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass-in">Password</Label>
              <Input id="pass-in" type="password" placeholder="..." className="rounded-xl"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()} />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button className="w-full rounded-full" onClick={handleSignIn} disabled={loading}>
              {loading ? <><Loader2 className="size-4 animate-spin mr-2" />Signing in...</> : t("sign_in")}
            </Button>
          </TabsContent>

          <TabsContent value="up" className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name-up">Full Name</Label>
              <Input id="name-up" placeholder="Ayesha Khan" className="rounded-xl"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-up">Email</Label>
              <Input id="email-up" type="email" placeholder="you@example.com" className="rounded-xl"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass-up">Password</Label>
              <Input id="pass-up" type="password" placeholder="min 8 characters" className="rounded-xl"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()} />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button className="w-full rounded-full" onClick={handleSignUp} disabled={loading}>
              {loading ? <><Loader2 className="size-4 animate-spin mr-2" />Creating account...</> : "Create Account"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
