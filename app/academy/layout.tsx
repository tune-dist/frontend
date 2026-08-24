import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'Music Distribution Academy | Learn & Grow | Courses | KratoLib',
  'Free music distribution courses and learning modules. Learn how to release music, promote on streaming platforms, manage royalties, and build your fanbase.',
)

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
