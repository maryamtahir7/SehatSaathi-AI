"use client"
import { API_URL } from '../../lib/api';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db.service';
import Link from 'next/link';
import { useLanguage } from "../../context/LanguageContext";

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cartItems, removeFromCart, checkoutCart } = useCart();
  const { t } = useLanguage();
  
  const [activeStep, setActiveStep] = useState(1); // 1: Basket, 2: Profile, 3: Success
  const [form, setForm] = useState({ phone: '', age: '', address: '', city: '', postalCode: '' });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any>(null);

  useEffect(() => {
    const directBuyParam = searchParams.get('buyNow');
    if (directBuyParam) {
      // 1-Click Fast Checkout: Fetch this specific item and bypass the cart context
      fetch(`${API_URL}/medicines/search?q=${encodeURIComponent(directBuyParam)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (data) {
               setBuyNowItem({ 
                 id: 'buy_now_virtual', 
                 name: data.name, 
                 price: data.price, 
                 quantity: 1, 
                 manufacturer: data.manufacturer, 
                 type: 'medicine' 
               });
               setActiveStep(2); // Jump straight to finalize order!
            }
        }).catch(err => console.error("Could not fetch buyNow item", err));
    } else if (searchParams.get('checkout') === 'true' && cartItems.length > 0) {
      setActiveStep(2);
    }
  }, [searchParams, cartItems.length]);

  const activeCheckoutItems = buyNowItem ? [buyNowItem] : cartItems;
  const totalCost = activeCheckoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push('/login');
    if (!form.phone || !form.city || !form.postalCode) return alert("Missing delivery details.");

    setIsCheckingOut(true);
    try {
      // If we are bypassing the cart, we need to create the payload directly
      if (buyNowItem) {
        const itemsPayload = [{ name: buyNowItem.name, type: buyNowItem.type, qty: buyNowItem.quantity, price: buyNowItem.price }];
        
        await dbService.createOrder({
          userId: user.$id,
          items: JSON.stringify(itemsPayload),
          total: Number(buyNowItem.price),
          name: form.phone, // mapping phone for quick bypass logic, user.name is better
          phone: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          notes: "Buy Now Fast Checkout",
          paymentMethod: "COD",
          status: 'pending'
        });
      } else {
        // Normal Cart Checkout
        await checkoutCart({
          userId: user.$id,
          name: user.name,
          phone: form.phone,
          age: form.age,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode
        });
      }
      setActiveStep(3);
    } catch (err) {
      alert("Checkout sequence failure.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="container" style={{ minHeight: '90vh', paddingTop: '4rem' }}>
      
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          {activeStep === 1 && 'Your Selection'}
          {activeStep === 2 && 'Finalize Order'}
          {activeStep === 3 && 'Order Confirmed'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          {activeStep === 1 && 'Review your medical supplies and laboratory bookings.'}
          {activeStep === 2 && 'Please provide your shipping coordinates and contact details.'}
          {activeStep === 3 && 'Your request has been merged into the MediStore clinical log.'}
        </p>
      </div>

      {/* Step Progress */}
      <div style={{ maxWidth: '600px', margin: '0 auto 4rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ 
           width: '40px', height: '40px', borderRadius: '50%', background: activeStep >= 1 ? 'var(--accent-color)' : '#e2e8f0', 
           display: 'grid', placeItems: 'center', fontWeight: 'bold', color: '#0f172a', border: activeStep === 1 ? '4px solid rgba(56, 189, 248, 0.3)' : 'none'
         }}>1</div>
         <div style={{ flex: 1, height: '2px', background: activeStep >= 2 ? 'var(--accent-color)' : '#e2e8f0', margin: '0 1rem' }} />
         <div style={{ 
           width: '40px', height: '40px', borderRadius: '50%', background: activeStep >= 2 ? 'var(--accent-color)' : '#e2e8f0', 
           display: 'grid', placeItems: 'center', fontWeight: 'bold', color: '#0f172a', border: activeStep === 2 ? '4px solid rgba(56, 189, 248, 0.3)' : 'none'
         }}>2</div>
         <div style={{ flex: 1, height: '2px', background: activeStep === 3 ? 'var(--accent-color)' : '#e2e8f0', margin: '0 1rem' }} />
         <div style={{ 
           width: '40px', height: '40px', borderRadius: '50%', background: activeStep === 3 ? 'var(--accent-color)' : '#e2e8f0', 
           display: 'grid', placeItems: 'center', fontWeight: 'bold', color: '#0f172a', border: activeStep === 3 ? '1px solid var(--accent-color)' : 'none'
         }}>3</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeStep === 1 && cartItems.length > 0 ? '1.5fr 1fr' : '1fr', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* STEP 1: BASKET */}
        {activeStep === 1 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cartItems.length === 0 ? (
                <div className="card glass" style={{ textAlign: 'center', padding: '5rem' }}>
                   <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📦</div>
                   <h2>{t("Your cart is currently empty")}</h2>
                   <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t("Browse our marketplace for clinical supplies.")}</p>
                   <Link href="/market" className="btn" style={{ width: 'auto', display: 'inline-block' }}>{t("Go to Marketplace")}</Link>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ width: '60px', height: '60px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', display: 'grid', placeItems: 'center' }}>
                         {item.type === 'medicine' ? '💊' : '🔬'}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{item.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0' }}>{item.manufacturer}</p>
                        <div style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{t("Qty:")}{item.quantity} × Rs. {item.price}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      {t("Delete")}</button>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="card glass" style={{ height: 'fit-content', position: 'sticky', top: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>{t("Order Summary")}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t("Items Total")}</span>
                    <span>Rs. {totalCost}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t("Clinical Delivery")}</span>
                    <span style={{ color: '#10b981' }}>{t("FREE")}</span>
                  </div>
                  <div style={{ height: '1px', background: 'var(--card-border)', margin: '1rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <span>{t("Total Cost")}</span>
                    <span style={{ color: 'var(--accent-color)' }}>Rs. {totalCost}</span>
                  </div>
                </div>
                <button className="btn" onClick={() => setActiveStep(2)}>
                   {t("Proceed to Checkout")}</button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: PROFILE */}
        {activeStep === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '3rem', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.6s ease-out' }}>
            
            {/* LEFT: SHIPPING FORM */}
            <div className="card glass" style={{ padding: '3rem', border: '1px solid rgba(52, 211, 153, 0.15)', background: 'linear-gradient(145deg, rgba(2,6,23,0.9), rgba(13,148,136,0.03))' }}>
               <h2 style={{ fontSize: '1.8rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#0f172a' }}>
                  <span style={{ color: '#34d399', filter: 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.6))' }}>📍</span> {t("Clinical Shipping Coordinates")}</h2>
               
               <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                     <div className="input-group">
                       <label style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'block' }}>Assigned Identity</label>
                       <input type="text" readOnly value={user?.name || 'Guest User'} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.05)', color: '#475569', outline: 'none' }} />
                     </div>
                     <div className="input-group">
                       <label style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'block' }}>{t("Comms Channel (Phone)")}</label>
                       <input type="tel" required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="+92 3XX XXXXXXX" style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.3)', background: 'rgba(255, 255, 255, 0.4)', color: '#0f172a', outline: 'none', transition: '0.3s' }} onFocus={e => e.target.style.borderColor = '#14b8a6'} onBlur={e => e.target.style.borderColor = 'rgba(52, 211, 153, 0.3)'} />
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                     <div className="input-group">
                       <label style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'block' }}>{t("Destination Node (City)")}</label>
                       <input type="text" required value={form.city} onChange={e=>setForm({...form, city: e.target.value})} placeholder="e.g. Neo-Islamabad" style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.3)', background: 'rgba(255, 255, 255, 0.4)', color: '#0f172a', outline: 'none', transition: '0.3s' }} onFocus={e => e.target.style.borderColor = '#14b8a6'} onBlur={e => e.target.style.borderColor = 'rgba(52, 211, 153, 0.3)'} />
                     </div>
                     <div className="input-group">
                       <label style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'block' }}>Routing Area Code</label>
                       <input type="text" required value={form.postalCode} onChange={e=>setForm({...form, postalCode: e.target.value})} placeholder="46000" style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.3)', background: 'rgba(255, 255, 255, 0.4)', color: '#0f172a', outline: 'none', transition: '0.3s' }} onFocus={e => e.target.style.borderColor = '#14b8a6'} onBlur={e => e.target.style.borderColor = 'rgba(52, 211, 153, 0.3)'} />
                     </div>
                  </div>

                  <div className="input-group">
                    <label style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'block' }}>Exact Physical Vector (Full Address)</label>
                    <textarea required value={form.address} onChange={e=>setForm({...form, address: e.target.value})} placeholder="Sector, Street, Structure Number..." style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.3)', background: 'rgba(255, 255, 255, 0.4)', color: '#0f172a', outline: 'none', minHeight: '120px', resize: 'vertical', transition: '0.3s', fontFamily: 'inherit' }} onFocus={e => e.target.style.borderColor = '#14b8a6'} onBlur={e => e.target.style.borderColor = 'rgba(52, 211, 153, 0.3)'} />
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => buyNowItem ? router.back() : setActiveStep(1)} className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid rgba(0,0,0,0.2)', color: '#0f172a', padding: '1.2rem', borderRadius: '12px', fontWeight: 600, transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                       {buyNowItem ? 'Cancel Direct Buy' : 'Return to Basket'}
                    </button>
                    <button type="submit" className="btn" disabled={isCheckingOut} style={{ flex: 2, background: 'linear-gradient(135deg, #0d9488, #34d399)', border: 'none', color: '#0f172a', padding: '1.2rem', borderRadius: '12px', fontWeight: 900, boxShadow: '0 10px 30px rgba(52, 211, 153, 0.3)', opacity: isCheckingOut ? 0.7 : 1, transition: '0.3s' }}>
                       {isCheckingOut ? 'Transmitting Crypto-Tokens...' : 'Authorize Dispatch Sequence'}
                    </button>
                  </div>
               </form>
            </div>

            {/* RIGHT: ORDER DOSSIER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#0f172a', paddingLeft: '0.5rem' }}>Active Order Dossier</h2>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                 {activeCheckoutItems.map((item, idx) => (
                    <div key={idx} className="card glass" style={{ padding: '1.2rem 1.5rem', borderLeft: '4px solid #34d399', background: 'linear-gradient(145deg, rgba(2,6,23,0.8), rgba(13,148,136,0.05))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.2rem' }}>{item.manufacturer || 'Verified Entity'}</div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>Rs. {item.price}</div>
                          <div style={{ fontSize: '0.8rem', color: '#475569' }}>{t("Qty:")}{item.quantity}</div>
                       </div>
                    </div>
                 ))}
               </div>
               
               <div className="card glass" style={{ marginTop: '1rem', padding: '2rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(52, 211, 153, 0.15)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#475569', fontSize: '0.95rem' }}>
                     <span>Base Value Sync</span>
                     <span>Rs. {totalCost}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#475569', fontSize: '0.95rem' }}>
                     <span>Secure Logistics Link</span>
                     <span style={{ color: '#34d399', fontWeight: 700, letterSpacing: '1px' }}>COMPLIMENTARY</span>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '1.5rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 600 }}>{t("Total Allocation")}</span>
                     <span style={{ color: '#14b8a6', fontSize: '2rem', fontWeight: 900, textShadow: '0 0 25px rgba(20, 184, 166, 0.4)' }}>Rs. {totalCost}</span>
                  </div>
               </div>
            </div>

          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {activeStep === 3 && (
          <div className="card glass" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '4rem' }}>
             <div style={{ width: '100px', height: '100px', background: 'var(--accent-color)', borderRadius: '50%', margin: '0 auto 2rem auto', display: 'grid', placeItems: 'center', fontSize: '3rem', color: '#0f172a', boxShadow: '0 0 40px var(--accent-glow)' }}>
               ✓
             </div>
             <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Dispense Successful</h2>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
               Your clinical order has been successfully merged into our logistics system. 
               Our pharmacists will verify the prescription and contact you for dispatch.
             </p>
             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
               <Link href="/market" className="btn" style={{ width: 'auto' }}>{t("Continue Shopping")}</Link>
               <Link href="/" className="btn" style={{ width: 'auto', background: 'transparent', border: '1px solid var(--card-border)' }}>{t("Back to Home")}</Link>
             </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default function CartPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: 'center', padding: '10rem' }}>Loading Clinical Basket...</div>}>
      <CartContent />
    </Suspense>
  );
}
