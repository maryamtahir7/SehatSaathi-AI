import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import { LanguageProvider } from '../context/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'SehatSaathi AI | Intelligent Healthcare',
  description: 'AI-powered healthcare platform: medical image analysis, symptom diagnosis, prescription scanning, AI assistant, and pharmacy — for Pakistan and South Asia.',
  keywords: 'healthcare AI, medical diagnosis, AI assistant, prescription scanner, medicine store, Pakistan healthcare',
  openGraph: {
    title: 'SehatSaathi AI | Intelligent Healthcare',
    description: 'Your intelligent healthcare companion powered by AI.',
    siteName: 'SehatSaathi AI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              <Navbar />
              <main style={{ flex: 1 }}>
                {children}
              </main>
              <Footer />
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
