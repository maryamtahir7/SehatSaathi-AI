"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { apiEndpoints } from '../../lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AssistantPage() {
  const { language, setLanguage, t, isRTL } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMessage: Message = { role: 'user', content: trimmed, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))

      const res = await fetch(apiEndpoints.assistantChat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language,
          history
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error: ${res.status}`)
      }

      const data = await res.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      setError(err.message || t('common.error') || "Ensure backend is running locally on port 8000")
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  const quickQuestions = language === 'ur' ? [
    'مجھے بخار ہے، کیا کروں؟',
    'ذیابیطس کی علامات کیا ہیں؟',
    'بلڈ پریشر کو کیسے کنٹرول کریں؟',
    'صحت مند غذا کے بارے میں بتائیں',
  ] : [
    'What should I do for a fever?',
    'What are symptoms of diabetes?',
    'How to control blood pressure?',
    'What foods boost immunity?',
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
      
      {/* Ambient background glows */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(5, 150, 105, 0.06) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', position: 'relative', zIndex: 1 }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', flexShrink: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.2)', padding: '0.4rem 1.2rem', borderRadius: '50px', marginBottom: '1.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', boxShadow: '0 0 10px #0284c7', animation: 'pulseGlow 2s infinite' }}></div>
            <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {language === 'ur' ? 'اے آئی فعال — Groq پر مبنی' : 'AI Active — Groq Powered'}
            </span>
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', marginBottom: '0.5rem' }}>
            {t('assistant.title')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500, maxWidth: '600px', margin: '0 auto' }}>
            {t('assistant.disclaimer')}
          </p>
        </div>

        {/* CHAT INTERFACE */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(226, 232, 240, 1)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden'
        }}>
          
          {/* Top Bar of Chat */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem', borderBottom: '1px solid rgba(226, 232, 240, 1)', background: 'rgba(255, 255, 255, 0.95)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', color: '#ffffff', display: 'grid', placeItems: 'center', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.2)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
               </div>
               <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Clinical Assistant</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> Online
                  </div>
               </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['en', 'ur'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className="lang-btn"
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '10px',
                    border: language === lang ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(226, 232, 240, 1)',
                    background: language === lang ? 'rgba(2, 132, 199, 0.1)' : 'transparent',
                    color: language === lang ? '#0284c7' : '#64748b',
                    cursor: 'pointer',
                    fontWeight: language === lang ? 700 : 500,
                    fontSize: '0.85rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {lang === 'en' ? 'EN' : 'اردو'}
                </button>
              ))}
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.2)', background: 'rgba(244, 63, 94, 0.05)', color: '#f43f5e', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s' }}
                  title={t("Clear chat")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            scrollBehavior: 'smooth'
          }}>
            {messages.length === 0 && (
              <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '600px' }}>
                <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.1), rgba(14, 165, 233, 0.1))', borderRadius: '24px', margin: '0 auto 1.5rem', display: 'grid', placeItems: 'center', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                   <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  {language === 'ur' ? 'میں آپ کی کیا مدد کر سکتا ہوں؟' : 'How can I assist you today?'}
                </h2>
                <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem' }}>
                  {language === 'ur' ? 'کسی بھی طبی سوال، ادویات یا علامات کے بارے میں دریافت کریں۔' : 'Ask any medical question, check symptoms, or learn about medications.'}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); inputRef.current?.focus() }}
                      className="quick-question-btn"
                      style={{
                        padding: '1rem 1.5rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(226, 232, 240, 1)',
                        background: '#ffffff',
                        color: '#0f172a',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        textAlign: isRTL ? 'right' : 'left',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: '0.5rem',
                  animation: 'fadeUp 0.4s ease forwards'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '1.2rem 1.5rem',
                  borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #0284c7, #0ea5e9)'
                    : '#ffffff',
                  border: msg.role === 'user'
                    ? 'none'
                    : '1px solid rgba(226, 232, 240, 1)',
                  color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: msg.role === 'user' ? '0 10px 25px rgba(2, 132, 199, 0.25)' : '0 4px 15px rgba(15, 23, 42, 0.03)',
                  textAlign: isRTL ? 'right' : 'left'
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, padding: '0 0.5rem' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{
                  padding: '1.2rem 1.5rem',
                  borderRadius: '24px 24px 24px 4px',
                  background: '#ffffff',
                  border: '1px solid rgba(226, 232, 240, 1)',
                  display: 'flex', gap: '8px', alignItems: 'center',
                  boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '1rem 1.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', color: '#e11d48', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(226, 232, 240, 1)', background: 'rgba(248, 250, 252, 0.8)' }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-end',
              background: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 1)',
              borderRadius: '20px',
              padding: '0.8rem 1rem',
              boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)',
              transition: 'border-color 0.3s'
            }} className="input-container">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('assistant.placeholder')}
                rows={1}
                disabled={loading}
                dir={isRTL ? 'rtl' : 'ltr'}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0f172a',
                  fontSize: '1.05rem',
                  lineHeight: 1.5,
                  resize: 'none',
                  fontFamily: 'inherit',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  textAlign: isRTL ? 'right' : 'left',
                  padding: '0.4rem 0'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  border: 'none',
                  background: loading || !input.trim() ? 'rgba(226, 232, 240, 1)' : 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  color: loading || !input.trim() ? '#94a3b8' : '#ffffff',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  boxShadow: loading || !input.trim() ? 'none' : '0 8px 20px rgba(2, 132, 199, 0.3)'
                }}
                className={!loading && input.trim() ? 'send-btn' : ''}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(-2px)' }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); box-shadow: 0 0 15px #0284c7; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .quick-question-btn:hover {
          border-color: #0284c7 !important;
          color: #0284c7 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.1) !important;
        }
        .lang-btn:hover {
          background: rgba(2, 132, 199, 0.05) !important;
          border-color: rgba(2, 132, 199, 0.3) !important;
        }
        .input-container:focus-within {
          border-color: #0284c7 !important;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.1) !important;
        }
        .send-btn:hover {
          transform: scale(1.05) translateY(-2px);
        }
      `}</style>
    </main>
  )
}
