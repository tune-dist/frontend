import type { Metadata } from 'next'
import { DEFAULT_SITE_METADATA, OG_IMAGE, SITE_URL } from '@/lib/site-metadata'
import { Manrope } from 'next/font/google';
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { PlanInactiveProvider } from '@/contexts/PlanInactiveContext'
import QueryProvider from '@/components/providers/query-provider'
import { Toaster } from 'react-hot-toast'
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
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_SITE_METADATA.title,
  description: DEFAULT_SITE_METADATA.description,
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: DEFAULT_SITE_METADATA.title,
    description: DEFAULT_SITE_METADATA.description,
    url: SITE_URL,
    siteName: 'Kratolib',
    images: [OG_IMAGE],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_SITE_METADATA.title,
    description: DEFAULT_SITE_METADATA.description,
    images: [OG_IMAGE.url],
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
        <QueryProvider>
          <AuthProvider>
          <PlanInactiveProvider>
            <SmoothScrollProvider>
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
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

