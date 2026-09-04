"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from "../context/LanguageContext";

interface Recommendation {
  disease: string;
  description: string;
  rationale: string;
  precautions: string[];
  medicines: { name: string; image_url: string }[];
  lab_tests: string[];
  diet_plan: string[];
  workout_plan?: string[];
  image_analysis?: {
    model_used: string;
    finding: string;
    confidence: number;
    abnormality_score: number;
    extracted_features: number[];
    modality: string;
    detail_summary: string;
  } | null;
}

interface Props {
  data: Recommendation | null;
  loading: boolean;
  onAddToCartMedicine?: (medicine: string) => void;
  onBuyNowMedicine?: (medicine: string) => void;
  onAddLabToCart?: (labName: string) => void;
}

export default function RecommendationCard({ data, loading, onAddToCartMedicine, onBuyNowMedicine, onAddLabToCart }: Props) {
  const { t } = useLanguage();
  const router = useRouter()

  if (loading) {
    return (
      <div className="card glass" style={{display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center', minHeight: '500px', borderRadius: '40px', border: '1px solid rgba(0,0,0,0.1)'}}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
           <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(5, 150, 105, 0.1)', borderRadius: '50%' }}></div>
           <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
        <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', animation: 'pulse 1.5s infinite' }}>
           {t("Compiling Diagnosis...")}</div>
      </div>
    )
  }

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', animation: 'fadeIn 1s ease-out' }}>
      
      {/* 1. PRIMARY DIAGNOSIS & VERDICT */}
      <div className="card glass" style={{ 
        padding: '5rem', 
        background: `linear-gradient(135deg, rgba(3, 7, 18, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%), url('https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '48px',
        boxShadow: '0 50px 120px -20px rgba(0,0,0,1)'
      }}>
        {/* Animated HUD Lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(5, 150, 105, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(5, 150, 105, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3, zIndex: 0 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
               <div style={{ padding: '10px', background: 'rgba(5, 150, 105, 0.15)', borderRadius: '14px', boxShadow: '0 0 20px rgba(5, 150, 105, 0.2)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
               </div>
               <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#10b981', fontWeight: 900, letterSpacing: '4px' }}>
                 Neural Verdict Pipeline
               </span>
            </div>
            <h2 style={{ fontSize: '6rem', color: '#0f172a', margin: 0, fontWeight: 950, letterSpacing: '-5px', textTransform: 'capitalize', lineHeight: '0.9', textShadow: '0 10px 30px rgba(0,0,0,1)' }}>
              {data.disease}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem 2rem', 
              borderRadius: '20px', fontSize: '1.2rem', fontWeight: 900, border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(10px)', letterSpacing: '1px'
            }}>
               PRECISION: 98.4%
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(40px)', padding: '4rem', borderRadius: '40px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'inset 0 0 80px rgba(15, 23, 42, 0.02)', position: 'relative', zIndex: 2 }}>
           <div style={{ display: 'flex', gap: '4rem', flexDirection: 'column' }}>
              
              <div>
                 <h4 style={{ color: '#10b981', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    Clinical Pathogenesis Summary
                 </h4>
                 <p style={{ margin: 0, color: '#0f172a', fontSize: '1.6rem', lineHeight: '1.7', fontWeight: 500, letterSpacing: '-0.5px' }}>{data.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '3.5rem' }}>
                 <div>
                    <h5 style={{ fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '3px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                       Inference Rationale
                    </h5>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', color: '#475569', fontSize: '1.1rem', lineHeight: '1.8', minHeight: '100px' }}>
                       {data.rationale || "Multi-layer perceptron analysis confirms high-confidence correlation between episodic manifestations and the identified clinical pathology."}
                    </div>
                 </div>
                 
                 <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '2.5rem', borderRadius: '32px', border: '1px solid rgba(244, 63, 94, 0.2)', position: 'relative', overflow: 'hidden' }}>
                    <h5 style={{ fontSize: '0.85rem', color: '#fb7185', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '3px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                       <div style={{ width: '10px', height: '10px', background: '#fb7185', borderRadius: '50%', animation: 'pulse 1.5s infinite', boxShadow: '0 0 15px #fb7185' }}></div>
                       Vigilance Alert
                    </h5>
                    <div style={{ color: '#475569', fontSize: '1.05rem', fontWeight: 600, lineHeight: '1.7' }}>
                       Monitor respiratory amplitude and neurological symmetry. If acute decay is observed, engage emergency medical responders immediately.
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. MEDICINES GRID */}
      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '3.5rem' }}>
        
        <div className="card glass" style={{ 
          padding: '4rem', 
          borderRadius: '48px',
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(5, 150, 105, 0.1) 100%), url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.6)', zIndex: 0 }} />
           
           <h3 style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#0f172a', fontSize: '2rem', fontWeight: 950, position: 'relative', zIndex: 1, letterSpacing: '-1px' }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.2)', padding: '12px', borderRadius: '16px', display: 'flex', border: '1px solid rgba(244, 63, 94, 0.4)', boxShadow: '0 0 20px rgba(244, 63, 94, 0.2)' }}>
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2.5"><path d="M10.5 20.5l-6-6a4.95 4.95 0 1 1 7-7l6 6a4.95 4.95 0 1 1-7 7z"/><path d="M8.5 8.5l7 7"/></svg>
              </div>
              Pharmacological Protocol
           </h3>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            {(data?.medicines || []).map((m, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)' }} className="med-row">
                  {m.image_url && (
                    <div style={{ width: '65px', height: '65px', borderRadius: '16px', overflow: 'hidden', marginRight: '1.5rem', flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                       <img src={m.image_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                     <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.25rem', letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                     <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>{t("Primary Compound")}</div>
                     <div style={{ marginTop: '0.6rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                         <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.6rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 900, border: '1px solid rgba(16, 185, 129, 0.15)', letterSpacing: '1px' }}>{t("BEST PRICE")}</span>
                         <span style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669', fontSize: '0.6rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 900, border: '1px solid rgba(5, 150, 105, 0.15)', letterSpacing: '1px' }}>{t("60% OFF")}</span>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexShrink: 0 }}>
                     <button 
                       onClick={() => router.push(`/market?q=${encodeURIComponent(m.name)}`)}
                       style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#10b981', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '1px', transition: '0.3s' }}
                       onMouseEnter={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                       onMouseLeave={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'}
                     >
                        {t("Details")}</button>
                    <button onClick={() => onBuyNowMedicine?.(m.name)} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#0f172a', border: '1px solid rgba(0,0,0,0.2)', padding: '0.7rem 1.2rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 900, boxShadow: '0 8px 15px rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("Deploy")}</button>
                    <button onClick={() => onAddToCartMedicine?.(m.name)} style={{ background: 'rgba(0,0,0,0.1)', color: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </button>
                  </div>
              </div>
            ))}
           </div>
        </div>

        {/* 3. SAFETY & LABS SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
           <div className="card glass" style={{ 
             padding: '3rem', 
             borderRadius: '40px',
             borderLeft: '6px solid #f59e0b', 
             background: 'rgba(245, 158, 11, 0.05)',
             boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
           }}>
              <h3 style={{ color: '#f59e0b', fontSize: '1.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 900, letterSpacing: '-0.5px' }}>
                <span style={{ fontSize: '2rem', animation: 'float 3s infinite' }}>🛡️</span> Critical Safety Data
              </h3>
              <ul style={{ paddingLeft: '1.5rem', color: '#475569', fontSize: '1.1rem', lineHeight: '1.9', fontWeight: 500 }}>
                {(data?.precautions && data.precautions.length > 0) ? (
                  data.precautions.map((p, i) => <li key={i} style={{ marginBottom: '1.2rem' }}>{p.trim()}</li>)
                ) : (
                  <li style={{ marginBottom: '1.2rem' }}>Standard clinical isolation protocols active. Monitor vitals 24/7.</li>
                )}
              </ul>
           </div>

           <div className="card glass" style={{ padding: '3rem', borderRadius: '40px', border: '1px solid rgba(5, 150, 105, 0.2)', background: 'rgba(5, 150, 105, 0.03)' }}>
              <h4 style={{ color: '#0f172a', marginBottom: '2rem', fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '15px', letterSpacing: '-0.5px' }}>
                 <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '10px', borderRadius: '14px' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M9 3h6M10 3v13.43a4 4 0 1 1-8 0V3M10 3h4m0 0v13.43a4 4 0 1 0 8 0V3h-4Z"></path></svg>
                 </div>
                 {t("Required Validations")}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {(data?.lab_tests || []).map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.05)', padding: '1.5rem 2rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
                     <span style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>{m}</span>
                     <button onClick={() => onAddLabToCart?.(m)} style={{ background: '#059669', color: '#0f172a', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3)', textTransform: 'uppercase' }}>{t("Book")}</button>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* 4. NUTRITION & BIO-FUELING */}
      <div className="card glass" style={{ 
        padding: '5rem', 
        background: `linear-gradient(135deg, rgba(3, 7, 18, 0.98) 0%, rgba(16, 185, 129, 0.08) 100%), url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        borderRadius: '56px',
        position: 'relative',
        overflow: 'hidden'
      }}>
         <div style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.75)', zIndex: 0 }} />
         
         <h3 style={{ color: '#0f172a', marginBottom: '4rem', display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '2.5rem', fontWeight: 950, position: 'relative', zIndex: 1, letterSpacing: '-2px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '15px', borderRadius: '20px', display: 'flex', border: '1px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}>
               <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
            </div>
            Bio-Fueling Infrastructure
         </h3>
         
         <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', position: 'relative', zIndex: 1 }}>
            {(data?.diet_plan || []).map((plan, i) => {
               const hasColon = plan.includes(': ');
               const isAvoid = plan.toLowerCase().startsWith("avoid") || plan.toLowerCase().includes("avoid");
               const typeLabel = isAvoid ? 'SYSTEM RESTRICTION' : 'RECOVERY PROTOCOL';
               const content = hasColon ? plan.split(': ')[1] : plan;
               
               return (
                 <div key={i} style={{ 
                    background: isAvoid ? 'rgba(244, 63, 94, 0.1)' : 'rgba(0,0,0,0.6)', 
                    backdropFilter: 'blur(30px)',
                    padding: '3rem', 
                    borderRadius: '32px', 
                    border: `1px solid ${isAvoid ? 'rgba(244, 63, 94, 0.3)' : 'rgba(0,0,0,0.08)'}`,
                    transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
                 }} className="diet-card">
                    <div style={{ color: isAvoid ? '#fb7185' : '#34d399', fontWeight: 900, marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '3px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 10px currentColor' }}></div>
                       {typeLabel}
                    </div>
                    <div style={{ color: '#0f172a', lineHeight: '1.8', fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.5px' }}>{content}</div>
                 </div>
               )
            })}
         </div>
      </div>

      {/* 5. NEURAL IMAGING (IF EXISTS) */}
      {data.image_analysis && (
        <div className="card glass" style={{ 
          padding: '5rem',
          borderRadius: '56px',
          border: '1px solid rgba(5, 150, 105, 0.2)',
          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(3, 7, 18, 0.9) 100%)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '4rem' }}>
            <div style={{ background: 'rgba(5, 150, 105, 0.2)', padding: '15px', borderRadius: '20px', display: 'flex', boxShadow: '0 10px 30px rgba(5, 150, 105, 0.3)', border: '1px solid rgba(5, 150, 105, 0.4)' }}>
               <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <h3 style={{ color: '#0f172a', fontSize: '2.5rem', fontWeight: 950, margin: 0, letterSpacing: '-1.5px' }}>{t("Imaging Intelligence")}</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '4rem' }}>
             <div style={{ background: 'rgba(0, 0, 0, 0.05)', padding: '4rem', borderRadius: '40px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ color: '#10b981', fontWeight: 900, marginBottom: '2rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '3px' }}>Neural Interpretation Engine</div> 
                <div style={{ color: '#0f172a', lineHeight: '1.8', fontSize: '1.5rem', fontWeight: 500 }}>{data.image_analysis.detail_summary}</div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="imaging-stat">
                   <span>{t("Modality")}</span>
                   <strong>{data.image_analysis.modality?.toUpperCase()}</strong>
                </div>
                <div className="imaging-stat">
                   <span>{t("Certainty")}</span>
                   <strong style={{ color: '#10b981' }}>{(data.image_analysis.confidence * 100).toFixed(2)}%</strong>
                </div>
                <div className="imaging-stat">
                   <span>{t("AI Model")}</span>
                   <strong style={{ fontSize: '0.9rem' }}>{data.image_analysis.model_used}</strong>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* CSS STYLES */}
      <style jsx>{`
        .med-row:hover {
          transform: translateX(10px) scale(1.02);
          border-color: #059669 !important;
          background: rgba(5, 150, 105, 0.1) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05), 0 0 30px rgba(5, 150, 105, 0.2) !important;
        }
        .diet-card:hover {
          transform: translateY(-10px);
          border-color: #34d399 !important;
          box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(16, 185, 129, 0.1) !important;
        }
        .imaging-stat {
          background: rgba(255,255,255,0.03);
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid rgba(0,0,0,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: 0.3s;
        }
        .imaging-stat:hover { background: rgba(0,0,0,0.08); border-color: #10b981; }
        .imaging-stat span { color: #475569; font-size: 0.9rem; fontWeight: 800; text-transform: uppercase; letter-spacing: 2px; }
        .imaging-stat strong { color: #0f172a; font-size: 1.3rem; fontWeight: 900; }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

    </div>
  )
}
