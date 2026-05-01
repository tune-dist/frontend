import type { Metadata } from 'next'
import GuidesContent from '@/components/GuidesContent'

export const metadata: Metadata = {
  title: 'Music Distribution Guides | Free Resources for Artists | KratoLib',
  description: 'In-depth guides for independent musicians. Music distribution, copyright, artist rights, marketing strategies. Free downloadable resources and templates.',
  openGraph: {
    title: 'Music Distribution Guides | Free Resources for Artists | KratoLib',
    description: 'In-depth guides for independent musicians. Music distribution, copyright, artist rights, marketing strategies. Free downloadable resources and templates.',
  },
  twitter: {
    title: 'Music Distribution Guides | Free Resources for Artists | KratoLib',
    description: 'In-depth guides for independent musicians. Music distribution, copyright, artist rights, marketing strategies. Free downloadable resources and templates.',
  },
}

export default function GuidesPage() {
  return <GuidesContent />
}
