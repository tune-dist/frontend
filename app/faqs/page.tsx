import type { Metadata } from 'next'
import FaqsContent from '@/components/FaqsContent'

export const metadata: Metadata = {
  title: 'Music Distribution FAQs | Spotify, CRBT, Royalties | KratoLib',
  description: 'Frequently asked questions about music distribution, royalties, CRBT, payment methods, plans, and platform support. Get answers to all your distribution questions.',
  alternates: { canonical: '/faqs' },
  openGraph: {
    title: 'Music Distribution FAQs | Spotify, CRBT, Royalties | KratoLib',
    description: 'Frequently asked questions about music distribution, royalties, CRBT, payment methods, plans, and platform support. Get answers to all your distribution questions.',
  },
  twitter: {
    title: 'Music Distribution FAQs | Spotify, CRBT, Royalties | KratoLib',
    description: 'Frequently asked questions about music distribution, royalties, CRBT, payment methods, plans, and platform support. Get answers to all your distribution questions.',
  },
}

export default function FAQPage() {
  return <FaqsContent />
}
