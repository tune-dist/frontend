import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'Music Distribution Guides | Free Resources for Artists | KratoLib',
  'In-depth guides for independent musicians. Music distribution, copyright, artist rights, marketing strategies. Free downloadable resources and templates.',
)

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
