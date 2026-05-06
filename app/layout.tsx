import type { Metadata } from 'next'
import { Manrope } from 'next/font/google';
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
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
  title: {
    default: 'Kratolib - Distribute Your Music Worldwide',
    template: '%s | KratoLib',
  },
  description: 'Kratolib empowers independent artists to release their music to Spotify, Apple Music, YouTube, JioSaavn, and 150+ platforms — all from one dashboard.',
  icons: {
    icon: '/favicon.png',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'KratoLib',
  url: 'https://www.kratolib.com',
  logo: 'https://www.kratolib.com/logo.png',
  email: 'info@kratolib.com',
  telephone: '+91-2717-448117',
  description:
    'KratoLib is a music distribution platform helping independent artists release music to 150+ streaming platforms while keeping 100% earnings.',
  sameAs: [
    'https://youtube.com/@kratolib',
    'https://instagram.com/kratolib',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      email: 'info@kratolib.com',
      telephone: '+91-2717-448117',
      contactType: 'customer support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Gujarati'],
    },
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'KratoLib',
  url: 'https://www.kratolib.com',
  inLanguage: 'en-IN',
  publisher: {
    '@type': 'Organization',
    name: 'KratoLib',
  },
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://www.kratolib.com/#localbusiness',
  name: 'KratoLib',
  image: 'https://www.kratolib.com/og-image.png',
  url: 'https://www.kratolib.com',
  email: 'info@kratolib.com',
  telephone: '+91-2717-448117',
  priceRange: '₹0 - ₹6,999',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '4044, The Retail Park, Rajyash City, Bopal',
    addressLocality: 'Ahmedabad',
    addressRegion: 'Gujarat',
    postalCode: '380058',
    addressCountry: 'IN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://api.web3forms.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className={`${manrope.variable} ${outfit.variable}`}>
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  )
}

