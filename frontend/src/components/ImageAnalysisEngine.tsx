"use client"
import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../lib/api';

interface ImageAnalysisEngineProps {
  type: 'xray' | 'mri' | 'skin';
  title: string;
  classes: any[];
}

export default function ImageAnalysisEngine({ type, title, classes }: ImageAnalysisEngineProps) {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      let endpoint = '';
      if (type === 'skin') {
        endpoint = `${API_URL}/api/medical/skin/analyze`;
      } else {
        endpoint = `${API_URL}/analyze-medical-image`;
        formData.append('modality', type);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errMsg = 'Analysis failed. Please try again.';
        try {
            const errData = await response.json();
            if (errData.detail) errMsg = errData.detail;
            else if (errData.error) errMsg = errData.error;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="engine-container">
      <div className="upload-section glass">
        <h2>{title} {t("Analysis Studio")}</h2>
        <p>{t("Upload a high-resolution scan for AI-powered diagnostics.")}</p>

        <div 
          className={`dropzone ${file ? 'has-file' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/jpg" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          
          {preview ? (
            <img src={preview} alt="Scan Preview" className="preview-img" />
          ) : (
            <div className="drop-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{t("Drag & drop scan here")}</span>
              <small>{t("or click to browse (JPG/PNG)")}</small>
            </div>
          )}
        </div>

        <button 
          className="btn" 
          onClick={handleSubmit} 
          disabled={!file || loading}
          style={{ marginTop: '2rem' }}
        >
          {loading ? t("Analyzing...") : t("Run AI Diagnostics")}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="results-section glass">
          <h3>{t("Diagnostic Results")}</h3>
          
                    {result.skin_type ? (
            <div className="premium-skin-dashboard">
              {/* Header Section */}
              <div className="premium-header">
                <div className="header-left">
                  <div className="scan-status">
                    <span className="dot"></span> SCAN COMPLETE
                  </div>
                  <h2>Clinical Profile</h2>
                  <div className="confidence-text">
                    Neural Network Confidence: <span>{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="header-right">
                  <div className="match-ring">
                    <div className="match-inner">
                      <span className="grade">A+</span>
                      <span className="grade-sub">MATCH</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards Section */}
              <div className="premium-cards-grid">
                <div className="premium-card light-card">
                  <div className="card-bg-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.05"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  </div>
                  <span className="card-subtitle">SKIN PHENOTYPE</span>
                  <span className="card-title black-text">{result.skin_type}</span>
                </div>
                
                <div className="premium-card pink-card">
                  <div className="card-bg-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.05"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  </div>
                  <span className="card-subtitle red-text">PRIMARY TARGET</span>
                  <span className="card-title red-text">{result.finding || "Unknown"}</span>
                </div>
              </div>

              {/* Vectors Section */}
              {result.conditions_detected && result.conditions_detected.length > 0 && (
                <div className="premium-vectors">
                  <div className="vectors-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    <span>NEURAL DETECTION VECTORS</span>
                  </div>
                  <div className="vectors-list">
                    {result.conditions_detected.map((cond: any, idx: number) => (
                      <div className="vector-item" key={idx}>
                        <div className="vector-info">
                          <span className="vector-name">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            {cond.condition}
                          </span>
                          <span className="vector-pct">{(cond.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="vector-bar-bg">
                          <div className="vector-bar-fill" style={{ width: `${(cond.confidence * 100).toFixed(0)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulated Actives */}
              {result.ingredient_recommendations && result.ingredient_recommendations.length > 0 && (
                <div className="premium-actives-section">
                  <div className="section-title-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    <span className="section-title">FORMULATED ACTIVES</span>
                  </div>
                  <div className="actives-grid">
                    {result.ingredient_recommendations.map((ing: any, idx: number) => {
                      const initials = ing.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
                      const isRed = idx % 2 === 0;
                      return (
                        <div className="active-card" key={idx}>
                          <div className={`active-badge ${isRed ? 'red-badge' : 'black-badge'}`}>
                            {initials}
                          </div>
                          <div className="active-details">
                            <h4 className={isRed ? 'red-text' : 'black-text'}>{ing.name}</h4>
                            <p>{ing.benefit || ing.description || "Used in skincare to improve skin health."}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended Protocol */}
              {result.ingredient_recommendations && result.ingredient_recommendations.length > 0 && (
                <div className="premium-protocol-section">
                  <div className="section-title-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span className="section-title">RECOMMENDED PROTOCOL</span>
                  </div>
                  <div className="protocol-list">
                    {result.ingredient_recommendations.slice(0, 3).map((ing: any, idx: number) => {
                      const isRed = idx === 0;
                      const price = (Math.floor(Math.random() * 20) + 10) * 100 - 1; // Random price 999 - 2999
                      
                      // Mock product names based on ingredient
                      let prodType = "Serum";
                      if(idx === 0) prodType = "Face Cream";
                      if(idx === 1) prodType = "Cleanser";
                      
                      return (
                        <div className="protocol-card" key={idx}>
                          <div className={`protocol-step ${isRed ? 'red-step' : 'black-step'}`}>
                            <span className="step-text">STEP 0{idx + 1}</span>
                          </div>
                          <div className="protocol-content">
                            <div className="protocol-mock-img">
                              {/* Pure CSS Mock Product Box */}
                              <div className={`mock-bottle ${isRed ? 'red-theme' : 'green-theme'}`}></div>
                            </div>
                            <div className="protocol-info">
                              <h4 className={isRed ? 'red-text' : 'black-text'}>{ing.name.split(' ')[0]} {prodType}</h4>
                              <span className="protocol-type">Treatment</span>
                              <span className="protocol-price">Rs. {price.toLocaleString()}</span>
                            </div>
                            <div className="protocol-action">
                              <button className="cart-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
                      ) : (
              <div className="medical-dashboard">
                <div className="result-main">
                  <div className="result-condition">
                    <span className="label">{t("Primary Finding")}</span>
                    <span className="value">{result.finding || result.primary_concern || result.condition || result.prediction || "Unknown"}</span>
                  </div>
                  <div className="result-confidence">
                    <span className="label">{t("Confidence Score")}</span>
                    <span className="value">{((result.confidence || result.probability || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="result-details">
                  <h4>{t("Clinical Notes")}</h4>
                  <p>{result.detail_summary || result.notes || result.recommendation || t("Please consult a specialist for a definitive diagnosis.")}</p>
                </div>

                {result.full_clinical_report && (
                  <div className="clinical-report-section">
                    
                    {/* Precautions */}
                    {result.full_clinical_report.precautions && result.full_clinical_report.precautions.length > 0 && (
                      <div className="report-card precautions-card">
                        <div className="card-header">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          <h4>Precautions</h4>
                        </div>
                        <ul>
                          {result.full_clinical_report.precautions.map((p: string, i: number) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Diet Plan */}
                    {result.full_clinical_report.diet_plan && result.full_clinical_report.diet_plan.length > 0 && (
                      <div className="report-card diet-card">
                        <div className="card-header">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                          <h4>Recommended Diet</h4>
                        </div>
                        <div className="tags-container">
                          {result.full_clinical_report.diet_plan.map((d: string, i: number) => (
                            <span key={i} className="diet-tag">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pharmacy / Medicines */}
                    {result.full_clinical_report.medicines && result.full_clinical_report.medicines.length > 0 && (
                      <div className="report-card medicines-card">
                        <div className="card-header">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                          <h4>Pharmacy Recommendations</h4>
                        </div>
                        <div className="medicines-grid">
                          {result.full_clinical_report.medicines.map((m: any, i: number) => (
                            <div key={i} className="medicine-item">
                              <div className="med-icon">Rx</div>
                              <div className="med-info">
                                <h5>{typeof m === 'string' ? m : (m.name || 'Medicine')}</h5>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
              </div>
            )}
        </div>
      )}

      <style jsx>{`
        .engine-container {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 2rem 0;
        }
        .upload-section, .results-section {
          padding: 3rem;
          text-align: center;
        }
        .upload-section h2 {
          font-size: 2.5rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .upload-section p {
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 2.5rem;
        }
        .dropzone {
          border: 2px dashed #94a3b8;
          border-radius: 20px;
          padding: 4rem 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8fafc;
          position: relative;
          overflow: hidden;
        }
        .dropzone:hover {
          border-color: #0ea5e9;
          background: #f0f9ff;
        }
        .dropzone.has-file {
          padding: 0;
          border-style: solid;
          height: 400px;
        }
        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #475569;
          font-weight: 600;
          font-size: 1.2rem;
        }
        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .error-message {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #fef2f2;
          color: #ef4444;
          border-radius: 12px;
          font-weight: 600;
        }
        .results-section h3 {
          font-size: 2rem;
          color: #0f172a;
          margin-bottom: 2rem;
        }
        .result-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .result-condition, .result-confidence {
          background: #f0f9ff;
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid #bae6fd;
        }
        .label {
          display: block;
          font-size: 0.9rem;
          color: #0284c7;
          text-transform: uppercase;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .value {
          font-size: 1.8rem;
          font-weight: 900;
          color: #0f172a;
        }
        .result-details {
          text-align: left;
          background: #f8fafc;
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        .result-details h4 {
          color: #0f172a;
          margin-bottom: 1rem;
        }
        .result-details p {
          color: #475569;
          line-height: 1.6;
        }

        .clinical-report-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .report-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          text-align: left;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .card-header h4 {
          margin: 0;
          font-size: 1.2rem;
          color: #0f172a;
        }
        .precautions-card ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          color: #475569;
          line-height: 1.6;
        }
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .diet-tag {
          background: #dcfce7;
          color: #166534;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .medicines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .medicine-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #eff6ff;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #bfdbfe;
        }
        .med-icon {
          width: 40px;
          height: 40px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.1rem;
        }
        .med-info h5 {
          margin: 0;
          color: #1e3a8a;
          font-size: 1rem;
        }


        .premium-skin-dashboard {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 1rem;
          text-align: left;
        }

        /* HEADER */
        .premium-header {
          background: linear-gradient(135deg, #1f1115 0%, #1a1618 100%);
          border-radius: 20px;
          padding: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .scan-status {
          font-size: 0.75rem;
          letter-spacing: 2px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
        }
        .dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
        }
        .premium-header h2 {
          font-size: 2.8rem;
          font-weight: 500;
          margin: 0;
          color: white;
          letter-spacing: -1px;
        }
        .confidence-text {
          color: #94a3b8;
          font-size: 0.9rem;
        }
        .confidence-text span {
          color: #fb7185;
          font-weight: 600;
        }
        .match-ring {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f43f5e, #be123c);
          padding: 6px;
          box-shadow: 0 0 30px rgba(244, 63, 94, 0.3);
        }
        .match-inner {
          background: #1a1618;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .match-inner .grade {
          font-size: 1.8rem;
          font-weight: 800;
          line-height: 1;
        }
        .match-inner .grade-sub {
          font-size: 0.5rem;
          letter-spacing: 1px;
          color: #94a3b8;
        }

        /* CARDS */
        .premium-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .premium-card {
          padding: 2rem;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          background: white;
          border: 1px solid #f1f5f9;
        }
        .pink-card {
          background: linear-gradient(135deg, #fff1f2, #ffe4e6);
          border: 1px solid #fecdd3;
        }
        .card-bg-icon {
          position: absolute;
          right: -20px;
          bottom: -20px;
          width: 120px;
          height: 120px;
          color: #000;
        }
        .pink-card .card-bg-icon {
          color: #be123c;
        }
        .card-subtitle {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #94a3b8;
          z-index: 1;
          text-transform: uppercase;
        }
        .card-title {
          font-size: 2.2rem;
          font-weight: 900;
          z-index: 1;
        }
        .black-text { color: #0f172a; }
        .red-text { color: #be123c; }

        /* VECTORS */
        .premium-vectors {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border-radius: 20px;
          padding: 2.5rem;
          color: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .vectors-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: #94a3b8;
          margin-bottom: 2rem;
        }
        .vector-item {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .vector-item:last-child {
          margin-bottom: 0;
        }
        .vector-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .vector-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .vector-pct {
          color: #10b981;
          font-weight: 700;
        }
        .vector-bar-bg {
          height: 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        .vector-bar-fill {
          height: 100%;
          background: #10b981;
          border-radius: 4px;
        }

        /* ACTIVES */
        .section-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          margin-bottom: 1.5rem;
        }
        .section-title {
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: #64748b;
        }
        .actives-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .active-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
        }
        .active-badge {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: 900;
          color: white;
        }
        .red-badge { background: #e11d48; }
        .black-badge { background: #1e1e1e; }
        .active-details h4 {
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
        }
        .active-details p {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* PROTOCOL */
        .protocol-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .protocol-card {
          display: flex;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
        }
        .protocol-step {
          width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .red-step { background: #e11d48; }
        .black-step { background: #1a1618; }
        .step-text {
          transform: rotate(-90deg);
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 3px;
          white-space: nowrap;
        }
        .protocol-content {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 1.5rem 2rem;
          gap: 2rem;
        }
        .protocol-mock-img {
          width: 100px;
          height: 100px;
          background: #f8fafc;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mock-bottle {
          width: 34px;
          height: 68px;
          border-radius: 4px;
          position: relative;
        }
        .mock-bottle::before {
          content: '';
          position: absolute;
          top: -12px;
          left: 5px;
          width: 24px;
          height: 12px;
          background: #cbd5e1;
          border-radius: 3px 3px 0 0;
        }
        .red-theme { background: linear-gradient(#fecdd3, #fda4af); }
        .green-theme { background: linear-gradient(#bbf7d0, #86efac); }
        
        .protocol-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .protocol-info h4 {
          font-size: 1.4rem;
          font-weight: 800;
        }
        .protocol-type {
          font-size: 0.9rem;
          color: #94a3b8;
          font-weight: 600;
        }
        .protocol-price {
          font-weight: 900;
          font-size: 1.1rem;
          margin-top: 0.5rem;
        }
        .protocol-action {
          padding-right: 1rem;
        }
        .cart-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #1a1618;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cart-btn:hover {
          transform: scale(1.05);
          background: #e11d48;
        }

      `}</style>
    </div>
  );
}
