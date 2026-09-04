"use client"
import React from "react"
import Link from "next/link"
import { useLanguage } from "../../context/LanguageContext"
import { BRAIN_MRI_CLASSES, LUNG_XRAY_CLASSES, SKIN_ANALYSIS_CLASSES } from "../../constants/imagingClasses"

export default function ImageAnalysisSelectionPage() {
  const { t } = useLanguage();

  return (
    <main className="iah-page">
      <div className="iah-page__ambient" aria-hidden />

      <div className="container" style={{ maxWidth: '1200px', padding: '4rem 2rem' }}>
        <header className="iah-hero">
          <span className="iah-hero__badge">
            <span className="iah-hero__dot" />
            {t("Medical Intelligence")}
          </span>
          <h1 className="iah-hero__title">
            {t("Diagnostic")} <span style={{ color: '#0284c7' }}>{t("Imaging")}</span>
          </h1>
          <p className="iah-hero__sub">
            {t("Clinical-grade AI workflows for Dermatology, X-ray, and MRI — upload, analyze, and diagnose instantly.")}
          </p>
        </header>

        <div className="iah-stats">
          {[
            { v: "3", l: t("Diagnostic Modalities"), c: "#0284c7" },
            { v: "<30s", l: t("Typical Turnaround"), c: "#10b981" },
            { v: "99%", l: t("Classification Accuracy"), c: "#0ea5e9" },
            { v: "24/7", l: t("Always Available"), c: "#059669" },
          ].map((s) => (
            <div key={s.l} className="iah-stat">
              <span className="iah-stat__val" style={{ color: s.c }}>
                {s.v}
              </span>
              <span className="iah-stat__lbl">{s.l}</span>
            </div>
          ))}
        </div>

        <div className="iah-grid">
          
          {/* SKIN ANALYSIS CARD */}
          <Link href="/image-analysis/skin" className="iah-card">
            <div className="iah-card__top">
              <div className="iah-card__icon" style={{ color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                  <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                </svg>
              </div>
              <span className="iah-card__tag" style={{ color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)' }}>{t("Dermatology")}</span>
            </div>
            <div className="iah-card__body">
              <h2 className="iah-card__title">{t("Skin Analysis")}</h2>
              <p className="iah-card__desc">
                {t("Detect dermatological conditions including melanoma, carcinoma, and benign keratosis from skin lesion images.")}
              </p>
              <div className="iah-card__classes">
                <span className="iah-card__classes-label">{t("Detects multiple skin conditions")}</span>
                <div className="iah-card__chips">
                  {SKIN_ANALYSIS_CLASSES?.slice(0, 4).map((c) => (
                    <span key={c.id} className="iah-chip" style={{ borderColor: `${c.accent}44`, color: c.accent }}>
                      {c.label}
                    </span>
                  ))}
                  <span className="iah-chip iah-chip--muted">+ {t("More")}</span>
                </div>
              </div>
              <span className="iah-card__cta" style={{ color: '#ec4899' }}>
                {t("Launch Skin Studio")}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* X-RAY CARD */}
          <Link href="/image-analysis/xray" className="iah-card">
            <div className="iah-card__top">
              <div className="iah-card__icon" style={{ color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16v16H4z" />
                  <path d="M4 12h16M12 4v16" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <span className="iah-card__tag" style={{ color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)' }}>{t("Chest · Pulmonary")}</span>
            </div>
            <div className="iah-card__body">
              <h2 className="iah-card__title">{t("Thoracic X-Ray")}</h2>
              <p className="iah-card__desc">
                {t("Detect patterns associated with pneumonia, effusion, and other thoracic findings from frontal chest radiographs.")}
              </p>
              <div className="iah-card__classes">
                <span className="iah-card__classes-label">{t("Detects 4 lung conditions + normal")}</span>
                <div className="iah-card__chips">
                  {LUNG_XRAY_CLASSES.filter((c) => !c.isHealthy).map((c) => (
                    <span key={c.id} className="iah-chip" style={{ borderColor: `${c.accent}44`, color: c.accent }}>
                      {c.label}
                    </span>
                  ))}
                  <span className="iah-chip iah-chip--muted">+ {t("Normal")}</span>
                </div>
              </div>
              <span className="iah-card__cta" style={{ color: '#0ea5e9' }}>
                {t("Launch X-Ray Studio")}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* MRI CARD */}
          <Link href="/image-analysis/mri" className="iah-card">
            <div className="iah-card__top">
              <div className="iah-card__icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 4v16M4 12h16" />
                </svg>
              </div>
              <span className="iah-card__tag" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>{t("Brain · Oncology")}</span>
            </div>
            <div className="iah-card__body">
              <h2 className="iah-card__title">{t("Cerebral MRI")}</h2>
              <p className="iah-card__desc">
                {t("Screen brain MRI slices for tumor-class signals with confidence bands and structured clinical copy.")}
              </p>
              <div className="iah-card__classes">
                <span className="iah-card__classes-label">{t("4-class brain MRI model")}</span>
                <div className="iah-card__chips">
                  {BRAIN_MRI_CLASSES.map((c) => (
                    <span
                      key={c.id}
                      className={`iah-chip ${c.isHealthy ? "iah-chip--muted" : ""}`}
                      style={c.isHealthy ? { borderColor: '#e2e8f0', color: '#64748b' } : { borderColor: `${c.accent}44`, color: c.accent }}
                    >
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
              <span className="iah-card__cta" style={{ color: '#8b5cf6' }}>
                {t("Launch MRI Studio")}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
          
        </div>

        <p className="iah-footnote">
          {t("These tools support clinical decision-making only. Always correlate AI output with qualified radiology and physician review.")}
        </p>
      </div>

      <style jsx global>{`
        .iah-page {
          position: relative;
          min-height: 94vh;
          background-color: #f8fafc;
        }
        
        .iah-hero {
          text-align: center;
          margin-bottom: 3rem;
          animation: iahUp 0.75s ease;
        }
        .iah-hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1.2rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #0284c7;
          background: rgba(2, 132, 199, 0.1);
          border: 1px solid rgba(2, 132, 199, 0.2);
          margin-bottom: 1.5rem;
        }
        .iah-hero__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0284c7;
          animation: pulse 2s infinite;
        }
        .iah-hero__title {
          font-size: 4rem;
          font-weight: 900;
          letter-spacing: -1px;
          color: #0f172a;
          margin: 0 0 1rem;
        }
        .iah-hero__sub {
          margin: 0 auto;
          max-width: 800px;
          font-size: 1.2rem;
          line-height: 1.7;
          color: #475569;
          font-weight: 500;
        }

        .iah-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 4rem;
        }
        @media (max-width: 768px) {
          .iah-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .iah-stat {
          text-align: center;
          padding: 1.5rem 1rem;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 1);
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
        }
        .iah-stat__val {
          display: block;
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
        }
        .iah-stat__lbl {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
        }

        .iah-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 4rem;
        }
        @media (max-width: 1024px) {
          .iah-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .iah-grid {
            grid-template-columns: 1fr;
          }
        }

        .iah-card {
          display: flex;
          flex-direction: column;
          border-radius: 24px;
          text-decoration: none !important;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 1);
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
          transition: all 0.3s ease;
          padding: 2rem;
        }
        .iah-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.1);
        }

        .iah-card__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .iah-card__icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: grid;
          place-items: center;
        }
        .iah-card__tag {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.4rem 0.8rem;
          border-radius: 50px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .iah-card__title {
          font-size: 1.8rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 0.8rem;
          letter-spacing: -0.5px;
        }
        .iah-card__desc {
          color: #475569;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .iah-card__classes {
          margin-bottom: 2rem;
        }
        .iah-card__classes-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 0.8rem;
        }
        .iah-card__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .iah-chip {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.3rem 0.8rem;
          border-radius: 8px;
          border: 1px solid;
          background: #ffffff;
        }
        .iah-chip--muted {
          border-color: #1e293b;
          color: #64748b;
          background: #f8fafc;
        }

        .iah-card__cta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 800;
          font-size: 1.1rem;
          margin-top: auto;
          transition: transform 0.3s ease;
        }
        .iah-card:hover .iah-card__cta {
          transform: translateX(5px);
        }

        .iah-footnote {
          text-align: center;
          color: #94a3b8;
          font-size: 0.9rem;
          max-width: 600px;
          margin: 0 auto;
        }

        @keyframes iahUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </main>
  )
}
