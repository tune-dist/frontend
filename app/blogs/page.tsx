import type { Metadata } from 'next'
import BlogsContent from '@/components/BlogsContent'

export const metadata: Metadata = {
  title: 'Music Distribution Blog | Guides, Tips & Artist Stories | KratoLib',
  description: 'Read KratoLib blog for music distribution guides, artist tips, industry insights, and success stories. Learn how to release, promote, and earn from your music.',
  openGraph: {
    title: 'Music Distribution Blog | Guides, Tips & Artist Stories | KratoLib',
    description: 'Read KratoLib blog for music distribution guides, artist tips, industry insights, and success stories. Learn how to release, promote, and earn from your music.',
  },
  twitter: {
    title: 'Music Distribution Blog | Guides, Tips & Artist Stories | KratoLib',
    description: 'Read KratoLib blog for music distribution guides, artist tips, industry insights, and success stories. Learn how to release, promote, and earn from your music.',
  },
}

export default function BlogsPage() {
  return <BlogsContent />
}
