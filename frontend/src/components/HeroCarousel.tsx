"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from "../context/LanguageContext";

const slides = [
  {
    image: '/hero-ai.png',
    title: 'Neural Diagnosis Engine',
    subtitle: 'Autonomous symptom triangulation using Ensemble Machine Learning.',
    cta: 'Start Diagnosis',
    link: '/diagnose',
    color: '#059669'
  },
  {
    image: '/hero-lab.png',
    title: 'Clinical Laboratory Matrix',
    subtitle: 'Automated test recommendations with precision clinical mapping.',
    cta: 'Explore Labs',
    link: '/labs',
    color: '#10b981'
  },
  {
    image: '/hero-market.png',
    title: 'Global Pharmacy Hub',
    subtitle: 'Access 20,000+ medicinal products with dynamic neural pricing.',
    cta: 'Enter Marketplace',
    link: '/market',
    color: '#0d9488'
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
      height: '600px',
      width: '100%',
      overflow: 'hidden',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
      background: '#f1f5f9'
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
            transition: 'opacity 1.5s ease-in-out, transform 2s ease-out',
            transform: index === current ? 'scale(1.05)' : 'scale(1.15)',
            zIndex: index === current ? 1 : 0
          }}
        >
          {/* Background Image */}
          <div style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.75)'
          }} />

          {/* HUD Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 10%',
            textAlign: 'center',
            background: 'linear-gradient(to top, rgba(7, 10, 18, 0.8), transparent)'
          }}>
            <div style={{
               opacity: index === current ? 1 : 0,
               transform: index === current ? 'translateY(0)' : 'translateY(30px)',
               transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s'
            }}>
              <span style={{
                background: `${slide.color}22`,
                color: slide.color,
                padding: '0.4rem 1rem',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                border: `1px solid ${slide.color}44`,
                marginBottom: '1.5rem',
                display: 'inline-block'
              }}>
                {t("Neural Operation Active")}</span>
              <h1 style={{
                fontSize: 'Clamp(2.5rem, 5vw, 4rem)',
                color: '#0f172a',
                fontWeight: 800,
                marginBottom: '1rem',
                lineHeight: 1.1,
                textShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
              }}>
                {slide.title}
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#475569',
                maxWidth: '600px',
                margin: '0 auto 2.5rem auto',
                lineHeight: 1.6
              }}>
                {slide.subtitle}
              </p>
              <Link href={slide.link} style={{ textDecoration: 'none' }}>
                 <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: slide.color,
                    color: '#0f172a',
                    padding: '1rem 2.5rem',
                    borderRadius: '50px',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    boxShadow: `0 10px 30px ${slide.color}44`,
                    transition: '0.3s'
                 }}
                 className="hero-cta"
                 >
                   {slide.cta}
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                 </div>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        zIndex: 10
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? '40px' : '10px',
              height: '10px',
              borderRadius: '10px',
              background: i === current ? '#f1f5f9' : 'rgba(0,0,0,0.3)',
              border: 'none',
              cursor: 'pointer',
              transition: '0.4s'
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .hero-cta:hover {
          transform: translateY(-5px) scale(1.05);
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  )
}
