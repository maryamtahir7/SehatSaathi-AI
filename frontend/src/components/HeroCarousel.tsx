"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from "../context/LanguageContext";

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    title: 'Neural Diagnostics Engine',
    subtitle: 'Autonomous symptom triangulation using Ensemble Machine Learning. Delivering clinical precision in milliseconds.',
    cta: 'Initialize Diagnosis',
    link: '/diagnose',
    color: '#059669'
  },
  {
    image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    title: 'Advanced OCR Array',
    subtitle: 'Swiftly digitize and map handwritten prescriptions using deep learning optical character recognition.',
    cta: 'Scan Prescription',
    link: '/scanner',
    color: '#0d9488'
  },
  {
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    title: 'ResNet50 Imaging',
    subtitle: 'Extract deep image features from radiological scans to estimate abnormality signatures with high fidelity.',
    cta: 'Analyze Scan',
    link: '/image-analysis',
    color: '#10b981'
  }
];

export default function HeroCarousel() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'relative',
      height: '70vh',
      minHeight: '650px',
      width: '100%',
      overflow: 'hidden',
      borderRadius: '32px',
      boxShadow: '0 30px 60px -15px rgba(5, 150, 105, 0.2)',
      background: '#0f172a',
      margin: '2rem 0'
    }}>
      {slides.map((slide, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: index === current ? 1 : 0,
            visibility: index === current ? 'visible' : 'hidden',
            transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), visibility 1.2s',
            zIndex: index === current ? 1 : 0
          }}
        >
          {/* Background Image with Ken Burns Effect */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: index === current ? 'scale(1.05)' : 'scale(1.15)',
            transition: 'transform 8s ease-out',
            filter: 'brightness(0.4) saturate(1.2)'
          }} />

          {/* Premium Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 50%, transparent 100%)`,
            zIndex: 1
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 40%)`,
            zIndex: 1
          }} />

          {/* HUD Content Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '0 12%',
            textAlign: 'left',
            zIndex: 2
          }}>
            <div style={{
               opacity: index === current ? 1 : 0,
               transform: index === current ? 'translateY(0)' : 'translateY(40px)',
               transition: 'all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s',
               maxWidth: '800px'
            }}>
              {/* Telemetry Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.5rem 1.5rem',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                marginBottom: '2rem'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: slide.color, boxShadow: `0 0 12px ${slide.color}`, animation: 'pulseIndicator 2s infinite' }} />
                <span style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {t("System Online & Calibrated")}
                </span>
              </div>

              {/* Main Typography */}
              <h1 style={{
                fontSize: 'Clamp(3rem, 6vw, 5.5rem)',
                color: '#ffffff',
                fontWeight: 900,
                marginBottom: '1.5rem',
                lineHeight: 1.05,
                letterSpacing: '-2px',
                textShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}>
                {slide.title}
              </h1>
              
              <p style={{
                fontSize: 'Clamp(1.1rem, 2vw, 1.35rem)',
                color: '#cbd5e1',
                maxWidth: '700px',
                marginBottom: '3rem',
                lineHeight: 1.6,
                fontWeight: 400
              }}>
                {slide.subtitle}
              </p>
              
              {/* CTA Action */}
              <Link href={slide.link} style={{ textDecoration: 'none' }}>
                 <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: `linear-gradient(135deg, ${slide.color}, #047857)`,
                    color: '#ffffff',
                    padding: '1.2rem 3rem',
                    borderRadius: '50px',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    letterSpacing: '1px',
                    boxShadow: `0 15px 35px ${slide.color}66`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                 }}
                 className="hero-cta-advanced"
                 >
                   <span style={{ position: 'relative', zIndex: 1 }}>{slide.cta}</span>
                   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                   <div className="cta-glow"></div>
                 </div>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Advanced Slide Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '12%',
        display: 'flex',
        gap: '16px',
        zIndex: 10,
        alignItems: 'center'
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? '48px' : '12px',
              height: '12px',
              borderRadius: '12px',
              background: i === current ? '#10b981' : 'rgba(255,255,255,0.3)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: i === current ? '0 0 15px rgba(16, 185, 129, 0.6)' : 'none'
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes pulseIndicator {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .hero-cta-advanced {
          position: relative;
        }
        .hero-cta-advanced::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(135deg, #10b981, #059669);
          opacity: 0;
          transition: opacity 0.4s ease;
          zIndex: 0;
        }
        .hero-cta-advanced:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 45px rgba(16, 185, 129, 0.4);
        }
        .hero-cta-advanced:hover::before {
          opacity: 1;
        }
        .cta-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.6s ease;
          pointer-events: none;
        }
        .hero-cta-advanced:hover .cta-glow {
          opacity: 1;
          transform: scale(1);
          animation: rotateGlow 4s linear infinite;
        }
        @keyframes rotateGlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
