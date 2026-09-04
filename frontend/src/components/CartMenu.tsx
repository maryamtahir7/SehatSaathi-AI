import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'
import { useLanguage } from "../context/LanguageContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  manufacturer: string;
  type: 'medicine' | 'lab';
}

interface Props {
  items: CartItem[];
  onRemove: (id: string) => void;
  onCheckout: (patient: any) => Promise<void>;
  isScrolled?: boolean;
}

export default function CartMenu({
  items, onRemove, onCheckout, isScrolled }: Props) {
  const { t } = useLanguage();
  const { user } = useAuth()
  const { isCartOpen, setIsCartOpen, showCheckoutForm, setShowCheckoutForm } = useCart()
  const [activeStep, setActiveStep] = useState(1) // 1: Basket, 2: Profile, 3: Success
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({ phone: '', age: '', address: '', city: '', postalCode: '' })

  // Portal mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Sync activeStep with Context's showCheckoutForm
  useEffect(() => {
    if (showCheckoutForm) {
      setActiveStep(2);
    } else if (!isCartOpen) {
      setActiveStep(1);
    }
  }, [showCheckoutForm, isCartOpen]);

  // Reset step when cart closes
  useEffect(() => {
    if (!isCartOpen) {
      if (activeStep === 3) {
        setTimeout(() => setActiveStep(1), 500);
      }
      setShowCheckoutForm(false);
    }
  }, [isCartOpen, activeStep, setShowCheckoutForm]);

  // Body Scroll Lock logic
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    }
  }, [isCartOpen]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalCost = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("System Auth Error: User drop detected.");
    if (!form.phone || !form.city || !form.postalCode) return alert("Missing required delivery details.");
    
    setIsCheckingOut(true);
    try {
      await onCheckout({
        name: user.name,
        email: user.email,
        userId: user.$id,
        phone: form.phone,
        age: form.age,
        address: form.address,
        city: form.city,
        postalCode: form.postalCode
      });
      setActiveStep(3); // Move to Success
      setForm({ phone: '', age: '', address: '', city: '', postalCode: '' });
    } catch (err) {
      alert("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  const handleProceedClick = () => {
    if (!user) {
      setIsCartOpen(false);
      router.push('/login');
    } else {
      setActiveStep(2);
    }
  }

  const drawerJSX = (
    <div 
      className="drawer-overlay"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(2, 6, 17, 0.9)', 
        zIndex: 2147483647, // Absolute Absolute Maximum
        display: 'flex',
        justifyContent: 'flex-end',
        overscrollBehavior: 'contain',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        className="drawer-content"
        style={{
          background: '#070a13',
          width: '100%',
          maxWidth: '480px',
          height: '100vh',
          padding: '2.5rem',
          boxShadow: '-40px 0 80px rgba(0,0,0,1)',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 2147483647,
          opacity: 1,
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <div>
            <h2 style={{color: '#0f172a', margin: 0, fontSize: '1.8rem', fontWeight: 800}}>
              {activeStep === 1 && 'Basket'}
              {activeStep === 2 && 'Patient Profile'}
              {activeStep === 3 && 'Confirmed'}
            </h2>
            <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px'}}>
               {activeStep === 1 && `Step 1: Review (${totalItems} items)`}
               {activeStep === 2 && 'Step 2: Shipping & Details'}
               {activeStep === 3 && 'Order Placed Successfully'}
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)} 
            style={{background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'grid', placeItems: 'center', color: '#0f172a', cursor: 'pointer'}}
          >
            ✖
          </button>
        </div>

        {/* STEP INDICATOR */}
        <div className="step-indicator" style={{ marginBottom: '2.5rem' }}>
           <div className={`step ${activeStep >= 1 ? 'active' : ''}`} style={activeStep > 1 ? {background: '#10b981', borderColor: '#10b981'} : {}}>
             {activeStep > 1 ? '✓' : '1'}
           </div>
           <div style={{ flex: 1, height: '2px', background: activeStep > 1 ? '#10b981' : 'var(--card-border)', margin: '0 10px' }}></div>
           <div className={`step ${activeStep >= 2 ? 'active' : ''}`} style={activeStep > 2 ? {background: '#10b981', borderColor: '#10b981'} : {}}>
             {activeStep > 2 ? '✓' : '2'}
           </div>
           <div style={{ flex: 1, height: '2px', background: activeStep > 2 ? '#10b981' : 'var(--card-border)', margin: '0 10px' }}></div>
           <div className={`step ${activeStep === 3 ? 'active' : ''}`}>3</div>
        </div>

        {/* CONTENT BY STEP */}
        {activeStep === 1 && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
              {items.length === 0 ? (
                <div style={{textAlign: 'center', marginTop: '5rem'}}>
                  <p style={{color: 'var(--text-secondary)'}}>{t("Empty Cart.")}</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="glass" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <div style={{fontWeight: 700}}>{item.name}</div>
                       <div style={{color: '#10b981'}}>Rs. {item.price}</div>
                     </div>
                     <button onClick={() => onRemove(item.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}>{t("Remove")}</button>
                  </div>
                ))
              )}
            </div>
            {items.length > 0 && (
              <div style={{marginTop: 'auto', borderTop: '1px solid var(--card-border)', paddingTop: '2rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                  <span>{t("Total")}</span>
                  <span style={{fontSize: '1.5rem', fontWeight: 800}}>Rs. {totalCost}</span>
                </div>
                <button className="btn" onClick={handleProceedClick}>{t("Proceed to Profile")}</button>
              </div>
            )}
          </>
        )}

        {activeStep === 2 && (
          <form onSubmit={handleCheckoutSubmit} style={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
            <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem'}}>
               <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #059669'}}>
                 <p>{t("Ordering as:")}<strong>{user?.name}</strong></p>
               </div>
               <div className="input-group">
                 <label>{t("Phone Number")}</label>
                 <input type="tel" required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} style={{padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#0f172a'}} />
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div className="input-group">
                   <label>{t("City")}</label>
                   <input type="text" required value={form.city} onChange={e=>setForm({...form, city: e.target.value})} style={{padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#0f172a'}} />
                 </div>
                 <div className="input-group">
                   <label>{t("Postal Code")}</label>
                   <input type="text" required value={form.postalCode} onChange={e=>setForm({...form, postalCode: e.target.value})} style={{padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#0f172a'}} />
                 </div>
               </div>

               <div className="input-group">
                 <label>{t("Full Delivery Address")}</label>
                 <textarea required value={form.address} onChange={e=>setForm({...form, address: e.target.value})} style={{padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#0f172a', minHeight: '80px'}} />
               </div>
               <div style={{ height: '40px' }}></div> {/* Extra space for scroll comfort */}
            </div>
            <div style={{marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)'}}>
              <button type="button" onClick={() => setActiveStep(1)} style={{width: '100%', padding: '0.8rem', background: 'none', border: 'none', color: '#475569', cursor: 'pointer'}}>{t("← Back to items")}</button>
              <button type="submit" className="btn" disabled={isCheckingOut}>
                {isCheckingOut ? 'Placing Order...' : `Confirm Order (Rs. ${totalCost})`}
              </button>
            </div>
          </form>
        )}


        {activeStep === 3 && (
          <div style={{ textAlign: 'center', marginTop: '5rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🎉</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t("Success!")}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>{t("Your order has been placed on the clinical matrix. Our team will contact you shortly.")}</p>
            <button className="btn" onClick={() => setIsCartOpen(false)}>{t("Close Cart")}</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsCartOpen(true)}
        style={{
          background: isScrolled ? 'rgba(56, 189, 248, 0.1)' : 'var(--accent-color)',
          color: isScrolled ? 'var(--accent-color)' : '#f1f5f9',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          padding: '0.6rem 1.2rem',
          borderRadius: '30px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.3s ease',
          boxShadow: isScrolled ? 'none' : '0 4px 15px var(--accent-glow)'
        }}
      >
        <span>{t("🛒 Cart")}</span>
        {totalItems > 0 && (
          <span style={{
            background: 'var(--accent-color)',
            color: '#0f172a',
            borderRadius: '50%',
            padding: '2px 8px',
            fontSize: '0.8rem',
            boxShadow: '0 0 10px var(--accent-glow)'
          }}>
            {totalItems}
          </span>
        )}
      </button>

      {isCartOpen && mounted && createPortal(drawerJSX, document.body)}
    </>
  )
}
