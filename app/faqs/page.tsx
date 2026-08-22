import FaqsContent from '@/components/FaqsContent'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'Music Distribution FAQs | Spotify, CRBT, Royalties | KratoLib',
  'Frequently asked questions about music distribution, royalties, CRBT, payment methods, plans, and platform support. Get answers to all your distribution questions.',
)

export default function FAQPage() {
  return <FaqsContent />
}
