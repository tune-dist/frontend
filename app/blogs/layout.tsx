import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'Music Distribution Blog | Guides, Tips & Artist Stories | KratoLib',
  'Read KratoLib blog for music distribution guides, artist tips, industry insights, and success stories. Learn how to release, promote, and earn from your music.',
)

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
