"use client"
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db.service';
import { storageService } from '../../services/storage.service';
import Link from 'next/link';
import { useLanguage } from "../../context/LanguageContext";

export default function AdminPortal() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [dataPayload, setDataPayload] = useState<any>({});
  const [sysLoading, setSysLoading] = useState(true);

  // Add Medicine Form
  const [newMed, setNewMed] = useState({ name: '', price: '', stock: '' });
  const [medImage, setMedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPushing, setIsPushing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user?.email === 'medistore.pk@gmail.com') {
      fetchGlobalData();
    } else {
      setSysLoading(false);
    }
  }, [user, authLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const fetchGlobalData = async () => {
    setSysLoading(true);
    try {
      const requests = [
        { key: 'orders', query: dbService.getOrders() },
        { key: 'products', query: dbService.getProducts() },
        { key: 'categories', query: dbService.getCategories() },
        { key: 'patients', query: dbService.getPatients() },
        { key: 'reviews', query: dbService.getAllReviews() },
        { key: 'labs', query: dbService.getAllLabBookings() },
        { key: 'prescriptions', query: dbService.getAllPrescriptions() },
      ];

      const resolvedData: any = {};
      await Promise.all(
        requests.map(async (req) => {
          try {
            const res = await req.query;
            resolvedData[req.key] = res.documents;
          } catch (e) {
            resolvedData[req.key] = [];
          }
        })
      );

      setDataPayload(resolvedData);
    } catch (e) {
      console.error(e);
    } finally {
      setSysLoading(false);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newMed.name || !newMed.price) return;
    setIsPushing(true);
    try {
       let imageUrl = "";
       if (medImage) {
         const uploadRes = await storageService.uploadImage(medImage);
         imageUrl = uploadRes.url.toString();
       }

       await dbService.addProduct({
         name: newMed.name,
         price: parseFloat(newMed.price),
         stock: parseInt(newMed.stock) || 0,
         image: imageUrl
       });
       
       alert("Medicine Synced to Appwrite Database with Visuals!");
       setNewMed({ name: '', price: '', stock: '' });
       setMedImage(null);
       setImagePreview(null);
       fetchGlobalData();
    } catch(err: any) {
       alert("Upload Error: " + err.message);
    } finally {
       setIsPushing(false);
    }
  };

  if (authLoading || sysLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9', color: '#14b8a6' }}>
        <div style={{ fontSize: '3rem', animation: 'pulse 2s infinite' }}>💊</div>
        <div style={{ marginTop: '1rem', fontWeight: 600, letterSpacing: '2px' }}>SYNCHRONIZING CENTRAL MATRIX...</div>
      </div>
    );
  }

  if (!user || user.email !== 'medistore.pk@gmail.com') {
    return (
      <main className="container" style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="card glass" style={{ width: '100%', maxWidth: '600px', padding: '4rem', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
          <h1 style={{ color: '#ef4444', fontSize: '2.5rem', marginBottom: '1rem' }}>{t("401 Unauthorized")}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Classified routing restricted to Chief Pharmacist.</p>
          <Link href="/" className="btn" style={{ marginTop: '2rem', display: 'inline-block' }}>{t("Return to Base")}</Link>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'Medicine Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'Add Medicine', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { id: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'Patients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'Lab Tests', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { id: 'Prescriptions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'System Logs', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  ];

  const totalRev = (dataPayload.orders || []).reduce((s: number, o: any) => s + (o.total || o.total_price || 0), 0);

  const renderGenericTable = (dataArr: any[], title: string) => (
      <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.4)', borderBottom: '1px solid var(--card-border)' }}>
          <h2 style={{ margin: 0 }}>{title} ({dataArr.length} entries)</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--card-border)' }}>Document ID</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--card-border)' }}>Clinical Timestamp</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--card-border)' }}>{t("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {dataArr.length === 0 ? <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No telemetry data isolating in this collection.</td></tr> : 
                dataArr.map((doc: any, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                     <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{doc.$id}</td>
                     <td style={{ padding: '1rem' }}>{new Date(doc.$createdAt).toLocaleString()}</td>
                     <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '4px', fontSize: '0.75rem' }}>SYNCED</span>
                     </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* ADMIN SIDEBAR */}
      <aside style={{ 
        width: '280px', 
        background: '#f1f5f9', 
        borderRight: '1px solid var(--card-border)', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
        <div style={{ padding: '2rem 1.5rem', background: '#0b101e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#0f172a', fontSize: '1.2rem', fontWeight: 'bold' }}>
             <div style={{ background: '#14b8a6', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
             </div>
             <div>
               <div style={{ lineHeight: 1 }}>{t("MediStore")}</div>
               <div style={{ fontSize: '0.7rem', color: '#475569', letterSpacing: '1px', marginTop: '4px' }}>{t("ADMIN PANEL")}</div>
             </div>
          </div>
        </div>

        <nav style={{ padding: '1rem 12px', flex: 1, overflowY: 'auto' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                width: '100%', background: isActive ? '#0d9488' : 'transparent',
                border: 'none', color: isActive ? '#f1f5f9' : '#475569', padding: '0.9rem 1.2rem',
                display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                textAlign: 'left', fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s', borderRadius: '12px',
                marginBottom: '4px'
              }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon}/>
                </svg>
                {tab.id}
              </button>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', background: '#0b101e' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', display: 'grid', placeItems: 'center', color: '#0f172a', fontWeight: 'bold' }}>A</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>{t("Chief Pharmacist")}</div>
            <div style={{ color: '#475569', fontSize: '0.75rem' }}>{t("Active Session")}</div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
           <h1 style={{ color: '#0f172a', fontSize: '2rem', margin: 0 }}>{activeTab}</h1>
           <div style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid rgba(20,184,166,0.2)' }}>
             SYSTEM SCAN OK • {new Date().toLocaleTimeString()}
           </div>
        </div>

        {/* --- OVERVIEW --- */}
        {activeTab === 'Overview' && (
           <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div className="card glass" style={{ borderLeft: '4px solid #059669' }}>
                <span style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("Global Patients")}</span>
                <div style={{ fontSize: '3rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a' }}>{(dataPayload.patients || []).length}</div>
              </div>
              <div className="card glass" style={{ borderLeft: '4px solid #10b981' }}>
                <span style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("Projected Revenue")}</span>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10b981', marginTop: '0.5rem' }}>Rs. {totalRev.toLocaleString()}</div>
              </div>
              <div className="card glass" style={{ borderLeft: '4px solid #f59e0b' }}>
                <span style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("Stock Inventory")}</span>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.5rem' }}>{(dataPayload.products || []).length}</div>
              </div>
           </div>
        )}

        {/* --- ADD MEDICINE --- */}
        {activeTab === 'Add Medicine' && (
          <div className="card glass" style={{ maxWidth: '650px', margin: '0 auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '2rem', color: '#14b8a6' }}>{t("Medicine Clinical Profiling")}</h3>
            <form onSubmit={handleAddMedicine} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div 
                onClick={() => document.getElementById('med-image')?.click()}
                style={{
                  border: '2px dashed var(--card-border)',
                  borderRadius: '20px',
                  padding: '3rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.02)',
                  transition: '0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <input id="med-image" type="file" accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
                {imagePreview ? (
                  <img src={imagePreview} alt={t("Preview")} style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }} />
                ) : (
                  <div>
                    <div style={{fontSize: '3rem', marginBottom: '1rem', opacity: 0.5}}>🩺</div>
                    <div style={{color: '#475569', fontSize: '1rem', fontWeight: 500}}>{t("CLICK TO SCAN PRODUCT PHOTO")}</div>
                    <div style={{color: 'rgba(0,0,0,0.2)', fontSize: '0.8rem', marginTop: '8px' }}>{t("JPEG, PNG isolated only")}</div>
                  </div>
                )}
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#14b8a6', textTransform: 'uppercase', fontWeight: 800 }}>{t("Product Nomenclature")}</label>
                <input type="text" placeholder="e.g. Panadol Forte" required value={newMed.name} onChange={e=>setNewMed({...newMed, name: e.target.value})} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.3)', color: '#0f172a' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: '#14b8a6', textTransform: 'uppercase', fontWeight: 800 }}>{t("Clinical Price (Rs.)")}</label>
                  <input type="number" step="0.01" required value={newMed.price} onChange={e=>setNewMed({...newMed, price: e.target.value})} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.3)', color: '#0f172a' }} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: '#14b8a6', textTransform: 'uppercase', fontWeight: 800 }}>{t("Supply Count")}</label>
                  <input type="number" value={newMed.stock} onChange={e=>setNewMed({...newMed, stock: e.target.value})} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.3)', color: '#0f172a' }} />
                </div>
              </div>

              <button type="submit" className="btn" style={{ padding: '1.2rem', background: 'linear-gradient(90deg, #0d9488, #14b8a6)', color: '#0f172a', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '1rem' }} disabled={isPushing}>
                {isPushing ? 'UPLOADING TO MATRIX...' : 'DEPLOY TO APPREWRITE DB'}
              </button>
            </form>
          </div>
        )}

        {/* --- MEDICINE INVENTORY --- */}
        {activeTab === 'Medicine Inventory' && (
           <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
             <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(255,255,255,0.03)', color: '#475569' }}>
                <tr>
                  <th style={{ padding: '1.2rem' }}>Product Visual</th>
                  <th style={{ padding: '1.2rem' }}>Nomenclature</th>
                  <th style={{ padding: '1.2rem' }}>{t("Pricing Index")}</th>
                  <th style={{ padding: '1.2rem' }}>{t("Stock Status")}</th>
                </tr>
              </thead>
              <tbody>
                {(dataPayload.products || []).map((p: any) => (
                  <tr key={p.$id} style={{ borderBottom: '1px solid var(--card-border)', transition: '0.3s' }}>
                     <td style={{ padding: '1.2rem' }}>
                        <div style={{ width: '60px', height: '60px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '10px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                           {(p.image || p.imageUrl || p.image_url || p.img || p.pic) ? (
                             <img src={p.image || p.imageUrl || p.image_url || p.img || p.pic} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           ) : (
                             <span style={{fontSize: '1.5rem'}}>💊</span>
                           )}
                        </div>
                     </td>
                     <td style={{ padding: '1.2rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name || 'Unnamed Isolated Item'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>{p.$id}</div>
                     </td>
                     <td style={{ padding: '1.2rem', color: '#10b981', fontWeight: 700 }}>Rs. {p.price?.toFixed(2)}</td>
                     <td style={{ padding: '1.2rem' }}>
                        <span style={{ 
                          padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
                          background: p.stock > 10 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: p.stock > 10 ? '#10b981' : '#ef4444'
                        }}>
                          {p.stock} {t("UNITS")}</span>
                     </td>
                  </tr>
                ))}
              </tbody>
             </table>
           </div>
        )}

        {/* --- ORDERS --- */}
        {activeTab === 'Orders' && (
           <div className="card glass" style={{ padding: 0, overflowX: 'auto' }}>
             <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead style={{ background: 'rgba(255,255,255,0.03)', color: '#475569' }}>
                <tr>
                  <th style={{ padding: '1.5rem' }}>{t("Customer Profile")}</th>
                  <th style={{ padding: '1.5rem' }}>{t("Billing Matrix")}</th>
                  <th style={{ padding: '1.5rem' }}>{t("Item Count")}</th>
                  <th style={{ padding: '1.5rem' }}>Clinical Status</th>
                </tr>
              </thead>
              <tbody>
                {(dataPayload.orders || []).length === 0 ? <tr><td colSpan={4} style={{ padding: '5rem', textAlign: 'center', color: '#475569', fontSize: '1.2rem' }}>NO ORDER SIGNALS DETECTED.</td></tr> :
                (dataPayload.orders || []).map((o: any) => (
                  <tr key={o.$id} style={{ borderBottom: '1px solid var(--card-border)', transition: '0.2s' }}>
                     <td style={{ padding: '1.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{o.name || 'Incognito User'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>{o.city || 'Undisclosed Loc'}</div>
                     </td>
                     <td style={{ padding: '1.5rem', fontWeight: 800, color: '#10b981' }}>Rs. {o.total?.toFixed(2) || o.total_price?.toFixed(2)}</td>
                     <td style={{ padding: '1.5rem' }}>
                        <span style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                          {o.items ? (typeof o.items === 'string' ? JSON.parse(o.items).length : o.items.length) : 0} {t("MOLECULES")}</span>
                     </td>
                     <td style={{ padding: '1.5rem' }}>
                        <span style={{ 
                          padding: '0.4rem 1.2rem', borderRadius: '30px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px',
                          background: o.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                          color: o.status === 'pending' ? '#f59e0b' : '#10b981',
                          border: `1px solid ${o.status === 'pending' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`
                        }}>
                          {o.status || 'PROCESSED'}
                        </span>
                     </td>
                  </tr>
                ))}
              </tbody>
             </table>
           </div>
        )}

        {/* GENERIC TABLES */}
        {activeTab === 'Patients' && renderGenericTable(dataPayload.patients || [], 'Registered Patients')}
        {activeTab === 'Lab Tests' && renderGenericTable(dataPayload.labs || [], 'Laboratory Reservations')}
        {activeTab === 'Prescriptions' && renderGenericTable(dataPayload.prescriptions || [], 'Prescription Scan History')}
        {activeTab === 'System Logs' && renderGenericTable(dataPayload.orders || [], 'System Telemetry')}

      </main>

      <style jsx>{`
        input::placeholder { color: rgba(0,0,0,0.1); }
        @keyframes pulse {
          0% { opacity: 0.5; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.5; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}
