"use client"
import { API_URL } from '../../lib/api';
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { dbService } from '../../services/db.service'
import { useLanguage } from "../../context/LanguageContext";

function MarketContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [appwriteInventory, setAppwriteInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { t } = useLanguage()

  const loadAppwriteInventory = async () => {
    try {
      const data = await dbService.getProducts()
      setAppwriteInventory(data.documents)
    } catch (e) {
      console.error("Failed to load live inventory", e)
    }
  }

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    let combinedResults: any[] = []

    // 1. Filter Appwrite Inventory Locally
    const appwriteMatches = appwriteInventory.filter((p: any) => 
      !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.generic?.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(p => ({ ...p, source: 'Appwrite' }))
    
    combinedResults = [...appwriteMatches]

    // 2. Search Clinical Database (CSV) via Backend if query is present
    if (searchQuery.trim()) {
      try {
        const res = await fetch(`${API_URL}/medicines/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const csvData = await res.json()
          if (csvData && !combinedResults.some(r => r.name.toLowerCase() === csvData.name.toLowerCase())) {
            combinedResults.push({ ...csvData, source: 'Clinical Registry' })
          }
        }
      } catch (e) {
        console.warn("Clinical Registry search skipped or failed")
      }
    }

    setResults(combinedResults)
    setLoading(false)
  }

  useEffect(() => {
    loadAppwriteInventory()
  }, [])

  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam) {
      setQuery(qParam)
      performSearch(qParam)
    } else {
      performSearch("") 
    }
  }, [searchParams, appwriteInventory.length])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  const handleAddToCart = async (item: any) => {
    await addToCart(item.name);
  }

  const handleBuyNow = async (item: any) => {
    if (!user) {
      router.push('/login');
    } else {
      router.push(`/cart?buyNow=${encodeURIComponent(item.name)}`);
    }
  }

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '8rem', position: 'relative', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .super-search {
          width: 100%;
          padding: 1.8rem 2rem 1.8rem 5rem;
          border-radius: 20px;
          border: 1px solid rgba(226, 232, 240, 1);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          color: #0f172a;
          font-size: 1.2rem;
          outline: none;
          transition: all 0.4s ease;
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
        }
        .super-search:focus {
          border-color: #0284c7;
          box-shadow: 0 15px 40px -10px rgba(2, 132, 199, 0.15);
          transform: translateY(-2px);
        }
        .super-btn {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: #ffffff;
          border: none;
          padding: 0 3rem;
          border-radius: 20px;
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.4);
        }
        .super-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px -5px rgba(2, 132, 199, 0.5);
        }
        .cyber-card {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 24px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
        }
        .cyber-card.appwrite-src {
          border-color: rgba(16, 185, 129, 0.3);
          background: linear-gradient(165deg, rgba(255, 255, 255, 1) 0%, rgba(240, 253, 244, 0.5) 100%);
        }
        .cyber-card:hover {
          transform: translateY(-8px);
          border-color: rgba(2, 132, 199, 0.3);
          box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.1);
        }
        .hero-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 8rem 0 6rem 0;
          margin-top: -100px;
          border-bottom: 1px solid rgba(226, 232, 240, 1);
        }
      `}} />

      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="container" style={{ maxWidth: '1400px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.2)', padding: '0.6rem 1.8rem', borderRadius: '100px', marginBottom: '2.5rem', color: '#0284c7', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7', animation: 'pulse 2s infinite' }}></div>
            {t("Medical Pharmacy Hub")}
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-2px', margin: '0 0 1.5rem 0', lineHeight: '1.1', color: '#0f172a' }}>
            {t("Clinical")} <span style={{ color: '#0284c7' }}>{t("Inventory")}</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.7', fontWeight: 500 }}>
            {t("Search our extensive database of certified medicines and healthcare products.")}
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1400px', marginTop: '-30px', position: 'relative', zIndex: 10 }}>
        
        {/* SEARCH CONSOLE */}
        <form onSubmit={handleFormSubmit} style={{ maxWidth: '900px', margin: '0 auto 5rem auto', display: 'flex', gap: '1.2rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', left: '1.8rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }}>
               <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input 
              type="text" 
              className="super-search"
              placeholder={t("Search for medicines, symptoms, or brands...")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="super-btn" disabled={loading}>
            {loading ? t("SEARCHING...") : t("SEARCH")}
          </button>
        </form>

        {/* METRICS & STATUS */}
        {!loading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', padding: '0 1rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: '#0f172a', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>{results.length}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{t("Products Found")}</span>
                </div>
             </div>
          </div>
        )}

        {/* RESULTS GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid rgba(2, 132, 199, 0.2)', borderTopColor: '#0284c7', animation: 'spin 1s linear infinite', marginBottom: '2rem' }}></div>
             <h3 style={{ color: '#0f172a', fontSize: "1.8rem", margin: "0 0 1rem 0", fontWeight: 800 }}>{t("Searching Inventory...")}</h3>
             <p style={{ color: "#475569", fontSize: "1.4rem", fontWeight: 500 }}>Accessing secure molecular archives and live vendor nodes...</p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
            {results.map((item, i) => (
              <div key={i} className={`cyber-card ${item.source === 'Appwrite' ? 'appwrite-src' : ''}`} style={{ animation: `fadeUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards`, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                
                {/* Status Badges */}
                <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '10px', zIndex: 10 }}>
                  {item.source === 'Appwrite' && (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #059669, #10b981)', color: '#0f172a', fontSize: '0.75rem', 
                      padding: '0.6rem 1.4rem', borderRadius: '100px', fontWeight: 950,
                      boxShadow: '0 10px 25px rgba(16,185,129,0.4)', letterSpacing: '1.5px',
                      display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase'
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f1f5f9', boxShadow: '0 0 10px #f1f5f9', animation: 'pulse 1.5s infinite' }}></div>
                      {t("In-Stock")}</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', position: 'relative', zIndex: 5, textAlign: 'center' }}>
                  <div style={{ 
                    width: '100%', height: '180px', 
                    background: 'rgba(0, 0, 0, 0.05)', 
                    borderRadius: '24px', display: 'flex', 
                    justifyContent: 'center', alignItems: 'center',
                    border: '1px solid rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.6)',
                    flexShrink: 0
                  }}>
                    {(item.image || item.imageUrl || item.image_url || item.img || item.pic || item.picture) ? (
                      <img 
                        src={item.image || item.imageUrl || item.image_url || item.img || item.pic || item.picture} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={item.source === 'Appwrite' ? '#10b981' : '#059669'} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 10px ${item.source === 'Appwrite' ? 'rgba(16,185,129,0.5)' : 'rgba(5, 150, 105, 0.5)'})` }}>
                        <path d="M10.5 20.5l-6-6a4.95 4.95 0 1 1 7-7l6 6a4.95 4.95 0 1 1-7 7z"/><path d="M8.5 8.5l7 7"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ width: '100%' }}>
                    <h3 style={{ fontSize: '1.6rem', margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 950, lineHeight: '1.2', letterSpacing: '-0.5px', wordBreak: 'break-word' }}>{item.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {item.generic || 'Advanced Formula'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(248,250,252,1)', padding: '1.5rem', borderRadius: '20px', marginBottom: '2.5rem', border: '1px solid rgba(226,232,240,1)', position: 'relative', zIndex: 5 }}>
                   <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '1px' }}>{t("Manufacturer")}</div>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.manufacturer || 'Bio-Pharma'}</div>
                   </div>
                   <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '1px' }}>{t("Weight")}</div>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>{item.strength || '100% Active'}</div>
                   </div>
                   {item.uses && (
                     <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.65rem', color: '#0284c7', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '1px' }}>{t("Clinical Uses")}</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.uses}</div>
                     </div>
                   )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', position: 'relative', zIndex: 5, gap: '1rem' }}>
                   <div>
                      <div style={{ fontSize: '2rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-1px' }}>
                        <span style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px', color: '#64748b' }}>Rs.</span>{Number(item.price).toFixed(0)}
                      </div>
                   </div>
                   <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button onClick={() => handleAddToCart(item)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', padding: '0.8rem 1.2rem', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', transition: '0.4s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                        {t("+ Cart")}</button>
                      <button onClick={() => handleBuyNow(item)} style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', border: 'none', color: '#ffffff', padding: '0.8rem 1.5rem', borderRadius: '15px', fontSize: '0.9rem', fontWeight: 950, cursor: 'pointer', transition: '0.4s ease', boxShadow: '0 10px 25px rgba(2, 132, 199, 0.3)', textTransform: 'uppercase', letterSpacing: '1px' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        {t("Buy")}</button>
                   </div>
                </div>
              </div>
            ))}

            {results.length === 0 && !loading && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10rem 0', animation: 'fadeIn 1s ease-out' }}>
                 <div style={{ background: 'rgba(244, 63, 94, 0.1)', width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 2rem', display: 'grid', placeItems: 'center', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                 </div>
                 <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: '#0f172a', letterSpacing: '-1px' }}>{t("No Products Found")}</h3>
                 <p style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 500, maxWidth: '600px', margin: '0 auto' }}>{t("We couldn't find any medicines matching your search. Please try another query.")}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </main>
  )
}

export default function MarketPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: 'center', padding: '10rem', fontSize: '1.5rem', color: '#0284c7', fontWeight: 700 }}>{t("Loading Market...")}</div>}>
      <MarketContent />
    </Suspense>
  )
}
