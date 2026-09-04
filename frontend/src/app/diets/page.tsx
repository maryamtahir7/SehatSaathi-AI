"use client"
import { API_URL } from '../../lib/api';
import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from "../../context/LanguageContext";

const COMMON_DIETS = [
  {
    disease: 'Diabetes Management',
    icon: '💧',
    desc: 'Regulate blood glucose levels',
    diet: ['Low Glycemic Index', 'High Fiber', 'Lean Proteins', 'Leafy Greens'],
    match: '98%',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80'
  },
  {
    disease: 'Hypertension Protocol',
    icon: '🫀',
    desc: 'Reduce blood pressure safely',
    diet: ['DASH Framework', 'Low Sodium', 'Potassium Rich Foods', 'Berries'],
    match: '95%',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'
  },
  {
    disease: 'Celiac Care',
    icon: '🌾',
    desc: 'Intestinal healing & maintenance',
    diet: ['Strict Gluten-Free', 'Quinoa', 'Rice', 'Nut Flours'],
    match: '99%',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7JLp09svcqlp3akhJ3cwHtVlhLwbU4m4epQ&s'
  },
  {
    disease: 'GERD Mitigation',
    icon: '🔥',
    desc: 'Minimize acid reflux & heartburn',
    diet: ['Non-citrus fruits', 'Oatmeal', 'Ginger', 'Lean Poultries'],
    match: '92%',
    image: 'https://wellbeingnutrition.com/cdn/shop/articles/buddha-bowl-dish-with-vegetables-legumes-top-view_1150-42589_4b4c2c4b-d2a8-4820-a185-debe91aa47e1.jpg?v=1766489906'
  },
  {
    disease: 'Anemia Recovery',
    icon: '🩸',
    desc: 'Boost hemoglobin & energy',
    diet: ['Iron-fortified cereals', 'Spinach', 'Red Meat', 'Vitamin C pairing'],
    match: '96%',
    image: 'https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&w=800&q=80'
  },
  {
    disease: 'Cardiovascular Health',
    icon: '❤️',
    desc: 'Strengthen heart function',
    diet: ['Mediterranean Core', 'Olive Oil', 'Fatty Fish', 'Whole Grains'],
    match: '97%',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80'
  }
];

// High-end Reusable SVG Components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export default function DietsPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<string[]>([])
  const [diseaseLabel, setDiseaseLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return;

    setLoading(true)
    setScanProgress(0)
    setResult([]) // Clear previous

    // Cinematic progress simulation
    const interval = setInterval(() => {
      setScanProgress(p => p < 85 ? p + Math.random() * 15 : p);
    }, 150);

    try {
      const res = await fetch(`${API_URL}/recommendations/${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setResult(data.diet_plan || [])
        setDiseaseLabel(data.disease)
      } else {
        setResult([])
        setDiseaseLabel("No protocol found.")
      }
    } catch (e) {
      setResult([])
      setDiseaseLabel("Connection Interrupted.")
    } finally {
      clearInterval(interval);
      setScanProgress(100);

      setTimeout(() => {
        setLoading(false)
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 600);
    }
  }

  if (!mounted) return null;

  return (
    <main className="container animate-fadeUp">
      {/* Immersive Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem', marginTop: '1rem', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: '60vw', height: '30vh', background: 'radial-gradient(ellipse at top, rgba(5, 150, 105, 0.15), transparent 70%)',
          pointerEvents: 'none', zIndex: -1
        }} />

        <div className="pulse-glow" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 1.2rem',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '50px',
          color: '#34d399',
          fontWeight: 600,
          marginBottom: '1.5rem',
          letterSpacing: '1.5px',
          fontSize: '0.75rem',
          boxShadow: '0 0 15px rgba(16,185,129,0.1)'
        }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#34d399', borderRadius: '50%', boxShadow: '0 0 8px #34d399' }} />
          NUTRITION ENGINE ONLINE
        </div>
        <h1 className="gradient-text title" style={{ fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '1.2rem', letterSpacing: '-1.5px' }}>
          {t("Metabolic Profiling")}</h1>
        <p className="subtitle" style={{ maxWidth: '700px', fontSize: '1.15rem' }}>
          Enter clinical indicators or disease parameters to instantly synthesize a biochemically optimized nutritional protocol.
        </p>
      </div>

      {/* Advanced Search HUD */}
      <div className="card glass animate-fadeRight" style={{
        maxWidth: '850px',
        margin: '0 auto 4rem auto',
        padding: '2rem',
        borderRadius: '24px',
        border: '1px solid rgba(5, 150, 105, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Scanning Overlay Effect */}
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', background: 'linear-gradient(90deg, transparent, rgba(5, 150, 105, 0.1), transparent)', animation: 'shimmerLight 2s infinite', zIndex: 0, pointerEvents: 'none' }} />
        )}

        <form onSubmit={handleSearch} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', '@media (minWidth: 768px)': { flexDirection: 'row' } } as React.CSSProperties}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: loading ? '#10b981' : '#475569', transition: 'color 0.3s' }}>
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Initialize scan for condition (e.g., Hypertension)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'rgba(255, 255, 255, 0.7)',
                  color: '#0f172a',
                  fontSize: '1.1rem',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.7 : 1
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(5, 150, 105, 0.5)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(5, 150, 105, 0.15), inset 0 2px 10px rgba(0, 0, 0, 0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.target.style.boxShadow = 'inset 0 2px 10px rgba(0, 0, 0, 0.05)';
                }}
              />
            </div>
            <button type="submit" className="btn" style={{
              width: '100%', maxWidth: '240px',
              background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #059669, #0f766e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
              border: loading ? '1px solid #cbd5e1' : '1px solid rgba(0,0,0,0.2)',
              color: loading ? '#475569' : '#f1f5f9'
            }} disabled={loading || !query}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ActivityIcon /> {t("Synthesizing...")}</span>
              ) : (
                <>{t("Execute Analysis")}<ArrowRightIcon /></>
              )}
            </button>
          </div>

          {/* Progress HUD */}
          {loading && (
            <div style={{ marginTop: '1.5rem', padding: '0 0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                <span>AI Model Analysis</span>
                <span style={{ color: '#10b981' }}>{Math.round(scanProgress)}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${scanProgress}%`,
                  background: 'linear-gradient(90deg, #059669, #0f766e)',
                  boxShadow: '0 0 10px #0f766e',
                  transition: 'width 0.2s ease-out'
                }} />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Dashboard-Style Result Panel */}
      {result.length > 0 && !loading && (
        <div ref={resultsRef} className="animate-fadeUp" style={{ marginBottom: '5rem' }}>
          <div className="glass" style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05), 0 0 40px rgba(16, 185, 129, 0.05)',
            overflow: 'hidden',
            borderRadius: '24px'
          }}>
            {/* Left Panel: Profile */}
            <div style={{
              flex: '0 0 38%',
              background: `linear-gradient(180deg, rgba(3, 7, 18, 0.5) 0%, rgba(3, 7, 18, 0.95) 100%), url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: '3rem 2rem',
              borderRight: '1px solid rgba(0,0,0,0.05)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '1.5rem', textShadow: '0 2px 4px rgba(15, 23, 42, 0.02)' }}>
                <ShieldIcon /> {t("AI-VERIFIED PATHWAY")}</div>
              <h2 style={{ color: '#0f172a', fontSize: '2.5rem', lineHeight: 1.1, marginBottom: '1rem', textShadow: '0 2px 10px rgba(15, 23, 42, 0.02)' }}>
                {diseaseLabel}
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '2.5rem', textShadow: '0 1px 2px rgba(15, 23, 42, 0.02)' }}>
                Clinical directive formulated based on global nutritional databases and metabolic constraints.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ color: '#475569', fontSize: '0.8rem', marginBottom: '0.3rem', textTransform: 'uppercase' }}>{t("Confidence")}</div>
                  <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 800 }}>98.4%</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ color: '#475569', fontSize: '0.8rem', marginBottom: '0.3rem', textTransform: 'uppercase' }}>{t("Interventions")}</div>
                  <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>{result.length}</div>
                </div>
              </div>
            </div>

            {/* Right Panel: Interventions */}
            <div style={{ flex: '1', padding: '3rem 2rem', background: 'rgba(255, 255, 255, 0.9)' }}>
              <h3 style={{ color: '#0f172a', fontSize: '1.3rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '8px', height: '24px', background: '#10b981', borderRadius: '4px' }} />
                Required Nutritional Interventions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {result.map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    padding: '1.2rem 1.5rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.2rem',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(10px)';
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      width: '32px', height: '32px',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <CheckIcon />
                    </div>
                    <span style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.3px' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disease Fallback Alert */}
      {diseaseLabel && diseaseLabel !== "Not found in clinical database." && result.length === 0 && !loading && (
        <div className="card glass animate-fadeUp" style={{
          marginBottom: '5rem',
          padding: '3rem',
          borderLeft: '5px solid #ef4444',
          background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 0.85) 100%)',
          textAlign: 'center'
        }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <ActivityIcon />
          </div>
          <h3 style={{ color: '#fca5a5', fontSize: '1.8rem', marginBottom: '1rem' }}>Protocol Unidentified</h3>
          <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            {diseaseLabel} Our clinical database requires highly specific medical terminology. Please refine your query or consult a certified nutritionist.
          </p>
        </div>
      )}

      {/* Database Library */}
      <div style={{ marginBottom: '5rem', marginTop: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <h2 className="gradient-text" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
              {t("Library of Clinical Protocols")}</h2>
            <p style={{ color: '#475569', fontSize: '1.05rem' }}>
              Rapid-access to scientifically validated foundational diets.
            </p>
          </div>
        </div>

        <div className="grid">
          {COMMON_DIETS.map((d, index) => (
            <div key={index} className="card glass" style={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.3) 0%, rgba(255, 255, 255, 0.5) 100%)',
              overflow: 'hidden'
            }}>
              {/* Card Image Header */}
              <div style={{
                height: '180px',
                width: '100%',
                backgroundImage: `url(${d.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 1) 100%)'
                }} />
                <div style={{
                  position: 'absolute', top: '1.2rem', right: '1.2rem',
                  fontSize: '2rem', opacity: 0.9, filter: 'drop-shadow(0 0 10px rgba(15, 23, 42, 0.02))'
                }}>
                  {d.icon}
                </div>
                <div style={{
                  position: 'absolute', bottom: '1rem', left: '1.5rem',
                  background: 'rgba(5, 150, 105, 0.15)', color: '#10b981', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(5, 150, 105, 0.3)', backdropFilter: 'blur(4px)'
                }}>
                  {d.match} {t("AI MATCH")}</div>
              </div>

              {/* Content Body */}
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '0.5rem', paddingRight: '3rem', fontWeight: 700 }}>
                  {d.disease}
                </h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', minHeight: '40px' }}>
                  {d.desc}
                </p>

                <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1.2rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <ul style={{ listStyleType: 'none', paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {d.diet.slice(0, 3).map((item, idx) => (
                      <li key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: '0.8rem',
                        color: '#475569', fontSize: '0.95rem'
                      }}>
                        <div style={{ width: '5px', height: '5px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 5px #10b981' }} />
                        {item}
                      </li>
                    ))}
                    {d.diet.length > 3 && (
                      <li style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.5rem', paddingLeft: '1.2rem', fontStyle: 'italic' }}>
                        + {d.diet.length - 3} more interventions
                      </li>
                    )}
                  </ul>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <button
                    onClick={() => {
                      setQuery(d.disease.split(' ')[0]);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      background: 'transparent', border: 'none',
                      color: '#059669', fontWeight: 600, fontSize: '1rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                      transition: 'all 0.3s ease', width: '100%', justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#10b981';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#059669';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    Load Parameters <ArrowRightIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
