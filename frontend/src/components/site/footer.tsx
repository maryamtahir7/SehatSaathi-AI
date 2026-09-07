import { Link } from "@tanstack/react-router";
import { HeartPulse, Phone, Mail, MapPin } from "lucide-react";
import { useApp } from "@/lib/app-context";

export function Footer() {
  const { t } = useApp();
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/50 no-print">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="gradient-primary flex size-9 items-center justify-center rounded-xl text-primary-foreground">
              <HeartPulse className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold">{t("brand")}</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t("footer_desc")}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">{t("quick_links")}</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/diagnostics" className="transition-colors hover:text-primary">{t("nav_diagnostics")}</Link></li>
            <li><Link to="/symptoms" className="transition-colors hover:text-primary">{t("nav_symptoms")}</Link></li>
            <li><Link to="/diet" className="transition-colors hover:text-primary">{t("nav_diet")}</Link></li>
            <li><Link to="/pharmacy" className="transition-colors hover:text-primary">{t("nav_pharmacy")}</Link></li>
            <li><Link to="/chat" className="transition-colors hover:text-primary">{t("nav_chat")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">{t("footer_company")}</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/about" className="transition-colors hover:text-primary">{t("footer_about")}</Link></li>
            <li><Link to="/terms" className="transition-colors hover:text-primary">{t("terms")}</Link></li>
            <li><Link to="/privacy" className="transition-colors hover:text-primary">{t("privacy")}</Link></li>
          </ul>
        </div>

        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
          <h4 className="text-sm font-semibold text-destructive">{t("emergency")}</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone className="size-4 text-destructive" /> Rescue 1122</li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> medistore.pk@gmail.com</li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" /> Faisalabad, Pakistan</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex-1 text-center md:text-center md:absolute md:left-1/2 md:-translate-x-1/2">
          © 2026 SehatSaathi AI. All rights reserved. {t("disclaimer")}
        </div>
        <div className="flex-1 text-center md:text-right font-medium text-foreground/80 md:ml-auto z-10 relative">
          {t("footer_developed_by")} <a href="http://www.maryamtahir.tech" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Maryam Tahir</a>
        </div>
      </div>
    </footer>
  );
}
