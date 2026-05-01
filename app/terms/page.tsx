import type { Metadata } from 'next'
import TermsContent from '@/components/TermsContent'

export const metadata: Metadata = {
  title: 'Terms of Service | Artist Rights Protection | KratoLib',
  description: "Read KratoLib's terms of service. Understand copyright protections, royalty terms, artist rights, content policies, and platform usage agreements for music distribution.",
  openGraph: {
    title: 'Terms of Service | Artist Rights Protection | KratoLib',
    description: "Read KratoLib's terms of service. Understand copyright protections, royalty terms, artist rights, content policies, and platform usage agreements for music distribution.",
  },
  twitter: {
    title: 'Terms of Service | Artist Rights Protection | KratoLib',
    description: "Read KratoLib's terms of service. Understand copyright protections, royalty terms, artist rights, content policies, and platform usage agreements for music distribution.",
  },
}

export default function TermsPage() {
  return <TermsContent />
}
