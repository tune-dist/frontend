import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Music Distribution Guides | Free Resources for Artists | KratoLib',
  description: 'In-depth guides for independent musicians. Music distribution, copyright, artist rights, marketing strategies. Free downloadable resources and templates.',
  alternates: { canonical: '/guides' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Music Distribution Guides | Free Resources for Artists | KratoLib',
    description: 'In-depth guides for independent musicians. Music distribution, copyright, artist rights, marketing strategies. Free downloadable resources and templates.',
  },
  twitter: {
    title: 'Music Distribution Guides | Free Resources for Artists | KratoLib',
    description: 'In-depth guides for independent musicians. Music distribution, copyright, artist rights, marketing strategies. Free downloadable resources and templates.',
  },
}

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
