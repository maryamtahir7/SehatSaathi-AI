"use client"
import React from 'react'
import PrescriptionUploader from '../../components/PrescriptionUploader'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from "../../context/LanguageContext";

export default function ScannerPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addToCart } = useCart()

  const handleBuyNow = async (medicineName: string) => {
    if (!user) {
      router.push('/login');
    } else {
      router.push(`/cart?buyNow=${encodeURIComponent(medicineName)}`);
    }
  }

  return (
    <main className="container animate-fadeUp" style={{ maxWidth: '1100px', position: 'relative', overflow: 'hidden' }}>
      {/* Cinematic Background Animations */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '120%',
        height: '120%',
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.03) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.03) 0%, transparent 40%)',
        zIndex: -2,
        pointerEvents: 'none'
      }} />

      {/* Immersive Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '4.5rem', marginTop: '2rem', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '80vw', height: '40vh', background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.12), transparent 70%)',
          pointerEvents: 'none', zIndex: -1
        }} />
        
        <div className="pulse-glow" style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.5rem 1.4rem', 
          background: 'rgba(16, 185, 129, 0.05)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          borderRadius: '50px',
          color: '#34d399',
          fontWeight: 700,
          marginBottom: '1.8rem',
          letterSpacing: '2px',
          fontSize: '0.8rem',
          boxShadow: '0 0 20px rgba(16,185,129,0.1)',
          backdropFilter: 'blur(4px)'
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#34d399', borderRadius: '50%', boxShadow: '0 0 10px #34d399', animation: 'pulse 1.5s infinite' }} />
          BIO-SCANNER ARRAY v4.2
        </div>

        <h1 className="gradient-text title" style={{ fontSize: '5.2rem', lineHeight: 1, marginBottom: '1.5rem', letterSpacing: '-2px', fontWeight: 900 }}>
          Neural Prescription <br/><span style={{ opacity: 0.8 }}>Parsing Engine</span>
        </h1>
        
        <p className="subtitle" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.25rem', lineHeight: 1.6, color: '#475569' }}>
          Deploying deep-learning computer vision to deconstruct clinical handwriting. <br/>
          Instant molecular extraction. Zero-latency inventory synchronization.
        </p>

        {/* Floating Data Core Effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          zIndex: -1,
          opacity: 0.5
        }}>
           <div style={{
             position: 'absolute',
             top: '10%',
             left: '20%',
             width: '2px',
             height: '100px',
             background: 'linear-gradient(to bottom, transparent, #34d399, transparent)',
             animation: 'float 4s infinite ease-in-out'
           }} />
           <div style={{
             position: 'absolute',
             bottom: '20%',
             right: '15%',
             width: '2px',
             height: '150px',
             background: 'linear-gradient(to bottom, transparent, #34d399, transparent)',
             animation: 'float 5s infinite ease-in-out reverse'
           }} />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <PrescriptionUploader 
          onAddToCart={addToCart} 
          onBuyNowMedicine={handleBuyNow} 
          userId={user?.$id}
        />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) opacity(0.2); }
          50% { transform: translateY(-40px) opacity(0.8); }
        }
      `}</style>
    </main>
  )
}
