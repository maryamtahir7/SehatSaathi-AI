import { motion } from "motion/react";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { useAppContext } from "@/lib/app-context";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  wide,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="surface-hero"
    >
      <div className={`mx-auto px-4 pb-8 pt-14 sm:px-6 lg:px-8 ${wide ? "max-w-7xl" : "max-w-5xl"}`}>
        <div className="mb-10 text-center">
          {eyebrow && (
            <span className="inline-flex items-center rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
          {description && (
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </motion.main>
  );
}

export function Disclaimer() {
  const { t } = useAppContext();
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
      <p className="text-foreground/80">{t("disclaimer")}</p>
    </div>
  );
}
