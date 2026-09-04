"use client"
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Prevent scrolling when sidebar is open
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);

  const navLinks = [
    { name: t('nav.assistant'), path: '/assistant', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> },
    { name: t('nav.diagnose'), path: '/diagnose', icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/> },
    { name: t('nav.imageAI'), path: '/image-analysis', icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
    { name: t('nav.scanner'), path: '/scanner', icon: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></> },
    { name: t('nav.market'), path: '/market', icon: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></> },
    { name: t('nav.labs'), path: '/labs', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px) saturate(150%)',
        borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: scrolled ? '0.7rem 0' : '1.2rem 0',
        boxShadow: scrolled ? '0 10px 30px -10px rgba(15, 23, 42, 0.05)' : 'none'
      }}>
        <div className="container" style={{ padding: '0 1.5rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* LEFT: LOGO & NAV */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="/" className="logo-container group" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', 
                color: '#0f172a', 
                padding: '0.5rem', 
                borderRadius: '12px', 
                display: 'grid', 
                placeItems: 'center',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.25)',
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} className="logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              <h1 style={{ 
                fontSize: '1.4rem', 
                margin: 0, 
                fontWeight: 800, 
                letterSpacing: '-0.5px', 
                color: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1.1,
                whiteSpace: 'nowrap'
              }}>
                {language === 'en' ? (
                  <>SehatSaathi<span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2px', color: '#0284c7', textTransform: 'uppercase' }}>AI</span></>
                ) : (
                  <>صحت ساتھی<span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2px', color: '#0284c7', textTransform: 'uppercase' }}>اے آئی</span></>
                )}
              </h1>
            </Link>


          </div>

          {/* RIGHT: LANG TOGGLE + CART & USER ACTIONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '50px',
                border: '1px solid rgba(5, 150, 105, 0.3)',
                background: 'rgba(5, 150, 105, 0.08)',
                color: '#10b981',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                letterSpacing: '0.5px'
              }}
              title={t("Toggle Language / زبان تبدیل کریں")}
            >
              {language === 'en' ? 'اردو' : 'EN'}
            </button>
            
            {/* MODERN CART PILL */}
            <Link href="/cart" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid rgba(2, 132, 199, 0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                boxShadow: scrolled ? '0 4px 15px rgba(2, 132, 199, 0.1)' : '0 10px 25px rgba(15, 23, 42, 0.05)',
                backdropFilter: 'blur(10px)',
                whiteSpace: 'nowrap'
              }}
              className="nav-btn-hover"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Cart</span>
                {cartItems.length > 0 && (
                   <span style={{
                     background: '#10b981',
                     color: '#ffffff',
                     borderRadius: '50px',
                     padding: '0 6px',
                     minWidth: '22px',
                     height: '22px',
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     fontSize: '0.75rem',
                     fontWeight: 800,
                     boxShadow: '0 0 15px rgba(5, 150, 105, 0.6)',
                     animation: 'pulseGlow 2s infinite'
                   }}>
                     {cartItems.length}
                   </span>
                )}
              </div>
            </Link>

            <div style={{ width: '1px', height: '28px', background: 'rgba(0,0,0,0.1)', margin: '0 0.2rem' }}></div>

            {/* USER AVATAR / AUTH */}
            {user ? (
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                    backgroundSize: '200% 200%',
                    border: '2px solid rgba(255,255,255,0.8)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                  className="nav-avatar"
                >
                  {getInitials(user.name)}
                </button>

                {/* USER DROPDOWN */}
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 16px)',
                    right: 0,
                    width: '280px',
                    background: 'rgba(255, 255, 255, 1)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.05)',
                    padding: '1.5rem',
                    animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    transformOrigin: 'top right'
                  }}>
                    <div style={{ marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,0,0,0.1)', display: 'grid', placeItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>
                         {getInitials(user.name)}
                      </div>
                      <div>
                        <div style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>{user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', wordBreak: 'break-all' }}>{user.email}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                       {user.email === 'medistore.pk@gmail.com' && (
                         <Link href="/admin" onClick={()=>setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#059669', fontSize: '0.95rem', padding: '0.8rem', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.1)', fontWeight: 600, transition: '0.2s', whiteSpace: 'nowrap' }} className="dropdown-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            {t("Admin Intelligence")}</Link>
                       )}
                       <Link href="/cart" onClick={()=>setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#475569', fontSize: '0.95rem', padding: '0.8rem', borderRadius: '12px', transition: '0.2s', whiteSpace: 'nowrap' }} className="dropdown-link">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                          {t("My Orders & History")}</Link>
                       <Link href="/settings" onClick={()=>setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#475569', fontSize: '0.95rem', padding: '0.8rem', borderRadius: '12px', transition: '0.2s', whiteSpace: 'nowrap' }} className="dropdown-link">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                          {t("Account Settings")}</Link>
                       <button 
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'rgba(239, 68, 68, 0.05)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.1)',
                          padding: '0.8rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          marginTop: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: '0.2s',
                          whiteSpace: 'nowrap'
                        }}
                        className="dropdown-logout"
                       >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                         {t("Terminate Session")}</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Link href="/login" style={{ color: '#0f172a', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '50px', transition: '0.2s', whiteSpace: 'nowrap' }} className="nav-login-btn">{t("Sign In")}</Link>
                <Link href="/signup" style={{ 
                  background: 'linear-gradient(135deg, #059669, #0f766e)', 
                  color: '#0f172a', 
                  textDecoration: 'none', 
                  fontSize: '0.9rem', 
                  padding: '0.6rem 1.4rem', 
                  borderRadius: '50px', 
                  fontWeight: 700,
                  boxShadow: '0 8px 25px rgba(5, 150, 105, 0.4)',
                  transition: 'all 0.3s',
                  whiteSpace: 'nowrap'
                }} className="nav-signup-btn">{t("Get Started")}</Link>
              </div>
            )}

            {/* SIDEBAR TOGGLE BUTTON */}
            <button 
              onClick={() => setSidebarOpen(true)}
              style={{ 
                background: 'rgba(0,0,0,0.05)', 
                border: '1px solid rgba(0,0,0,0.1)', 
                cursor: 'pointer', 
                color: '#0f172a', 
                display: 'grid', 
                placeItems: 'center', 
                marginLeft: '0.3rem',
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                transition: 'all 0.3s'
              }}
              className="hamburger-btn flex-shrink-0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>

        </div>
      </nav>

      {/* Slide-out Sidebar Drawer with Enhanced Features */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 10000, display: 'flex', justifyContent: 'flex-end',
          animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Close Area */}
          <div style={{ flex: 1 }} onClick={() => setSidebarOpen(false)}></div>
          
          {/* Main Sidebar Panel */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98))', 
            width: '100%', maxWidth: '380px', height: '100vh',
            boxShadow: '-20px 0 50px rgba(15, 23, 42, 0.02), -1px 0 0 rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {/* Ambient Background Glows */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '30%', background: '#059669', filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '30%', background: '#0d9488', filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none' }}></div>

            {/* Sidebar Header */}
            <div style={{ padding: '2rem 2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', color: '#0f172a', padding: '0.5rem', borderRadius: '10px', display: 'grid', placeItems: 'center', boxShadow: '0 0 20px rgba(5, 150, 105, 0.3)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', letterSpacing: '1px', fontWeight: 800 }}>NEURAL NODE</h2>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>System Control</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: '#475569', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'grid', placeItems: 'center', transition: 'all 0.2s' }} className="close-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
              
              {/* SYSTEM STATUS WIDGET */}
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569', fontWeight: 800, letterSpacing: '2px', display: 'block', marginBottom: '1rem' }}>{t("System Status")}</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', position: 'absolute', top: '1rem', right: '1rem' }}></div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>🧠</div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("AI Engine")}</div>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{t("Online")}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', boxShadow: '0 0 10px #059669', position: 'absolute', top: '1rem', right: '1rem', animation: 'pulseGlow 2s infinite' }}></div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>⚡</div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("Network")}</div>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{t("Optimized")}</div>
                  </div>
                </div>
              </div>

              {/* CORE NAVIGATION */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569', fontWeight: 800, letterSpacing: '2px', display: 'block', marginBottom: '0.5rem' }}>Core Protocols</span>
                {[{name:'Home Base', path:'/', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>, icon2: <polyline points="9 22 9 12 15 12 15 22"/>}, ...navLinks].map((link, idx) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link key={link.name} href={link.path} onClick={() => setSidebarOpen(false)} style={{
                      textDecoration: 'none',
                      color: isActive ? '#0f172a' : '#475569',
                      padding: '1rem 1.2rem',
                      borderRadius: '12px',
                      background: isActive ? 'linear-gradient(90deg, rgba(5, 150, 105, 0.1), transparent)' : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '1.05rem',
                      borderLeft: isActive ? '4px solid #059669' : '4px solid transparent',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      animation: `slideInRight ${0.4 + idx * 0.05}s cubic-bezier(0.16, 1, 0.3, 1)` // cascade effect
                    }}
                    className="sidebar-link"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#059669' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {link.icon}
                        {(link as any).icon2}
                      </svg>
                      {link.name}
                    </Link>
                  )
                })}
              </nav>
              
              {/* SUPPORT / EXTRA ACTIONS */}
              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569', fontWeight: 800, letterSpacing: '2px', display: 'block', marginBottom: '0.8rem' }}>{t("Actions")}</span>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', color: '#0f172a', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }} className="action-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    {t("Help Center")}</button>
                  <button style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', color: '#0f172a', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }} className="action-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {t("Feedback")}</button>
                </div>
              </div>
            </div>

            {/* User Profile in Sidebar Bottom */}
            {user && (
              <div style={{
                padding: '1.5rem 2rem',
                borderTop: '1px solid rgba(0,0,0,0.05)',
                background: 'rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #059669, #14b8a6)', display: 'grid', placeItems: 'center', fontWeight: 'bold', color: '#0f172a', flexShrink: 0 }}>
                  {getInitials(user.name)}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>{t("Connected")}</div>
                </div>
                <button onClick={() => { logout(); setSidebarOpen(false); }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }} title={t("Sign Out")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GLOBAL STYLES FOR NAVBAR */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(15px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(5, 150, 105, 0); }
          100% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
        }
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .logo-container:hover .logo-icon {
          transform: scale(1.08) rotate(5deg);
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: #059669;
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        .nav-link:not(.active):hover {
          color: #0f172a !important;
          background: rgba(0,0,0,0.05) !important;
        }
        .nav-link:not(.active):hover::after {
          width: 40%;
        }

        .nav-btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3) !important;
          border-color: rgba(5, 150, 105, 0.5) !important;
        }
        
        .nav-avatar:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 25px rgba(139, 92, 246, 0.5);
        }

        .hamburger-btn:hover {
          background: rgba(0,0,0,0.1) !important;
          color: #059669 !important;
          border-color: rgba(5, 150, 105, 0.3) !important;
        }

        .sidebar-link:hover {
          background: rgba(0,0,0,0.05) !important;
          color: #0f172a !important;
          transform: translateX(5px);
        }

        .action-btn:hover {
          background: rgba(0,0,0,0.1) !important;
          border-color: rgba(0,0,0,0.2) !important;
          color: #059669 !important;
        }

        .dropdown-link:hover {
          background: rgba(0,0,0,0.08) !important;
          color: #0f172a !important;
          padding-left: 1rem !important;
        }

        .dropdown-logout:hover {
          background: rgba(239, 68, 68, 0.15) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
        }
        
        .close-btn:hover {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
          border-color: rgba(239, 68, 68, 0.2) !important;
          transform: rotate(90deg);
        }

        .flex-shrink-0 {
          flex-shrink: 0;
        }


      `}</style>
    </>
  )
}
