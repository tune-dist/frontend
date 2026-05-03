import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Music Distribution Academy | Learn & Grow | Courses | KratoLib',
  description: 'Free music distribution courses and learning modules. Learn how to release music, promote on streaming platforms, manage royalties, and build your fanbase.',
  openGraph: {
    title: 'Music Distribution Academy | Learn & Grow | Courses | KratoLib',
    description: 'Free music distribution courses and learning modules. Learn how to release music, promote on streaming platforms, manage royalties, and build your fanbase.',
  },
  twitter: {
    title: 'Music Distribution Academy | Learn & Grow | Courses | KratoLib',
    description: 'Free music distribution courses and learning modules. Learn how to release music, promote on streaming platforms, manage royalties, and build your fanbase.',
  },
}

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
