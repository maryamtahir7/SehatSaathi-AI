"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from "../context/LanguageContext";

const medicines = [
  { name: 'Panadol', price: 50, img: '💊', color: '#ef4444' },
  { name: 'Amoxicillin', price: 120, img: '🧪', color: '#059669' },
  { name: 'Brufen', price: 80, img: '🧬', color: '#10b981' },
  { name: 'Flagyl', price: 90, img: '🔬', color: '#0d9488' },
  { name: 'Insulin', price: 1500, img: '💉', color: '#f59e0b' },
  { name: 'Augmentin', price: 450, img: '🧫', color: '#14b8a6' }
];

export default function MedicineCarousel() {
  const { t } = useLanguage();
  return (
    <div style={{ marginTop: '5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
         <h2 style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: 800 }}>{t("Featured Diagnostics & Labs")}</h2>
         <Link href="/market" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>{t("Browse Full Matrix →")}</Link>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        overflowX: 'auto', 
        padding: '20px 0',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }} className="hide-scrollbar">
        {medicines.map((med, i) => (
          <Link key={i} href="/market" style={{ textDecoration: 'none' }}>
            <div style={{
              minWidth: '220px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              transition: '0.3s'
            }}
            className="med-card"
            >
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem', 
                filter: `drop-shadow(0 0 15px ${med.color}44)` 
              }}>
                {med.img}
              </div>
              <h3 style={{ color: '#0f172a', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{med.name}</h3>
              <div style={{ color: med.color, fontWeight: 800, fontSize: '1.1rem' }}>Rs. {med.price}</div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .med-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(56, 189, 248, 0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  )
}
