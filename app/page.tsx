import type { Metadata } from 'next'
import HomePage from '@/components/home-page'

export const metadata: Metadata = {
  title: 'KratoLib - Music Distribution Free | Keep 100% | ₹999/Year',
  description: 'KratoLib - Free music distribution for Indian indie artists. Upload to Spotify, Apple Music, JioSaavn, YouTube. Keep 100% earnings. 24/7 support. Start free today!',
  openGraph: {
    title: 'KratoLib - Music Distribution Free | Keep 100% | ₹999/Year',
    description: 'KratoLib - Free music distribution for Indian indie artists. Upload to Spotify, Apple Music, JioSaavn, YouTube. Keep 100% earnings. 24/7 support. Start free today!',
  },
  twitter: {
    title: 'KratoLib - Music Distribution Free | Keep 100% | ₹999/Year',
    description: 'KratoLib - Free music distribution for Indian indie artists. Upload to Spotify, Apple Music, JioSaavn, YouTube. Keep 100% earnings. 24/7 support. Start free today!',
  },
}

export default function Home() {
  return <HomePage />
}
