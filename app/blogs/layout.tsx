import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Music Distribution Blog | Guides, Tips & Artist Stories | KratoLib',
  description: 'Read KratoLib blog for music distribution guides, artist tips, industry insights, and success stories. Learn how to release, promote, and earn from your music.',
  alternates: { canonical: '/blogs' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Music Distribution Blog | Guides, Tips & Artist Stories | KratoLib',
    description: 'Read KratoLib blog for music distribution guides, artist tips, industry insights, and success stories. Learn how to release, promote, and earn from your music.',
  },
  twitter: {
    title: 'Music Distribution Blog | Guides, Tips & Artist Stories | KratoLib',
    description: 'Read KratoLib blog for music distribution guides, artist tips, industry insights, and success stories. Learn how to release, promote, and earn from your music.',
  },
}

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
