"use client"
import React, { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useLanguage } from "../../context/LanguageContext";

const LAB_TESTS_CATALOG = [
  { name: 'Complete Blood Count (CBC)', category: 'Hematology', description: 'Comprehensive baseline evaluation tracking red, #f1f5f9 blood cells, and platelets. Essential for detecting infections, anemia, and immune system disorders.', price: 1500, tat: '24 Hours', icon: 'droplet', image: 'https://images.unsplash.com/photo-1579152276503-346764510c49?auto=format&fit=crop&w=800&q=80' },
  { name: 'Basic Metabolic Panel (BMP)', category: 'Metabolic', description: 'Critical organ function screening. Evaluates kidney performance, blood glucose levels, and electrolyte balance for systemic health.', price: 2550, tat: '12 Hours', icon: 'activity', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lipid Profiling Matrix', category: 'Cardiology', description: 'Advanced cardiovascular risk assessment. Measures HDL, LDL, triglycerides, and total cholesterol to predict cardiac event probabilities.', price: 2000, tat: '24 Hours', icon: 'heart', image: 'https://images.unsplash.com/photo-1505751172107-573225a9405d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Thyroid Stimulating Hormone (TSH)', category: 'Endocrinology', description: 'Precision thyroid gland performance evaluation. Detects hyperthyroidism, hypothyroidism, and metabolic rate irregularities.', price: 3000, tat: '48 Hours', icon: 'target', image: 'https://images.unsplash.com/photo-1511174511562-5f7f18b854f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Urinalysis & Cultures', category: 'Renal', description: 'Microscopic and chemical examination of urine to detect urinary tract infections, kidney disease, and systemic metabolic conditions.', price: 1000, tat: '24 Hours', icon: 'flask', image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80' },
  { name: 'Comprehensive Metabolic Panel', category: 'Metabolic', description: 'The ultimate physiological baseline. Evaluates liver and kidney capability, diabetic markers, and full protein/electrolyte panels.', price: 4500, tat: '24 Hours', icon: 'layers', image: 'https://images.unsplash.com/photo-1579152276503-346764510c49?auto=format&fit=crop&w=800&q=80' },
  { name: 'High-Sensitivity C-Reactive Protein', category: 'Immunology', description: 'Detects acute systemic clinical inflammation. Highly predictive marker for hidden infections and cardiovascular disease risk.', price: 1800, tat: '12 Hours', icon: 'zap', image: 'https://images.unsplash.com/photo-1511174511562-5f7f18b854f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Vitamin D (25-OH) Assay', category: 'Nutrition', description: 'Critical deficiency scanning for bone health, immune system regulation, and neuromuscular functionality.', price: 3500, tat: '48 Hours', icon: 'sun', image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80' }
];

const renderIcon = (type: string) => {
  switch(type) {
    case 'droplet': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>;
    case 'activity': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case 'heart': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case 'target': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case 'flask': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 2v2"/><path d="M15 2v2"/><path d="M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>;
    case 'layers': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
    case 'zap': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case 'sun': return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
    default: return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 2v2"/><path d="M15 2v2"/><path d="M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/></svg>;
  }
}

export default function LabsPage() {
  const { t } = useLanguage();
  const { addLabToCart } = useCart()
  const [search, setSearch] = useState("");

  const filtered = LAB_TESTS_CATALOG.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '8rem', position: 'relative', overflow: 'hidden' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-section {
          background: linear-gradient(to bottom, rgba(2, 6, 23, 0.5), rgba(2, 6, 23, 1)), url('https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1600&q=80');
          background-size: cover;
          background-position: center;
          padding: 10rem 0 6rem 0;
          margin-top: -100px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          text-align: center;
        }
        .lab-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(32px);
          border: 1px solid rgba(226, 232, 240, 1);
          border-radius: 40px;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
        }
        .lab-card:hover {
          transform: translateY(-15px) scale(1.02);
          border-color: #059669;
          box-shadow: 0 40px 100px rgba(15, 23, 42, 0.02), 0 0 40px rgba(5, 150, 105, 0.2);
        }
        .lab-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(5, 150, 105, 0.1), transparent 70%);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 1.8rem 2rem 1.8rem 5rem;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(2, 6, 23, 0.7);
          backdrop-filter: blur(40px);
          color: #0f172a;
          font-size: 1.4rem;
          outline: none;
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: inset 0 4px 30px rgba(0,0,0,0.6), 0 20px 50px rgba(0, 0, 0, 0.05);
        }
        .search-input:focus {
          border-color: #059669;
          box-shadow: inset 0 4px 30px rgba(0,0,0,0.6), 0 0 50px rgba(5, 150, 105, 0.3);
          transform: scale(1.02);
        }
        .reserve-btn {
          background: linear-gradient(135deg, #059669, #2563eb);
          color: #0f172a;
          border: 1px solid rgba(0,0,0,0.2);
          padding: 1rem 2rem;
          border-radius: 18px;
          font-weight: 950;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
          display: flex;
          align-items: center;
          gap: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .reserve-btn:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 20px 45px rgba(5, 150, 105, 0.5);
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="container" style={{ maxWidth: '1400px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.3)', padding: '0.6rem 1.8rem', borderRadius: '100px', marginBottom: '2.5rem', color: '#059669', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669', boxShadow: '0 0 15px #059669', animation: 'pulse 2s infinite' }}></div>
            Certified Diagnostics
          </div>
          <h1 style={{ fontSize: '6rem', fontWeight: 950, letterSpacing: '-4px', margin: '0 0 1.5rem 0', lineHeight: '0.9', color: '#0f172a', textShadow: '0 10px 40px rgba(15, 23, 42, 0.02)' }}>
            Clinical <br/><span className="gradient-text">Laboratory.</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '1.4rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.7', fontWeight: 500, textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
            Precision biomolecular diagnostics and pathology services. Reserve certified testing protocols with complimentary home-collection.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1400px', marginTop: '-100px', position: 'relative', zIndex: 10 }}>
        
        {/* SEARCH CONSOLE */}
        <div style={{ maxWidth: '900px', margin: '0 auto 6rem auto', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '1.8rem', top: '50%', transform: 'translateY(-50%)', color: '#059669', opacity: 0.8, zIndex: 1 }}>
             <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search diagnostic protocols or categories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* CATALOG GRID */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '3rem' }}>
          {filtered.map((test, index) => (
            <div key={index} className="lab-card" style={{ animation: `fadeUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards`, animationDelay: `${index * 0.1}s`, opacity: 0 }}>
              
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '200px', overflow: 'hidden', zIndex: 0 }}>
                 <img src={test.image} alt={test.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2, filter: 'grayscale(100%)' }} />
                 <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(15, 23, 42, 1))' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ padding: '1.2rem', background: 'rgba(5, 150, 105, 0.15)', borderRadius: '20px', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.3)', boxShadow: '0 10px 20px rgba(5, 150, 105, 0.15)' }}>
                  {renderIcon(test.icon)}
                </div>
                <div style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.12)', padding: '0.6rem 1.4rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '2px', backdropFilter: 'blur(10px)' }}>
                  {test.category}
                </div>
              </div>
              
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0f172a', fontWeight: 950, lineHeight: '1.2', letterSpacing: '-1px', position: 'relative', zIndex: 1 }}>{test.name}</h3>
              
              <p style={{ color: '#475569', flexGrow: 1, marginBottom: '3rem', fontSize: '1.15rem', lineHeight: '1.7', fontWeight: 500, position: 'relative', zIndex: 1 }}>
                {test.description}
              </p>
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '3.5rem', position: 'relative', zIndex: 1 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.95rem', fontWeight: 800 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    TAT: {test.tat}
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontSize: '0.95rem', fontWeight: 800 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    {t("Home Collection")}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '2.5rem', position: 'relative', zIndex: 1 }}>
                <div>
                   <div style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '2px' }}>{t("Protocol Fee")}</div>
                   <span style={{ fontSize: '2.2rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-1.5px' }}><span style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '6px', color: '#059669' }}>Rs.</span>{test.price.toFixed(0)}</span>
                </div>
                <button 
                  onClick={() => addLabToCart(test.name, test.price)}
                  className="reserve-btn"
                >
                  {t("Reserve")}<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '10rem 0', animation: 'fadeIn 1s ease-out' }}>
             <div style={{ background: 'rgba(244, 63, 94, 0.1)', width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 3rem', display: 'grid', placeItems: 'center', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
               <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
             </div>
             <h3 style={{ fontSize: '3.5rem', fontWeight: 950, marginBottom: '1rem', color: '#0f172a', letterSpacing: '-2px' }}>No Protocols Identified</h3>
             <p style={{ fontSize: '1.4rem', color: '#475569', fontWeight: 500 }}>Try adjusting your clinical search parameters.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </main>
  )
}
