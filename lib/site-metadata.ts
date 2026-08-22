import type { Metadata } from 'next'

export const SITE_URL = 'https://www.kratolib.com'

export const OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Kratolib - Music Distribution Platform',
} as const

export const DEFAULT_SITE_METADATA = {
  title: 'Kratolib - Distribute Your Music Worldwide',
  description:
    'Kratolib empowers independent artists to release their music to Spotify, Apple Music, YouTube, JioSaavn, and 150+ platforms — all from one dashboard.',
} as const

export function createPageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
    },
  }
}
