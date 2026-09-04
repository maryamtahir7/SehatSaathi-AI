"use client"
import React from "react"
import Link from "next/link"
import ImageAnalysisEngine from "../../../components/ImageAnalysisEngine"
import { BRAIN_MRI_CLASSES } from "../../../constants/imagingClasses"

export default function MriAnalysisPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', padding: '4rem 2rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        <Link href="/image-analysis" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Image Analysis Hub
        </Link>

        <ImageAnalysisEngine 
          type="mri"
          title="Cerebral MRI"
          classes={BRAIN_MRI_CLASSES || []}
        />
        
      </div>
    </main>
  );
}
