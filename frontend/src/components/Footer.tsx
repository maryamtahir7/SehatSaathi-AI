"use client"
import React from 'react'
import Link from 'next/link'
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0, 0, 0, 0.08)',
      padding: '4rem 0 2rem 0',
      marginTop: 'auto',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          marginBottom: '4rem'
        }}>

          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', color: '#0f172a', padding: '0.4rem', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800, color: '#0f172a' }}>{t("SehatSaathi AI")}</h2>
            </div>
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {t("Revolutionizing healthcare using neural intelligence and clinical data diagnostics.\r\n              The future of medicine is here.")}</p>
          </div>

          {/* Quick Hub Links */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 700, letterSpacing: '1px' }}>{t("Quick Hub")}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><Link href="/diagnose" style={{ color: '#475569', textDecoration: 'none', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.color = '#059669'} onMouseOut={e => e.currentTarget.style.color = '#475569'}>{t("Diagnose AI")}</Link></li>
              <li><Link href="/labs" style={{ color: '#475569', textDecoration: 'none', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.color = '#059669'} onMouseOut={e => e.currentTarget.style.color = '#475569'}>{t("Clinical Labs")}</Link></li>
              <li><Link href="/market" style={{ color: '#475569', textDecoration: 'none', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.color = '#059669'} onMouseOut={e => e.currentTarget.style.color = '#475569'}>{t("Pharmacy Market")}</Link></li>
              <li><Link href="/diets" style={{ color: '#475569', textDecoration: 'none', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.color = '#059669'} onMouseOut={e => e.currentTarget.style.color = '#475569'}>{t("Diet Plans")}</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 700, letterSpacing: '1px' }}>{t("Contact Intelligence")}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li style={{ color: '#475569', fontSize: '0.9rem' }}>{t("📧 medistore.pk@gmail.com")}</li>
            </ul>
          </div>

        </div>

        {/* Developer Credit Bar */}
        <div style={{
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ color: '#475569', fontSize: '0.85rem' }}>
            {t("&copy;")}{currentYear} {t("SehatSaathi AI. All Clinical Rights Reserved.")}</div>

          <div style={{
            fontSize: '1rem',
            fontWeight: 600,
            padding: '0.5rem 1.5rem',
            borderRadius: '50px',
            background: 'rgba(5, 150, 105, 0.05)',
            border: '1px solid rgba(5, 150, 105, 0.1)',
            transition: '0.3s'
          }}>
            <span style={{ color: '#475569' }}>{t("Developed by")}</span>
            <span style={{
              background: 'linear-gradient(to right, #059669, #0f766e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'initial',
              color: '#059669',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}>{t("Maryam Tahir")}</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
