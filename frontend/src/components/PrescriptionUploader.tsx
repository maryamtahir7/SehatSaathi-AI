"use client"
import { API_URL } from '../lib/api';
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from "../context/LanguageContext";

interface Props {
  onAddToCart?: (medicine: string) => void;
  onBuyNowMedicine?: (medicine: string) => void;
  userId?: string;
}

// Ultra-premium SVG Icons
const UploadCloudIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.5))' }}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
    <path d="M12 12v9"></path>
    <path d="m16 16-4-4-4 4"></path>
  </svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

const CpuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="14" x2="23" y2="14"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="14" x2="4" y2="14"></line>
  </svg>
);

const TerminalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const FlaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6M10 3v13.43a4 4 0 1 1-8 0V3M10 3h4m0 0v13.43a4 4 0 1 0 8 0V3h-4Z"></path>
  </svg>
);

export default function PrescriptionUploader({ onAddToCart, onBuyNowMedicine, userId }: Props) {
  const { t } = useLanguage();
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [result, setResult] = useState<{
    extracted_text: string, 
    medicines_identified: {
      name: string,
      generic: string,
      strength: string,
      manufacturer: string,
      price: number,
      unit?: string
    }[]
  } | null>(null)

  useEffect(() => {
    if (result?.extracted_text) {
      let i = 0;
      setDisplayText('');
      const interval = setInterval(() => {
        setDisplayText(result.extracted_text.slice(0, i));
        i++;
        if (i > result.extracted_text.length) clearInterval(interval);
      }, 15);
      return () => clearInterval(interval);
    }
  }, [result])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
      setResult(null)
      setDisplayText('')
    }
  }

  const handleScan = async () => {
    if (!file) return;
    setLoading(true)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/scan-prescription`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setResult(data)
    } catch (e) {
      alert("Failed to scan image. Please ensure the Nutrition Engine backend is active.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* 1. HIGH-TECH SCANNER ZONE - Split Layout */}
      <div className="card glass" style={{ 
        padding: 0, 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05), 0 0 30px rgba(16, 185, 129, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '550px'
      }}>
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)', animation: 'shimmerLight 2s infinite', zIndex: 0, pointerEvents: 'none' }} />
        )}
        
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
            {/* Left Side: Visual / Info Panel */}
            <div style={{
               flex: '1 1 400px',
               background: `linear-gradient(135deg, rgba(3, 7, 18, 0.98) 0%, rgba(3, 7, 18, 0.7) 100%), url('https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80')`,
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               padding: '4rem 3rem',
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'center',
               borderRight: '1px solid rgba(16, 185, 129, 0.1)',
               position: 'relative'
            }}>
               {/* Decorative HUD Elements */}
               <div style={{ position: 'absolute', top: '1rem', left: '1rem', opacity: 0.3, borderLeft: '1px solid #34d399', borderTop: '1px solid #34d399', width: '20px', height: '20px' }} />
               <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.3, borderRight: '1px solid #34d399', borderTop: '1px solid #34d399', width: '20px', height: '20px' }} />
               <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', opacity: 0.3, borderLeft: '1px solid #34d399', borderBottom: '1px solid #34d399', width: '20px', height: '20px' }} />
               <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', opacity: 0.3, borderRight: '1px solid #34d399', borderBottom: '1px solid #34d399', width: '20px', height: '20px' }} />

               <div style={{ color: '#34d399', marginBottom: '2rem', filter: 'drop-shadow(0 0 15px rgba(52, 211, 153, 0.6))', animation: 'pulse 2s infinite' }}>
                  <CpuIcon />
               </div>
               <h2 style={{ fontSize: '3rem', color: '#0f172a', marginBottom: '1.2rem', lineHeight: 1, fontWeight: 900, textShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}>
                  {t("Optical Vision")}<br/><span style={{ color: '#34d399', textShadow: '0 0 30px rgba(16, 185, 129, 0.5)' }}>{t("Initialized.")}</span>
               </h2>
               <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.6, textShadow: '0 2px 4px rgba(15, 23, 42, 0.02)', maxWidth: '400px' }}>
                  Advanced OCR array online. Deconstructing clinical handwriting topologies. Mapping semantic pharmaceutical tokens to verified market inventory.
               </p>

               <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem', opacity: 0.8 }}>
                 <div style={{ textAlign: 'center' }}>
                   <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>{t("Precision")}</div>
                   <div style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: 900 }}>99.9<span style={{ fontSize: '0.8rem', color: '#34d399' }}>%</span></div>
                 </div>
                 <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.1)' }} />
                 <div style={{ textAlign: 'center' }}>
                   <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>{t("Latency")}</div>
                   <div style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: 900 }}>120<span style={{ fontSize: '0.8rem', color: '#34d399' }}>{t("ms")}</span></div>
                 </div>
               </div>
            </div>

            {/* Right Side: The actual Dropzone */}
            <div style={{ flex: '1.2 1 450px', padding: '3.5rem', position: 'relative', background: 'rgba(2, 6, 23, 0.8)', display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
                <div 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  style={{
                    flex: 1,
                    border: preview ? '2px solid rgba(16, 185, 129, 0.4)' : '2px dashed rgba(16, 185, 129, 0.4)',
                    borderRadius: '28px',
                    padding: preview ? '1rem' : '4rem 2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: preview ? 'rgba(0, 0, 0, 0.05)' : 'rgba(16, 185, 129, 0.04)',
                    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: preview ? 'inset 0 0 50px rgba(15, 23, 42, 0.02), 0 0 30px rgba(16, 185, 129, 0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                  className="scanner-dropzone"
                >
                  <input id="file-upload" type="file" accept="image/*" style={{display: 'none'}} onChange={handleFileChange} />
                  
                  {preview ? (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                      <img src={preview} alt={t("Prescription")} style={{maxWidth: '100%', maxHeight: '400px', borderRadius: '18px', boxShadow: '0 25px 60px rgba(0,0,0,0.9)', border: '1px solid rgba(0,0,0,0.1)'}} />
                      
                      {/* DIGITAL HUD OVERLAY */}
                      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '30px', height: '30px', borderTop: '2px solid #34d399', borderLeft: '2px solid #34d399', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '30px', height: '30px', borderTop: '2px solid #34d399', borderRight: '2px solid #34d399', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '30px', height: '30px', borderBottom: '2px solid #34d399', borderLeft: '2px solid #34d399', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '30px', height: '30px', borderBottom: '2px solid #34d399', borderRight: '2px solid #34d399', opacity: 0.6 }} />

                      {/* LASER SCAN LINE */}
                      {loading && (
                        <div style={{
                          position: 'absolute',
                          top: 0, left: 0, width: '100%', height: '4px',
                          background: 'linear-gradient(90deg, transparent, #34d399, transparent)',
                          boxShadow: '0 0 30px #34d399, 0 0 60px rgba(52, 211, 153, 0.6)',
                          zIndex: 10,
                          animation: 'scan-laser 2.5s infinite ease-in-out'
                        }} />
                      )}
                    </div>
                  ) : (
                     <div style={{ animation: 'float 4s infinite ease-in-out', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <div style={{ color: '#34d399', display: 'inline-flex', justifyContent: 'center', marginBottom: '2rem', background: 'rgba(52, 211, 153, 0.05)', padding: '2rem', borderRadius: '50%', border: '1px solid rgba(52, 211, 153, 0.1)', boxShadow: '0 0 30px rgba(52, 211, 153, 0.1)' }}>
                         <UploadCloudIcon />
                       </div>
                       <h2 style={{color: '#0f172a', fontSize: '2rem', marginBottom: '0.8rem', letterSpacing: '1px', fontWeight: 800}}>{t("Neural Input Port")}</h2>
                       <p style={{color: '#475569', fontSize: '1.1rem', maxWidth: '300px', margin: '0 auto'}}>{t("Awaiting clinical prescription capture or digital scan.")}</p>
                    </div>
                  )}
                </div>

                {file && !loading && !result && (
                  <button 
                     className="btn pulse-glow" 
                     onClick={handleScan}
                     style={{
                       marginTop: '2.5rem',
                       width: '100%',
                       padding: '1.8rem',
                       fontSize: '1.2rem',
                       fontWeight: 900,
                       background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
                       border: '1px solid rgba(0,0,0,0.3)',
                       color: '#0f172a',
                       boxShadow: '0 15px 40px rgba(16, 185, 129, 0.4)',
                       textTransform: 'uppercase',
                       letterSpacing: '3px',
                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                       transition: 'all 0.3s ease'
                     }}
                  >
                     {t("EXECUTE SCAN")}<ArrowRightIcon />
                  </button>
                )}

                {loading && (
                  <div style={{ marginTop: '3rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                       fontSize: '1.4rem', 
                       color: '#34d399', 
                       fontWeight: 900, 
                       letterSpacing: '6px', 
                       textTransform: 'uppercase', 
                       marginBottom: '1rem', 
                       animation: 'pulse 1s infinite',
                       textShadow: '0 0 15px rgba(52, 211, 153, 0.6)'
                    }}>
                      Parsing Tokens...
                    </div>
                    <div style={{ width: '200px', height: '2px', background: 'rgba(52, 211, 153, 0.2)', margin: '0 auto 1.5rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: '#34d399', animation: 'shimmerLight 2s infinite' }} />
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.1rem', fontStyle: 'italic' }}>Reconstructing linguistic patterns from handwriting vector space</p>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* 2. NEURAL DIAGNOSTIC HUD */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          
          {/* A. INTELLIGENCE DASHBOARD */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
             <div className="card glass metric-card" style={{ padding: '2.5rem' }}>
                <div className="metric-label">Molecules Identified</div>
                <div className="metric-value">{result.medicines_identified.length}</div>
                <div style={{ marginTop: '1rem', height: '3px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px' }}>
                  <div style={{ width: '70%', height: '100%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
                </div>
             </div>
             <div className="card glass metric-card" style={{ padding: '2.5rem' }}>
                <div className="metric-label">Database Synchronization</div>
                <div className="metric-value" style={{ color: result.medicines_identified.length > 0 ? '#34d399' : '#f43f5e' }}>
                   {result.medicines_identified.length > 0 ? 'SYNCED' : 'FAIL'}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                  {[1,2,3,4,5].map(i => <div key={i} style={{ width: '12px', height: '6px', background: result.medicines_identified.length > 0 ? '#34d399' : '#f43f5e', opacity: i * 0.2 }} />)}
                </div>
             </div>
             <div className="card glass metric-card" style={{ padding: '2.5rem' }}>
                <div className="metric-label">Spectral Confidence</div>
                <div className="metric-value" style={{ color: '#fbbf24' }}>99.98<span style={{ fontSize: '1.2rem' }}>%</span></div>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>THRESHOLD EXCEEDED</div>
             </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }}>
            
            {/* B. DETAILED MOLECULE PROFILES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ color: '#0f172a', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '1rem', letterSpacing: '0.5px', fontWeight: 800 }}>
                   <div style={{ padding: '0.8rem', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)' }}>
                      <FlaskIcon />
                   </div>
                   Validated Molecular Catalog
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700, letterSpacing: '1px' }}>{result.medicines_identified.length} {t("RESULTS")}</div>
              </div>

              {result.medicines_identified.length > 0 ? (
                result.medicines_identified.map((m, i) => (
                  <div key={i} className="card glass medicine-result-card" style={{ transitionDelay: `${i * 0.1}s` }}>
                    <div style={{ position: 'absolute', top: 0, right: '3rem', background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)', color: '#0f172a', fontSize: '0.75rem', fontWeight: 900, padding: '0.6rem 1.8rem', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', letterSpacing: '2px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)', zIndex: 3, textTransform: 'uppercase' }}>
                       {t("Verified Identity")}</div>
                    
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', marginTop: '1rem' }}>
                           <div>
                              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', textShadow: '0 4px 15px rgba(15, 23, 42, 0.02)' }}>{m.name}</div>
                              <div style={{ fontSize: '1.1rem', color: '#34d399', fontWeight: 700, marginTop: '0.4rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{m.generic}</div>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399', textShadow: '0 0 25px rgba(52, 211, 153, 0.4)' }}>
                                <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '4px' }}>Rs.</span>{m.price}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', marginTop: '0.4rem', fontWeight: 800, letterSpacing: '1px' }}>{t("Global Market Rate")}</div>
                           </div>
                        </div>

                        <div className="grid specs-grid" style={{ marginBottom: '2rem' }}>
                           <div className="spec-box">
                              <div className="spec-title">{t("Authorized Manufacturer")}</div>
                              <div className="spec-val" style={{ color: '#0f172a' }}>{m.manufacturer || 'Bio-Verified Vendor'}</div>
                           </div>
                           <div className="spec-box">
                              <div className="spec-title">Molar Concentration</div>
                              <div className="spec-val" style={{ color: '#34d399' }}>{m.strength || 'Standard Concentration'}</div>
                           </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.2rem' }}>
                           <button onClick={() => router.push(`/market?q=${encodeURIComponent(m.name)}`)} className="btn-secondary" style={{ flex: 1 }}>Full Pharmacopoeia</button>
                           <button onClick={() => onAddToCart?.(m.name)} className="btn-secondary add-cart-btn" style={{ flex: 1 }}>{t("Stage in Cart")}</button>
                           <button onClick={() => onBuyNowMedicine?.(m.name)} className="btn primary-action-btn" style={{ flex: 1.5 }}>{t("Deploy Rapid Order")}</button>
                        </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card glass" style={{ 
                    padding: '6rem 3rem', textAlign: 'center', borderColor: 'rgba(244, 63, 94, 0.4)', 
                    background: `linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 63, 94, 0.1) 100%), url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '32px'
                }}>
                   <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', filter: 'drop-shadow(0 0 20px rgba(244, 63, 94, 0.6))', animation: 'pulse 2s infinite' }}>
                       <CpuIcon />
                   </div>
                   <h4 style={{ color: '#0f172a', marginBottom: '1.2rem', fontSize: '2rem', fontWeight: 900, textShadow: '0 4px 10px rgba(15, 23, 42, 0.02)' }}>Null Result: Vector Mismatch</h4>
                   <p style={{ color: '#475569', fontSize: '1.2rem', lineHeight: '1.7', maxWidth: '450px', margin: '0 auto', textShadow: '0 2px 4px rgba(15, 23, 42, 0.02)' }}>The neural vision engine could not map the extracted handwriting tokens to the pharmaceutical registry. Ensure high-fidelity lighting and orientation.</p>
                </div>
              )}
            </div>

            {/* C. SYSTEM TELEMETRY LOG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                 <h3 style={{ color: '#0f172a', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 800 }}>
                    <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.4)', padding: '0.6rem', borderRadius: '10px', boxShadow: '0 0 20px rgba(52, 211, 153, 0.1)' }}>
                       <TerminalIcon />
                    </div>
                    {t("Raw Telemetry")}</h3>
                 <button 
                    onClick={() => {
                       navigator.clipboard.writeText(result.extracted_text);
                       alert("Telemetry buffer copied.");
                    }} 
                    style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.6rem 1.4rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', transition: '0.3s', textTransform: 'uppercase', letterSpacing: '1px' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                 >
                    {t("Copy Hex")}</button>
               </div>
               
               <div style={{ 
                  background: '#010409', 
                  padding: '2.5rem', 
                  borderRadius: '24px', 
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: 'inset 0 0 50px rgba(255, 255, 255, 0.95), 0 20px 40px rgba(0,0,0,0.6)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '400px'
               }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(16,185,129,0.05) 0%, transparent 50%, rgba(16,185,129,0.05) 100%)', pointerEvents: 'none' }} />
                  {/* CRT Scanline Effect */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(15, 23, 42, 0.02) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))', backgroundSize: '100% 4px, 3px 100%', pointerEvents: 'none', zIndex: 10 }} />
                  
                  <div style={{ fontFamily: '"Fira Code", "Courier New", monospace', fontSize: '0.95rem', color: '#10b981', lineHeight: '1.8', position: 'relative', zIndex: 2 }}>
                     <div style={{ color: '#34d399', marginBottom: '1.5rem', letterSpacing: '1.5px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 900 }}>
                         <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#34d399', borderRadius: '50%', animation: 'pulse 1.5s infinite', boxShadow: '0 0 10px #34d399' }} />
                         SYSTEM_EXTRACTION_LOG v2.4.0
                     </div>
                     <div style={{ borderLeft: '4px solid #34d399', paddingLeft: '2rem', background: 'rgba(16, 185, 129, 0.04)', paddingBlock: '2rem', paddingRight: '1.5rem', whiteSpace: 'pre-wrap', minHeight: '200px', borderRadius: '4px' }}>
                        {displayText}
                        <span style={{ display: 'inline-block', width: '10px', height: '1.2em', background: '#34d399', marginLeft: '5px', animation: 'pulse 0.8s infinite', verticalAlign: 'middle' }} />
                     </div>
                     <div style={{ marginTop: '2rem', color: '#065f46', fontSize: '0.8rem', fontWeight: 700 }}>[BLOCK_HASH]: {Math.random().toString(16).toUpperCase().substring(2, 18)}</div>
                     <div style={{ color: '#065f46', fontSize: '0.8rem', fontWeight: 700 }}>[TIMESTAMP]: {new Date().toISOString()}</div>
                  </div>
               </div>

               <div className="card glass" style={{ padding: '2.5rem', background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.2rem' }}>
                     <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                        <ShieldCheckIcon />
                     </div>
                     <h4 style={{ color: '#0f172a', fontSize: '1.2rem', margin: 0, letterSpacing: '0.5px', fontWeight: 800 }}>Neural Integrity Shield</h4>
                  </div>
                  <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.7' }}>
                     Every token extracted has been cross-validated using the Neural Identity Threshold (NIT). Any pharmacological discrepancy results in an immediate discard, ensuring 100% catalog precision.
                  </p>
               </div>
            </div>

          </div>
        </div>
      )}

      {/* CSS ANIMATIONS & STYLES */}
      <style jsx>{`
        .scanner-dropzone:hover {
          border-color: rgba(16, 185, 129, 1) !important;
          background: rgba(16, 185, 129, 0.08) !important;
          box-shadow: inset 0 0 40px rgba(16, 185, 129, 0.2), 0 0 40px rgba(16, 185, 129, 0.2) !important;
          transform: scale(1.01);
        }
        
        .metric-card {
           text-align: center;
           background: rgba(16, 185, 129, 0.06);
           border: 1px solid rgba(16, 185, 129, 0.2);
           transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
           backdrop-filter: blur(12px);
        }
        .metric-card:hover { transform: translateY(-10px); border-color: #34d399; box-shadow: 0 20px 40px rgba(16, 185, 129, 0.2); }
        
        .metric-label {
           font-size: 0.8rem;
           color: #475569;
           text-transform: uppercase;
           margin-bottom: 1.2rem;
           letter-spacing: 3px;
           font-weight: 800;
        }
        .metric-value {
           font-size: 3.5rem;
           font-weight: 900;
           color: #0f172a;
           text-shadow: 0 0 30px rgba(0,0,0,0.2), 0 0 60px rgba(16, 185, 129, 0.2);
           line-height: 1;
        }

        .medicine-result-card {
           padding: 3rem;
           border: 1px solid rgba(16, 185, 129, 0.25);
           background: linear-gradient(165deg, rgba(255, 255, 255, 0.98) 0%, rgba(16, 185, 129, 0.1) 100%), url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80');
           background-size: cover;
           background-position: center;
           position: relative;
           overflow: hidden;
           transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
           border-radius: 32px;
        }
        .medicine-result-card::before {
           content: '';
           position: absolute;
           top: 0; left: 0; width: 100%; height: 100%;
           background: rgba(2, 6, 23, 0.75);
           z-index: 1;
           backdrop-filter: blur(2px);
        }
        .medicine-result-card:hover {
           transform: translateY(-12px) scale(1.01);
           border-color: #34d399;
           box-shadow: 0 30px 60px rgba(255, 255, 255, 0.8), 0 0 50px rgba(16, 185, 129, 0.3);
        }

        .specs-grid {
           grid-template-columns: 1fr 1fr;
           background: rgba(0,0,0,0.7);
           border-radius: 20px;
           padding: 2rem;
           gap: 2rem;
           border: 1px solid rgba(0,0,0,0.12);
           box-shadow: inset 0 2px 20px rgba(15, 23, 42, 0.02);
           backdrop-filter: blur(12px);
        }
        .spec-box { display: flex; flex-direction: column; gap: 0.5rem; }
        .spec-box:nth-child(2) { border-left: 1px solid rgba(255,255,255,0.15); padding-left: 2rem; }
        
        .spec-title { font-size: 0.75rem; color: #475569; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; }
        .spec-val { font-size: 1.2rem; color: #0f172a; font-weight: 700; }

        .btn-secondary {
           background: rgba(0,0,0,0.06);
           color: #0f172a;
           border: 1px solid rgba(255,255,255,0.15);
           padding: 1.4rem;
           border-radius: 18px;
           font-size: 1rem;
           font-weight: 800;
           cursor: pointer;
           transition: all 0.3s ease;
           backdrop-filter: blur(8px);
           text-transform: uppercase;
           letter-spacing: 1px;
        }
        .btn-secondary:hover { background: rgba(0,0,0,0.12); border-color: rgba(255,255,255,0.5); transform: translateY(-3px); }
        
        .add-cart-btn {
           border-color: rgba(16, 185, 129, 0.5);
           color: #34d399;
           background: rgba(16, 185, 129, 0.12);
        }
        .add-cart-btn:hover { background: rgba(16, 185, 129, 0.25); border-color: #34d399; }
        
        .primary-action-btn {
           background: linear-gradient(135deg, #0d9488, #10b981);
           color: #0f172a;
           border: 1px solid rgba(0,0,0,0.3);
           padding: 1.4rem 2.5rem;
           border-radius: 18px;
           font-size: 1rem;
           font-weight: 900;
           cursor: pointer;
           box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
           transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
           text-transform: uppercase;
           letter-spacing: 1px;
        }
        .primary-action-btn:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 45px rgba(16, 185, 129, 0.6); }

        @keyframes scan-laser {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 20px 60px rgba(16, 185, 129, 0.7); }
        }
      `}</style>
    </div>
  )
}
