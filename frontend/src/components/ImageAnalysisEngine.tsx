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
        throw new Error('Analysis failed. Please try again.');
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
            <p>{result.notes || result.recommendation || t("Please consult a specialist for a definitive diagnosis.")}</p>
          </div>
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
      `}</style>
    </div>
  );
}
