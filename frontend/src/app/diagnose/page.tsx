"use client"
import React, { useState, useEffect, useRef } from 'react'
import SymptomInput from '../../components/SymptomInput'
import RecommendationCard from '../../components/RecommendationCard'
import { useAuth } from '../../context/AuthContext'
import { API_URL, apiEndpoints } from '../../lib/api'

export default function DiagnosePage() {
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)
  const [patientName, setPatientName] = useState('Anonymous Patient')
  const [patientAge, setPatientAge] = useState<number>(30)
  const [patientGender, setPatientGender] = useState('Unknown')
  const [recommendationData, setRecommendationData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const reportRefId = useRef<number | null>(null)

  useEffect(() => {
    if (recommendationData && reportRefId.current === null) {
      reportRefId.current = Math.floor(Math.random() * 900000 + 100000)
    }
    if (!recommendationData) reportRefId.current = null
  }, [recommendationData])

  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    const label = user?.name || user?.email
    if (typeof label === 'string' && label.trim()) {
      setPatientName((prev) => (prev === 'Anonymous Patient' ? label.trim() : prev))
    }
  }, [user?.name, user?.email])

  const handlePredict = async (symptoms: string[]) => {
    setLoading(true)
    try {
      const predRes = await fetch(apiEndpoints.predictDisease, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, age: Number(patientAge) || 25, gender: patientGender })
      })
      const predData = await predRes.json()

      if (predData.disease) {
        const recRes = await fetch(`${API_URL}/recommendations/${predData.disease}?age=${patientAge}&gender=${patientGender}`)
        const recData = await recRes.json()

        let imageAnalysis = null
        if (uploadedImage) {
          const imageFormData = new FormData()
          imageFormData.append('file', uploadedImage)
          const imageRes = await fetch(apiEndpoints.analyzeMedicalImage, {
            method: 'POST',
            body: imageFormData
          })
          if (imageRes.ok) {
            imageAnalysis = await imageRes.json()
          }
        }

        const mergedData = {
          ...recData,
          confidence: predData.confidence,
          image_analysis: imageAnalysis
        }
        setRecommendationData(mergedData)
        setCurrentStep(1)
      }
    } catch {
      alert("Failed to get prediction. Ensure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentStep === 0) {
      const el = document.querySelector<HTMLInputElement>('[data-diagnose-focus="symptom-search"]')
      el?.focus()
    }
  }, [currentStep])

  const onPickImage = (file: File | null) => {
    setUploadedImage(file)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    if (file) setImagePreview(URL.createObjectURL(file))
  }

  const handleExportPDF = async () => {
    const element = document.getElementById('report-content')
    if (!element) return

    try {
      const html2pdfModule = await import('html2pdf.js')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2pdf = (html2pdfModule as any).default || html2pdfModule

      element.classList.add('pdf-export-mode')

      const opt = {
        margin: 0.5,
        filename: `Diagnostic_Report_${patientName.replace(/\s+/g, '_') || 'Patient'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }

      await html2pdf().set(opt).from(element).save()
      element.classList.remove('pdf-export-mode')
    } catch (err) {
      console.error("Failed to export PDF", err)
      element.classList.remove('pdf-export-mode')
      alert("Failed to export PDF")
    }
  }

  const resetCase = () => {
    setRecommendationData(null)
    setCurrentStep(0)
    setUploadedImage(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  return (
    <main className="diagnose-page" suppressHydrationWarning>
      <div className="diagnose-page__ambient" aria-hidden />

      <div className="diagnose-page__inner container">
        {currentStep === 0 && (
          <header className="diagnose-hero">
            <div className="diagnose-hero__badge">
              <span className="diagnose-hero__badge-dot" />
              Clinical intelligence suite
            </div>
            <h1 className="diagnose-hero__title">
              Precision <span className="diagnose-hero__title-accent">diagnosis</span>
            </h1>
            <p className="diagnose-hero__subtitle">
              Map symptoms to evidence-backed guidance in two calm steps—built for clarity, not jargon.
            </p>
          </header>
        )}

        {currentStep === 1 && (
          <p className="diagnose-page__crumb no-print">Assessment complete — review your brief below</p>
        )}

        {/* Steps */}
        <nav className="diagnose-steps no-print" aria-label="Assessment progress">
          <div className="diagnose-steps__track">
            <div
              className="diagnose-steps__track-fill"
              style={{ width: currentStep === 0 ? '33%' : '100%' }}
            />
          </div>
          <ol className="diagnose-steps__list">
            {[
              { n: 1, label: 'Profile & symptoms', short: 'Input' },
              { n: 2, label: 'Clinical report', short: 'Report' }
            ].map((step, idx) => {
              const done = currentStep > idx
              const active = currentStep === idx
              return (
                <li key={step.n} className={`diagnose-steps__item ${active ? 'diagnose-steps__item--active' : ''} ${done ? 'diagnose-steps__item--done' : ''}`}>
                  <span className="diagnose-steps__num" aria-hidden>
                    {done ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      step.n
                    )}
                  </span>
                  <span className="diagnose-steps__text">
                    <span className="diagnose-steps__text-short">{step.short}</span>
                    <span className="diagnose-steps__text-full">{step.label}</span>
                  </span>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Step 1 */}
        {currentStep === 0 && (
          <div className="diagnose-stage animate-diagnose-in">
            <div className="diagnose-panel diagnose-panel--header">
              <div>
                <p className="diagnose-panel__eyebrow">Assessment workspace</p>
                <h2 className="diagnose-panel__heading">Tell us what you are experiencing</h2>
                <p className="diagnose-panel__lede">
                  Add symptoms below. Our models correlate patterns with reference pathways—always confirm with a licensed clinician.
                </p>
              </div>
              <div className="diagnose-panel__pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Secure session
              </div>
            </div>

            <div className="diagnose-panel diagnose-panel--body">
              <div className="diagnose-context">
                <p className="diagnose-context__title">Clinical context</p>
                <div className="diagnose-context__grid">
                  <label className="diagnose-field">
                    <span className="diagnose-field__label">Display name</span>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Case notes label"
                      className="diagnose-field__input"
                    />
                  </label>
                  <label className="diagnose-field">
                    <span className="diagnose-field__label">Age</span>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value) || 0)}
                      className="diagnose-field__input"
                    />
                  </label>
                  <label className="diagnose-field">
                    <span className="diagnose-field__label">Sex recorded</span>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="diagnose-field__input diagnose-field__select"
                    >
                      <option value="Unknown">Prefer not to say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </div>

                <div className="diagnose-upload">
                  <p className="diagnose-upload__label">Optional medical image</p>
                  <p className="diagnose-upload__hint">Attach one scan or photo for AI-assisted imaging notes (JPEG / PNG).</p>
                  <div className="diagnose-upload__row">
                    <label className="diagnose-upload__zone">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="diagnose-upload__input"
                        onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                      />
                      <span className="diagnose-upload__zone-inner">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {uploadedImage ? uploadedImage.name : 'Drop file or browse'}
                      </span>
                    </label>
                    {uploadedImage && (
                      <button type="button" className="diagnose-upload__clear" onClick={() => onPickImage(null)}>
                        Remove
                      </button>
                    )}
                  </div>
                  {imagePreview && (
                    <img src={imagePreview} alt="Selected upload preview" className="diagnose-upload__thumb" />
                  )}
                </div>
              </div>

              <div className="diagnose-divider" />

              <SymptomInput onPredict={handlePredict} />
            </div>

            {loading && (
              <div className="diagnose-overlay" role="alertdialog" aria-busy aria-live="polite">
                <div className="diagnose-overlay__card">
                  <div className="diagnose-loader" aria-hidden>
                    <div className="diagnose-loader__ring diagnose-loader__ring--outer" />
                    <div className="diagnose-loader__ring diagnose-loader__ring--inner" />
                    <div className="diagnose-loader__icon">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="diagnose-overlay__title">Synthesizing clinical signals</h3>
                  <p className="diagnose-overlay__text">
                    Matching symptom clusters with disease ontology and care pathways. This usually takes a few seconds.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 1 && recommendationData && (
          <div className="diagnose-stage animate-diagnose-in">
            <div className="diagnose-toolbar glass no-print">
              <div className="diagnose-toolbar__brand">
                <div className="diagnose-toolbar__icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <h2 className="diagnose-toolbar__title">Your clinical brief</h2>
                  <p className="diagnose-toolbar__meta">
                    Reference <strong>{reportRefId.current ?? '—'}</strong>
                    <span className="diagnose-toolbar__dot" />
                    {patientName.trim() || 'Anonymous'}
                  </p>
                </div>
              </div>
              <div className="diagnose-toolbar__actions">
                <button type="button" className="diagnose-btn diagnose-btn--ghost" onClick={handleExportPDF}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export PDF
                </button>
                <button type="button" className="diagnose-btn diagnose-btn--primary" onClick={resetCase}>
                  New assessment
                </button>
              </div>
            </div>

            <div id="report-content" className="diagnose-report-wrap">
              <RecommendationCard data={recommendationData} loading={loading} />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .diagnose-page {
          position: relative;
          min-height: 92vh;
          padding-bottom: 4rem;
        }
        .diagnose-page__ambient {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 233, 0.18), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(168, 85, 247, 0.12), transparent),
            radial-gradient(ellipse 50% 35% at 0% 80%, rgba(52, 211, 153, 0.08), transparent);
        }
        .diagnose-page__inner {
          max-width: 1080px;
        }

        .diagnose-page__crumb {
          text-align: center;
          font-family: Outfit, sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #64748b;
          margin: 0 0 1.25rem;
          animation: diagnoseFadeUp 0.5s ease both;
        }

        .diagnose-hero {
          text-align: center;
          margin-bottom: 3rem;
          animation: diagnoseFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .diagnose-hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 1rem 0.35rem 0.65rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7dd3fc;
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(14, 165, 233, 0.35);
          margin-bottom: 1.25rem;
        }
        .diagnose-hero__badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 12px #34d399;
          animation: diagnosePulse 2.4s ease-in-out infinite;
        }
        .diagnose-hero__title {
          font-family: Outfit, system-ui, sans-serif;
          font-size: clamp(2.15rem, 4vw, 3.15rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #0f172a;
          margin: 0 0 0.75rem;
          line-height: 1.08;
        }
        .diagnose-hero__title-accent {
          background: linear-gradient(120deg, #38bdf8 0%, #a855f7 45%, #34d399 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: diagnoseGradient 8s ease infinite;
        }
        .diagnose-hero__subtitle {
          margin: 0 auto;
          max-width: 34rem;
          font-size: 1.05rem;
          line-height: 1.65;
          color: #94a3b8;
          font-weight: 400;
        }

        .diagnose-steps {
          margin-bottom: 2.75rem;
          animation: diagnoseFadeUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both;
        }
        .diagnose-steps__track {
          height: 3px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          margin: 0 12% 1.75rem;
          overflow: hidden;
        }
        .diagnose-steps__track-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #0ea5e9, #8b5cf6, #34d399);
          transition: width 0.65s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 24px rgba(14, 165, 233, 0.45);
        }
        .diagnose-steps__list {
          list-style: none;
          display: flex;
          justify-content: center;
          gap: clamp(2rem, 8vw, 5rem);
          padding: 0;
          margin: 0;
        }
        .diagnose-steps__item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          opacity: 0.45;
          transition: opacity 0.35s ease;
        }
        .diagnose-steps__item--active,
        .diagnose-steps__item--done {
          opacity: 1;
        }
        .diagnose-steps__num {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-family: Outfit, sans-serif;
          font-weight: 800;
          font-size: 1rem;
          color: #64748b;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(226, 232, 240, 1);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s, color 0.35s, box-shadow 0.35s;
        }
        .diagnose-steps__item--active .diagnose-steps__num {
          color: #fff;
          border-color: transparent;
          background: linear-gradient(145deg, #0ea5e9, #6366f1);
          box-shadow: 0 12px 32px rgba(99, 102, 241, 0.35);
          transform: translateY(-3px);
        }
        .diagnose-steps__item--done .diagnose-steps__num {
          color: #fff;
          border-color: rgba(52, 211, 153, 0.5);
          background: linear-gradient(145deg, #059669, #10b981);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }
        .diagnose-steps__text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          text-align: left;
        }
        .diagnose-steps__text-short {
          display: none;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #64748b;
        }
        .diagnose-steps__text-full {
          font-family: Outfit, sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: #1e293b;
        }
        @media (max-width: 520px) {
          .diagnose-steps__text-short { display: block; }
          .diagnose-steps__text-full { display: none; }
        }

        .diagnose-stage {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .animate-diagnose-in {
          animation: diagnoseFadeIn 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .diagnose-panel {
          border-radius: 28px;
          border: 1px solid rgba(226, 232, 240, 1);
          background: linear-gradient(165deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.8) 100%);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          box-shadow: 0 28px 80px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }
        .diagnose-panel--header {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 2rem 2.25rem;
        }
        .diagnose-panel__eyebrow {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #38bdf8;
          margin: 0 0 0.5rem;
        }
        .diagnose-panel__heading {
          font-family: Outfit, sans-serif;
          font-size: clamp(1.45rem, 2.5vw, 1.85rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0f172a;
          margin: 0 0 0.5rem;
          line-height: 1.2;
        }
        .diagnose-panel__lede {
          margin: 0;
          max-width: 36rem;
          font-size: 0.95rem;
          line-height: 1.65;
          color: #94a3b8;
        }
        .diagnose-panel__pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 1rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #334155;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(226, 232, 240, 1);
        }
        .diagnose-panel--body {
          padding: 2rem 2.25rem 2.5rem;
        }

        .diagnose-context__title {
          font-family: Outfit, sans-serif;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
          margin: 0 0 1rem;
        }
        .diagnose-context__grid {
          display: grid;
          grid-template-columns: 1.4fr 0.5fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .diagnose-context__grid {
            grid-template-columns: 1fr;
          }
        }

        .diagnose-upload {
          margin-top: 1.75rem;
          padding-top: 1.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .diagnose-upload__label {
          font-family: Outfit, sans-serif;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
          margin: 0 0 0.35rem;
        }
        .diagnose-upload__hint {
          margin: 0 0 1rem;
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.5;
        }
        .diagnose-upload__row {
          display: flex;
          flex-wrap: wrap;
          align-items: stretch;
          gap: 0.65rem;
        }
        .diagnose-upload__input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .diagnose-upload__zone {
          position: relative;
          flex: 1;
          min-width: 200px;
          border-radius: 16px;
          border: 1px dashed rgba(14, 165, 233, 0.35);
          background: rgba(14, 165, 233, 0.04);
          cursor: pointer;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
        }
        .diagnose-upload__zone:hover {
          border-color: rgba(168, 85, 247, 0.55);
          background: rgba(168, 85, 247, 0.07);
          box-shadow: 0 0 32px rgba(168, 85, 247, 0.12);
        }
        .diagnose-upload__zone-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          padding: 1rem 1.25rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #94a3b8;
        }
        .diagnose-upload__zone-inner svg {
          color: #38bdf8;
          flex-shrink: 0;
        }
        .diagnose-upload__clear {
          padding: 0 1.15rem;
          border-radius: 14px;
          border: 1px solid rgba(248, 113, 113, 0.35);
          background: rgba(248, 113, 113, 0.08);
          color: #fca5a5;
          font-family: Outfit, sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .diagnose-upload__clear:hover {
          background: rgba(248, 113, 113, 0.14);
          transform: translateY(-1px);
        }
        .diagnose-upload__thumb {
          margin-top: 1rem;
          max-height: 140px;
          width: auto;
          max-width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(226, 232, 240, 1);
          object-fit: contain;
          background: rgba(15, 23, 42, 0.05);
        }

        .diagnose-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .diagnose-field__label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
        }
        .diagnose-field__input,
        .diagnose-field__select {
          width: 100%;
          padding: 0.85rem 1rem;
          border-radius: 14px;
          border: 1px solid rgba(226, 232, 240, 1);
          background: rgba(255, 255, 255, 0.7);
          color: #0f172a;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
        }
        .diagnose-field__input:focus,
        .diagnose-field__select:focus {
          border-color: rgba(14, 165, 233, 0.65);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
          background: rgba(14, 165, 233, 0.06);
        }
        .diagnose-field__select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.85rem center;
          padding-right: 2.5rem;
        }

        .diagnose-divider {
          height: 1px;
          margin: 2rem 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        }

        .diagnose-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
        }
        .diagnose-overlay__card {
          text-align: center;
          max-width: 380px;
        }
        .diagnose-loader {
          position: relative;
          width: 112px;
          height: 112px;
          margin: 0 auto 1.75rem;
        }
        .diagnose-loader__ring {
          position: absolute;
          border-radius: 50%;
          border-style: solid;
          border-color: transparent;
          animation: diagnoseSpin 1.1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }
        .diagnose-loader__ring--outer {
          inset: 0;
          border-width: 3px;
          border-top-color: #0ea5e9;
          border-right-color: rgba(14, 165, 233, 0.25);
        }
        .diagnose-loader__ring--inner {
          inset: 14px;
          border-width: 3px;
          border-bottom-color: #a855f7;
          border-left-color: rgba(168, 85, 247, 0.2);
          animation-direction: reverse;
          animation-duration: 1.4s;
        }
        .diagnose-loader__icon {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: #38bdf8;
          filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.5));
        }
        .diagnose-overlay__title {
          font-family: Outfit, sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.6rem;
          letter-spacing: -0.02em;
        }
        .diagnose-overlay__text {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #94a3b8;
        }

        .diagnose-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1.35rem 1.75rem;
          border-radius: 24px;
        }
        .diagnose-toolbar__brand {
          display: flex;
          align-items: center;
          gap: 1.1rem;
        }
        .diagnose-toolbar__icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(145deg, #0ea5e9, #059669);
          box-shadow: 0 16px 36px rgba(14, 165, 233, 0.35);
        }
        .diagnose-toolbar__title {
          font-family: Outfit, sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.2rem;
          letter-spacing: -0.02em;
        }
        .diagnose-toolbar__meta {
          margin: 0;
          font-size: 0.85rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .diagnose-toolbar__meta strong {
          color: #38bdf8;
          font-weight: 800;
        }
        .diagnose-toolbar__dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #475569;
        }
        .diagnose-toolbar__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
        }

        .diagnose-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.72rem 1.25rem;
          border-radius: 14px;
          font-family: Outfit, sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s, background 0.25s, border-color 0.25s;
        }
        .diagnose-btn--ghost {
          color: #1e293b;
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .diagnose-btn--ghost:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .diagnose-btn--primary {
          color: #fff;
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 14px 36px rgba(99, 102, 241, 0.35);
        }
        .diagnose-btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 44px rgba(99, 102, 241, 0.45);
        }

        .diagnose-report-wrap {
          animation: diagnoseFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes diagnoseFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes diagnoseFadeIn {
          from { opacity: 0; transform: translateY(16px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes diagnosePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(0.92); }
        }
        @keyframes diagnoseGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes diagnoseSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
