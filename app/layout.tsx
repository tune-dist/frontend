import type { Metadata } from 'next'
import { Manrope } from 'next/font/google';
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import VersionNotifier from '@/components/VersionNotifier'
import { Righteous } from 'next/font/google'
import SmoothScrollProvider from '@/components/SmoothScrollProvider'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

const righteous = Righteous({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: 'KratoLib - Distribute Your Music Worldwide',
  description: 'KratoLib empowers independent artists to release their music to Spotify, Apple Music, YouTube, and 150+ platforms — all from one dashboard.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} ${righteous.variable}`}>
        <AuthProvider>
          <SmoothScrollProvider>
            <VersionNotifier />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  border: '1px solid #374151',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

