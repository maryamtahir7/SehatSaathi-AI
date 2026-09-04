"use client"
import React from 'react'
import Link from 'next/link'
import HeroCarousel from '../components/HeroCarousel'
import MedicineCarousel from '../components/MedicineCarousel'
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  return (
    <main style={{ overflow: 'hidden', position: 'relative', background: '#f1f5f9', minHeight: '100vh' }}>
      
      {/* Dynamic Background Mesh */}
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.05) 0%, transparent 50%)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }}></div>

      {/* 1. IMMERSIVE HERO SECTION (Full Width) */}
      <section style={{ position: 'relative', zIndex: 10, animation: 'fadeInScale 1s ease-out' }}>
        <HeroCarousel />
      </section>

      {/* 2. LIVE TELEMETRY STATS BAR (Bridge) */}
      <section style={{ 
        position: 'relative', 
        zIndex: 20, 
        marginTop: '-30px', 
        padding: '0 2rem'
      }}>
        <div className="container" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '20px',
          padding: '1.5rem 3rem',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>50,000+</div>
            <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("AI Diagnoses")}</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.1)' }} className="stat-sep"></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f766e' }}>{t("1.2M+")}</div>
            <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("Clinical Records")}</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.1)' }} className="stat-sep"></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>20,000+</div>
            <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("Verified Meds")}</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.1)' }} className="stat-sep"></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>100%</div>
            <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("Neural Precision")}</div>
          </div>
        </div>
      </section>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* 3. MEDICINE MATRIX (Reduced Gap) */}
        <section style={{ animation: 'fadeUp 1s ease-out forwards' }}>
          <MedicineCarousel />
        </section>

        {/* 4. CORE PROTOCOLS (Organized Flow) */}
        <section style={{ marginTop: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase' }}>{t("Expert Intelligence")}</span>
            <h2 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: 800, marginTop: '0.5rem' }}>{t("Neural Diagnostics Matrix")}</h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '2rem',
          }}>
            <Link href="/diagnose" style={{ textDecoration: 'none' }}>
              <div className="feature-card" style={{
                 background: 'rgba(255, 255, 255, 0.85)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255,255,255,0.03)',
                 borderRadius: '24px',
                 padding: '3rem',
                 height: '100%',
                 transition: '0.4s'
              }}>
                <div style={{ background: 'rgba(5, 150, 105, 0.1)', width: '50px', height: '50px', borderRadius: '12px', marginBottom: '1.5rem', display: 'grid', placeItems: 'center' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h3 style={{ color: '#0f172a', fontSize: '1.5rem', marginBottom: '1rem' }}>{t("AI Diagnostics")}</h3>
                <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '1rem' }}>
                  {t("Analyze clinical symptoms against 25k+ records using ensemble learning.")}</p>
              </div>
            </Link>

            <Link href="/scanner" style={{ textDecoration: 'none' }}>
              <div className="feature-card" style={{
                 background: 'rgba(255, 255, 255, 0.85)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255,255,255,0.03)',
                 borderRadius: '24px',
                 padding: '3rem',
                 height: '100%',
                 transition: '0.4s'
              }}>
                <div style={{ background: 'rgba(15, 118, 110, 0.1)', width: '50px', height: '50px', borderRadius: '12px', marginBottom: '1.5rem', display: 'grid', placeItems: 'center' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>
                </div>
                <h3 style={{ color: '#0f172a', fontSize: '1.5rem', marginBottom: '1rem' }}>{t("Neural OCR Rx")}</h3>
                <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '1rem' }}>
                  {t("Swiftly digitize and map handwritten formulas using deep learning arrays.")}</p>
              </div>
            </Link>

            <Link href="/image-analysis" style={{ textDecoration: 'none' }}>
              <div className="feature-card" style={{
                 background: 'rgba(255, 255, 255, 0.85)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255,255,255,0.03)',
                 borderRadius: '24px',
                 padding: '3rem',
                 height: '100%',
                 transition: '0.4s'
              }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '50px', height: '50px', borderRadius: '12px', marginBottom: '1.5rem', display: 'grid', placeItems: 'center' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
                <h3 style={{ color: '#0f172a', fontSize: '1.5rem', marginBottom: '1rem' }}>{t("ResNet50 Imaging")}</h3>
                <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '1rem' }}>
                  {t("Extract deep image features from scans and estimate abnormality signatures.")}</p>
              </div>
            </Link>
          </div>
        </section>

        {/* 5. TRUST MATRIX (Balanced) */}
        <div style={{ marginTop: '6rem', textAlign: 'center' }}>
           <h2 style={{ fontSize: '1.5rem', color: '#475569', marginBottom: '3rem', textTransform: 'uppercase', letterSpacing: '4px' }}>{t("Clinical Partners")}</h2>
           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', opacity: 0.3 }}>
              <span style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 900 }}>DENTAL+</span>
              <span style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 900 }}>VISION.AI</span>
              <span style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 900 }}>HEART.LOGIC</span>
              <span style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 900 }}>PHARMA.NET</span>
           </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feature-card:hover {
          transform: translateY(-8px);
          border-color: rgba(5, 150, 105, 0.2);
          background: rgba(255, 255, 255, 0.8);
        }
        @media (max-width: 768px) {
          .stat-sep { display: none; }
        }
      `}</style>
    </main>
  )
}
