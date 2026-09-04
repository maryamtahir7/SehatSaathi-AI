"use client"
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from "../../../context/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2.5rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.05)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center', color: '#0f172a', fontWeight: 900 }}>{t("Welcome Back")}</h1>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '2.5rem', fontWeight: 500 }}>{t("Sign in to access your medial records.")}</p>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>{t("Email Address")}</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '1rem' }} 
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>{t("Secure Password")}</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '1rem' }} 
            />
          </div>

          <button type="submit" className="btn" style={{ marginTop: '1rem', padding: '1.2rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.95rem' }}>
          Don't have a secure patient account? <Link href="/signup" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>{t("Register Now")}</Link>
        </div>
      </div>
    </main>
  );
}
