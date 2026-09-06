import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { translate, type DictKey, type Lang } from "./i18n";
import { authService } from "./appwrite";

export type CartItem = { id: string; name: string; price: number; qty: number };

export type AppUser = {
  $id: string;
  name: string;
  email: string;
  labels?: string[];
};

type AppState = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
  rtl: boolean;
  dark: boolean;
  toggleDark: () => void;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: { id: string; name: string; price: number }) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  authOpen: boolean;
  setAuthOpen: (v: boolean) => void;
  user: AppUser | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [dark, setDark] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const rtl = lang === "ur";

  // Load current Appwrite session on mount
  useEffect(() => {
    authService.getUser().then((u) => {
      if (u) setUser(u as AppUser);
    }).finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dir = rtl ? "rtl" : "ltr";
    root.lang = rtl ? "ur" : "en";
  }, [rtl]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const t = useCallback((key: DictKey) => translate(key, lang), [lang]);

  const addToCart = useCallback((item: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const found = prev.find((c) => c.id === item.id);
      if (found) return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...item, qty: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((c) => c.id !== id) : prev.map((c) => (c.id === id ? { ...c, qty } : c)),
    );
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await authService.login(email, password);
    const u = await authService.getUser();
    if (u) setUser(u as AppUser);
    setAuthOpen(false);
    toast.success(`Welcome back, ${u?.name ?? email}!`);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    await authService.register(name, email, password);
    const u = await authService.getUser();
    if (u) setUser(u as AppUser);
    setAuthOpen(false);
    toast.success(`Welcome to SehatSaathi, ${name}!`);
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
    toast("Signed out successfully");
  }, []);

  const value = useMemo<AppState>(
    () => ({
      lang, setLang, t, rtl, dark,
      toggleDark: () => setDark((d) => !d),
      cart,
      cartCount: cart.reduce((n, c) => n + c.qty, 0),
      cartTotal: cart.reduce((n, c) => n + c.qty * c.price, 0),
      addToCart, setQty,
      removeFromCart: (id) => setCart((prev) => prev.filter((c) => c.id !== id)),
      clearCart: () => setCart([]),
      cartOpen, setCartOpen,
      authOpen, setAuthOpen,
      user, authLoading,
      signIn, signUp, signOut,
    }),
    [lang, t, rtl, dark, cart, cartOpen, authOpen, user, authLoading, addToCart, setQty, signIn, signUp, signOut],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export const formatPKR = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;
