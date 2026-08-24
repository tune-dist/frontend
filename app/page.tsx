import HomePage from '@/components/home-page'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'KratoLib - Music Distribution Free | Keep 100% | ₹999/Year',
  'KratoLib - Free music distribution for Indian indie artists. Upload to Spotify, Apple Music, JioSaavn, YouTube. Keep 100% earnings. 24/7 support. Start free today!',
)

export default function Home() {
  return <HomePage />
}
