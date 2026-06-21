import type { Metadata } from 'next'
import { Manrope } from 'next/font/google';
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { PlanInactiveProvider } from '@/contexts/PlanInactiveContext'
import QueryProvider from '@/components/providers/query-provider'
import { Toaster } from 'react-hot-toast'
import VersionNotifier from '@/components/VersionNotifier'
import { Outfit } from 'next/font/google'
import SmoothScrollProvider from '@/components/SmoothScrollProvider'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kratolib.com'),
  title: 'Kratolib - Distribute Your Music Worldwide',
  description: 'Kratolib empowers independent artists to release their music to Spotify, Apple Music, YouTube, JioSaavn, and 150+ platforms — all from one dashboard.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Kratolib - Distribute Your Music Worldwide',
    description: 'Kratolib empowers independent artists to release their music to Spotify, Apple Music, YouTube, JioSaavn, and 150+ platforms — all from one dashboard.',
    url: 'https://www.kratolib.com',
    siteName: 'Kratolib',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kratolib - Music Distribution Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kratolib - Distribute Your Music Worldwide',
    description: 'Kratolib empowers independent artists to release their music to Spotify, Apple Music, YouTube, JioSaavn, and 150+ platforms — all from one dashboard.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} ${outfit.variable}`}>
        <AuthProvider>
          <QueryProvider>
          <PlanInactiveProvider>
            <SmoothScrollProvider>
              {/* <VersionNotifier /> */}
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
          </PlanInactiveProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

